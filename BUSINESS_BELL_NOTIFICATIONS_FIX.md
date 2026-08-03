# Business Bell Notifications Fix

The business dashboard bell now includes persisted `Notification` records for the active business, including subscription plan request decisions.

## Behavior

- Rejected, approved, and activated plan requests appear in the business bell.
- The unread badge includes unread business notifications.
- Subscription notifications link to `/dashboard/settings/subscription`.
- Opening a persisted business notification marks it as read and refreshes the dashboard.
- Existing marketplace inquiry and vehicle claim notifications remain available.

No Prisma schema or database migration is required for this fix.
