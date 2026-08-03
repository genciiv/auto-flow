# Subscription Plan Requests

Ky modul ruan kërkesat për ndryshim plani në databazë dhe i menaxhon nga paneli Admin.

## Përfshirë

- `SubscriptionPlanRequest` me statuset `PENDING`, `APPROVED`, `REJECTED`, `PAID`;
- mbrojtje nga kërkesat e dyfishta aktive;
- ruajtje e çmimit dhe planit aktual në momentin e kërkesës;
- listë dhe filtra në `/admin/plan-requests`;
- aprovim, refuzim dhe konfirmim pagese;
- aktivizim i abonimit vetëm pas konfirmimit të pagesës;
- audit log;
- njoftim në aplikacion dhe email për biznesin;
- migration jo-destruktiv.

## Migration

`20260803063000_subscription_plan_requests`

Pas backup-it përdor script-in e kontrolluar të projektit me `--execute`.
