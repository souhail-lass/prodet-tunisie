import { cache } from 'react';
import { eq, sql } from 'drizzle-orm';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import {
  SupabaseAuthConfigurationError,
  createSupabaseServerClient,
} from '@/lib/supabase/server';

export type AdminRole = 'owner' | 'admin' | 'operator' | 'reviewer';

export type CurrentUser = {
  authUser: SupabaseUser;
  appUser: {
    id: string;
    authId: string | null;
    email: string;
    fullName: string | null;
    role: string;
    isActive: boolean;
  } | null;
};

export class AdminAuthUnavailableError extends Error {
  constructor(message = 'Admin authentication is not configured yet.') {
    super(message);
    this.name = 'AdminAuthUnavailableError';
  }
}

export class UnauthenticatedAdminError extends Error {
  constructor() {
    super('Admin session is required.');
    this.name = 'UnauthenticatedAdminError';
  }
}

export class ForbiddenAdminError extends Error {
  constructor() {
    super('Admin role is required.');
    this.name = 'ForbiddenAdminError';
  }
}

/**
 * Wrapped in React cache(): the admin layout and the page of one request
 * share a single Supabase verification + DB lookup.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  let supabase;
  try {
    supabase = await createSupabaseServerClient();
  } catch (error) {
    if (error instanceof SupabaseAuthConfigurationError) {
      throw new AdminAuthUnavailableError(error.message);
    }
    throw error;
  }

  const {
    data: { user: authUser },
    error,
  } = await supabase.auth.getUser();

  if (error || !authUser) return null;

  const { db, schema } = await import('@/db/client');

  const [byAuthId] = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.authId, authUser.id))
    .limit(1);

  if (byAuthId) return { authUser, appUser: byAuthId };

  const email = authUser.email?.trim().toLowerCase();
  if (!email) return { authUser, appUser: null };

  const [byEmail] = await db
    .select()
    .from(schema.user)
    .where(sql`lower(${schema.user.email}) = ${email}`)
    .limit(1);

  if (!byEmail) return { authUser, appUser: null };

  if (!byEmail.authId) {
    const [linked] = await db
      .update(schema.user)
      .set({ authId: authUser.id, updatedAt: new Date() })
      .where(eq(schema.user.id, byEmail.id))
      .returning();

    return { authUser, appUser: linked ?? byEmail };
  }

  return { authUser, appUser: byEmail };
});

export async function requireSession(): Promise<CurrentUser> {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new UnauthenticatedAdminError();
  return currentUser;
}

export async function assertRole(allowedRoles: readonly AdminRole[]): Promise<CurrentUser> {
  const currentUser = await requireSession();
  const { appUser } = currentUser;

  if (!appUser?.isActive || !allowedRoles.includes(appUser.role as AdminRole)) {
    throw new ForbiddenAdminError();
  }

  return currentUser;
}

export async function requireAdminRole(allowedRoles: readonly AdminRole[]): Promise<CurrentUser> {
  return assertRole(allowedRoles);
}

export async function requireAdmin(): Promise<CurrentUser> {
  return assertRole(['owner', 'admin', 'operator', 'reviewer']);
}

export function isAdminAuthUnavailableError(error: unknown): error is AdminAuthUnavailableError {
  return error instanceof AdminAuthUnavailableError;
}

export function isUnauthenticatedAdminError(
  error: unknown,
): error is UnauthenticatedAdminError {
  return error instanceof UnauthenticatedAdminError;
}

export function isForbiddenAdminError(error: unknown): error is ForbiddenAdminError {
  return error instanceof ForbiddenAdminError;
}
