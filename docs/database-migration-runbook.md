# AutoFlow — Database Migration Runbook

## Qëllimi

Ky workflow fut Prisma Migrate në një databazë ekzistuese pa bërë reset dhe pa humbur të dhëna.

## Rregulla të panegociueshme

- Mos përdor `prisma migrate reset` mbi staging ose production.
- Mos përdor `prisma db push` si mekanizëm production deployment.
- Mos ndrysho migration files pasi të jenë aplikuar.
- Kryej backup para baseline-it dhe para çdo migration-i me risk.
- `migrate deploy` ekzekutohet në release/CI, jo nga laptopi pa kontroll.

## Baseline për databazën ekzistuese

1. Sigurohu që je në commit-in e duhur dhe working tree është clean.
2. Kontrollo që `DATABASE_URL` tregon databazën e saktë.
3. Gjenero SQL nga schema aktuale:

```bash
npm run db:baseline:generate
```

4. Lexo të gjithë `prisma/migrations/20260731000000_baseline/migration.sql`.
5. Krijo backup:

```bash
npm run db:target
npm run db:backup
```

6. Krahaso databazën me `schema.prisma`:

```bash
npm run db:drift:check
```

`migrate diff --exit-code` përdor exit code 2 kur ka ndryshime. Mos vazhdo nëse ka drift të pashpjeguar.

7. Merr vlerën e konfirmimit nga `npm run db:target` dhe vendose:

```env
ALLOW_REMOTE_DB_OPERATIONS=true
DB_OPERATION_CONFIRM=<database>:<fingerprint>
```

8. Shiko dry-run:

```bash
npm run db:baseline:resolve
```

9. Vetëm pasi backup-i dhe review janë përfunduar:

```bash
npm run db:baseline:resolve -- --execute
npm run db:migrate:status
```

`resolve --applied` regjistron migration-in si të aplikuar; nuk duhet të ekzekutojë SQL-në e baseline-it mbi databazën që tashmë i ka tabelat.

## Migrimet e ardhshme

Development:

```bash
npx prisma migrate dev --name pershkrim_i_shkurter
npm test
npm run lint
npm run build
```

Staging/production:

```bash
npm run db:migrate:status
npm run db:migrate:deploy
npm run db:migrate:deploy -- --execute
```

Komanda është dry-run pa `--execute`.

## Rollback

Prisma nuk gjeneron rollback automatik universal. Për çdo migration destruktiv:

- përgatit SQL roll-forward/repair;
- bëj backup;
- testo në staging me kopje të të dhënave;
- dokumento kolonat/tabelat që preken;
- prefero expand/contract migrations për zero-downtime.
