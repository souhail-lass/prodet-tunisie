# ASSETS.md — imagery for the public-site elevation

Running manifest of imagery the redesign wants. **Drop a file at the given path
and it renders automatically** — every slot already has a clean, intentional
fallback (existing photo or styled placeholder), so nothing is blocked.

Conventions: landscape unless noted · real on-site photography preferred over
stock · bright, professional, uncluttered · avoid heavy color casts (a navy
scrim sits over hero shots, so mid-tone/bright images read best).

---

## Sectors page — Phase 2 (live now)

The 6 existing files in `public/images/sectors/` are already used as the index
covers **and** as the full-bleed detail-page hero. They work, but they're small
(70–160 KB) and not all wide. Replacing them with proper shots is the single
biggest quality lever on this page.

| Path | Subject | Ratio / size | Notes |
|---|---|---|---|
| `public/images/sectors/hotels.jpg` | Hotel housekeeping — clean room, corridor or linen trolley | **16:9**, ≥ 2000×1125 | Used as the **feature** card + detail hero — give this the best shot |
| `public/images/sectors/restaurants-cafes.jpg` | Professional kitchen / service line | 3:2, ≥ 1600×1067 | |
| `public/images/sectors/societes-nettoyage.jpg` | Cleaning crew on site, floor/large surface | 3:2, ≥ 1600×1067 | |
| `public/images/sectors/entreprises.jpg` | Office / lobby being maintained | 3:2, ≥ 1600×1067 | |
| `public/images/sectors/revendeurs-grossistes.jpg` | Stocked shelves / pallets of cans | 3:2, ≥ 1600×1067 | |
| `public/images/sectors/institutions.jpg` | School, clinic or public-facility corridor | 3:2, ≥ 1600×1067 | |

`// ASSET NEEDED` (nice-to-have, not blocking): a wide 16:9 ≥2000px crop per
sector specifically for the detail-page hero, since the cover crop is tighter.

---

The same 6 files now appear in **three** places — sectors index covers, the
sector detail hero, and the homepage "Pensé pour vos métiers" covers — so a
quality upgrade here lifts the whole site.

---

## Homepage — Phase 4

- `// ASSET NEEDED` (optional): the hero still uses the SIRAFAN packshot
  (`public/images/products/sirafan.png`). A wide environment/range shot
  (shelf of Prodet products, or a facility) could replace or sit behind it
  later — not required; the current hero is clean.

## Contact — Phase 4 (done, no asset needed)

- The fake CSS-grid "map" was replaced with a live Google Maps embed of
  `companyInfo.addressFull`. No image asset required.

## Product packshots — ongoing

- Resold/commercialized articles without a photo now fall back to a branded
  placeholder everywhere (grid + PDP). Dropping real packshots into
  `public/images/products/resell/` (matched by name) lights them up. 44 are
  done; the rest degrade gracefully until supplied.
