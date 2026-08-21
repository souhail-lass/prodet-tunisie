'use server';

import {
  submitPortalQuoteRequest,
  type PortalSubmitKind,
  type QuoteLineInput,
} from './quote-submit';

export async function submitPortalQuoteAction(
  lines: QuoteLineInput[],
  kind: PortalSubmitKind = 'order',
) {
  return submitPortalQuoteRequest({ lines, kind });
}
