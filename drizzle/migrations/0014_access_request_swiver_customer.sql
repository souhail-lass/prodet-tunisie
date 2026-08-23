-- Retient le client Swiver créé au moment de l'approbation, pour que
-- l'activation puisse rattacher le customer local au bon enregistrement ERP.
--
-- La création se fait via POST /open_api/customers/new (champs camelCase) —
-- vérifié en direct : /open_api/customers/ n'accepte que GET.
ALTER TABLE public.client_access_request
  ADD COLUMN IF NOT EXISTS swiver_customer_id text;
