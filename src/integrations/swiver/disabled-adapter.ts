import {
  SwiverNotConfiguredError,
  type SwiverAdapter,
  type SwiverCustomer,
  type SwiverCustomerPort,
  type SwiverDocumentPort,
  type SwiverDocumentSummary,
  type SwiverHealthPort,
  type SwiverProduct,
  type SwiverProductPort,
} from './types';

/**
 * The "disabled" adapter is the default when no Swiver credentials are
 * configured. Reads return empty arrays / nulls so feature code can render
 * without conditional branches. Health check returns false. Any future
 * write methods will throw `SwiverNotConfiguredError`.
 */
class DisabledCustomerPort implements SwiverCustomerPort {
  async createCustomer(): Promise<null> {
    return null;
  }

  async listCustomers(): Promise<SwiverCustomer[]> {
    return [];
  }
  async getCustomer(): Promise<SwiverCustomer | null> {
    return null;
  }
}

class DisabledProductPort implements SwiverProductPort {
  async listProducts(): Promise<SwiverProduct[]> {
    return [];
  }
  async getProduct(): Promise<SwiverProduct | null> {
    return null;
  }
}

class DisabledDocumentPort implements SwiverDocumentPort {
  async listDocumentsForCustomer(): Promise<SwiverDocumentSummary[]> {
    return [];
  }
  async getDocument(): Promise<SwiverDocumentSummary | null> {
    return null;
  }
  async getDocumentPdf(): Promise<Uint8Array | null> {
    return null;
  }
  async createDraftDocument(): Promise<{ swiverId: string; version: number; warehouseId: number | null } | null> {
    return null;
  }
  async updateDocument(): Promise<boolean> {
    return false;
  }
  async setDocumentState(): Promise<boolean> {
    return false;
  }
}

class DisabledHealthPort implements SwiverHealthPort {
  async ping(): Promise<boolean> {
    return false;
  }
}

export const disabledSwiverAdapter: SwiverAdapter = {
  mode: 'disabled',
  customers: new DisabledCustomerPort(),
  products: new DisabledProductPort(),
  documents: new DisabledDocumentPort(),
  health: new DisabledHealthPort(),
};

export { SwiverNotConfiguredError };
