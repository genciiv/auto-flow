# AutoFlow Production Deployment Runbook

## Release gate
1. Krijo backup të verifikuar të PostgreSQL.
2. Ekzekuto `npm run audit:ci`, `npm test`, `npm run lint`, `npm run build`.
3. Ekzekuto `npm run deploy:validate -- --target=production` me env production të ngarkuara.
4. Kontrollo `npm run db:migrate:status`; apliko vetëm migration-et pending me workflow-in e mbrojtur.
5. Deploy commit-in e njëjtë që kaloi CI.
6. Ekzekuto `DEPLOYMENT_URL=https://domain npm run deploy:verify`.

## Vercel environments
Mbaj vlera të ndara për Development, Preview/Staging dhe Production. Mos kopjo databazën production te Preview. `NEXT_PUBLIC_APP_URL` duhet të jetë URL kanonike HTTPS e environment-it. `AUTH_SECRET` duhet të jetë unik dhe i gjatë.

## Supabase
Përdor pooler URL për runtime dhe direct connection vetëm për migrime kur kërkohet. Service-role key është vetëm server-side. Storage bucket duhet të ekzistojë para deploy-it.

## Go/no-go
Release lejohet vetëm kur readiness kthen 200, CI është green, schema nuk ka drift dhe rollback target është identifikuar.
