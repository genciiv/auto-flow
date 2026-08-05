# Korrigjimi i fushave opsionale të pagesës

Gabimi `Invalid input: expected string, received undefined` vinte nga fusha
`notes`, e cila nuk ekziston në formular, por validimi priste gjithmonë string.

Tani `reference` dhe `notes` pranojnë edhe vlerë të munguar dhe normalizohen
në `null`.

Nuk kërkohet migrim Prisma.
