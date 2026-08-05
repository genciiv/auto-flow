# Invoice and Finance Synchronization

## Implemented

- Marking an invoice as `PAID` now creates a `CustomerPayment` for only the remaining unpaid amount.
- Creating an invoice directly with `PAID` status also creates the corresponding payment.
- Existing partial payments are respected, so the system does not double-count income.
- Finance pages are revalidated after invoice payment/status changes.
- The finance dashboard now separates:
  - `Të faturuara`: non-draft invoices issued in the selected period.
  - `Të arkëtuara`: actual customer payments received in the selected period.
- Monthly profit continues to use actual collected payments minus posted expenses and received purchases.
- Added integration contract coverage for invoice/payment synchronization and finance reporting.

## Important accounting behavior

An issued invoice and a collected payment are displayed separately. This prevents the same amount from being counted twice while still showing both monthly sales and monthly cash received.
