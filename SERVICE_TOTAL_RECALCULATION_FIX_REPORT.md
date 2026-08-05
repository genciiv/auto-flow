# AutoFlow — Korrigjimi i totalit të shërbimit

## Problemi

Disa shërbime të vjetra kishin një vlerë ekzistuese në `service.total`.
Kur shtohej një punë ose pjesë, sistemi e rriste atë vlerë në vend që
ta ndërtonte totalin vetëm nga rreshtat aktualë.

Shembull:

- total i vjetër: 15,000 Lekë
- punë: 2,000 Lekë
- pjesë: 1,200 Lekë
- rezultat i gabuar: 18,200 Lekë
- rezultat i saktë: 3,200 Lekë

## Zgjidhja

- Totali rillogaritet nga zero pas çdo shtimi ose heqjeje.
- Formula është: punët + pjesët.
- Faqja e shërbimit shfaq totalin e llogaritur nga rreshtat.
- Para krijimit të faturës, totali rillogaritet dhe ruhet në databazë.
- Nuk përdoret më `increment` ose `decrement` mbi një total të vjetër.
- Shtohet test integrimi për regresionin.

## Pa migrim Prisma

Nuk kërkohet migrim.
