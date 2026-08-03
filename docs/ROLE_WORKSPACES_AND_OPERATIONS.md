# AutoFlow — Role workspaces and service operations

## Role flow

- OWNER: full access, billing, staff, audit and settings.
- MANAGER: daily operations, assignment, customers, vehicles, services, invoices, inventory and team activity.
- RECEPTIONIST: customers, vehicles, appointments, work-order intake, customer approval, invoice creation and payment registration.
- MECHANIC: assigned jobs only, diagnosis, technical notes, labor lines, parts used and workflow up to READY_FOR_PICKUP.
- WAREHOUSE: inventory, stock movements, purchase orders and service parts.
- ACCOUNTANT: invoices, partial/full payments, outstanding balances, analytics and audit.

## New data model

- ServiceLaborItem: labor/service lines entered by staff.
- InventoryMovement: immutable stock movement history.
- InvoiceItem: invoice snapshot of labor and parts.
- CustomerPayment: customer payments, separate from AutoFlow SaaS billing Payment.

## End-to-end flow

Reception creates customer/vehicle/appointment -> manager assigns mechanic -> mechanic records diagnosis, labor and parts -> stock decreases and movement is recorded -> mechanic marks READY_FOR_PICKUP -> receptionist/accountant creates invoice -> full or partial payments are recorded -> owner/manager sees actions in Audit Log and workspace activity.

## Vehicle connection requests

Vehicle claims connect a personal customer account with a vehicle already registered by a business. After approval, the customer can see the vehicle and permitted service history in the customer portal.
