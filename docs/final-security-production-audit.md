# AutoFlow — Final Security & Production Audit

Ky dokument është checklist-i final para deploy-it në production.

## Automatic gates

Ekzekuto:

```bash
npm run audit:production
npm run ci:verify
```

`audit:production` verifikon:
- Platform Admin guard në admin layout dhe Server Actions.
- Revokimin e sesioneve me `sessionVersion` dhe bllokimin e user-ave joaktivë.
- Google OAuth vetëm me email të verifikuar.
- `AUTH_SECRET` dhe `CRON_SECRET` minimum 32 karaktere.
- `DATABASE_URL` + `DIRECT_URL`.
- Google OAuth, Brevo dhe private Supabase Storage configuration.
- Cron endpoints me Bearer secret dhe `timingSafeEqual`.
- Debug/test-email endpoint restrictions.
- Security headers dhe fshehjen e `X-Powered-By`.
- CI gates: dependency audit, project audits, tests, lint dhe production build.

## Manual production checklist

Para launch-it:
1. Vendos vetëm secrets reale në provider-in e hosting-ut; mos commit `.env.local`.
2. Verifiko që Supabase bucket për dokumentet e klientëve është PRIVATE.
3. Konfirmo Google OAuth production origin/callback URL.
4. Konfirmo Brevo sender/domain verification.
5. Krijo `AUTH_SECRET` dhe `CRON_SECRET` të ndryshëm, random dhe >= 32 karaktere.
6. Ekzekuto `npm run deploy:validate -- --target=production`.
7. Ekzekuto migrations vetëm me `prisma migrate deploy` / workflow-in e projektit.
8. Pas deploy-it ekzekuto `DEPLOYMENT_URL=https://... npm run deploy:verify`.
9. Verifiko backup/restore procedure dhe rollback runbook.
10. Mbaj `ENABLE_TEST_EMAIL_API=false` dhe `PRISMA_LOG_QUERIES=false` normalisht në production.

## Remaining operational note

`serverActions.bodySizeLimit` është i lartë për upload-et. Audit-i jep warning që kjo vlerë të mbahet vetëm nëse upload-et reale e kërkojnë.
