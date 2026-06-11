import { NextResponse } from 'next/server';
import { getSwiverAdapter } from '@/integrations/swiver';
import { findSwiverCustomerByContact, getPortalSwiverIdentity } from '@/features/client-portal/swiver-identity';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * DEV-ONLY Swiver connectivity probe. Returns 404 in production. Confirms the
 * typed adapter can authenticate and read live data (mode, health ping, and a
 * small sample of products/customers). Read-only — never writes to Swiver.
 */
export async function GET(): Promise<NextResponse> {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
  }

  try {
    const swiver = getSwiverAdapter();
    const ping = await swiver.health.ping();

    if (!ping) {
      return NextResponse.json(
        { ok: false, mode: swiver.mode, ping, hint: 'Adapter could not reach/authenticate Swiver. Check SWIVER_MODE, SWIVER_API_BASE_URL, SWIVER_API_KEY.' },
        { status: 200 },
      );
    }

    const products = await swiver.products.listProducts({});
    const customers = await swiver.customers.listCustomers({});

    // Prove the customer matcher: pick a real customer that has a contact
    // value, match by it, and confirm it resolves back to the same record.
    const sample = customers.find((c) => c.email) ?? customers.find((c) => c.phone) ?? null;
    const matched = sample
      ? await findSwiverCustomerByContact({ email: sample.email, phone: sample.phone })
      : null;
    const demoIdentity = await getPortalSwiverIdentity({ demoMode: true });

    return NextResponse.json(
      {
        ok: true,
        mode: swiver.mode,
        ping,
        customerMatch: {
          probedWith: sample ? { email: sample.email, phone: sample.phone } : null,
          resolvedTo: matched ? { swiverId: matched.swiverId, legalName: matched.legalName } : null,
          roundTripOk: Boolean(sample && matched && matched.swiverId === sample.swiverId),
          demoIdentity: demoIdentity.customer
            ? { swiverId: demoIdentity.customer.swiverId, legalName: demoIdentity.customer.legalName, demoFallback: demoIdentity.demoFallback }
            : null,
        },
        products: {
          total: products.length,
          sample: products.slice(0, 5).map((p) => ({
            swiverId: p.swiverId,
            sku: p.sku,
            name: p.name,
            unitPrice: p.unitPrice,
            categoryLabel: p.categoryLabel,
            brandName: p.brandName,
            hasImage: Boolean(p.imageUrl),
            active: p.active,
          })),
          categories: Array.from(new Set(products.map((p) => p.categoryLabel).filter(Boolean))).slice(0, 15),
        },
        customers: {
          total: customers.length,
          sample: customers.slice(0, 3).map((c) => ({
            swiverId: c.swiverId,
            legalName: c.legalName,
            city: c.city,
          })),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
