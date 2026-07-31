# AutoFlow — Hapi 5: Database Safety & Migration Baseline

## Përmbledhje

Ky hap krijon workflow-in e sigurt për kalimin nga një projekt me vetëm `schema.prisma` te një histori Prisma Migrate e ruajtur në Git, pa bërë reset mbi databazën ekzistuese.

## Çfarë u shtua

- guardrails për target-in e databazës;
- fingerprint pa ekspozuar kredencialet;
- bllokim i operacioneve remote pa flag eksplicit;
- konfirmim i detyrueshëm `database:fingerprint`;
- baseline generator me `prisma migrate diff --from-empty --to-schema`;
- baseline resolve me dry-run dhe `--execute` eksplicit;
- schema drift check;
- migration status dhe deploy me dry-run;
- backup PostgreSQL me `pg_dump` custom format;
- runbook për baseline, migrime, rollback dhe restore;
- audit automatik për workflow-in;
- 3 unit tests për database safety.

## Vendim i rëndësishëm

`migration.sql` nuk u shkrua manualisht. Ai duhet të gjenerohet nga Prisma CLI i të njëjtit version që përdor projekti:

```bash
npm run db:baseline:generate
```

Mjedisi i paketimit nuk mundi të instalojë varësitë sepse registry i brendshëm ktheu 404 për `zod-validation-error@4.0.2`. Për këtë arsye baseline SQL duhet të gjenerohet në makinën lokale, ku projekti tashmë ka `node_modules` funksional.

## Rendi lokal i verifikimit

```bash
npm run audit:database
npm test
npm run db:baseline:generate
npm run db:target
npm run db:drift:check
```

Mos ekzekuto `db:baseline:resolve -- --execute` derisa:

1. të kesh backup;
2. drift check të jetë i pastër;
3. `migration.sql` të jetë lexuar;
4. target-i dhe fingerprint-i të jenë verifikuar.

## Komandat e reja

- `npm run audit:database`
- `npm run db:target`
- `npm run db:baseline:generate`
- `npm run db:baseline:resolve`
- `npm run db:drift:check`
- `npm run db:migrate:status`
- `npm run db:migrate:deploy`
- `npm run db:backup`

## Verifikime në mjedisin e paketimit

- `audit:database`: PASS
- unit tests të database safety: 3/3 PASS
- `node --check` për script-et e reja: PASS
- npm install/ci: BLOCKED nga registry i mjedisit
- baseline SQL, lint dhe build: për t'u ekzekutuar lokalisht
