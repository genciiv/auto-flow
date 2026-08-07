# Sprint 8D — Vehicle Health & Ownership Insights

Sprint 8D adds a deterministic health layer on top of the existing customer vehicle data from Sprints 8A, 8B and 8C.

## Scope

- Vehicle health status: `OK`, `ATTENTION`, `URGENT`.
- Upcoming actions from maintenance due dates/mileage, manual reminders, expiring documents and stale/missing mileage.
- Document reminders are de-duplicated from their source document.
- Ownership metrics: expenses from the last 12 months, tracked maintenance categories, document count and verified-service count.
- Health overview on the customer vehicle detail page.
- Compact health overview on the customer dashboard.
- No new database tables or migration. Health is calculated from current source-of-truth data.

## Status rules

- `URGENT`: overdue or due maintenance/reminder, expired document, or document expiring within 7 days.
- `ATTENTION`: maintenance/reminder within the existing "soon" window, document expiring within 30 days, missing mileage, or mileage not refreshed for at least 120 days.
- `OK`: no active urgent/attention signals.

## Notes

The health layer is intentionally deterministic. It does not claim AI diagnosis or infer mechanical problems that are not represented by AutoFlow data.
