# RentNest — Final phase: Buy & Sell, triangle hero, SEO, production polish

Everything up to F13 is done. This is the last build phase. After it you do **Step 43 (docs)** and **Step 44 (deploy)** from PLAN-REDESIGN.md.

Same rules as before: Claude Code builds, runs lint and build, and reports. **You** run all git commands, and you run anything that touches the production database yourself.

Order: **Part A** (three small frontend changes, no backend needed) → **Part B** (backend for buy/sell) → **Part C** (frontend for buy/sell) → **Part D** (SEO, performance, final QA).

---

## Decisions I made (change any of them before you start)

| Topic | Decision |
|---|---|
| Roles | Still exactly 3 (the assignment requires it). A **Tenant** can also buy. A **Landlord** can list homes *for rent or for sale* (the UI says "Owner" where it makes sense). Admin approval of landlords applies to selling too. |
| Buy flow | A real-estate sale can't be one click, so it follows a realistic path: **Make an offer → owner accepts, rejects or counters → buyer pays an earnest-money deposit (Stripe) → home goes "Under contract" → owner marks it Sold.** The rental flow is not touched. |
| Deposit | 1% of the agreed price (minimum $500), paid with the existing Stripe Checkout in test mode. The full price is never charged online. The page wording stays neutral: no claims about escrow or legal protection. |
| Hero shape | I read your triangle image as the hero design: a connected mosaic of triangle facets with thin gaps, like that picture. |
| Brand name | Stays "RentNest" for now. If you want a name that covers buying too, that's a separate rename (logo, metadata, domain). Tell me before the SEO step if you want it. |

---

# Part A — Three frontend changes (start now)

### A1. Triangle mosaic hero cards (item 1)
> Redesign the 3 floating hero cards on the home page. They must no longer be rounded squares. Build one connected **triangle mosaic** like the triangle image in my design-refs folder (`triangle-ref.png`; look at it): a large equilateral-ish triangle made of ~7–9 small triangle facets separated by thin gaps (1.5–2 px, champagne/ivory hairline), with the central facet inverted, as in the reference. Implementation: one SVG or absolutely positioned elements using `clip-path: polygon(...)`; no images with baked-in shapes.
> - **3 facets show the admin-chosen properties** (from homepage settings `hero`): the photo fills the triangle (`object-cover`, via next/image), and a small price + city label sits inside or just under the facet, readable on any photo (dark gradient). Each is a link to the property, with `aria-label`, focus ring and hover (slight scale, brighter border).
> - **The other facets are decorative**: glass fill (blur, low opacity) with a thin gold outline, a few of them slowly pulsing.
> - **Same behavior as today**: mouse parallax at different depths, a gentle bobbing, and the same scroll-driven animation: as you scroll, the facets **fly outward from the center** and fade, while the hero image zooms. It must still feel like one 3D object breaking apart.
> - If fewer than 3 hero properties are set, empty photo facets become decorative ones.
> - Mobile (< 768 px): smaller mosaic placed to the right/below the headline, no mouse parallax, simpler scroll effect. Reduced motion: static mosaic.
> - Keep LCP and layout shift good: reserve the mosaic's size, no layout jump.

**Done when:** the hero shows a connected triangle shape with 3 property photos in it; scrolling breaks it apart smoothly; mobile looks good.

### A2. Professional logo wordmark font (item 2)
> Change the font of the "RentNest" logo text only. Build a temporary page `/logo-lab` showing the wordmark in 3 professional real-estate styles on dark and light backgrounds, with the monogram next to it:
> 1. **Marcellus**: classic Roman capitals, uppercase `RENTNEST`, tracking 0.18em.
> 2. **Jost** (500): modern geometric sans, uppercase, tracking 0.22em.
> 3. **Playfair Display** (600): editorial serif, "RentNest" in mixed case.
>
> Load them with `next/font/google` (subset latin, `display: swap`). Wait for me to pick one, then apply it to the navbar, footer, auth pages, dashboard bar and the OG image, and delete `/logo-lab`. Keep the monogram. Make sure the wordmark stays sharp at 14–22 px.

