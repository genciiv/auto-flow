# Staff Management

U shtua moduli i stafit për biznesin:
- ftesa me email dhe token të hash-uar;
- skadim 7 ditë, anulim dhe pranim ftese;
- role biznesi dhe ndryshim roli;
- aktivizim/çaktivizim punonjësi;
- kufi real sipas `Plan.maxUsers`;
- veçoria `staff` kërkon planin Premium Business;
- audit log për veprimet kritike;
- migration jo-destruktiv `20260802185000_staff_invitations`.

Para përdorimit ekzekuto backup, pastaj `npm run db:migrate:deploy` me guard-at e databazës remote.


## Plan access update

Moduli i stafit është përfshirë edhe në planin Professional dhe në Free Trial, sepse Free Trial trashëgon funksionet e Professional. Premium Business vazhdon ta përfshijë modulin e stafit.

Shënim: biznesi duhet të ketë një abonim me status `ACTIVE` ose `TRIALING`; konfigurimi i feature-it nuk aktivizon automatikisht një abonim të skaduar ose joaktiv.
