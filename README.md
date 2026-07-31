This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Database migrations dhe backup

Workflow-i i databazës dokumentohet te:

- `docs/database-migration-runbook.md`
- `docs/database-backup-restore.md`
- `DATABASE_SAFETY_MIGRATION_REPORT.md`

Fillimi i sigurt:

```bash
npm run audit:database
npm run db:baseline:generate
npm run db:target
npm run db:drift:check
```

Mos përdor `prisma migrate reset` mbi databazë me të dhëna reale.

## Rate limiting dhe brute-force protection

```bash
npm run audit:rate-limit
npm test
```

Pas deploy-it të këtij versioni, aplikoni migration-et vetëm me `prisma migrate deploy`. Mos përdorni `migrate reset` në production.

## Plan limits and feature enforcement

Plan rules are enforced server-side through `src/services/plan-access-service.js`. Run `npm run audit:plans` to verify resource limits and feature gates.
