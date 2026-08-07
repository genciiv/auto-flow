# Sprint 8C — Vehicle Documents & Automated Reminders

## Implemented

- Private customer vehicle document model linked to `CustomerVehicle`.
- Document types: insurance, technical inspection, road tax, registration certificate, ownership, other.
- PDF/JPG/PNG/WEBP uploads up to 10 MB.
- File-signature validation in addition to MIME validation.
- Random, ownership-scoped Supabase Storage paths.
- Runtime guard that rejects a public Supabase bucket.
- Authenticated download route with ownership check and a 60-second signed URL.
- Expiration metadata and selectable reminder lead time (7/14/30/60/90 days).
- Automatic `CustomerVehicleReminder` creation for expiring documents.
- Daily Vercel cron that creates a customer bell notification once when the reminder window is reached.
- Notification deep-link back to the customer vehicle documents section.
- Document deletion removes the storage object and cascades the linked reminder.
- Manual standard reminders no longer deactivate document-backed reminders of the same type.

## Database migration

`prisma/migrations/20260807133000_customer_vehicle_documents_reminders/migration.sql`

Adds:

- `CustomerVehicleDocumentType`
- `CustomerVehicleDocument`
- `CustomerVehicleReminder.documentId`
- `CustomerVehicleReminder.remindDaysBefore`
- `CustomerVehicleReminder.notificationSentAt`
- supporting indexes and cascade relation

## Deployment requirement

`SUPABASE_STORAGE_BUCKET` must point to a **private** Supabase Storage bucket. The application now rejects document operations if that bucket is public.

Apply the Prisma migration before enabling the feature in production.

## Verification completed in this environment

- Sprint 8C targeted tests: 6/6 passed.
- Sprint 8A + Sprint 8B regression tests: 11/11 passed.
- Syntax checks passed for the new server-side JS files.
- `vercel.json` parses successfully.

## Environment limitation

Full `prisma format/validate/generate`, ESLint and Next production build could not be executed because this execution environment does not contain `node_modules` and its package registry could not provide Prisma / external npm packages. These commands should still be run in the normal local/CI environment where `npm ci` is available.
