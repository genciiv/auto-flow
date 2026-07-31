# AutoFlow — Hapi 7: Plan Limits & Feature Enforcement

## Përmbledhje

Ky hap e kthen konfigurimin e planeve nga metadata administrative në rregulla reale server-side. Kontrolli nuk mbështetet te fshehja e butonave në UI.

## Shërbimi qendror

U shtua `src/services/plan-access-service.js` me:

- `getBusinessPlanAccess(businessId)`;
- `getPlanUsage(businessId)`;
- `assertPlanLimit(businessId, resource)`;
- `assertPlanFeature(businessId, feature)`;
- `PLAN_RESOURCES` dhe `PLAN_FEATURES` si registry standard.

## Semantika e kompatibilitetit

- `maxUsers`, `maxCustomers`, `maxVehicles` me vlerë `null` trajtohen si unlimited.
- `features: null` ruan kompatibilitetin me planet legacy dhe nuk bllokon papritur module ekzistuese.
- `features: []` do të thotë se asnjë feature premium nuk përfshihet.
- Labels ekzistuese si `Magazinë e thjeshtë`, `Raporte`, `Marketplace` dhe `Punonjës` njihen përmes alias mapping.

## Enforcement i lidhur

- krijimi i klientit kontrollon `maxCustomers` brenda transaction-it;
- krijimi i automjetit kontrollon `maxVehicles` brenda transaction-it;
- krijimi dhe përditësimi i inventory parts kërkon feature `inventory`;
- krijimi, përditësimi dhe ndryshimi i statusit të marketplace listing kërkon feature `marketplace`;
- faqja Analytics kërkon feature `analytics` në server;
- `maxUsers` mbështetet nga shërbimi për flow-n e ardhshëm të staff invitations. Projekti aktual nuk ka action për shtim stafi, ndaj nuk u krijua një flow artificial vetëm për audit.

Fshirja/arkivimi nuk bllokohet nga feature downgrade, që biznesi të mund të pastrojë ose eksportojë të dhënat ekzistuese.

## Gabimet publike

U shtuan kodet:

- `PLAN_LIMIT_REACHED`;
- `PLAN_FEATURE_NOT_INCLUDED`.

Gabimet kthejnë status 403 dhe metadata të kontrolluar për resource, usage dhe plan, pa ekspozuar të dhëna të ndjeshme.

## Testet

U shtuan unit tests për:

- feature normalization dhe alias mapping;
- legacy compatibility;
- feature denial;
- limit reached;
- unlimited resources.

U shtuan contract tests që verifikojnë enforcement në customer, vehicle, marketplace, inventory dhe analytics.

## Verifikimet në mjedisin e paketimit

Kaluan:

- `npm run audit:plans`;
- syntax checks për file-t e rinj dhe të modifikuar.

Testet e plota, lint dhe build nuk mund të ekzekutoheshin në këtë mjedis sepse ZIP-i nuk përmban `node_modules` dhe registry i disponueshëm nuk instalon varësitë e projektit. Duhet të ekzekutohen lokalisht.

## Nuk ka migration

Ky hap nuk ndryshon schema-n Prisma. Fushat e planeve ekzistonin tashmë, ndaj nuk nevojitet migration e re.
