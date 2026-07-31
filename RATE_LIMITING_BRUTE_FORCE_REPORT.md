# Hapi 6 — Rate Limiting & Brute-Force Protection

## Implementimi

- Rate-limit buckets ruhen në PostgreSQL dhe përdorin vetëm SHA-256 hash të IP/identifier-it.
- Login mbrohet me limiter sipas IP dhe kombinimit IP + email.
- Tentativat e dështuara ruhen te User dhe aktivizojnë lockout progresiv: 5, 15, 30 dhe 60 minuta.
- Login i suksesshëm reseton counters dhe lockout-in.
- Tentativat e dështuara dhe lockout-et regjistrohen në AuditLog.
- Register, forgot password, resend verification, account activation, business application dhe marketplace inquiry kanë limiter server-side.
- Search API kthen HTTP 429 me Retry-After kur tejkalohet limiti.
- U shtua migration e veçantë pas baseline-it.

## Shënime production

Ky implementim është persistent dhe funksionon me shumë instance. Pas deploy-it ekzekutohet `prisma migrate deploy`. Bucket-et e skaduara duhet të pastrohen periodikisht me job/cron në një hap të ardhshëm.
