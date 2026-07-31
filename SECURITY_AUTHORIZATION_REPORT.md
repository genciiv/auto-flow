# AutoFlow — Hapi 3: Security & Authorization Audit

## Përmbledhje

Ky hap përforcon sigurinë e aplikacionit pa ndryshuar modelin ekzistues të roleve ose rrjedhat funksionale. Ndryshimet janë fokusuar te mbrojtja e sesionit, autorizimi server-side, endpoint-et diagnostikuese dhe security headers.

## Ndryshimet e implementuara

### 1. Security headers globale

U shtua `src/lib/security-headers.mjs` dhe u lidh në `next.config.mjs` për të dërguar:

- `X-Content-Type-Options: nosniff`;
- `X-Frame-Options: DENY`;
- `Referrer-Policy: strict-origin-when-cross-origin`;
- `Permissions-Policy` me camera, microphone, payment dhe USB të çaktivizuara;
- `Cross-Origin-Opener-Policy: same-origin`;
- `X-Permitted-Cross-Domain-Policies: none`;
- HSTS vetëm në production.

CSP nuk u aktivizua në këtë hap, sepse një politikë e sigurt për Next.js kërkon nonce/hash dhe testim të plotë të script-eve, Supabase storage dhe integrimeve të ardhshme. Vendosja e një CSP të paplotë do të rrezikonte thyerjen e production-it.

### 2. Mbrojtje ndaj user enumeration në login

`src/auth.js` kryen `bcrypt.compare` edhe kur email-i nuk ekziston ose llogaria nuk ka password aktiv, duke përdorur një hash dummy. Kjo zvogëlon diferencën e kohës mes email-eve ekzistuese dhe joekzistuese.

Kontrollet ekzistuese të `sessionVersion`, statusit aktiv dhe membership-eve aktive u ruajtën.

### 3. Gabime të kontrolluara autorizimi

Helper-at e Server Actions në `src/lib/business-context.js` tani hedhin `AppError` me kod `FORBIDDEN` për mungesë lejeje, jo `Error` të zakonshëm. Kjo i mban përgjigjet konsistente me Hapin 2 dhe shmang ekspozimin e gabimeve teknike.

### 4. Endpoint-et diagnostikuese

- `/api/debug-session` mbetet i paarritshëm në production dhe kërkon `PLATFORM_ADMIN` në development.
- `/api/test-email` kërkon `PLATFORM_ADMIN`; në production është i çaktivizuar si parazgjedhje dhe kthen `404`, përveçse kur vendoset shprehimisht `ENABLE_TEST_EMAIL_API=true`.

Rekomandimi është që `ENABLE_TEST_EMAIL_API` të mos aktivizohet në production, përveç një diagnostikimi të kontrolluar dhe të përkohshëm.

### 5. Audit automatik

U shtua:

```bash
npm run audit:security
```

Audit-i verifikon:

- security headers;
- session invalidation;
- mbrojtjen timing në login;
- endpoint-et debug/test;
- mungesën e `throw new Error` në helper-at e autorizimit;
- permission guard dhe tenant context në 11 modulet kryesore të veprimeve të biznesit.

Audit-i i Hapit 2 u korrigjua gjithashtu për path-et Windows dhe vazhdon të përjashtojë vetëm route-in standard të NextAuth.

## Çështje të shtyra që kërkojnë infrastrukturë

Nuk u implementua rate limiting in-memory, sepse në serverless/multi-instance nuk ofron mbrojtje të besueshme. Për production duhet Redis/Upstash ose rate limiting në reverse proxy/WAF për:

- login;
- forgot/reset password;
- resend verification;
- regjistrim;
- public marketplace inquiries.

Nuk u implementua CSP e rreptë pa nonce. Kjo duhet bërë si hap i veçantë me testim browser dhe observability për violation reports.

## Verifikimet e kërkuara lokalisht

```bash
npm run audit:security
npm run audit:backend
npm run audit:errors
npm run lint
npm run build
```

