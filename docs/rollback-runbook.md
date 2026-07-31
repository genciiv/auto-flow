# AutoFlow Rollback Runbook

1. Ndal ndryshimet e reja dhe identifiko commit-in e fundit të shëndetshëm.
2. Në Vercel promovo deployment-in e mëparshëm ose redeploy commit-in e fundit të shëndetshëm.
3. Mos bëj `prisma migrate reset` dhe mos fshi migration history.
4. Për migration destruktive, përdor vetëm migration forward-fix ose restore nga backup-i i verifikuar pas vendimit operacional.
5. Verifiko `/api/health/live`, `/api/health/ready`, login dhe një flow kritik biznesi.
6. Regjistro incidentin, commit-in, migration-et dhe kohën e rikuperimit.
