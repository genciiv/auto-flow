# AutoFlow — Subscription Plans Configuration

Ky ndryshim konfiguron vetëm planet dhe trial-in. Nuk ndryshon schema-n Prisma, dashboard-et, autentikimin, email-et, permissions ose të dhënat e moduleve të biznesit.

## Planet

- Starter: 19 €/muaj, 2 përdorues, 150 klientë, 250 automjete.
- Professional: 39 €/muaj, 7 përdorues, 1,000 klientë, 2,000 automjete; inventory, purchases, marketplace dhe analytics.
- Business: 69 €/muaj, 20 përdorues, klientë dhe automjete pa limit; funksione të avancuara.
- Free Trial: 14 ditë, 5 përdorues dhe feature-t e Professional.

## Aplikimi në databazë

Komanda është idempotente dhe përdor `upsert`, prandaj mund të ekzekutohet përsëri pa krijuar plane dublikatë:

```powershell
npm run plans:configure
```

Komanda përditëson vetëm planet me slug-et `free-trial`, `starter`, `professional`, `business` dhe konfigurimin `trialEnabled/trialDurationDays`.

## Siguria

- Nuk kryhet migration.
- Nuk fshihen abonime ose biznese.
- Abonimet ekzistuese ruajnë lidhjen me planin përkatës.
- Përpara ekzekutimit në production rekomandohet backup i databazës dhe kontroll i target-it.
