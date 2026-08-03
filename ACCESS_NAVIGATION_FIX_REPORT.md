# Dashboard access and navigation fix

## Fixed

- Added `/dashboard/unauthorized` so denied routes no longer end in a generic 404 page.
- Added read-only `SETTINGS_VIEW` access for receptionist, mechanic, warehouse and accountant roles.
- The Settings item now appears in the sidebar for all business staff roles.
- Profile and Settings links in the top-right menu now open the settings page.
- The Profile link targets the profile section directly.
- The Subscription link now uses `/dashboard/settings/subscription`.
- Subscription is hidden from roles that do not have `BILLING_VIEW` permission.
- Business settings remain protected: only roles with `SETTINGS_UPDATE` can modify them.
