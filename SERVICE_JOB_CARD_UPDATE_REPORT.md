# Service Job Card Update

Ky update e kthen faqen e detajeve të shërbimit në një Job Card më të qartë dhe funksionale për rrjedhën reale të servisit.

## Ndryshimet

- hiqet miratimi formal i klientit nga ndërfaqja dhe nga bllokimi i workflow-t;
- ruhet problemi i raportuar nga klienti te `description`;
- ruhen diagnoza, shënimet e brendshme dhe mekaniku përgjegjës;
- shtohet pamje vizuale e ecurisë së urdhër-punës;
- shtohet shënim opsional për çdo ndryshim statusi;
- shënimi ruhet në historikun e statusit dhe audit metadata;
- rifreskohen edhe `my-work` dhe `workspace` pas ndryshimeve;
- assignment lejon vetëm përdorues aktivë me rolin `MECHANIC`;
- shtohet test integrimi për Job Card dhe heqjen e miratimit.

## Pa migrim databaze

Nuk kërkohet migrim Prisma. Përdoren fushat ekzistuese `description`, `diagnosis`, `internalNotes`, `assignedUserId` dhe `statusHistory`.
