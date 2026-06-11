import { listMyTickets } from '@/features/client-portal/tickets';
import { SupportListClient, type SupportRow } from './support-list-client';

export const dynamic = 'force-dynamic';

const fmt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Africa/Tunis' });

export default async function SupportPage() {
  let rows: SupportRow[] = [];
  try {
    const tickets = await listMyTickets();
    rows = tickets.map((t) => ({
      id: t.id,
      subject: t.subject,
      status: t.status,
      lastAuthorRole: t.lastAuthorRole,
      dateLabel: fmt.format(t.lastMessageAt),
    }));
  } catch {
    // No real session (demo preview) — show the empty/new-ticket UI.
  }
  return <SupportListClient tickets={rows} />;
}
