# AutoFlow — Premium Homepage Redesign

## Goal
Redesign only the public `/` marketing experience so it feels like a focused, modern SaaS product for automotive workshops. The visual direction takes cues from the clarity and product-first structure of RentDeck while preserving AutoFlow's own blue/white product identity.

## What changed
- New product-first hero with a real AutoFlow dashboard screenshot inside a browser/app frame.
- Clear positioning for workshop owners: clients, vehicles, appointments, job cards, inventory, invoices and finance in one system.
- "Without AutoFlow / With AutoFlow" operational story section.
- Eight core product modules in a concise SaaS feature grid.
- End-to-end workflow: booking → vehicle → job card → parts → invoice → payment → customer portal.
- Customer Portal value section.
- Existing pricing, FAQ and footer are preserved and remain connected to the current product.
- Landing navigation anchors updated to match the redesigned sections.
- Existing session-aware Header behavior remains intact: admin, business and customer users still receive their correct dashboard destination.

## Safety / functional scope
No authentication, database, Prisma schema, API routes, business dashboard, customer portal routes or server actions were changed.

The redesign is isolated to the public landing page and its landing components/assets.

## Files
- `src/app/page.js`
- `src/components/landing/Header.jsx`
- `src/components/landing/HeroSection.jsx`
- `src/components/landing/LandingNavigationLinks.jsx`
- `src/components/landing/WorkshopStorySection.jsx`
- `src/components/landing/CoreProductSection.jsx`
- `public/images/autoflow-dashboard.png`

## Validation note
The source package registry available in the build workspace returned a 404 for `zod-validation-error`, so a clean dependency install and full lint/build could not be completed here. Run the normal local verification after applying the patch:

```powershell
npm install
npx prisma generate
npx prisma validate
npm test
npm run lint
npm run build
```
