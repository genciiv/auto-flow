# Korrigjimi i metodës së pagesës

Problemi vinte nga vlera `Cash` në formular, ndërsa Prisma pranon enum-in
`CASH`. Veprimi tani normalizon vlerat e formularit në enum-et e sakta:

- Cash -> CASH
- Bank / Bank Transfer -> BANK_TRANSFER
- Card -> CARD
- PayPal -> PAYPAL
- Other -> OTHER

Nuk kërkohet migrim Prisma.