**Done when:** you picked a font and it looks right everywhere the logo appears.

### A3. Remove the hover pop-up image (item 3)
> In the "A place for every chapter" section, remove only the small image that appears next to the cursor on hover (the one that duplicates the big image). Keep everything else exactly as it is: the type list, counts, gold underline, dimming, the big image on the right that crossfades, and the mobile cards. Remove any code that became unused.

**Done when:** hovering shows no floating image, and the rest looks unchanged.

---

# Part B — Backend for buy & sell

**First message in the backend session:**
```
Read README.md, docs/api.md, the Prisma schema and PLAN-FINAL.md (Part B). We add buy/sell support in steps; I name each step. Rules: don't change how the existing rental flow behaves, follow the existing module pattern (route, validation, controller, service), explicit .js import extensions, keep the Stripe webhook raw-body order, additive migrations only (relaxing a NOT NULL is allowed, no drops or renames), create migrations with `npx prisma migrate dev --create-only` and show me the SQL, never apply migrations to production, update docs/api.md and the Postman collection, run `npm run build` at the end. Do NOT run git commands. Start with Step S1.
```

### S1. Sale listings
> Add sale listings to Property.
> - Enum `ListingType { RENT SALE }`. Property gets `listingType ListingType @default(RENT)` (existing rows become RENT) and nullable `salePrice Decimal?`. Make `rentAmount` nullable (relaxing NOT NULL is allowed). Add `AvailabilityStatus` values `UNDER_CONTRACT` and `SOLD`. Add `@@index([listingType])`.
> - Validation by type: RENT requires `rentAmount > 0` and ignores `salePrice`; SALE requires `salePrice > 0` and stores `rentAmount = null`. Changing a listing's type is not allowed once it has bookings or offers.
> - `GET /properties` (and admin/landlord lists, `/properties/map`, `/properties/states`) accept `listingType`. `minPrice` and `maxPrice` apply to `rentAmount` for RENT and `salePrice` for SALE. `sortBy` accepts `price` (uses whichever field applies). Public lists only show `AVAILABLE` and `UNDER_CONTRACT` by default; `SOLD` ones stay viewable by direct link (details page shows a "Sold" banner) but are hidden from lists unless `availabilityStatus=SOLD` is requested.
> - Every response that returns a property includes `listingType` and `salePrice`, and `/properties/map` includes both and `price` (the right one). Check every place that uses `rentAmount` (rental service, homepage settings counts and starting prices, favorites) so a SALE property can't break rental code: booking a SALE property must be rejected with a clear error.
> - Homepage settings: counts and "starting price" per state/type are computed per listing type (return `rent` and `sale` counts and starting prices separately; keep the old fields so the current frontend keeps working).
> - Seed: add 6 SALE properties in different states (use `images.unsplash.com` photos like the current seed, realistic prices, coordinates), keeping the script idempotent.

