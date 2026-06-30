# NOYR — Supabase Sync Fixes (this pass)

## What was actually broken

The root cause was simple but pervasive: **the storefront and admin never
read from Supabase**, even when it was fully configured. Three separate
problems compounded:

1. **Storefront pages imported `data/products.ts` directly.** `/`,
   `/collections`, `/collections/[slug]`, `/products/[slug]`,
   `/drops`, and `/build-your-look` all hardcoded the static seed array.
   Nothing the admin changed (new products, edited prices, new
   collections) could ever show up on the live site — there was no
   code path that read the database on the storefront at all.

2. **The admin dashboard only read `localStorage`.** `getLocalProducts()`,
   `getLocalCollections()`, `getLocalOrders()` only ever touched the
   browser's localStorage. Saves did "fire-and-forget" a `fetch()` to
   the API afterward, but the UI never re-read from Supabase, so a
   second browser / incognito tab / production deploy would never see
   admin edits made elsewhere.

3. **The admin's auth header was silently rejected on read routes.**
   The admin UI always sends `x-admin-key: noyr2025` (i.e.
   `NEXT_PUBLIC_ADMIN_PASSWORD`), but `/api/orders` (GET) and
   `/api/analytics` only accepted `ADMIN_SECRET` / `ADMIN_PASSWORD`
   (server-only env vars that are usually unset). Every order/analytics
   fetch silently 401'd and the UI fell back to whatever was cached in
   localStorage — which is why orders looked "stuck."

4. **Schema mismatch.** The `products` table was missing `limited` and
   `drop_date` columns (used by the Phase 4 admin form), and
   `collection_id` was `not null`, so creating a product without
   picking a collection — or deleting a collection that had products —
   would fail outright.

## What changed

- `lib/supabase-schema.sql` — rewritten to be idempotent (`create table
  if not exists`, `on conflict do nothing`) so it's safe to re-run on
  an existing database. Adds `limited`, `drop_date`, `story` to
  `products`; makes `collection_id` nullable; adds a `coupons` table;
  adds `newsletter_subscribers`. **Run this file again in the Supabase
  SQL editor** — it will only add what's missing.
- `lib/database.types.ts` — updated to match (added `limited`,
  `drop_date`, nullable `collection_id`, `tracking_id` on orders,
  `coupons` table).
- `lib/admin-auth.ts` (new) — single shared auth check used by every
  protected route, so the admin's real key is always accepted.
- `/api/orders` and `/api/analytics` — now use the shared auth check.
- `/api/storefront/products` and `/api/storefront/collections` (new) —
  public, unauthenticated reads of *active* products/collections for
  the storefront.
- `lib/useStorefrontCatalog.ts` (new) — the hook every storefront page
  now uses. Resolution order: Supabase → localStorage admin cache →
  static seed data. This is what makes admin edits actually appear on
  the live site.
- `app/page.tsx`, `app/collections/page.tsx`,
  `app/collections/[slug]/page.tsx`, `app/products/[slug]/page.tsx`,
  `app/drops/page.tsx`, `app/build-your-look/page.tsx` — switched from
  the static `data/products.ts` import to `useStorefrontCatalog()`.
- `app/admin/page.tsx` — product/collection/order saves and deletes now
  `await` the Supabase write and reload from the server afterward
  instead of fire-and-forget + localStorage-only refresh. Save errors
  (e.g. a Supabase constraint violation) now surface in the UI instead
  of failing silently.
- `/api/coupons` (new) — coupons now persist to a real `coupons` table
  instead of living only in the admin browser's localStorage.
- `lib/orders.ts` — added `fetchOrders()`, which the admin dashboard
  now uses to load real order data from Supabase.

## Still not Supabase-backed (out of scope for this pass)

- Coupons are stored and manageable in the admin, but **checkout never
  validates or applies a coupon code** — that wiring doesn't exist yet
  on either side. Worth a follow-up if you want working discounts.
- There's no UI to add a new variant to an existing product (only
  existing-variant stock editing in the Stock tab works).
