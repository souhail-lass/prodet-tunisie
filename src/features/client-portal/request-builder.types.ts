/** Shared types for the portal « nouvelle demande » flow — no server directive. */

export type PortalProductOption = {
  productId: string;
  slug: string;
  productName: string;
  categoryName: string | null;
  conditionnement: string | null;
  unitOfSale: string | null;
};

export type PortalRequestPrefillLine = PortalProductOption & {
  quantity: number;
  note: string | null;
};

export type PortalRequestPrefill = {
  sourceRequestId: string;
  referenceCode: string;
  lines: PortalRequestPrefillLine[];
};

export type SubmitPortalRequestResult = {
  ok: boolean;
  referenceCode?: string;
  orderDraftId?: string;
  formError?: string;
  fieldErrors?: Record<string, string[]>;
};
