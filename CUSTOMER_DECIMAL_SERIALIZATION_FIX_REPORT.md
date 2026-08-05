# Korrigjimi i Prisma Decimal te Klientët

`/dashboard/customers` merr faturat e klientëve. Fusha `invoice.total`
është `Prisma.Decimal`, ndërsa `CustomersTable` është Client Component.

Tani lista serializohet para se t'i kalojë Client Component-it.

Mesazhi për `scroll-behavior: smooth` është warning i Next.js dhe nuk
është shkaku i problemit me faturat.

Nuk kërkohet migrim Prisma.
