-- ============================================================================
-- seed-demo-portal.sql
-- ============================================================================
-- Idempotent demo seed for the client portal.
--
-- Targets the customer linked to the customer_user `clearsurr@gmail.com`
-- (already created during real auth onboarding). This script:
--   * upgrades the customer profile to realistic Tunisian B2B metadata
--   * inserts a small but realistic Prodet catalog (1 category + 8 products
--     + FR translations) — only if products are missing
--   * inserts 8 customer_usual_product rows for that customer
--   * inserts 6 portal order_drafts in mixed statuses with order_line rows
--     and matching audit_log entries (so the timeline on /client/historique/[id]
--     shows real events)
--
-- All inserts use ON CONFLICT or guarded WHERE NOT EXISTS clauses so re-running
-- the script is safe.
--
-- It does NOT touch auth.users or the app_user/user_customer link rows.
-- It does NOT bypass any RLS or auth check.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1) Resolve the target customer via the linked customer_user email.
-- ---------------------------------------------------------------------------
do $$
declare
  v_customer_id uuid;
  v_user_id uuid;
  v_category_id uuid;

  -- product UUIDs (deterministic so reruns target the same rows)
  v_prod_alcogel uuid := '11111111-0000-4000-a000-000000000001';
  v_prod_sanihand uuid := '11111111-0000-4000-a000-000000000002';
  v_prod_javel uuid := '11111111-0000-4000-a000-000000000003';
  v_prod_prolax uuid := '11111111-0000-4000-a000-000000000004';
  v_prod_profour uuid := '11111111-0000-4000-a000-000000000005';
  v_prod_provitre uuid := '11111111-0000-4000-a000-000000000006';
  v_prod_prolac uuid := '11111111-0000-4000-a000-000000000007';
  v_prod_deofresh uuid := '11111111-0000-4000-a000-000000000008';

  -- order_draft UUIDs (deterministic)
  v_d1 uuid := '22222222-0000-4000-a000-000000000001'; -- review (most recent)
  v_d2 uuid := '22222222-0000-4000-a000-000000000002'; -- approved
  v_d3 uuid := '22222222-0000-4000-a000-000000000003'; -- approved (large)
  v_d4 uuid := '22222222-0000-4000-a000-000000000004'; -- exported
  v_d5 uuid := '22222222-0000-4000-a000-000000000005'; -- rejected
  v_d6 uuid := '22222222-0000-4000-a000-000000000006'; -- review (older)
