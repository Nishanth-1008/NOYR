# NOYR — Premium Interactive Streetwear Store

## Quick Start

```bash
npm install
cp .env.local.example .env.local   # fill in your keys
npm run dev
```

Open http://localhost:3000

---

## Routes

| Route | Type | Description |
|-------|------|-------------|
| `/` | Static | Homepage — 3D dark orb hero, marquee ticker, collections, trust badges |
| `/collections` | Static | All collections grid |
| `/collections/[slug]` | Dynamic | Individual collection |
| `/products/[slug]` | Dynamic | Product detail — size selector, add to cart, story, accordion |
| `/cart` | Static | Cart with qty controls |
| `/checkout` | Static | 3-step: Details → Review → UPI Payment |
| `/order-success` | Static | Confirmation with order ID |
| `/track-order` | Static | Status timeline by order ID |
| `/journal` | Static | Blog listing |
| `/journal/[slug]` | Dynamic | Post detail |
| `/about` | Static | Brand story |
| `/faq` | Static | Accordion FAQ |
| `/size-guide` | Static | Size tables (tops + bottoms) |
| `/contact` | Static | Contact form |
| `/admin` | Static | Admin dashboard (password protected) |
| `/api/orders` | API | POST create order, GET list (admin) |
| `/api/orders/[id]` | API | PATCH update status / payment |
| `/api/upload` | API | POST screenshot upload → Supabase Storage |

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| 3D | React Three Fiber + Drei + Three.js |
| Database | Supabase (Phase 2) / localStorage (MVP) |
| Email | Nodemailer (SMTP) |
| Storage | Supabase Storage (screenshots) |

---

## Phase 2 Features (included)

- ✅ **Supabase integration** — full schema in `lib/supabase-schema.sql`
- ✅ **Server API routes** — orders POST/GET, order PATCH, file upload
- ✅ **Email notifications** — order confirmation, payment verified, shipped (4 templates)
- ✅ **Admin dashboard** — search, filter by status/payment, inline controls, tracking ID entry
- ✅ **Journal / blog** — full listing + detail pages with 3 seed posts
- ✅ **Screenshot upload** → Supabase Storage
- ✅ **Graceful fallback** — works entirely on localStorage when Supabase is not configured

---

## Database Setup (Supabase)

1. Create a project at https://supabase.com
2. Go to SQL Editor and run the full contents of `lib/supabase-schema.sql`
3. Create a storage bucket named `noyr-uploads` (set to public)
4. Copy your keys into `.env.local`

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=NOYR <noreply@noyr.in>

ADMIN_PASSWORD=noyr2025
ADMIN_SECRET=change-this-in-production

NEXT_PUBLIC_UPI_ID=noyr@upi
```

---

## Admin Access

Visit `/admin` — default password: `noyr2025`

Change `ADMIN_PASSWORD` in `.env.local` for production.

---

## Deployment (Vercel)

```bash
npx vercel --prod
```

Add all env vars in the Vercel dashboard under Project → Settings → Environment Variables.

---

## Adding Products

**MVP (no DB):** Edit `data/products.ts` — add to the `products` array.

**Phase 2 (Supabase):** Insert rows into `products` and `variants` tables, or build an admin product form.

---

## Project Structure

```
noyr/
├── app/                   # Next.js App Router pages
│   ├── page.tsx           # Homepage
│   ├── collections/       # Collection pages
│   ├── products/[slug]/   # Product detail
│   ├── cart/              # Cart
│   ├── checkout/          # 3-step checkout
│   ├── journal/           # Blog
│   ├── admin/             # Admin dashboard
│   └── api/               # API routes
├── components/
│   ├── Navigation.tsx
│   ├── Footer.tsx
│   ├── CartContext.tsx
│   ├── ProductCard.tsx
│   └── three/Hero3D.tsx   # 3D orb scene
├── data/
│   ├── products.ts        # Seed data
│   └── journal.ts         # Blog posts
├── lib/
│   ├── supabase.ts        # Client
│   ├── supabase-server.ts # Admin client
│   ├── supabase-schema.sql # Full DB schema + seed
│   ├── database.types.ts  # Generated types
│   ├── email.ts           # 4 email templates
│   └── orders.ts          # localStorage helpers
└── types/index.ts         # Shared TypeScript types
```
