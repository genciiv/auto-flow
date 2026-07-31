# AutoFlow — Hapi 8: Integration & End-to-End Testing

## Qëllimi

Ky hap shton mbulim për flow-t kryesore të platformës pa ndryshuar runtime-in e aplikacionit dhe pa shtuar varësi të reja.

## Integration tests

Testet e integrimit verifikojnë:

- marrjen e `businessId` nga session/business context, jo nga input-i i klientit;
- filtrimin multi-tenant për customers, vehicles, services, invoices dhe marketplace;
- izolimin e Customer Portal me `profileId`/`userId` server-side;
- flow-n admin application approval → business → membership → subscription;
- permission checks për owner journey;
- feature enforcement për marketplace;
- ndarjen e route-ve për Platform Admin, Business User dhe Customer.

## HTTP E2E smoke tests

`npm run test:e2e` punon kundër një instance reale të AutoFlow kur vendoset:

```powershell
$env:E2E_BASE_URL="http://localhost:3000"
npm run test:e2e
```

Kontrollohen:

- route-t publike;
- security headers;
- redirect-et anonime për `/admin`, `/dashboard` dhe `/customer/dashboard`;
- 404 për route të panjohur.

Nëse `E2E_BASE_URL` mungon, testet E2E shënohen `SKIP` në mënyrë të kontrolluar.

## Kufiri aktual

Login E2E me role reale nuk automatizohet ende sepse kërkon databazë testimi të izoluar, fixture users dhe secrets të veçanta. Kjo nuk duhet të ekzekutohet kundër production database. Hapi i ardhshëm për E2E authenticated është krijimi i staging/test database dhe seed fixtures të dedikuara.