begin
  select uc.customer_id, u.id
    into v_customer_id, v_user_id
  from app_user u
  join user_customer uc on uc.user_id = u.id
  where u.email = 'clearsurr@gmail.com'
  limit 1;

  if v_customer_id is null then
    raise exception 'Target customer not found. Make sure the customer_user clearsurr@gmail.com is linked to a customer row first.';
  end if;

  -- -------------------------------------------------------------------------
  -- 1a) Upgrade the customer profile to a realistic Tunisian B2B identity.
  --     This makes the redesigned portal look alive without faking analytics.
  -- -------------------------------------------------------------------------
  update customer
    set
      name = 'Hôtel Marina Tunis',
      display_name = 'Hôtel Marina Tunis',
      phone = '+216 71 240 800',
      city = 'Tunis',
      address_line1 = 'Avenue de la Liberté, La Marsa',
      country = 'Tunisia',
      sector_key = 'hotels',
      status = 'active',
      tags = array['demo', 'hotels'],
      updated_at = now()
  where id = v_customer_id;

  -- -------------------------------------------------------------------------
  -- 2) Catalog: one category + 8 manufactured Prodet products with FR labels.
  -- -------------------------------------------------------------------------
  insert into category (id, key, name_fr, name_ar, name_en, display_order)
  values
    ('33333333-0000-4000-a000-000000000001', 'produits-prodet', 'Produits Prodet', 'منتجات بروديت', 'Prodet products', 0)
  on conflict (key) do update set name_fr = excluded.name_fr;

  select id into v_category_id from category where key = 'produits-prodet';

  -- Each product is inserted only if missing. Using stable UUIDs allows the
  -- usual-products and order-line rows below to reference them safely.
  insert into product (id, code, slug, name_canonical, category_id, is_manufactured_by_prodet, is_visible_public, conditionnement, unit_of_sale, search_text)
  values
    (v_prod_alcogel,  'P-ALCO-500',  'alcogel',         'Alcogel',          v_category_id, true, true, 'Flacon 500 ML', 'flacon', 'alcogel gel hydroalcoolique mains'),
    (v_prod_sanihand, 'P-SANI-5K',   'sanihand',        'Sanihand',         v_category_id, true, true, 'Bidon 05 KG',   'bidon',  'sanihand savon liquide mains'),
    (v_prod_javel,    'P-JAVE-5L',   'javel-prodet',    'Javel Prodet',     v_category_id, true, true, 'Bidon 05 L',    'bidon',  'javel prodet desinfectant chlore surfaces'),
    (v_prod_prolax,   'P-PRLX-20K',  'prolax-liquide',  'Prolax Liquide',   v_category_id, true, true, 'Bidon 20 KG',   'bidon',  'prolax lessive liquide linge'),
    (v_prod_profour,  'P-PFOU-5L',   'profour',         'Profour',          v_category_id, true, true, 'Bidon 05 L',    'bidon',  'profour four nettoyage cuisine'),
    (v_prod_provitre, 'P-PVTR-5L',   'provitre',        'Provitre',         v_category_id, true, true, 'Bidon 05 L',    'bidon',  'provitre vitres nettoyant'),
    (v_prod_prolac,   'P-PLAC-5L',   'prolac',          'Prolac',           v_category_id, true, true, 'Bidon 05 L',    'bidon',  'prolac detartrant'),
    (v_prod_deofresh, 'P-DEOF-5L',   'deofresh',        'DeoFresh',         v_category_id, true, true, 'Bidon 05 L',    'bidon',  'deofresh desodorisant ambiance')
  on conflict (slug) do nothing;

  -- French translations (idempotent).
  insert into product_translation (product_id, locale, name, short_description)
  values
    (v_prod_alcogel,  'fr', 'Alcogel',         'Gel hydroalcoolique 500 ML pour la désinfection des mains.'),
    (v_prod_sanihand, 'fr', 'Sanihand',        'Savon liquide professionnel pour l''hygiène des mains.'),
    (v_prod_javel,    'fr', 'Javel Prodet',    'Désinfectant chloré multi-surfaces, bidon 5 L.'),
    (v_prod_prolax,   'fr', 'Prolax Liquide',  'Lessive liquide professionnelle pour linge hôtelier.'),
    (v_prod_profour,  'fr', 'Profour',         'Nettoyant four et plaques de cuisson, dégraissage intensif.'),
    (v_prod_provitre, 'fr', 'Provitre',        'Nettoyant vitres et surfaces brillantes, sans traces.'),
    (v_prod_prolac,   'fr', 'Prolac',          'Détartrant acide pour sanitaires et zones humides.'),
    (v_prod_deofresh, 'fr', 'DeoFresh',        'Désodorisant d''ambiance longue durée.')
  on conflict (product_id, locale) do update set name = excluded.name, short_description = excluded.short_description;

  -- -------------------------------------------------------------------------
  -- 3) Customer usual products — the operational "produits habituels" list.
  -- -------------------------------------------------------------------------
  insert into customer_usual_product (customer_id, product_id, default_quantity, note, is_active)
  values
    (v_customer_id, v_prod_alcogel,  6,  'Distributeurs accueil et étages',                true),
    (v_customer_id, v_prod_sanihand, 12, 'Bidons réservés pour les chambres et la cuisine', true),
    (v_customer_id, v_prod_javel,    8,  null,                                              true),
    (v_customer_id, v_prod_prolax,   4,  'Blanchisserie, cycle principal',                  true),
    (v_customer_id, v_prod_profour,  3,  'Cuisine étage R+1',                               true),
    (v_customer_id, v_prod_provitre, 4,  null,                                              true),
    (v_customer_id, v_prod_prolac,   2,  'Sanitaires zone piscine',                         true),
    (v_customer_id, v_prod_deofresh, 5,  null,                                              true)
  on conflict (customer_id, product_id) do update
    set default_quantity = excluded.default_quantity,
        note = excluded.note,
        is_active = true,
        updated_at = now();

  -- -------------------------------------------------------------------------
  -- 4) Portal order_drafts — six demo requests covering every status, ordered
  --    from most recent to oldest. Lines are stored as rawText (product name)
  --    because the portal builder writes that field.
  -- -------------------------------------------------------------------------

  -- D1: REVIEW (most recent — what the dashboard "Dernières demandes" highlights)
  insert into order_draft (id, reference_code, customer_id, source, status, raw_inbound, notes_internal, created_at, updated_at)
  values (
    v_d1,
    'WEB-2026-0006',
    v_customer_id,
    'portal',
    'review',
    jsonb_build_object(
      'recurrenceMode', 'weekly',
      'recurrenceSummary', 'Hebdomadaire — chaque mardi',
      'deliveryText', 'Réception marchandises — entrée fournisseurs, La Marsa',
      'preferredTiming', 'Avant vendredi',
      'message', 'Réassort hebdomadaire standard. Merci de confirmer la disponibilité du Profour.'
    ),
    'Cadence livraisons: Hebdomadaire — chaque mardi
Zone ou adresse souhaitée: Réception marchandises — entrée fournisseurs, La Marsa
Délai souhaité: Avant vendredi
Message client: Réassort hebdomadaire standard. Merci de confirmer la disponibilité du Profour.',
    now() - interval '12 hours',
    now() - interval '12 hours'
  ) on conflict (id) do nothing;

  insert into order_line (order_draft_id, line_number, raw_text, quantity, unit, matched_product_id, notes) values
    (v_d1, 1, 'Sanihand', 12, 'bidon', v_prod_sanihand, null),
    (v_d1, 2, 'Alcogel',   6, 'flacon', v_prod_alcogel, null),
    (v_d1, 3, 'Profour',   4, 'bidon',  v_prod_profour, 'Si rupture, accepter Provitre en substitution partielle.'),
    (v_d1, 4, 'Provitre',  4, 'bidon',  v_prod_provitre, null)
  on conflict do nothing;

  -- D2: APPROVED (recent, confirmed by Prodet)
  insert into order_draft (id, reference_code, customer_id, source, status, approved_at, raw_inbound, notes_internal, created_at, updated_at)
  values (
    v_d2,
    'WEB-2026-0005',
    v_customer_id,
    'portal',
    'approved',
    now() - interval '3 days' + interval '6 hours',
    jsonb_build_object(
      'recurrenceMode', 'once',
      'recurrenceSummary', 'Commande ponctuelle',
      'deliveryText', 'Quai logistique B',
      'preferredTiming', 'Cette semaine'
    ),
    null,
    now() - interval '3 days',
    now() - interval '3 days' + interval '6 hours'
  ) on conflict (id) do nothing;

  insert into order_line (order_draft_id, line_number, raw_text, quantity, unit, matched_product_id, notes) values
    (v_d2, 1, 'Prolax Liquide', 4, 'bidon',  v_prod_prolax,   null),
    (v_d2, 2, 'Prolac',         2, 'bidon',  v_prod_prolac,   null),
    (v_d2, 3, 'Javel Prodet',   8, 'bidon',  v_prod_javel,    null)
  on conflict do nothing;

  -- D3: APPROVED (larger order, two weeks ago)
  insert into order_draft (id, reference_code, customer_id, source, status, approved_at, raw_inbound, notes_internal, created_at, updated_at)
  values (
    v_d3,
    'WEB-2026-0004',
    v_customer_id,
    'portal',
    'approved',
    now() - interval '14 days' + interval '1 day',
    jsonb_build_object(
      'recurrenceMode', 'monthly',
      'recurrenceSummary', 'Mensuel — début de mois',
      'deliveryText', 'Magasin central',
      'preferredTiming', 'Sous 5 jours ouvrés',
      'message', 'Réassort mensuel complet pour avril.'
    ),
    null,
    now() - interval '14 days',
    now() - interval '14 days' + interval '1 day'
  ) on conflict (id) do nothing;

  insert into order_line (order_draft_id, line_number, raw_text, quantity, unit, matched_product_id, notes) values
    (v_d3, 1, 'Sanihand',       20, 'bidon',  v_prod_sanihand, null),
    (v_d3, 2, 'Alcogel',         10, 'flacon', v_prod_alcogel,  null),
    (v_d3, 3, 'Javel Prodet',    15, 'bidon',  v_prod_javel,    'Prévoir étiquetage chambres.'),
    (v_d3, 4, 'Prolax Liquide',   8, 'bidon',  v_prod_prolax,   null),
    (v_d3, 5, 'Provitre',         6, 'bidon',  v_prod_provitre, null),
    (v_d3, 6, 'DeoFresh',         8, 'bidon',  v_prod_deofresh, null),
    (v_d3, 7, 'Prolac',           4, 'bidon',  v_prod_prolac,   null)
  on conflict do nothing;

  -- D4: EXPORTED (clôturée par Prodet, archivée)
  insert into order_draft (id, reference_code, customer_id, source, status, approved_at, exported_at, raw_inbound, created_at, updated_at)
  values (
    v_d4,
    'WEB-2026-0003',
    v_customer_id,
    'portal',
    'exported',
    now() - interval '30 days' + interval '8 hours',
    now() - interval '28 days',
    jsonb_build_object(
      'recurrenceMode', 'once',
      'recurrenceSummary', 'Commande ponctuelle',
      'deliveryText', 'Quai logistique B',
      'preferredTiming', 'Avant le 30'
    ),
    now() - interval '30 days',
    now() - interval '28 days'
  ) on conflict (id) do nothing;

  insert into order_line (order_draft_id, line_number, raw_text, quantity, unit, matched_product_id, notes) values
    (v_d4, 1, 'Sanihand',  12, 'bidon',  v_prod_sanihand, null),
    (v_d4, 2, 'DeoFresh',   6, 'bidon',  v_prod_deofresh, null)
  on conflict do nothing;

  -- D5: REJECTED (annulée, avec message)
  insert into order_draft (id, reference_code, customer_id, source, status, rejected_at, raw_inbound, notes_internal, created_at, updated_at)
  values (
    v_d5,
    'WEB-2026-0002',
    v_customer_id,
    'portal',
    'rejected',
    now() - interval '40 days' + interval '4 hours',
    jsonb_build_object(
      'recurrenceMode', 'custom',
      'recurrenceDetail', 'à confirmer avec le responsable achats',
      'recurrenceSummary', 'Personnalisée — à confirmer avec le responsable achats',
      'deliveryText', 'Réception centrale',
      'message', 'Demande créée par erreur, à annuler.'
    ),
    null,
    now() - interval '40 days',
    now() - interval '40 days' + interval '4 hours'
  ) on conflict (id) do nothing;

  insert into order_line (order_draft_id, line_number, raw_text, quantity, unit, matched_product_id, notes) values
    (v_d5, 1, 'Profour',  10, 'bidon',  v_prod_profour, 'Annulé')
  on conflict do nothing;

  -- D6: REVIEW (older, second pending — shows the "En revue" tile counter > 1)
  insert into order_draft (id, reference_code, customer_id, source, status, raw_inbound, created_at, updated_at)
  values (
    v_d6,
    'WEB-2026-0001',
    v_customer_id,
    'portal',
    'review',
    jsonb_build_object(
      'recurrenceMode', 'weekly',
      'recurrenceSummary', 'Hebdomadaire — chaque lundi',
      'deliveryText', 'Étages — gouvernantes',
      'preferredTiming', 'Lundi matin'
    ),
    now() - interval '5 days',
    now() - interval '5 days'
  ) on conflict (id) do nothing;

  insert into order_line (order_draft_id, line_number, raw_text, quantity, unit, matched_product_id, notes) values
    (v_d6, 1, 'Sanihand',     8, 'bidon',  v_prod_sanihand, null),
    (v_d6, 2, 'Alcogel',      4, 'flacon', v_prod_alcogel,  null),
    (v_d6, 3, 'Javel Prodet', 6, 'bidon',  v_prod_javel,    null)
  on conflict do nothing;

  -- -------------------------------------------------------------------------
  -- 5) Audit log — makes the timeline render real events.
  -- -------------------------------------------------------------------------
  insert into audit_log (actor_user_id, actor_role, action, entity_type, entity_id, created_at, metadata)
  values
    (v_user_id, 'customer_user', 'portal_request.submitted',       'order_draft', v_d1, now() - interval '12 hours', jsonb_build_object('referenceCode','WEB-2026-0006')),
    (v_user_id, 'customer_user', 'portal_request.submitted',       'order_draft', v_d2, now() - interval '3 days',    jsonb_build_object('referenceCode','WEB-2026-0005')),
    (null,      'operator',      'order_draft.status_updated',     'order_draft', v_d2, now() - interval '3 days' + interval '6 hours', jsonb_build_object('to','approved')),
    (v_user_id, 'customer_user', 'portal_request.submitted',       'order_draft', v_d3, now() - interval '14 days',   jsonb_build_object('referenceCode','WEB-2026-0004')),
    (null,      'operator',      'order_draft.status_updated',     'order_draft', v_d3, now() - interval '14 days' + interval '1 day', jsonb_build_object('to','approved')),
    (v_user_id, 'customer_user', 'portal_request.submitted',       'order_draft', v_d4, now() - interval '30 days',   jsonb_build_object('referenceCode','WEB-2026-0003')),
    (null,      'operator',      'order_draft.status_updated',     'order_draft', v_d4, now() - interval '30 days' + interval '8 hours', jsonb_build_object('to','approved')),
    (null,      'operator',      'order_draft.status_updated',     'order_draft', v_d4, now() - interval '28 days',   jsonb_build_object('to','exported')),
    (v_user_id, 'customer_user', 'portal_request.submitted',       'order_draft', v_d5, now() - interval '40 days',   jsonb_build_object('referenceCode','WEB-2026-0002')),
    (null,      'operator',      'order_draft.status_updated',     'order_draft', v_d5, now() - interval '40 days' + interval '4 hours', jsonb_build_object('to','rejected','reason','customer cancelled')),
    (v_user_id, 'customer_user', 'portal_request.submitted',       'order_draft', v_d6, now() - interval '5 days',    jsonb_build_object('referenceCode','WEB-2026-0001'))
  on conflict do nothing;

  raise notice 'Seed complete. customer_id=% user_id=%', v_customer_id, v_user_id;
end $$;

commit;
