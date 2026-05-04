# Spike 5 — Catalog data quality audit

- **Status.** Not started.
- **Owner.** Souhail (with Mère/Père for product knowledge).
- **Time box.** 1–2 days.
- **Blocks.** Slice A catalog launch, MVP acceptance criterion A4 (≥ 30 manufactured products with image/name/description/sector tags).

## Hypothesis

Of the ~80 *Produits finis Prodet* in Swiver, at least **30 (target ~50)** have sufficient data quality (clear name, code, conditionnement, family, image, short description) to launch publicly without embarrassment.

## Why it matters

- Public catalog credibility is fragile. Showing 80 entries where half have placeholder names ("PRODUIT TEST") or no description hurts the "manufacturer credibility" thesis the platform exists to convey.
- Better to launch with 30 polished entries than 80 ragged ones.
- The audit also surfaces what content work (descriptions, photos) is needed in Phase 2.

## Method

1. **Export.** Pull all 499 product/service lines from Swiver as a CSV (manual export from the UI is fine).
2. **Filter.** Keep only `is_manufactured_by_prodet = true` (or equivalent Swiver categorization). Should be ~80 rows.
3. **Audit checklist per row.** Spreadsheet (Google Sheets or `audit.csv`) with columns:
   - `code` (Swiver reference)
   - `current_name` (Swiver name, often ALL CAPS)
   - `category` / `family` (clean? assignable?)
   - `conditionnement` (clear, e.g. "BIDON 5L"?)
   - `unit_of_sale` (piece/litre/kg/carton)
   - `has_description` (boolean — short description suitable for catalog)
   - `has_image` (boolean — usable photo anywhere)
   - `recommended_sectors` (free-text list from Mère/Père knowledge)
   - `launch_ready` (boolean — Souhail's call after audit)
   - `gap_notes` (what is missing if not launch-ready)
4. **Sort by launch-readiness.** Top of list = ready to launch. Bottom = needs work.
5. **Decide launch set.** Pick the top N where N ≥ 30. Document in [07-research/catalog-audit.md](../07-research/catalog-audit.md).

## Dataset

- All 499 Swiver lines (CSV export).
- Optional input: any existing marketing materials, brochures, or product photos.

## Gate criteria

| Launch-ready manufactured products | Decision |
|---|---|
| ≥ 50 | Launch catalog with 50; defer remainder to Phase 2 enhancement. |
| 30–49 | Launch catalog with this set; flag this as "thin catalog, expand in Phase 2." |
| 15–29 | Launch with reduced expectations; consider whether to add resold articles ("articles commercialisés") earlier than Phase 2 to fill the catalog. |
| < 15 | Public catalog at MVP is too thin to justify the catalog page. Reduce Slice A to: homepage + about + sectors + contact + "demander un devis" form (no browseable catalog). Defer catalog to Phase 1.5. |

## Time box

2 days, including 0.5 day with Mère/Père for sector tagging and gap clarification.

## Result

_To fill in:_

- Total manufactured products: _.
- Launch-ready: _.
- Common gaps:
- Sector distribution:

## Decision

_To fill in:_

- Launch set size: _.
- Path: full catalog / thin catalog / no catalog at MVP.
- Phase 2 work needed: _ products, _ photos, _ descriptions.
- Output written to: [07-research/catalog-audit.md](../07-research/catalog-audit.md).

## References

- [01-product/mvp-scope.md A4](../01-product/mvp-scope.md#acceptance-criteria-high-level)
- [00-overview/sectors.md](../00-overview/sectors.md)
- [07-research/catalog-audit.md](../07-research/catalog-audit.md)
