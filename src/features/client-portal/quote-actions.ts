'use server';

import { submitPortalQuoteRequest, type QuoteLineInput } from './quote-submit';

export async function submitPortalQuoteAction(lines: QuoteLineInput[]) {
  return submitPortalQuoteRequest({ lines });
}
