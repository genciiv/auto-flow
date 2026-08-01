# AutoFlow — Brevo Email Provider Migration

## Scope

Ky ndryshim është i izoluar vetëm te provider-i i email-eve transactional.
Nuk janë ndryshuar dashboard-et, responsive design-i, databaza, autentikimi,
permissions, token-at, templates ose flow-t e aplikimit/regjistrimit.

## Ndryshimet

- `src/lib/email/email-service.js`
  - Resend SDK u zëvendësua me Brevo Transactional Email API.
  - Ndërfaqja ekzistuese `sendEmail(...)` u ruajt pa ndryshim.
  - Ruhen HTML, text, subject prefix, reply-to dhe development redirect.
  - U shtua timeout 15 sekonda dhe error handling i kontrolluar.
- `src/lib/env-validation.mjs`
  - `RESEND_API_KEY` u zëvendësua me `BREVO_API_KEY`.
- `.env.example`
  - U dokumentua `BREVO_API_KEY`.
- `package.json` / `package-lock.json`
  - U hoq dependency `resend`; nuk u shtua dependency e re.
- Audit-i dhe deployment contract test u përditësuan për Brevo.

## Environment variables

```env
BREVO_API_KEY=xkeysib-...
EMAIL_FROM=AutoFlow <sender-i-verifikuar@example.com>
EMAIL_REPLY_TO=adresa-jote@example.com
```

`EMAIL_DEV_REDIRECT_TO` mbetet vetëm për development dhe nuk duhet vendosur në production.

## Flow-t e ruajtura

- Customer registration → email verification
- Resend verification
- Forgot/reset password
- Business approval → account activation email
- Resend activation email
- Email change verification
- Password changed notification
- Development test email endpoint sipas safeguards ekzistuese

## Verifikimi lokal i rekomanduar

```powershell
npm install
npm run audit:deployment
npm test
npm run lint
npm run build
```
