import { cache } from 'react';
import { after } from 'next/server';
import { and, eq, isNull, sql } from 'drizzle-orm';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import {
  SupabaseAuthConfigurationError,
  createSupabaseServerClient,
} from '@/lib/supabase/server';

export type ClientPortalAccess = {
  authUser: SupabaseUser;
  appUser: {
    id: string;
    authId: string | null;
    email: string;
    fullName: string | null;
    role: string;
    isActive: boolean;
  };
  customer: {
    id: string;
    swiverId: string | null;
    name: string;
    displayName: string | null;
    email: string | null;
    phone: string | null;
    city: string | null;
    sectorKey: string | null;
    country: string;
    status: string;
    needsReview: boolean;
  };
  membership: {
    userId: string;
    customerId: string;
    role: string;
  };
};

export class ClientAuthUnavailableError extends Error {
  constructor(message = 'Client authentication is not configured yet.') {
    super(message);
    this.name = 'ClientAuthUnavailableError';
  }
}

export class UnauthenticatedClientError extends Error {
  constructor() {
    super('Client session is required.');
    this.name = 'UnauthenticatedClientError';
  }
}

export class ForbiddenClientError extends Error {
  constructor(message = 'Client portal access is required.') {
    super(message);
    this.name = 'ForbiddenClientError';
  }
}

const LAST_SEEN_REFRESH_MS = 5 * 60 * 1000;

/**
 * Records portal activity after the response is sent — never blocks
 * rendering, and skips the write entirely when last_seen_at is fresh.
 */
function touchLastSeen(userId: string, lastSeenAt: Date | null) {
  if (lastSeenAt && Date.now() - lastSeenAt.getTime() < LAST_SEEN_REFRESH_MS) return;
  after(async () => {
    try {
      const { db, schema } = await import('@/db/client');
      await db
        .update(schema.user)
        .set({ lastSeenAt: new Date(), updatedAt: new Date() })
        .where(eq(schema.user.id, userId));
    } catch {
      // Activity tracking must never break a portal request.
    }
  });
}

/**
 * Wrapped in React cache(): the layout, the page, and every query helper of a
 * single request share one Supabase verification and one DB lookup instead of
 * repeating them.
 */
export const requireClientPortalAccess = cache(
  async (): Promise<ClientPortalAccess> => {
    let supabase;
    try {
      supabase = await createSupabaseServerClient();
    } catch (error) {
      if (error instanceof SupabaseAuthConfigurationError) {
        throw new ClientAuthUnavailableError(error.message);
      }
      throw error;
    }

    const {
      data: { user: authUser },
      error,
    } = await supabase.auth.getUser();

    if (error || !authUser) throw new UnauthenticatedClientError();

    const email = authUser.email?.trim().toLowerCase();
    if (!email) throw new ForbiddenClientError();

    const { db, schema } = await import('@/db/client');

    // Fast path (returning user): user + membership + customer in one round trip.
    const [hit] = await db
      .select({
        user: schema.user,
        membership: schema.userCustomer,
        customer: schema.customer,
      })
      .from(schema.user)
      .innerJoin(schema.userCustomer, eq(schema.userCustomer.userId, schema.user.id))
      .innerJoin(schema.customer, eq(schema.userCustomer.customerId, schema.customer.id))
      .where(and(eq(schema.user.authId, authUser.id), isNull(schema.customer.deletedAt)))
      .limit(1);

    let appUser = hit?.user ?? null;
    let membershipRow = hit ? { membership: hit.membership, customer: hit.customer } : null;

    if (!appUser) {
      // Slow path: first login (account not linked yet) or no membership.
      const [byAuthId] = await db
        .select()
        .from(schema.user)
        .where(eq(schema.user.authId, authUser.id))
        .limit(1);

      appUser = byAuthId ?? null;

      if (!appUser) {
        const [byEmail] = await db
          .select()
          .from(schema.user)
          .where(sql`lower(${schema.user.email}) = ${email}`)
          .limit(1);

        if (!byEmail) throw new ForbiddenClientError();

        if (byEmail.authId && byEmail.authId !== authUser.id) {
          throw new ForbiddenClientError();
        }

        if (!byEmail.authId) {
          const [linked] = await db
            .update(schema.user)
            .set({
              authId: authUser.id,
              lastSeenAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(schema.user.id, byEmail.id))
            .returning();

          appUser = linked ?? byEmail;
        } else {
          appUser = byEmail;
        }
      }
    }

    if (appUser.role !== 'customer_user' || !appUser.isActive) {
      throw new ForbiddenClientError();
    }

    if (!membershipRow) {
      const [row] = await db
        .select({
          membership: schema.userCustomer,
          customer: schema.customer,
        })
        .from(schema.userCustomer)
        .innerJoin(schema.customer, eq(schema.userCustomer.customerId, schema.customer.id))
        .where(
          and(
            eq(schema.userCustomer.userId, appUser.id),
            isNull(schema.customer.deletedAt),
          ),
        )
        .limit(1);

      if (!row) throw new ForbiddenClientError();
      membershipRow = row;
    }

    touchLastSeen(appUser.id, appUser.lastSeenAt);

    return {
      authUser,
      appUser,
      customer: membershipRow.customer,
      membership: membershipRow.membership,
    };
  },
);
