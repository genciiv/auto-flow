# AutoFlow — Service Work-Order Workflow

Implemented a controlled first production version of the service workflow:

- extended statuses: DRAFT, PENDING, IN_PROGRESS, WAITING_FOR_PARTS, READY_FOR_PICKUP, COMPLETED, DELIVERED, CANCELLED;
- guarded server-side status transitions;
- mechanic assignment restricted to active business members;
- diagnosis and internal notes;
- optional customer approval gate before work starts;
- status timestamps and immutable status history;
- audit logging for workflow changes;
- business notifications for ready/completed/delivered states;
- dedicated work-order page at `/dashboard/services/[id]`;
- non-destructive Prisma migration `20260803090000_service_workflow`.

The existing service creation, parts usage, invoices and inventory flows are preserved.
