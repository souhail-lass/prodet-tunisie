import { Building2, CheckCircle2, Download, FileText, LogOut } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { account, documents } from '@/features/client-portal/mock/portal-mock';
import { resolveCurrentPortalSwiverIdentity } from '@/features/client-portal/swiver-identity';

export const dynamic = 'force-dynamic';

export default async function ClientAccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'portal' });
  const identity = await resolveCurrentPortalSwiverIdentity();
  const sw = identity.customer;

  const fields: { label: string; value: string }[] = [
    { label: t('account.fieldCompany'), value: sw?.legalName ?? account.name },
    { label: t('account.fieldContact'), value: account.contact },
    { label: t('account.fieldRole'), value: account.role },
    { label: t('account.fieldCity'), value: sw?.city ?? account.city },
  ];

  const swiverFields = sw
    ? [
        { label: t('swiver.ref'), value: sw.externalCode },
        { label: t('swiver.vat'), value: sw.vatNumber },
        { label: t('swiver.phone'), value: sw.phone },
        { label: t('swiver.address'), value: [sw.addressLine1, sw.postalCode, sw.city].filter(Boolean).join(', ') || null },
      ].filter((f) => f.value)
    : [];

  return (
    <div className="dash">
      {sw ? (
        <section className="panel" style={{ borderColor: 'var(--prodet-blue-tint-strong)', background: 'var(--prodet-blue-tint)' }}>
          <div className="panel__head" style={{ alignItems: 'center' }}>
            <h2 className="panel__title" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Building2 size={18} /> {sw.legalName}
            </h2>
            <span
              className="pds-badge"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: identity.matched ? 'var(--prodet-green)' : 'var(--text-secondary)' }}
            >
              <CheckCircle2 size={15} /> {identity.matched ? t('swiver.linked') : t('swiver.demoNote')}
            </span>
          </div>
          <div className="portal-fields">
            {swiverFields.map((field) => (
              <div key={field.label}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 'var(--fw-semibold)' }}>
                  {field.label}
                </div>
                <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--fw-medium)', marginTop: 4 }}>
                  {field.value}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="panel">
        <div className="panel__head">
          <h2 className="panel__title">{t('account.contactTitle')}</h2>
        </div>
        <div className="portal-fields">
          {fields.map((field) => (
            <div key={field.label}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 'var(--fw-semibold)' }}>
                {field.label}
              </div>
              <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--fw-medium)', marginTop: 4 }}>
                {field.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel__head">
          <h2 className="panel__title">{t('account.documentsTitle')}</h2>
          <p className="panel__sub">{t('account.documentsSub')}</p>
        </div>
        <div className="portal-list">
          {documents.map((doc) => (
            <div className="portal-list-row" key={doc.id}>
              <div className="portal-list-row__main">
                <span className="portal-list-row__icon">
                  <FileText size={18} />
                </span>
                <div>
                  <div className="portal-list-row__id">{doc.label}</div>
                  <div className="portal-list-row__meta">{doc.type}</div>
                </div>
              </div>
              <a href={doc.href} className="pds-btn pds-btn--ghost pds-btn--sm">
                <Download size={15} />
                <span>{t('account.download')}</span>
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel__head">
          <h2 className="panel__title">{t('account.sessionTitle')}</h2>
        </div>
        {/* Route handler clears the Supabase session, then returns to the
            client login. Plain <a> (full navigation), not a client Link. */}
        <a
          href={`/auth/signout?next=/${locale}/connexion-client`}
          className="pds-btn pds-btn--outline pds-btn--md"
        >
          <LogOut size={16} />
          <span>{t('account.logout')}</span>
        </a>
      </section>
    </div>
  );
}
