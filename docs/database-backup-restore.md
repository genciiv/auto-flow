# AutoFlow — Backup & Restore

## Objektivat fillestare

- RPO: maksimumi 24 orë për backup ditor; më mirë PITR kur provider-i e mbështet.
- RTO: 4 orë për beta private, të matet dhe ulet para lançimit publik.
- Retention: 14–30 ditë.
- Restore test: çdo 1–3 muaj dhe para migrimeve të mëdha.

## Backup manual i kontrolluar

Kërkon PostgreSQL client tools (`pg_dump`) në PATH.

```bash
npm run db:target
npm run db:backup
```

Backup-i krijohet në `backups/` ose në `DB_BACKUP_DIR`.

Mos e ruaj kopjen e vetme në të njëjtin server ose disk me aplikacionin.

## Restore test

Restore duhet bërë në databazë të re, kurrë direkt mbi production pa incident plan.

Shembull:

```bash
createdb autoflow_restore_test
pg_restore --clean --if-exists --no-owner --no-acl --dbname=autoflow_restore_test backups/<file>.dump
```

Pastaj:

1. vendos përkohësisht `DATABASE_URL` te databaza restore-test;
2. ekzekuto `npx prisma validate`;
3. ekzekuto `npm run db:drift:check`;
4. kontrollo numrin e tabelave dhe disa records kritike;
5. kryej smoke tests pa dërguar email real.

## Provider-managed backup

Në production aktivizo:

- daily snapshots;
- point-in-time recovery, kur ofrohet;
- encryption at rest;
- akses vetëm për operatorët e autorizuar;
- alarm kur backup-i dështon.
