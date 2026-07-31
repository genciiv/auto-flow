# Hapi 4 — Automated Testing

## Qëllimi

Ky hap shton një bazë testimi automatike pa varësi të reja runtime ose development. Test runner-i përdor `node:test`, i integruar në Node.js, dhe një loader lokal vetëm për alias-in `@/` dhe mock-un minimal të `next/server`.

## Mbulimi i shtuar

### Unit tests

- kontrata `actionSuccess`, `actionFailure`, `validationFailure`, `errorFailure`;
- `AppError`, helper-at e gabimeve dhe normalizimi i kodeve Prisma;
- fshehja e mesazheve teknike për gabime të panjohura;
- krijimi, ripërdorimi dhe kufizimi i `requestId`;
- konvertimi dhe validimi i `FormData`/objekteve;
- kontrata e API responses, statuset dhe headers;
- njohja e redirect/not-found errors të Next.js.

### Contract tests

- login-i përdor dummy bcrypt hash për të zvogëluar user enumeration nga timing;
- email verification kontrollohet pas password-it;
- API routes përdorin `requestId`, kontratën e standardizuar dhe server logging;
- debug/test-email endpoints janë të kufizuara në production;
- security headers kryesore ekzistojnë;
- invoice actions kërkojnë permission-et CREATE, UPDATE, MARK_PAID dhe DELETE;
- invoice actions marrin tenant context nga serveri dhe trajtojnë gabimet.

## Komandat

```bash
npm test
npm run test:unit
npm run test:contracts
npm run audit:tests
```

## Kufijtë e qëllimshëm

Këto janë unit dhe contract tests. Nuk përdorin databazë reale, email provider, Supabase ose browser. Testet integration/E2E me databazë testuese dhe Playwright duhet të shtohen në një hap të veçantë pasi të përcaktohet infrastruktura e testimit dhe izolimi i të dhënave.
