import { ImageResponse } from 'next/og';

/**
 * Branded 1200×630 share card used for Open Graph + Twitter previews across the
 * site (WhatsApp, LinkedIn, Facebook). Rendered on the brand navy with the
 * wordmark and B2B positioning so a shared Prodet link looks deliberate, not
 * like a bare URL. Per-page metadata can still override this where needed.
 */
export const alt = "Prodet Tunisie — Produits d'entretien professionnels";
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const NAVY = '#08233f';
const SAND = '#f7f6f3';
const ACCENT = '#c9a24b';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: NAVY,
          padding: '72px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 14,
              height: 56,
              backgroundColor: ACCENT,
              borderRadius: 4,
            }}
          />
          <div style={{ color: SAND, fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>
            Prodet Tunisie
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ color: '#ffffff', fontSize: 68, fontWeight: 800, lineHeight: 1.05, maxWidth: 920 }}>
            Produits d&apos;entretien &amp; d&apos;hygiène professionnels
          </div>
          <div style={{ color: '#9fb3c8', fontSize: 34, fontWeight: 500, maxWidth: 880 }}>
            Fabricant et distributeur en Tunisie — hôtellerie, restauration, entreprises &amp; institutions.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              display: 'flex',
              color: NAVY,
              backgroundColor: ACCENT,
              fontSize: 28,
              fontWeight: 700,
              padding: '12px 28px',
              borderRadius: 999,
            }}
          >
            Devis sur demande
          </div>
          <div style={{ color: '#9fb3c8', fontSize: 28, fontWeight: 500 }}>prodet.com.tn</div>
        </div>
      </div>
    ),
    size,
  );
}
