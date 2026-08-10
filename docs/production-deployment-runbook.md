# AutoFlow Production Deployment Runbook

## 1. Release gate

Para çdo production release:

1. Krijo backup të verifikuar të PostgreSQL.
2. Ekzekuto `npm run ci:verify`.
3. Ekzekuto `npm run deploy:validate -- --target=production` me environment-in real të production.
4. Ekzekuto `npm run db:target`, `npm run db:drift:check` dhe `npm run db:migrate:status`.
5. Apliko vetëm migration-et pending me `npm run db:migrate:deploy`.
6. Deploy vetëm commit-in që kaloi CI.
7. Pas deploy-it ekzekuto `DEPLOYMENT_URL=https://domain npm run deploy:verify`.

## 2. Production environment

Konfiguro në hosting provider, jo në Git:

- `APP_ENV=production`
- `NEXT_PUBLIC_APP_URL=https://<production-domain>`
- `DATABASE_URL` — runtime/pooler connection
- `DIRECT_URL` — direct database connection për migrations
- `AUTH_SECRET` — random, unik, minimum 32 karaktere
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `CRON_SECRET` — random, i ndryshëm nga `AUTH_SECRET`, minimum 32 karaktere
- `BREVO_API_KEY`
- `EMAIL_FROM`
- `EMAIL_REPLY_TO` kur përdoret
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` — vetëm server-side
- `SUPABASE_STORAGE_BUCKET` — bucket privat
- `ENABLE_TEST_EMAIL_API=false`
- `PRISMA_LOG_QUERIES=false`

Mos vendos secrets reale në `.env.example`, README, screenshots, logs ose GitHub issues.

## 3. Google OAuth production

Në Google OAuth Client konfiguro domain-in real të production:

- Authorized JavaScript origin: `https://<production-domain>`
- Authorized redirect URI: `https://<production-domain>/api/auth/callback/google`

`NEXT_PUBLIC_APP_URL` duhet të përdorë të njëjtin canonical HTTPS domain.

## 4. Database

- Preview/Staging nuk duhet të përdorë databazën e production.
- Përdor `DATABASE_URL` për runtime dhe `DIRECT_URL` për migration workflow.
- Mos përdor `prisma migrate reset` në production.
- Release ndalohet nëse drift check dështon.
- Para migration-eve me risk, verifiko restore procedure dhe backup-in.

## 5. Private storage

- `SUPABASE_STORAGE_BUCKET` duhet të jetë PRIVATE.
- `SUPABASE_SERVICE_ROLE_KEY` nuk ekspozohet me prefix `NEXT_PUBLIC_`.
- Customer document upload është maksimum 10 MB dhe lejon vetëm formatet e validuara server-side.
- `serverActions.bodySizeLimit` mbahet në 12 MB: mjafton për limitin 10 MB plus overhead dhe shmang payload-e të panevojshme shumë të mëdha.

## 6. Email

Para launch-it:

- verifiko sender/domain në Brevo;
- konfirmo `EMAIL_FROM`;
- dërgo test vetëm jashtë production ose përmes workflow-it të kontrolluar të Platform Admin;
- mbaj `ENABLE_TEST_EMAIL_API=false` në production.

## 7. Cron

Production duhet të ketë `CRON_SECRET` të fortë. Endpoint-et:

- `/api/cron/subscriptions`
- `/api/cron/customer-vehicle-reminders`

duhet të refuzojnë kërkesa pa secret të vlefshëm. Mos e vendos `CRON_SECRET` në URL ose client-side code.

## 8. Post-deploy verification

Ekzekuto:

```bash
DEPLOYMENT_URL=https://<production-domain> npm run deploy:verify
```

Kontrolli verifikon:

- `/api/health/live`
- `/api/health/ready`
- `/login`
- statuset HTTP;
- health payload dhe `cache-control: no-store`;
- mungesën e `X-Powered-By`;
- `X-Content-Type-Options: nosniff`;
- HSTS në HTTPS.

Pastaj bëj manualisht smoke test për:

- login Platform Admin;
- login Business Owner;
- login Customer / Google;
- një flow kritik business;
- upload/download të një dokumenti privat;
- email delivery;
- notification center;
- System Health.

## 9. Go / no-go

Release lejohet vetëm kur:

- CI është green;
- `audit:production` është OK;
- environment validation është OK;
- schema nuk ka drift;
- migration status është i kontrolluar;
- readiness kthen 200;
- post-deploy verification kalon;
- rollback target është identifikuar.

Nëse një nga këto dështon, release konsiderohet **NO-GO**.