### S2. Purchase offers
> Add an offers module. Model `PurchaseOffer { id, propertyId, buyerId, offerAmount Decimal, counterAmount Decimal?, agreedAmount Decimal?, financing (CASH | MORTGAGE | OTHER), message String?, status, createdAt, updatedAt; indexes on propertyId, buyerId, status }`. Enum `OfferStatus { PENDING COUNTERED ACCEPTED REJECTED WITHDRAWN DEPOSIT_PAID COMPLETED EXPIRED }`.
> Endpoints:
> - Tenant: `POST /offers { propertyId, offerAmount, financing, message? }` → rules: property is SALE and AVAILABLE, not owned by the buyer, buyer has no other open offer (PENDING/COUNTERED/ACCEPTED) on it, amount > 0. `GET /offers?status=` (mine), `GET /offers/:id`, `PATCH /offers/:id/withdraw` (allowed until the deposit is paid), `PATCH /offers/:id/accept-counter` (COUNTERED → ACCEPTED, `agreedAmount = counterAmount`).
> - Landlord (approved only, owner of the property): `GET /landlord/offers?status=`, `PATCH /landlord/offers/:id { action: "ACCEPT" | "REJECT" | "COUNTER", counterAmount? }` (ACCEPT sets `agreedAmount = offerAmount`; COUNTER requires `counterAmount > 0`), `PATCH /landlord/offers/:id/complete-sale` (only from DEPOSIT_PAID → COMPLETED and property → SOLD).
> - Admin: `GET /admin/offers?status&page&limit`.
> - Offers expire 7 days after the last action if still PENDING/COUNTERED/ACCEPTED without deposit: implement as a lazy check when offers are read plus a small `npm run offers:expire` script (no cron needed).
> - Notifications (add new enum values `OFFER_RECEIVED OFFER_ACCEPTED OFFER_REJECTED OFFER_COUNTERED OFFER_WITHDRAWN DEPOSIT_RECEIVED DEPOSIT_PAID SALE_COMPLETED`), sent after the main action succeeds and never breaking it, with links to the right dashboard pages.

