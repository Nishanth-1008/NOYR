# NOYR Phase 4 — Brand Universe

## What's New in Phase 4

### New Pages

| Route | Description |
|---|---|
| `/universe` | Immersive brand lore — chapters, pillars, timeline |
| `/lookbook` | Full-screen editorial lookbook with overlay detail view |
| `/drops` | Drop calendar with countdown timers + notify-me signup |
| `/rewards` | Loyalty program — tiers, points, referral codes, perks |
| `/build-your-look` | 3-step guided look builder / style quiz |
| `/newsletter` | Standalone newsletter signup with interest tags |

### New Components

| Component | Description |
|---|---|
| `CustomCursor` | Smooth spring-animated custom cursor (pointer: fine only) |
| `PageTransition` | Fade+slide entrance animation on navigation |

### Upgraded Pages
- **Navigation** — mega menu with sectioned links (Shop / Universe / Account)
- **Homepage** — added Lookbook teaser, Universe+Drops cards, Phase 4 trio row
- **Journal article** — reading progress bar (red line under nav), estimated read time
- **Footer** — full 5-column grid with all Phase 4 routes

### Admin Additions
- **Coupons tab** — create/pause/delete discount codes (percent or flat)
- **Audit log tab** — event timeline built from order history

## Route Summary (All Phases)

```
/                     Homepage
/collections          All collections
/collections/[slug]   Collection detail
/products/[slug]      Product detail
/cart                 Cart
/checkout             Checkout + UPI payment
/order-success        Post-order confirmation
/track-order          Order tracking
/wishlist             Wishlist
/about                About NOYR
/faq                  FAQ
/size-guide           Size guide
/contact              Contact
/journal              Journal index
/journal/[slug]       Journal article (with reading progress)
/admin                Admin dashboard

— Phase 4 —
/universe             Brand world / lore
/lookbook             Editorial lookbook
/drops                Drop calendar + countdown
/rewards              Loyalty rewards dashboard
/build-your-look      Style quiz / look builder
/newsletter           Newsletter signup
```

## Design Notes
- All Phase 4 pages follow the existing black/white/red design system
- Custom cursor only activates on devices with `pointer: fine` (desktop)
- Drop countdowns use static dates — wire to Supabase `products.drop_date` for live data
- Rewards/coupons use localStorage — migrate to Supabase for production
- Lookbook panels support `data-cursor` attribute for custom cursor labels
