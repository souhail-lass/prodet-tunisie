'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { assertRole } from '@/features/admin/auth';
import { grantClientAccess, removeClient, revokeClientAccess } from '@/features/admin/clients';

export type AccessResult = { ok: boolean };

function revalidate() {
  revalidatePath('/[locale]/admin/clients', 'page');
}

/** Bust the 1h Swiver-customers cache so newly-created clients show now. */
export async function refreshSwiverClientsAction(): Promise<AccessResult> {
  await assertRole(['owner', 'admin', 'operator']);
  revalidateTag('swiver-customers');
  revalidate();
  return { ok: true };
}

export async function grantAccessAction(input: {
  swiverId: string;
  email: string;
  name: string;
  phone: string | null;
  city: string | null;
}): Promise<AccessResult> {
  const session = await assertRole(['owner', 'admin']);
  const r = await grantClientAccess({ ...input, actorUserId: session.appUser?.id ?? null });
  revalidate();
  return r;
}

export async function revokeAccessAction(input: { userId: string }): Promise<AccessResult> {
  const session = await assertRole(['owner', 'admin']);
  if (!input.userId) return { ok: false };
  await revokeClientAccess(input.userId, session.appUser?.id ?? null);
  revalidate();
  return { ok: true };
}

export async function removeClientAction(input: { userId: string }): Promise<AccessResult> {
  const session = await assertRole(['owner', 'admin']);
  if (!input.userId) return { ok: false };
  await removeClient(input.userId, session.appUser?.id ?? null);
  revalidate();
  return { ok: true };
}
