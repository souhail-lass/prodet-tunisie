# Incident response — placeholder

> Status: Outline. Owner: Souhail.

## Severity levels

| Sev | Definition | Response |
|---|---|---|
| Sev-1 | Production down OR confirmed personal-data breach. | Acknowledge < 30 min during Tunisian business hours. Containment immediate. Notification per RGPD if breach (within 72h). |
| Sev-2 | Major feature broken (extraction down, push-to-Swiver down). | Acknowledge < 2h business hours. Workaround within 1 day. |
| Sev-3 | Minor bug, cosmetic, performance regression. | Triaged in next weekly review. |

## On detection

1. Acknowledge in [Sentry / Logtail / wherever the alert lives].
2. Open a private incident log (timestamp + observation + action).
3. Containment first (rotate keys, disable affected accounts, roll back deploy if needed).
4. Investigation second.
5. Communicate to stakeholders if Sev-1 or Sev-2 user-visible.
6. Post-incident: write a one-page postmortem under `runbooks/` named `postmortem-YYYY-MM-DD-short-description.md`.

## Personal-data breach (Sev-1)

- Confirm scope: which personal data, which subjects, what was exposed, for how long.
- Notify INPDP (Instance Nationale de Protection des Données Personnelles) per loi 2004-63.
- Notify affected subjects within 72 hours per RGPD alignment.
- Postmortem published internally; redacted version shared if requested.

## On-call posture

- **Single on-call: Souhail.** No rotating on-call.
- **Hours: Tunisian business hours.** Best-effort outside hours; no SLA.
- Critical alerts route via the chosen alerting channel (TBD — WhatsApp deep link from Sentry is a candidate).

## Related

- [../02-architecture/security-rgpd.md](../02-architecture/security-rgpd.md)
- [observability.md](observability.md)
- [runbooks/](runbooks/)
