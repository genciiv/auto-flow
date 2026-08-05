# AutoFlow — Sinkronizimi Fletë Pune, Inventar dhe Faturë

## Qëllimi

Ky update mbron konsistencën mes punëve, pjesëve, stokut, totalit të
shërbimit dhe faturës.

## Ndryshimet

- Shtimi i një pune rrit totalin e shërbimit.
- Heqja e një pune ul totalin e shërbimit.
- Shtimi i një pjese ul stokun, krijon `SERVICE_OUT` dhe rrit totalin.
- Heqja e një pjese e kthen sasinë në stok, krijon `SERVICE_RETURN`
  dhe ul totalin.
- Stoku i pamjaftueshëm bllokon veprimin.
- Pas krijimit të faturës, punët dhe pjesët bllokohen për ndryshim.
- Fatura vazhdon të krijohet me rreshta të veçantë `LABOR` dhe `PART`.
- UI shfaq qartë kur Fleta e punës është mbyllur për faturim.
- U shtua test integrimi për rrjedhën.

## Pa migrim Prisma

Ky update nuk ndryshon `schema.prisma` dhe nuk kërkon migrim.

## Validimi lokal

```powershell
npx eslint .
npm test
npx prisma validate
npm run build
git diff --check
```

## Testi manual

1. Hap një shërbim pa faturë.
2. Shto një punë dhe verifiko totalin.
3. Shto një pjesë dhe verifiko totalin dhe stokun.
4. Hiqe pjesën dhe verifiko që stoku rikthehet.
5. Krijo faturën.
6. Verifiko që formularët dhe butonat e heqjes bllokohen.
7. Hape faturën dhe verifiko rreshtat e punës dhe pjesës.
