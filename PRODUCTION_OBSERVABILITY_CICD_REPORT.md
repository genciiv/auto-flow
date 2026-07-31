# Hapi 9 — Production Observability & CI/CD

## Implementimi

- Structured JSON logger me nivele `debug`, `info`, `warn`, `error`.
- Redaction automatike për password, token, cookie, authorization, secrets, API keys dhe database URLs.
- Correlation përmes `requestId` në API errors dhe readiness responses.
- `GET /api/health/live` për liveness pa varësi nga databaza.
- `GET /api/health/ready` për readiness me kontroll PostgreSQL dhe status `503` kur databaza nuk është gati.
- Metadata për environment, service dhe release/commit SHA.
- Prisma query logging është opt-in me `PRISMA_LOG_QUERIES=true`.
- GitHub Actions CI për audit, test, lint dhe production build.
- Concurrency cancellation dhe minimum permissions në workflow.

## Environment variables

- `APP_ENV`: development, staging ose production.
- `LOG_LEVEL`: debug, info, warn ose error.
- `OTEL_SERVICE_NAME`: emri i shërbimit në log aggregator.
- `APP_VERSION`: versioni/release identifier; në Vercel përdoret automatikisht commit SHA kur mungon.
- `PRISMA_LOG_QUERIES`: `false` normalisht; aktivizo përkohësisht vetëm për diagnostikim.

## Endpoint-et

- `/api/health/live`: përdoret nga platforma për të kontrolluar që procesi përgjigjet.
- `/api/health/ready`: përdoret para dërgimit të trafikut; kontrollon databazën.

Endpoint-et kanë `cache-control: no-store`. Readiness nuk ekspozon kredenciale ose stack traces.

## CI

Workflow: `.github/workflows/ci.yml`

Ekzekutohet në pull request dhe push në `main`:

1. `npm ci`
2. `npm run audit:ci`
3. `npm test`
4. `npm run lint`
5. `npm run build`

CI përdor vetëm vlera placeholder për build dhe nuk lidhet me databazën production.

## Verifikimi në këtë ambient

- `audit:observability`: PASS.
- 5 testet e reja observability/CI: PASS.
- JavaScript syntax checks: PASS.
- `npm ci` u bllokua nga registry i ambientit për `zod-validation-error@4.0.2`; për këtë arsye full test/lint/build duhet të ekzekutohen lokalisht me lockfile-in ekzistues.
