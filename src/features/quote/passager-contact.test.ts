import { afterEach, describe, expect, it, vi } from 'vitest';
import type { SwiverAdapter, SwiverCustomer } from '@/integrations/swiver';
import {
  PASSAGER_CONTACT_NAME,
  resetPassagerContactCacheForTests,
  resolvePassagerContactId,
} from './passager-contact';

function fakeCustomer(partial: Partial<SwiverCustomer> & { swiverId: string }): SwiverCustomer {
  return {
    legalName: '',
    displayName: null,
    externalCode: null,
    email: null,
    phone: null,
    addressLine1: null,
    city: null,
    postalCode: null,
    country: null,
    vatNumber: null,
    rawShape: {},
    ...partial,
  };
}

function fakeAdapter(customers: SwiverCustomer[]): SwiverAdapter {
  return {
    mode: 'sandbox',
    customers: {
      listCustomers: vi.fn(async () => customers),
      getCustomer: vi.fn(async () => null),
      createCustomer: vi.fn(async () => null),
    },
    products: {
      listProducts: vi.fn(async () => []),
      getProduct: vi.fn(async () => null),
    },
    documents: {
      listDocumentsForCustomer: vi.fn(async () => []),
      getDocument: vi.fn(async () => null),
      getDocumentPdf: vi.fn(async () => null),
      createDraftDocument: vi.fn(async () => null),
      updateDocument: vi.fn(async () => false),
      setDocumentState: vi.fn(async () => false),
    },
    health: { ping: vi.fn(async () => true) },
  };
}

afterEach(() => {
  resetPassagerContactCacheForTests();
  vi.unstubAllEnvs();
});

describe('resolvePassagerContactId', () => {
  it('prefers SWIVER_PASSAGER_CONTACT_ID over a name lookup', async () => {
    vi.stubEnv('SWIVER_PASSAGER_CONTACT_ID', '855233');
    const adapter = fakeAdapter([
      fakeCustomer({ swiverId: '1', legalName: PASSAGER_CONTACT_NAME }),
    ]);

    await expect(resolvePassagerContactId(adapter)).resolves.toBe('855233');
    expect(adapter.customers.listCustomers).not.toHaveBeenCalled();
  });

  it('looks up CLIENT_PASSAGER by name when env is unset', async () => {
    vi.stubEnv('SWIVER_PASSAGER_CONTACT_ID', '');
    const adapter = fakeAdapter([
      fakeCustomer({ swiverId: '9', legalName: 'Hotel Test' }),
      fakeCustomer({ swiverId: '855233', legalName: 'CLIENT_PASSAGER' }),
    ]);

    await expect(resolvePassagerContactId(adapter)).resolves.toBe('855233');
  });

  it('returns null when the passager contact cannot be resolved', async () => {
    vi.stubEnv('SWIVER_PASSAGER_CONTACT_ID', '');
    const adapter = fakeAdapter([fakeCustomer({ swiverId: '1', legalName: 'Autre' })]);

    await expect(resolvePassagerContactId(adapter)).resolves.toBeNull();
  });
});
