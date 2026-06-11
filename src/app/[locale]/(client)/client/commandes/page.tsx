import { listMyOrders } from '@/features/client-portal/orders';
import { MyOrdersClient, type MyOrderRow } from './my-orders-client';

export const dynamic = 'force-dynamic';

const fmt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeZone: 'Africa/Tunis' });
const moneyFmt = new Intl.NumberFormat('fr-TN', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

export default async function ClientOrdersPage() {
  let rows: MyOrderRow[] = [];
  try {
    const orders = await listMyOrders();
    rows = orders.map((o) => ({
      id: o.id,
      reference: o.reference,
      status: o.status,
      dateLabel: fmt.format(o.createdAt),
      lineCount: o.lineCount,
      swiverPushed: o.swiverPushed,
      cancellable: o.cancellable,
      totalLabel: o.totalTtc != null ? `${moneyFmt.format(o.totalTtc)} TND` : null,
    }));
  } catch {
    rows = [];
  }
  return <MyOrdersClient orders={rows} />;
}
