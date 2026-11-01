# RentNest — Frontend

RentNest is a US home marketplace where people can **rent** a home or **buy** one. It has three roles:

- **Tenants and buyers** browse homes, request rentals, pay rent online and make offers on homes for sale.
- **Landlords and sellers** list homes, answer rental requests and handle purchase offers.
- **Admins** approve landlords and review every listing before it goes live. They also run the users, categories and homepage.

This repository is the Next.js frontend. It talks to a separate Express + Prisma backend ([rentnest-backend](https://github.com/Zarif207/rentnest-backend)). For how the frontend uses that backend, see [API_INTEGRATION.md](API_INTEGRATION.md).

| | URL |
| --- | --- |
| Live frontend | `https://<your-frontend>.vercel.app` (add after deploy) |
| Live backend API | `https://<your-backend>.vercel.app/api` (add after deploy) |

---

## Demo accounts

These accounts come from the backend seed (`prisma/seed.ts`):

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@rentnest.com` | `Admin@123` |
| Landlord | `landlord1@rentnest.com` | `Password@123` |
| Landlord | `landlord2@rentnest.com` | `Password@123` |
| Tenant | `tenant1@rentnest.com` | `Password@123` |
| Tenant | `tenant2@rentnest.com` | `Password@123` |

The login page has one-click buttons for the tenant, landlord and admin demo accounts. Admins can't sign up themselves; the seed creates the admin account.

**Stripe test card:** `4242 4242 4242 4242`, with any future expiry date, any CVC and any ZIP code. Stripe runs in test mode, so no real money is charged.

---

## Features

### Everyone (public)

- **Separate rent and buy sections.**
  - `/rent` and `/buy` each have their own filters: keyword, location (state and city), property type, category, price range, amenities and "available only".
  - Each listing type also has a page per US state (`/rent/texas`, `/buy/florida`).
  - `/properties` shows both rentals and homes for sale.
- **Map.** Leaflet with OpenStreetMap tiles and marker clusters, on the browse pages and each home's page.
- **Home page.**
  - The hero, featured homes and state tiles are chosen by an admin. With nothing chosen, the page falls back to live data.
  - It also has the latest-listings marquee, property types, "how it works" and the closing call to action.
- **A home's page.**
  - Photo gallery, details, amenities and location map.
  - Reviews, and the landlord's details.
  - A mortgage calculator on homes for sale.
  - "More homes in {State}": other homes in the same state, then the same city.
- **What's public.** Only listings an admin approved are shown. Rented and sold homes drop out of the lists but stay reachable by a direct link, which shows a banner and a disabled action.
- **Other pages.**
  - `/sell` explains selling on RentNest.
  - `/about`, `/contact`, `/privacy`, `/terms` and `/cookies`.
  - A WhatsApp chat button and a cookie consent banner.
- **Theme and design.** Light and dark themes, a responsive layout, and animation that respects reduced-motion settings.

### Tenant and buyer

- **Saving and renting.**
  - Save homes with the heart icon and see them under **Favorites**.
  - Request a rental with a move-in date and lease length, then follow the request: Pending → Approved → paid (Active) → Completed.
  - Pay rent with **Stripe Checkout** once the landlord approves. The success page confirms the payment.
  - See payment history and review a home after an active or completed rental.
- **Buying.**
  - Make an **offer** on a home for sale, withdraw it, or accept the seller's counter-offer.
  - Pay the **earnest-money deposit** through Stripe once an offer is accepted.
- **Staying up to date.**
  - **Notifications:** a bell with the unread count and a full notifications page.
  - **Section badges:** a red count on the dashboard section a notification belongs to; opening that section clears it.

### Landlord and seller

- **Approval.** New landlord accounts start as **Pending**. Until an admin approves them they can look around the dashboard, but they can't list homes or answer requests.
- **Listings.**
  - Create, edit and delete listings for rent or for sale.
  - Each listing has a photo upload (ImgBB) and a map pin.
  - Property type is the building (Apartment, House, Villa, Studio). Category is the market segment (for example Luxury or Family Homes).
- **Listing review.**
  - Every new listing goes to admin review and shows **Pending review**, **Live** or **Rejected**.
  - A rejected listing shows the admin's note and an "Edit and resubmit" button.
  - Owners can preview any of their listings in the dashboard, even before it's live.
- **Rentals.**
  - Approve or reject rental requests, then mark a rental completed.
  - Read the reviews tenants leave.
- **Sales.** Accept, reject or counter offers, then complete the sale after the deposit is paid.
- **Notifications** and section badges, as for tenants.

### Admin

- **Overview.** Live counts for users, pending landlords, pending listings, rentals and offers.
- **Users.**
  - Search and filter users.
  - Block and unblock accounts.
  - Approve or reject landlord applications.
- **Listing review.**
  - The **Properties** page has tabs: **Pending** (opens first, oldest first, with a count), **Approved**, **Rejected** and **All**.
  - Approve, or reject with a reason of 3–500 characters that the landlord sees.
  - Preview any listing before deciding.
  - Approving or rejecting updates the list straight away and is undone if the request fails.
- **Records.** All rentals and all offers, with filters.
- **Categories.** Create, rename and delete categories (the market segments).
- **Homepage editor.** Choose the hero cards, featured homes, state tiles, property-type images, the number of latest listings and the order of the sections.
- **Notifications** and section badges.

---

## Routes

| Route | Who | What |
| --- | --- | --- |
| `/` | Public | Home page |
| `/rent`, `/buy` | Public | Browse rentals / homes for sale with filters and a map |
| `/rent/[state]`, `/buy/[state]` | Public | One US state's homes (e.g. `/rent/new-york`) |
| `/properties` | Public | Browse rentals and homes for sale together |
| `/properties/[id]` | Public | A home's page (approved listings only) |
| `/sell` | Public | Selling on RentNest |
| `/about`, `/contact` | Public | About page; contact form (see limitations) |
| `/privacy`, `/terms`, `/cookies` | Public | Legal pages |
| `/auth/login`, `/auth/register` | Signed out | Sign in; sign up as a tenant or landlord |
| `/dashboard/tenant/...` | Tenant | Overview, requests (and `/requests/[id]/pay`), payments, offers, favorites, notifications, profile |
| `/dashboard/landlord/...` | Landlord | Overview, properties (new, `[id]` preview, `[id]/edit`), requests, offers, reviews, notifications, profile |
| `/dashboard/admin/...` | Admin | Overview, users, properties (`[id]` preview), rentals, offers, categories, homepage, notifications, profile |
| `/payment/success`, `/payment/cancel` | Signed in | Stripe return pages for rent payments and, with `?type=deposit`, for offer deposits |

**Route protection.** `src/proxy.ts` (Next 16's replacement for `middleware.ts`) reads the `rn_token` cookie.

- **Signed out:** visitors to a dashboard go to `/auth/login?redirect=…`.
- **Signed in:** users who open another role's dashboard go to their own, and signed-in users who open `/auth` go to their dashboard.

The backend still checks every request.

---

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | Next.js 16 (App Router, Cache Components / partial prerendering), React 19, TypeScript (strict) |
| Styling | Tailwind CSS v4, shadcn/ui on Radix, lucide-react icons |
| Server state | TanStack Query v5 (optimistic updates with rollback) |
| Auth state | Zustand, plus a `rn_token` cookie (`js-cookie`), with `jose` to read the token in the proxy |
| Forms | React Hook Form + Zod; server `errorDetails` are mapped onto form fields |
| Feedback | Sonner toasts |
| Motion | Lenis smooth scroll (desktop with a mouse only), GSAP + ScrollTrigger (`@gsap/react`), `motion` (Framer Motion), CSS 3D tilt |
| Maps | Leaflet, React Leaflet, `leaflet.markercluster`, OpenStreetMap tiles |
| Payments | Stripe Checkout; the backend creates the session and the browser is redirected to it |
| Images | `next/image` (through `components/shared/photo.tsx`); uploads go to ImgBB through a Next.js route handler, so the key never reaches the browser |
| Theme | `next-themes` (light, dark, system) |
| Testing | Playwright (smoke and full-flow projects), plus link and SEO check scripts |

### Design system: "quiet luxury"

- **Colours.**
  - **Light theme:** ivory background `#F6F3EE`, cards `#FDFBF7`, sand `#E9E2D6`, ink `#12100E` for text and main buttons, champagne `#C2A878` for highlights, bronze `#806435` for gold-toned text, and stone `#6F685F` for secondary text.
  - **Dark theme:** background `#0C0B0A`, cards `#161412`, text `#F2EEE7`, with the same champagne.
  - **Red:** used only for errors, destructive actions and notification badges.
- **Type.**
  - Geist for headings and body.
  - Cormorant Garamond, set upright, for occasional accent words.
  - Jost for the logo wordmark.
  - No italic anywhere.
- **Shapes.**
  - Pill-shaped buttons and chips.
  - Cards with `rounded-3xl` corners and hairline borders.
  - Frosted-glass panels over photos.
  - Shadows only on things that float (menus, dialogs).
- **Logo.** "RENT [two birds and an egg in a nest] NEST" (`components/brand/brand-logo.tsx`).
- **Motion.**
  - Lenis and GSAP scroll scenes on the public site.
  - Animations use only `transform` and `opacity`.
  - Everything turns off under `prefers-reduced-motion`.
  - Phones get simpler 3D and no pinned sections.
- **Dashboards.** Bento grids with pill navigation; on phones, a bottom tab bar plus a "More" sheet; tables become stacked cards on small screens.

---

## Local setup

Requirements: Node.js 20 or newer, npm, and a running RentNest backend (local or deployed).

```bash
git clone <this-repo-url> rentnest-frontend
cd rentnest-frontend
npm install
cp .env.example .env.local   # or create it by hand (variables below)
npm run dev                  # http://localhost:3000
```

### Environment variables (`.env.local`)

| Variable | Where it's used | What it is |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | browser and server | Backend base URL, ending in `/api` |
| `NEXT_PUBLIC_SITE_URL` | server (SEO) | The site's public URL, used for canonical links, the sitemap, robots and Open Graph |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | browser | Number for the WhatsApp chat button, in international format with no `+` or spaces |
| `IMGBB_API_KEY` | server only | ImgBB key used by `/api/upload`; never sent to the browser |

The Stripe success and cancel URLs are set on the **backend** (`CLIENT_SUCCESS_URL`, `CLIENT_CANCEL_URL`). Point them at this app's `/payment/success` and `/payment/cancel`.

### Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run lint` | ESLint |
| `npm run seo:check` | Walks every sitemap URL on a running build and checks status, title, `h1`, canonical link, landmarks and JSON-LD, plus robots, the manifest and 404s |
| `npm run test:e2e:smoke` | Playwright smoke tests (read-only; no `@writes` tests) |
| `npm run test:e2e` | All Playwright tests, including the flows that create data (`@writes`) |
| `npm run check:links` | Crawls public pages and reports broken links and images |

The Playwright tests run against a production build and the API in `NEXT_PUBLIC_API_URL`, and they sign in with the demo accounts above.

---

## Performance (Lighthouse)

The D2 targets for a mobile Lighthouse run on a production build:

| Metric | Target | Home | Details page |
| --- | --- | --- | --- |
| Performance | ≥ 85 | _to record_ | _to record_ |
| Accessibility | ≥ 95 | _to record_ | _to record_ |
| Best Practices | ≥ 95 | _to record_ | _to record_ |
| SEO | 100 | _to record_ | _to record_ |
| CLS / LCP / INP | < 0.05 / < 2.5 s / < 200 ms | _to record_ | _to record_ |

What D2 changed:

- Next's image optimizer is used for non-Unsplash hosts, and Unsplash photos are sized by Unsplash's own CDN.
- GSAP and Lenis are loaded only where they're used, and Lenis never loads on touch devices or with reduced motion.
- Font weights are trimmed, and far-down sections use `content-visibility`.

Fill in the scores from a run on the live site after deploying.

---

## Screenshots

_Add the images to `docs/screenshots/` and link them here._

- Home: light and dark
- Rent browse with filters and map
- A home's page
- Tenant dashboard
- Landlord dashboard (listing review chips)
- Admin listing review (Pending tab)
- Login and register

---

## Known limitations

- **Contact form and newsletter:** neither sends anything.
  - The contact form validates, waits briefly, then shows a thank-you panel. Its toast says "This demo doesn't send messages yet."
  - The newsletter field only shows a toast.
- **Sessions:** there is no refresh token. When the token expires, you are signed out and sent to the login page with a "Session expired" message.
- **Uploads:** images must be JPEG, PNG or WebP, up to 5 MB each.
- **Locations:** the US only, with states as the regions.
- **Payments:** Stripe runs in test mode.
- **Public lists:** a listing appears in, or leaves, a public list within about 60 seconds, the public cache time. Approving a listing and saving the homepage editor refresh the cache straight away.
- **Hidden listing pages:** the first request to a hidden listing's page (pending, rejected or deleted) answers HTTP 200 with a "not found" page marked noindex, and later requests answer 404. This comes from partial prerendering.
- **Deleting users:** the API has no endpoint for it; admins block accounts instead.
