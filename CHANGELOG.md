# Changelog

## 0.3.0 — 2026-11-06

- Store sale prices as integer minor units for exact cent precision, validate prices to two decimal places, and add a migration that backfills existing records.
- Widen the dashboard, improve text sizing, and enlarge monthly and annual sales charts.
- Add CI checks for typechecking, linting, and builds.

### Upgrade note

Apply `drizzle/0001_price_minor_units.sql` after the existing `0000` migration before running the updated API against an existing database.
