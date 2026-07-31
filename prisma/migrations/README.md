# Prisma migration history

Kjo dosje duhet të ruhet në Git së bashku me `schema.prisma`.

Baseline-i i parë gjenerohet me:

```bash
npm run db:baseline:generate
```

Kjo krijon:

```text
prisma/migrations/20260731000000_baseline/migration.sql
prisma/migrations/migration_lock.toml
```

Mos e regjistro baseline-in si applied pa:

1. backup të databazës;
2. verifikim që `schema.prisma` përfaqëson databazën ekzistuese;
3. review të `migration.sql`;
4. `npm run db:drift:check`;
5. konfirmim të target-it me fingerprint.

Mos modifiko migration files pasi të jenë aplikuar.
