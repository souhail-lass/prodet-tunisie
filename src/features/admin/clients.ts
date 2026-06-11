import 'server-only';
import { eq } from 'drizzle-orm';
import { getCachedSwiverCustomers } from '@/features/client-portal/swiver-identity';

export type AdminSwiverClient = {
  swiverId: string;
  name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  reference: string | null;
  /** Access state from our DB: */
  userId: string | null;
  active: boolean;
  hasLoggedIn: boolean;
  lastSeenLabel: string | null;
};

function normEmail(value?: string | null): string | null {
  const v = value?.trim().toLowerCase();
  return v && v.includes('@') ? v : null;
}

const dateFmt = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Africa/Tunis',
});

/**
 * Every Swiver client, joined with our portal access state (by email). The
 * single source of truth for the admin clients manager.
 */
export async function getAdminSwiverClients(): Promise<AdminSwiverClient[]> {
  const [customers, appUsers] = await Promise.all([
    getCachedSwiverCustomers(),
    (async () => {
      const { db, schema } = await import('@/db/client');
      return db
        .select({
          id: schema.user.id,
          email: schema.user.email,
          isActive: schema.user.isActive,
          lastSeenAt: schema.user.lastSeenAt,
        })
        .from(schema.user)
        .where(eq(schema.user.role, 'customer_user'));
    })(),
  ]);

  const byEmail = new Map<string, (typeof appUsers)[number]>();
  for (const u of appUsers) {
    const e = normEmail(u.email);
    if (e) byEmail.set(e, u);
  }

  return customers
    .map((c): AdminSwiverClient => {
      const e = normEmail(c.email);
      const u = e ? byEmail.get(e) : undefined;
      return {
        swiverId: c.swiverId,
        name: c.legalName,
        email: c.email,
        phone: c.phone,
        city: c.city,
        reference: c.externalCode,
        userId: u?.id ?? null,
        active: Boolean(u?.isActive),
        hasLoggedIn: Boolean(u?.lastSeenAt),
        lastSeenLabel: u?.lastSeenAt ? dateFmt.format(u.lastSeenAt) : null,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
}

async function audit(action: string, entityId: string | null, diff: object, actorUserId?: string | null, metadata: object = {}) {
  const { db, schema } = await import('@/db/client');
  await db.insert(schema.auditLog).values({
    actorUserId: actorUserId ?? null,
    actorRole: 'admin',
    action,
    entityType: 'app_user',
    entityId,
    diff,
    metadata,
  });
}

/** Grant portal access to a Swiver client (by email). Idempotent. */
export async function grantClientAccess(input: {
  swiverId: string;
  email: string;
  name: string;
  phone?: string | null;
  city?: string | null;
  actorUserId?: string | null;
}): Promise<{ ok: boolean }> {
  const email = normEmail(input.email);
  if (!email) return { ok: false };
  const { db, schema } = await import('@/db/client');
  const now = new Date();

  const [customer] = await db
    .insert(schema.customer)
    .values({
      swiverId: input.swiverId,
      name: input.name || email,
      email,
      phone: input.phone ?? null,
      city: input.city ?? null,
      status: 'active',
    })
    .onConflictDoUpdate({
      target: schema.customer.swiverId,
      set: { name: input.name || email, email, phone: input.phone ?? null, city: input.city ?? null, status: 'active', updatedAt: now },
    })
    .returning({ id: schema.customer.id });

  // Insert as customer_user; on conflict only (re)activate — never downgrade an admin's role.
  const [appUser] = await db
    .insert(schema.user)
    .values({ email, fullName: input.name || null, role: 'customer_user', isActive: true })
    .onConflictDoUpdate({ target: schema.user.email, set: { isActive: true, updatedAt: now } })
    .returning({ id: schema.user.id });

  if (!customer || !appUser) return { ok: false };

  await db
    .insert(schema.userCustomer)
    .values({ userId: appUser.id, customerId: customer.id, role: 'purchaser' })
    .onConflictDoNothing();

  // Pre-create a CONFIRMED Supabase auth user. Without this, the client's first
  // login (signInWithOtp) creates a brand-new unconfirmed user and Supabase
  // sends a "confirm your email / finish signing up" email instead of a magic
  // link — which never establishes a portal session. Pre-confirming means every
  // future login gets a clean magic link. Idempotent: ignore "already exists".
  await ensureConfirmedAuthUser(email, input.name);

  await audit('client_access.granted', appUser.id, { active: true }, input.actorUserId, { email, swiverId: input.swiverId });
  return { ok: true };
}

/** Create (or confirm) a Supabase auth user so magic-link login works. */
export async function ensureConfirmedAuthUser(email: string, name?: string | null): Promise<void> {
  try {
    const { createSupabaseAdminClient } = await import('@/lib/supabase/admin');
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: name ? { full_name: name } : undefined,
    });
    if (error && !/already.*registered|already.*exists|been registered/i.test(error.message)) {
      console.error('[grant:auth-user-create]', { email: email.replace(/^(.{2}).*(@.*)$/, '$1…$2'), message: error.message });
    }
  } catch (err) {
    // Never block the grant on auth provisioning — login can still self-create.
    console.error('[grant:auth-user-error]', err instanceof Error ? err.message : err);
  }
}

export async function revokeClientAccess(userId: string, actorUserId?: string | null): Promise<void> {
  const { db, schema } = await import('@/db/client');
  await db.update(schema.user).set({ isActive: false, updatedAt: new Date() }).where(eq(schema.user.id, userId));
  await audit('client_access.revoked', userId, { active: false }, actorUserId);
}

export async function removeClient(userId: string, actorUserId?: string | null): Promise<void> {
  const { db, schema } = await import('@/db/client');
  await db.delete(schema.user).where(eq(schema.user.id, userId)); // cascades user_customer
  await audit('client_access.removed', null, {}, actorUserId, { userId });
}