### S3. Earnest-money deposit (Stripe)
> Add the deposit payment without touching rental payments.
> - Model `OfferPayment { id, offerId @unique, transactionId @unique, amount Decimal, paymentStatus (reuse PaymentStatus), paymentDate?, timestamps }`.
> - `POST /offers/:id/deposit` (buyer, offer must be ACCEPTED): creates a Stripe Checkout Session in USD for `max(500, round(1% of agreedAmount))` with `metadata: { type: "sale_deposit", offerId }`, success URL `CLIENT_SUCCESS_URL`-style `/payment/success?type=deposit&session_id={CHECKOUT_SESSION_ID}` and cancel URL `/payment/cancel?type=deposit&offerId=…`. Re-calling it while a PENDING session exists returns a fresh session (like the rental flow).
> - `POST /offers/confirm { sessionId }` (buyer): idempotent, same pattern as `/payments/confirm`. The webhook handler dispatches by `metadata.type`: rentals as today, `sale_deposit` to the new handler. When paid (in one transaction): offer → DEPOSIT_PAID, property → UNDER_CONTRACT, every other open offer on that property → REJECTED with notifications. Notify buyer (DEPOSIT_PAID) and owner (DEPOSIT_RECEIVED) only when the update actually happened (no double notifications from webhook + confirm).
> - `GET /offers/payments` (buyer's deposits).
> - If the owner marks the sale complete → property SOLD. If a buyer withdraws after paying, return a clear error: "Contact the owner" (no refunds are automated).
> - Include the deposit amount (`depositAmount`) in the offer response for ACCEPTED offers so the UI can show it before the buyer pays.

### S4. Review and apply (you run this)
> Show me all migrations from S1–S3 and confirm each is additive. Then give me the exact commands, in order, to apply them to production and run the seed for the new sale properties. Don't run anything.

**You do:** same as last time — a separate terminal, export the production `DATABASE_URL`, run `npx prisma migrate status`, then `npx prisma migrate deploy`, then the seed command Claude Code gives you, then `unset DATABASE_URL`. Commit and push, wait for Vercel, then open `https://rentnest-backend-one.vercel.app/api/properties?listingType=SALE` and check it shows the new homes. (Only a **push** makes Vercel deploy new code; the Redeploy button reuses the old commit.)

---

# Part C — Frontend for buy & sell

**First message in the frontend session** (add it to your next session or send it after `/clear`):
```
Read CLAUDE.md, PLAN-REDESIGN.md, PLAN-FIXES.md and PLAN-FINAL.md. Steps A1–A3 are done and the backend now supports buy/sell (Part B of PLAN-FINAL.md is deployed): read ../rentnest-backend/docs/api.md and the new offers module before using the endpoints, and add service functions and types. I name each step; after each, run lint and build and give me a summary and the "Done when" list. Do NOT run git commands. Start with Step C1.
```

### C1. Public browsing: Rent | Buy everywhere
> Add buying to the public side without changing the rental look.
> - **Navbar:** links become Home, Rent, Buy, Sell, About, Contact (role-aware extras stay). "Sell" goes to a `/sell` landing page (C3).
> - **Routes:** `/rent` and `/buy` are the browse pages (same filter sidebar and grid as `/properties`, with `listingType` fixed). `/properties` stays and shows both with a Rent/Buy/All tab. Add `/rent/[state]` and `/buy/[state]` city/state landing pages (statically generated from `/properties/states`, with unique title, intro paragraph, and the filtered grid), and make the state tiles on the home page link there.
> - **Filters:** price range and slider adapt to the listing type (rent ≤ $10k/mo; sale up to $5M+, with sensible steps). Add the sort option "Price".
> - **PropertyCard:** a "For rent" / "For sale" chip; sale price formatted as `$450,000` without "/mo"; status chips Available / Under contract / Sold; price per sq ft for sale. Cards keep the favorite heart.
> - **Hero search:** add a Rent | Buy segmented switch above the search panel (default Rent). The panel's price options change with the switch. Submit goes to `/rent` or `/buy` with params.
> - **Home page:** the featured and latest sections get a small Rent | Buy toggle; add a "Sell with RentNest" call-to-action band (links to `/sell`); update the statement copy, FAQ (add 4 buying questions: how offers work, what the deposit is, can I withdraw, how long does it take) and stats so they mention both.
> - **Map markers:** rent = gold, sale = ink/white outline, current property = red. Add a small legend.
> - **Property details (sale):** big price, price per sq ft, "For sale" chip, a sticky panel with "Make an offer" (instead of "Request to Rent"), and a **mortgage estimate calculator** (home price, down payment slider 5–50 %, rate input, term 15/20/30 years → estimated monthly payment, with the note "Estimate only. Not a loan offer."). Banners for Under contract and Sold (offer button disabled). Rental details pages stay as they are.

**Done when:** you can browse rent and buy separately, the new sale homes show correct prices, and the rental pages look unchanged.

### C2. Buyer flow: offers and deposit
> Build the buyer side.
> - **Make an offer dialog** (tenant only; logged-out → login with redirect; landlord/admin → disabled with tooltip): offer amount (prefilled with the asking price, shows % of asking), financing select (Cash / Mortgage / Other), optional message (500 chars), summary of the deposit that would apply later. Zod validation, toasts, map `errorDetails` to fields.
> - **`/dashboard/tenant/offers`** (add "Offers" to the tenant nav): bento list with property thumbnail, asking vs your offer vs agreed price, a status pill (Pending, Countered, Accepted, Rejected, Withdrawn, Deposit paid, Completed, Expired) and actions per status: COUNTERED → "Accept counter" / "Decline"; ACCEPTED → "Pay deposit" ($X) / "Withdraw"; PENDING → "Withdraw"; DEPOSIT_PAID → "Awaiting sale completion"; show a timeline per offer (offer → response → deposit → sale).
> - **Deposit payment:** the "Pay deposit" button calls `POST /offers/:id/deposit` and redirects to Stripe. Extend `/payment/success` and `/payment/cancel` to handle `type=deposit` (confirm via `POST /offers/confirm`, show "Deposit received — the home is now under contract", links to My offers). Keep the rental payment flow exactly as it is.
> - Overview: add an "Offers" metric and "Next action" lines for the tenant; the Payments page also lists deposits (label "Deposit").
> - Notifications for the new types (icons, links).

**Done when:** a tenant makes an offer on a sale home, the owner counters (after C3), the tenant accepts, pays the Stripe test deposit and sees it Under contract.

### C3. Seller flow and admin
> Build the seller/owner side.
> - **Property form:** a "For rent | For sale" toggle at the top. Rent shows the monthly rent field; sale shows the asking price (and the estimated deposit). The type can't be changed on edit if it has bookings/offers (disabled with an explanation). My Properties list shows the type chip and the right price.
> - **`/dashboard/landlord/offers`** (add "Offers" to the landlord nav, with a pending-count badge): table/cards with buyer name, property, asking vs offer, financing, message, date, status; actions Accept / Reject / **Counter** (small dialog for the counter amount), and for DEPOSIT_PAID "Mark sale completed" (confirm dialog). Optimistic updates, toasts, same patterns as rental requests. Blocked while the landlord is pending approval, like other write actions.
> - **Overview:** add metrics (homes for sale, open offers, sales completed, deposits received) and an "Incoming offers" card.
> - **`/sell` landing page:** premium landing for owners: headline, 3 steps (List, Receive offers, Close), benefits, FAQ for sellers, CTA ("Register as an owner" → register with landlord preselected, or "List a property" if already an approved landlord, or the pending note). SEO metadata included.
> - **Admin:** add "Offers" page (all offers, status filters, pagination) and listing-type filters on admin Properties; overview metrics for sale listings and offers.
> - Contact form subject list: add "Buying" and "Selling". Update the About copy to say "rent and buy".

**Done when:** the whole sale flow works end to end across the three roles, with notifications at every step.

---

# Part D — SEO, performance and final quality

### D1. SEO foundation
> Make the site fully SEO-ready with the Next.js Metadata API (no third-party SEO plugin).
> - **Site config:** `NEXT_PUBLIC_SITE_URL` (canonical base). `metadataBase`, title template (`%s · RentNest`), default description, `alternates.canonical` on every public page (careful with filter query strings: canonical = the page without filters; paginated/filtered lists use `noindex,follow` when they have more than one filter).
> - **Per page:** unique `title` and `description` for home, /rent, /buy, /rent/[state], /buy/[state], /properties, /properties/[id] (title like "3-bed house for sale in Austin, TX · $450,000"), /sell, /about, /contact, /cookies, /privacy, /terms. Open Graph and Twitter cards (summary_large_image) with dynamic OG images per property (first photo, price, city) using `opengraph-image.tsx`.
> - **`app/sitemap.ts`:** static pages, all state landing pages, and every property (rent and sale, excluding SOLD older than 90 days) with `lastModified`; split if over 5,000 URLs. **`app/robots.ts`:** allow public pages, disallow `/dashboard`, `/auth`, `/api`, `/payment`, and point to the sitemap.
> - **`noindex`** on dashboards, auth pages, payment pages, `/offers`-type private pages and 404s.
> - **Structured data (JSON-LD, valid and escaped):** `Organization` and `WebSite` with `SearchAction` on home; `BreadcrumbList` on details and landing pages; on property pages `RealEstateListing` (with `Offer` and price in USD, address, geo, images, `availability`), and `FAQPage` on pages that show an FAQ. Validate each with a script that parses the JSON and checks required fields.
> - **Real 404 status for a missing property:** currently it shows the right page but with HTTP 200 (because of streaming). Move the existence check into the property segment's `layout.tsx` (above `loading.tsx`) so `notFound()` returns a true 404. Check with `curl -I`.
> - **Semantics:** one `<h1>` per page, correct heading order, landmarks (`header`, `nav`, `main`, `footer`), descriptive link text, `alt` text on every photo (e.g. "Living room of 2-bedroom apartment in New York"), `lang="en"`, and no duplicate titles.
> - **Social:** favicon set, apple-touch-icon, `manifest.webmanifest`, theme-color for both themes.
> - Redirects: `/properties?listingType=SALE` → `/buy` and RENT → `/rent` (permanent).

**Done when:** `/sitemap.xml` and `/robots.txt` work; the JSON-LD validates in Google's Rich Results Test (use the production URL after deploy); view-source shows unique titles; `curl -I` on a fake property URL returns 404.

### D2. Performance and smoothness
> Fix the mobile performance gap you found in F13 and make the site feel smooth.
> - **Images:** re-enable Next's image optimizer for non-Unsplash hosts (the 226 KB rdcpix photo), with proper `sizes`, `priority` only on the LCP image, blur placeholders where cheap, and AVIF/WebP.
> - **JavaScript budget:** analyze with `@next/bundle-analyzer`. Load GSAP and ScrollTrigger only where used (home, about) via dynamic import; do not load Lenis on touch devices or when reduced motion is on; load `motion` per component; use `optimizePackageImports` for lucide-react and others; remove unused dependencies and dead code. Target: home first-load JS under ~170 KB gzipped.
> - **Rendering:** make sure public pages are static or ISR where possible (`revalidate`), no client-side waterfalls on the home page, memoize the heavy scroll components, and use `content-visibility: auto` for far-below-the-fold sections.
> - **Interaction:** no layout shift (set `width`/`height` or aspect ratios), no long tasks on scroll (check the Performance panel), animations only use `transform` and `opacity`, `will-change` only during animations, and kill ScrollTrigger instances on unmount.
> - **Fonts:** only the weights in use, `display: swap`, preloaded.
> - Targets (mobile Lighthouse, production build): Performance ≥ 85 on home and details, Accessibility ≥ 95, Best Practices ≥ 95, SEO = 100; CLS < 0.05, LCP < 2.5 s, INP < 200 ms. If the home page can't reach 85 without removing the 3D effects, report the best score with what each effect costs, and let me choose.

### D3. Bug sweep and end-to-end tests
> Do a strict stability pass.
> 1. Run `npx tsc --noEmit`, `npm run lint` and `npm run build` with zero errors and zero warnings.
> 2. Add **Playwright** smoke tests (`tests/e2e`) against the production build and the live backend with demo accounts: public browsing and filters on `/rent` and `/buy`; login for each role and role redirects; rental flow request → approve; sale flow offer → counter → accept → deposit page redirects to Stripe (stop at the Stripe URL, don't type a card); favorites toggle; landlord pending block; notifications bell; 404 page; sitemap and robots respond. Fail on any `console.error` or failed request that isn't expected. Add `npm run test:e2e` and make the tests clean up after themselves where the API allows.
> 3. Crawl every public link with a small script and report broken links or images.
> 4. Test at 375, 768, 1024 and 1440 px in both themes: no horizontal scroll, no overlapping elements (navbar, WhatsApp button, cookie banner, back-to-top), no clipped text.
> 5. Test slow network (Fast 3G) and offline: skeletons show, errors are friendly, nothing crashes.
> 6. Security basics: no secrets in the client bundle (`grep` the `.next` output for keys), security headers in `next.config` (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, a reasonable `Permissions-Policy`; a CSP only if it doesn't break Stripe, ImgBB, OSM tiles and Google Maps embed), and HTTPS-only cookies in production.
> Report everything you fixed.

### D4. Data cleanup before submission (you)
> Your live database has test data from QA runs: the user `qa.landlord.f13@rentnest.dev`, a completed rental with a review, and old notifications, plus whatever the sale tests create. Decide whether to leave it (it makes the site look used) or remove it directly in the database (there's no delete-user endpoint). Ask Claude Code to write a **read-only SQL script that lists** these rows, then delete them yourself with your database tool if you want.
> Also check that the admin credentials in the README still work and the demo property photos look good.

---

## Then: the last two steps from PLAN-REDESIGN.md

- **Step 43 (docs):** add to its prompt: "Also document everything from PLAN-FIXES.md and PLAN-FINAL.md: buy and sell flow, offers and deposit endpoints, SEO setup, env vars (`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `IMGBB_API_KEY`), the Playwright tests, and the final Lighthouse scores."
- **Step 44 (deploy):** work on `main`, no branch merge. Before deploying, set `NEXT_PUBLIC_SITE_URL` to the real Vercel URL in Vercel, update the backend's `CLIENT_SUCCESS_URL`/`CLIENT_CANCEL_URL` if the frontend URL changed, then run the smoke test again on the live site and submit the sitemap to Google Search Console.
