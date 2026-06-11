'use server';

import { cancelMyOrder } from '@/features/client-portal/orders';

export async function cancelOrderAction(orderDraftId: string) {
  return cancelMyOrder(orderDraftId);
}
