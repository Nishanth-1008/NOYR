# NOYR — Implementation Plan

Scope for this pass: 9 items, ordered roughly by dependency (auth has to
exist before rewards/referral can be "real"; storage has to exist before
products can have real uploaded images). Each section says what's broken
today, what we'll build, the files touched, and what's explicitly out of
scope.

---

## 0. Sequencing & dependencies

Auth (#3) is a prerequisite for rewards and referrals being *real* per-user
features instead of guest-session mocks, so it goes first. Storage (#8) is
a prerequisite for the product-image-upload flow but not for anything
else. Suggested build order:

1. Supabase Storage bucket + image upload UI (#8) — small, unblocks nothing
   else but admins will want it immediately.
2. Product variants/sizes UI in admin (#1) — small, standalone.
3. Auth: Supabase Auth + Google OAuth + `profiles` table (#3) — foundational.
4. Rewards (#4a) and Referral (#4b) — depend on auth existing.
5. Coupons in checkout (#5) — standalone.
6. Track order fix (#6) — small, standalone.
7. Newsletter API (#7) — small, standalone.
8. Hero 3D hoodie mockup (#2) — purely visual, no backend dependency.

---

## 1. Sizes not defined for new products

**Root cause:** `ProductForm` in `app/admin/page.tsx` imports
`addVariantToProduct` and `deleteVariant` from `lib/catalog.ts` but never
renders any UI to call them. A brand-new product is created with
`variants: []` and there's no way to add a size/stock row afterward except
directly in Supabase. The Stock tab can only *edit* the stock of variants
that already exist — it can't create the first one.

**Fix — add a Variants section to `ProductForm`:**

- New inline editable table inside `ProductForm` (shown only when editing
  an existing product, since a variant needs a real product `id` as its
  foreign key):
  - Columns: Size, Color, SKU, Price override (optional, defaults to
    product price), Stock.
  - "+ ADD SIZE" button appends a blank row; common sizes (XS–XXL)
    available as quick-add chips.
  - Each row has its own Save (`POST /api/catalog/variants`, new handler)
    and Delete (`DELETE /api/catalog/variants?id=`) action, matching the
    existing per-row save pattern already used in `StockTab`.
- For **new** products: after the initial product save succeeds (so we
  have a real `id`), keep the form open and switch straight into "add
  sizes" mode instead of closing, so create-product → add-sizes is one
  continuous flow.

**New/changed files:**
- `app/api/catalog/variants/route.ts` — add `POST` (create) and `DELETE`
  (remove) handlers alongside the existing `PATCH` (stock update). Reuses
  `isAdminAuthed`.
- `app/admin/page.tsx` — `ProductForm` gets a `VariantsEditor` subcomponent.
- `lib/catalog.ts` — `addVariantToProduct`/`deleteVariant` already exist
  for the localStorage cache layer; just wire the new UI to call them +
  the new API routes (same pattern `StockTab.saveVariant` already uses).

**Out of scope:** bulk CSV import of variants, per-variant images.

---

## 2. 3D hoodie mockup in the hero section

**Current state:** `components/three/Hero3D.tsx` already renders an
abstract dark crystalline orb with orbiting shards. `three`,
`@react-three/fiber`, and `@react-three/drei` are already dependencies, so
no new packages are needed.

**Fix — add a low-poly hoodie mesh into the existing scene rather than
building a separate hero:**

- Construct the hoodie from primitive Three.js geometries (no external 3D
  model/asset pipeline needed, and it matches the brand's faceted aesthetic
  already used for the orb):
  - Torso: tapered `CylinderGeometry`.
  - Hood: half `SphereGeometry` offset behind the neckline.
  - Sleeves: two angled `CylinderGeometry` instances.
  - Kangaroo pocket: flattened `BoxGeometry` overlay.
  - Material: `MeshPhysicalMaterial`, low roughness, near-black with the
    existing red-accent palette, so it reads as premium fabric rather than
    a flat placeholder.
- Position it where the orb currently sits; keep the existing orbiting
  shard/particle system as ambient detail around it instead of replacing
  it, so the established motion design isn't lost.
- Slow continuous Y-axis rotation via `useFrame`, layered with the
  existing scroll-linked parallax already applied in `app/page.tsx`
  (`heroY`/`heroOpacity` transforms wrap whatever `Hero3D` renders, so
  this comes for free).
- Mobile fallback: simplified low-vertex geometry (or the existing static
  fallback path, if `Hero3D` already has one) gated on a basic
  viewport-width / `hardwareConcurrency` check, since full WebGL geometry
  can be heavy on low-end mobile GPUs.

**Changed files:**
- `components/three/Hero3D.tsx` — add the hoodie mesh + material; keep
  existing orb/shard/particle systems intact.

**Out of scope:** photogrammetry-accurate hoodie model, importing a GLTF
asset (would require a separate asset-hosting decision — flagged as a
possible follow-up if the primitive-geometry version isn't premium enough).

---

## 3. User accounts (Sign in with Google)

**Decision: use Supabase Auth**, not NextAuth — the project is already
fully built on Supabase (DB + storage), so a second auth system would mean
syncing two separate user identities. Supabase Auth sessions are also
already compatible with the RLS policies used everywhere else in the
schema.

**Setup (Supabase dashboard + Google Cloud Console, not code):**
1. Google Cloud Console: create OAuth 2.0 credentials, add the Supabase
   callback URL (`https://<project>.supabase.co/auth/v1/callback`) as an
   authorized redirect URI.
2. Supabase Dashboard → Authentication → Providers → enable Google with
   the client ID/secret from step 1.
3. Add the production domain (and `localhost:3000` for dev) to Supabase's
   allowed redirect URLs.

**New schema — `profiles` table**, keyed by `auth.users.id`:
```sql
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  full_name     text,
  avatar_url    text,
  referral_code text unique,
  created_at    timestamptz not null default now()
);

create function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end; $$ language plpgsql security definer;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
create policy "Users read own profile"   on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);
```
Also add a nullable `user_id` to `orders` so order history can be queried
per-account while still supporting guest checkout:
```sql
alter table public.orders add column if not exists user_id uuid references auth.users(id);
```

**New files:**
- `lib/supabase-browser.ts` — browser-side Supabase client using
  `@supabase/ssr`'s cookie-based session handling.
- `middleware.ts` — refreshes the Supabase session cookie on every
  request (standard `@supabase/ssr` pattern); required for SSR pages to
  know who's signed in.
- `app/auth/callback/route.ts` — OAuth callback handler that exchanges the
  code for a session.
- `app/account/page.tsx` — profile info, order history (queries `orders`
  filtered by `user_id`), sign out.
- `components/AuthContext.tsx` — exposes `user`, `signInWithGoogle()`,
  `signOut()`, consumed by `Navigation.tsx`.
- `app/login/page.tsx` — "Sign in with Google" screen, matches the site's
  dark/minimal aesthetic.

**Changed files:**
- `components/Navigation.tsx` — account menu entry point.
- `app/checkout/page.tsx` — if signed in, prefill name/email and tag the
  resulting order with `user_id`.
- `package.json` — add `@supabase/ssr`.

**Out of scope:** email/password auth, additional OAuth providers, account
deletion flow, email verification UI (Google accounts are already
verified).

---

## 4. Fix rewards and referral codes

### 4a. Rewards

**Current state:** `app/rewards/page.tsx` is entirely client-side mock
data — `MOCK_ORDERS` is hardcoded, and the referral code is
`'NOYR-' + Math.random()...`, regenerated on every page load, never
persisted, never tied to a real account. None of it reflects real
purchase history.

**Fix:**
- Gate the rewards page behind sign-in (#3) and replace the mock with the
  signed-in user's real verified order history:
  `select * from orders where user_id = ? and payment_status = 'verified'`.
- Points = `floor(total_spent / 10)`, computed from real order totals
  (formula unchanged — only the data source changes).
- Tier thresholds/perks UI stay as-is.
- Referral code: fetch-or-create via the **existing**
  `POST /api/referral` endpoint — it already writes to the real
  `referrals` Supabase table correctly, it was just never called from
  anywhere in the UI. Call it once per signed-in session with the user's
  real email/name instead of generating a fake client-side code.

**Changed files:**
- `app/rewards/page.tsx` — replace `MOCK_ORDERS` + random code generation
  with a real `orders` query + the `/api/referral` call, gated on
  `AuthContext`'s `user`.

### 4b. Referral codes

**Current state:** `/api/referral` (POST to register/fetch a code, GET to
validate one and return a 5% discount) is fully implemented and correct —
it's simply never invoked from the UI on either end (not from rewards, not
from checkout).

**Fix:**
- Wire `app/rewards/page.tsx` to call the existing POST endpoint (4a).
- Add a referral-code field to checkout (can share the input UI with the
  coupon field from #5) that calls `GET /api/referral?code=` and, if
  valid, applies the discount the endpoint already returns.
- On successful order placement with a referral code applied, increment
  `referrals.uses` for that code (new logic — the column exists in the
  schema already, nothing increments it today).

**Changed files:**
- `app/checkout/page.tsx` — referral/coupon input + validation call +
  applying the discount to the displayed/charged total.
- `app/api/orders/route.ts` — on order creation, if a referral code was
  used, increment `referrals.uses`.

**Out of scope:** referral reward payout automation (`reward_pending`
exists in the schema but actually issuing a reward to the referrer stays a
manual admin action for now).

---

## 5. Fix coupon codes — "can't find any placeholder to use them"

**Root cause:** confirmed — coupons are fully manageable in the admin
(`CouponsTab`, backed by the real `coupons` Supabase table) but **checkout
has zero UI to enter one**. The `Tag` icon is imported in
`app/checkout/page.tsx` and never used. There's also no public validation
endpoint — `/api/coupons` is admin-CRUD only and requires the admin key.

**Fix:**
- New public endpoint `GET /api/coupons/validate?code=` — checks `active`,
  `expires_at > now()`, and `used_count < max_uses` against the real
  table, returns the discount type/value or a rejection reason.
- Add a coupon input to the checkout review step, using the
  already-imported `Tag` icon: text input + "APPLY" button, shows the
  resulting discount inline, recalculates the displayed total.
- On order placement, if a valid coupon was applied: factor the discount
  into the stored `order.total`, and increment `coupons.used_count`
  (mirrors the referral `uses` increment in #4b — both can share one code
  path in `POST /api/orders` that bumps whichever code type was used).
- Surface that codes exist somewhere discoverable — e.g. a small "got a
  code?" hint on the cart page, or list active non-expired coupons on the
  rewards page — since right now there's also no way for a shopper to
  *discover* a code exists, only to enter one if they already know it.

**New/changed files:**
- `app/api/coupons/validate/route.ts` (new) — public read-only validation.
- `app/checkout/page.tsx` — coupon input + apply/remove + total
  recalculation.
- `app/api/orders/route.ts` — increment `used_count` on successful order
  with an applied coupon.

---

## 6. Track order cannot find order from database

**Root cause:** confirmed — `app/track-order/page.tsx`'s `handleSearch`
reads `localStorage.getItem('noyr_orders')` directly and never calls any
API. It only finds orders placed in the *same browser* that haven't had
localStorage cleared, which is why it can't find essentially any real
order living in Supabase.

**Fix:**
- New public endpoint `GET /api/orders/lookup?id=&email=` — looks up a
  single order by ID, **requiring the email to match** as a lightweight
  ownership check (orders aren't necessarily tied to a signed-in account,
  so this is the simplest safe public lookup without exposing every order
  by ID alone). Returns the normalized order shape, reusing the
  normalization logic already in `lib/orders.ts`.
- Update the track-order form to collect both Order ID and email, call the
  new endpoint, and remove the `localStorage` read entirely.

**Changed files:**
- `app/api/orders/lookup/route.ts` (new).
- `lib/orders.ts` — extract `normalizeSupabaseOrder` so it's exported and
  shared instead of being private to `fetchOrders`.
- `app/track-order/page.tsx` — replace the localStorage lookup with the
  API call; add an email input alongside the existing order ID input.

---

## 7. Newsletter not sending data to database

**Root cause:** confirmed — there is no `app/api/newsletter/route.ts` in
this codebase at all, despite the `newsletter_subscribers` table already
existing in the schema. `app/newsletter/page.tsx`'s signup form currently
posts nowhere real.

**Fix:**
- `app/api/newsletter/route.ts` (new) — `POST` upserts into
  `newsletter_subscribers` (`email` primary key, so re-subscribing is
  idempotent), accepting an optional `interests` array matching whatever
  the signup form collects.
- Wire `app/newsletter/page.tsx`'s submit handler to this endpoint.
- Basic server-side email format validation before insert.

**Changed files:**
- `app/api/newsletter/route.ts` (new).
- `app/newsletter/page.tsx` — point the form at the real endpoint, show a
  real success/error state instead of an optimistic local-only one.

---

## 8. Hosting images for products

**Current state:** `app/api/upload/route.ts` already uploads to a
Supabase Storage bucket (`noyr-uploads`) when configured, currently used
for payment screenshots. The bucket itself is never created automatically
— `lib/supabase-schema.sql` only has it as a commented-out suggestion.
Product image fields in the admin (`ProductForm`'s `imagesText` textarea)
are raw newline-separated URL strings — there's no upload-from-admin flow
for product photos specifically, only manual URL pasting.

**Fix:**
- Activate the bucket creation in `lib/supabase-schema.sql`:
  `insert into storage.buckets (id, name, public) values
  ('noyr-uploads', 'noyr-uploads', true) on conflict do nothing;` plus a
  public-read storage policy for that bucket.
- Generalize `/api/upload` to accept a `folder` field
  (`payment-screenshots` | `products` | `collections`) so product images
  land in `noyr-uploads/products/...` instead of mixing with payment
  screenshots.
- Add an upload control to `ProductForm` (and `CollectionForm` for
  `banner_image`) alongside the existing raw-URL textarea — file picker
  calling `/api/upload` with `folder: 'products'`, appending the returned
  public URL into the images list. The raw-URL textarea stays as a
  fallback for already-hosted CDN images, not replaced.

**Changed files:**
- `lib/supabase-schema.sql` — activate bucket creation + policy.
- `app/api/upload/route.ts` — add `folder` param.
- `app/admin/page.tsx` — `ProductForm`/`CollectionForm` get an upload
  button next to the image URL fields.

**Out of scope:** image resizing/optimization pipeline, a CDN layer in
front of Supabase Storage (already CDN-backed at the infra level, likely
sufficient without an extra layer).

---

## Summary of new database migrations required

All additive — safe to run on the existing live database:

```sql
-- profiles table + auth trigger (section 3, full SQL above)

-- orders.user_id (section 3)
alter table public.orders add column if not exists user_id uuid references auth.users(id);

-- storage bucket (section 8)
insert into storage.buckets (id, name, public) values ('noyr-uploads', 'noyr-uploads', true)
on conflict do nothing;
create policy "Public read uploads"   on storage.objects for select using (bucket_id = 'noyr-uploads');
create policy "Authenticated upload"  on storage.objects for insert with check (bucket_id = 'noyr-uploads');
```

(`coupons.used_count` and `referrals.uses` already exist in the schema
from the previous fix pass — sections 4–5 only add the logic that
increments them, no new columns required.)

## New environment variables

```
NEXT_PUBLIC_SITE_URL=https://your-deployed-domain.com
```
(Google OAuth client ID/secret are configured directly in the Supabase
dashboard, not as app env vars — Supabase handles the OAuth handshake.)

## New npm packages

```
@supabase/ssr   # cookie-based session handling for Supabase Auth (#3)
```

## Out of scope across the board

- Email verification flows, password-based auth.
- Automated referral/reward payout.
- CSV/bulk import tooling.
- Image optimization/CDN beyond what Supabase Storage already provides.
- A photorealistic (vs. stylized primitive-geometry) 3D hoodie model.
