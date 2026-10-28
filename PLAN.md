# RentNest Frontend — Step-by-Step Plan for Claude Code

How to use this file:

1. Do **Part A** (one-time setup) yourself.
2. For each step in Part B and C, open Claude Code in the frontend folder and paste the step's **Prompt**. Claude Code reads `CLAUDE.md` automatically, so the prompts stay short.
3. Check the **Done when** list in the browser before letting it commit.
4. One step = one commit. That gives you 27 meaningful commits (the requirement is 20).

Test accounts (from the backend seed): admin `admin@rentnest.com`, landlords `landlord1@rentnest.com` / `landlord2@rentnest.com`, tenants `tenant1@rentnest.com` / `tenant2@rentnest.com`. Passwords are in `prisma/seed.ts` (or your `SEED_*` env values).
Stripe test card: `4242 4242 4242 4242`, any future date, any CVC.

---

## Part A — One-time setup (you, not Claude Code)

**A1. Get an ImgBB key.** Sign up at imgbb.com → API → copy the key.

**A2. Create the project folder** next to your backend:
```
rentnest/
├── rentnest-backend/    (existing)
└── rentnest-frontend/   (new)
```
Put `CLAUDE.md` and this `PLAN.md` inside `rentnest-frontend/` before starting Claude Code there.

**A3. Turn off Claude's commit attribution** (three layers, because the setting alone has been unreliable):
- Create `rentnest-frontend/.claude/settings.json`:
  ```json
  {
    "attribution": { "commit": "", "pr": "" },
    "includeCoAuthoredBy": false
  }
  ```
- The rule is already in `CLAUDE.md`.
- Step 1 below installs a `commit-msg` git hook that strips any leftover trailer.

**A4. Make sure your git identity is set** (`git config --global user.name` / `user.email`) to the account that should own the commits.

---

## Part B — Backend prep (in `rentnest-backend`, before frontend work)

### B1. Allow reviews on ACTIVE rentals
**Prompt (run Claude Code in the backend folder):**
> In `src/app/modules/review/review.service.ts`, `createReview` only accepts bookings with `bookingStatus: "COMPLETED"`. Change it to accept ACTIVE or COMPLETED (`bookingStatus: { in: ["ACTIVE", "COMPLETED"] }`), rename `completedBookings` to `eligibleBookings`, and update both error messages ("You can only review a property after your rental is active" / "You have already reviewed this rental"). Update `docs/api.md` if it describes this rule. Run `npm run build`. Commit as `feat(review): allow reviews on active rentals`. No Co-Authored-By or Claude-Session lines. Ask me before pushing.

**Done when:** build passes, pushed, Vercel redeployed.

### B2. Payment redirect URLs (do this after frontend step 26)
In the backend's Vercel project → Settings → Environment Variables (Production):
- `CLIENT_SUCCESS_URL` = `https://<your-frontend>.vercel.app/payment/success`
- `CLIENT_CANCEL_URL` = `https://<your-frontend>.vercel.app/payment/cancel`

Redeploy the backend. Until then, local testing works because the defaults point to `http://localhost:3000`.

Also check in the Stripe dashboard (test mode) that the webhook endpoint is `https://rentnest-backend-one.vercel.app/api/payments/webhook`. The success page calls `/payments/confirm` anyway, so the flow works even if the webhook is late.

---

## Part C — Frontend build (in `rentnest-frontend`)

### Phase 1 — Foundation

#### Step 1. Scaffold the project
**Prompt:**
> Read CLAUDE.md. Scaffold a Next.js App Router project in this folder with TypeScript, Tailwind, ESLint, `src/` directory, and `@/*` alias (use create-next-app, keeping CLAUDE.md and PLAN.md). Initialize shadcn/ui. Install: @tanstack/react-query, @tanstack/react-query-devtools, zustand, react-hook-form, @hookform/resolvers, zod, sonner, next-themes, motion, jose, js-cookie, @types/js-cookie, lucide-react, date-fns. Create `.env.example` with `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, `IMGBB_API_KEY` and a `.env.local` (not committed) with the backend URL. Add `CLAUDE.md`, `PLAN.md`, `.claude/` and `.env*.local` to `.gitignore`. `git init` with `main` branch, and add a `.git/hooks/commit-msg` hook that deletes lines starting with `Co-Authored-By: Claude`, `Claude-Session:` and any "Generated with [Claude Code]" line (use `sed -i.bak … && rm -f "$1.bak"` so it works on macOS, Linux and Git Bash; make it executable). Configure `next.config` image remotePatterns for images.unsplash.com and i.ibb.co. Run lint and build.

**Done when:** `npm run dev` shows the starter page; build passes; `git log` is empty so far.
**Commit:** `chore: initialize next.js project with typescript, tailwind and shadcn`

#### Step 2. Design system and theming
**Prompt:**
> Set up the design system from CLAUDE.md: Hanken Grotesk + Instrument Serif (italic) via next/font, CSS variables for light and dark themes in globals.css mapped to shadcn tokens (ink #171717, accent #ff291b, surface #f8f9fa), ThemeProvider with next-themes (class strategy, system default), and a ThemeToggle component. Add shadcn components we'll need: button, input, label, textarea, select, dialog, sheet, dropdown-menu, avatar, badge, card, skeleton, table, tabs, separator, tooltip, popover, calendar, slider, checkbox, switch, alert-dialog, pagination, form. Customize button to pill shape with variants: default (black), outline (white with border), accent. Create a `SerifAccent` component for the italic heading word and a temporary `/style-guide` page showing type, colors, buttons and badges in both themes.

**Done when:** `/style-guide` looks like the reference palette in light and dark.
**Commit:** `feat(ui): add design tokens, fonts and dark mode theming`

#### Step 3. API client and data layer
**Prompt:**
> Build the data layer from CLAUDE.md. `lib/api/client.ts`: typed fetch wrapper (base URL from env, JSON, Bearer token from the `rn_token` cookie on the client, `ApiResponse<T>` envelope with optional meta, throws `ApiError {status, message, errorDetails}`; network failures become a friendly ApiError). Add `types/` for User, Property, Category, Booking, Payment, Review, enums and Meta — read the backend Prisma schema and services to match the actual JSON (Decimals are strings). Add `lib/query-keys.ts`, `lib/format.ts` (USD currency, dates, enum labels like "APARTMENT" → "Apartment"), a QueryProvider (staleTime 30s, retry off for 4xx, devtools in dev), and the Sonner Toaster in the root layout. Create `lib/api/` service files per resource (auth, properties, categories, rentals, landlord, payments, reviews, admin, users) with one function per endpoint listed in CLAUDE.md.

**Done when:** build passes; a quick test call to `getProperties()` in a server component logs real data.
**Commit:** `feat(api): add typed api client, services and query provider`

#### Step 4. Auth state and session handling
**Prompt:**
> Implement auth state: a Zustand `auth-store` (user, token, status, setSession, clearSession) that stores the token in the `rn_token` cookie (js-cookie, sameSite lax, secure in production, expires at the JWT exp) and the user in the store. On app load, if a token exists, hydrate the user via `GET /auth/me`; if it fails, clear the session. In the API client, on 401 clear the session and redirect to `/auth/login?redirect=<current path>` with a "Session expired" toast; on 403 "User is blocked" clear the session and show a blocked message. Add hooks `useAuth`, `useLogin`, `useRegister`, `useLogout`, and a `roleHome(role)` helper (`/dashboard/tenant|landlord|admin`).

**Done when:** logging in through a temporary button stores the cookie and `useAuth()` returns the user after a reload.
**Commit:** `feat(auth): add zustand auth store and session handling`

#### Step 5. Login and register pages
**Prompt:**
> Build `/auth/login` and `/auth/register` in the reference style (split layout: form on one side, large rounded property image with a short italic-serif quote on the other; image hidden on mobile). Use React Hook Form + Zod schemas that mirror the backend rules. Register has a role picker of two selectable cards (Tenant: "I'm looking for a home", Landlord: "I want to list properties"), plus name, email, phone (optional), password with show/hide, confirm password. Map backend `errorDetails` to fields with setError, toast on success/failure, show a spinner in the submit button while pending, and respect `?redirect=`. Register returns the user without a token, so after a successful register call login with the same credentials and continue as a logged-in user. On login, add a "Demo accounts" row with three small buttons (Tenant, Landlord, Admin) that fill the form for graders. After login, route to `roleHome(role)`.

**Done when:** you can register a tenant and a landlord, log in as each seeded role, and see inline errors for a wrong password and a duplicate email.
**Commit:** `feat(auth): build login and register pages with validation`

#### Step 6. Route protection middleware
**Prompt:**
> Add Next.js route protection (middleware.ts or proxy.ts depending on the installed Next version — see CLAUDE.md). Read `rn_token`, decode with `decodeJwt`, treat expired tokens as logged out. Rules: `/dashboard/**` requires login (redirect to `/auth/login?redirect=…`); `/dashboard/tenant/**` TENANT only, `/dashboard/landlord/**` LANDLORD only, `/dashboard/admin/**` ADMIN only (wrong role → redirect to own dashboard); `/auth/*` while logged in → own dashboard; `/dashboard` → own dashboard. Exclude static files, images and `/api` from the matcher. Write short comments explaining that the backend still verifies the signature.

**Done when:** each role gets bounced from the other roles' dashboards; logged-out users are sent to login and returned after login.
**Commit:** `feat(auth): protect dashboard routes with role-based middleware`

### Phase 2 — Public site

#### Step 7. Navbar and footer
**Prompt:**
> Build the site header and footer from the reference. Header: logo "RentNest" with a small house mark, centered links (Home, Properties, About, Contact), right side theme toggle + either "Log in" (black pill) or an avatar dropdown (name, role badge, Dashboard, Profile, Log out). Transparent over the hero on the home page, solid with blur after scrolling; mobile uses a Sheet menu. Links shown depend on role (e.g. landlords see "List a property"). Footer: brand blurb, link columns, newsletter input (UI only, toast on submit), copyright. Put them in a `(public)` route group layout.

**Done when:** header adapts per role and works at 375 px.
**Commit:** `feat(layout): add responsive navbar and footer with role-aware menu`

#### Step 8. Property card, skeleton and empty states
**Prompt:**
> Create reusable property UI: `PropertyCard` (next/image with sizes, rounded-2xl, hover lift + image zoom, availability badge on the image, title, MapPin + "City, ST" (US city and state), one-line description, beds/baths/area icons, price in bold italic "$1,200 /mo"); `PropertyCardSkeleton`; `PropertyGrid` (responsive 1/2/3 columns, staggered fade-up with motion, reduced-motion aware); and a shared `EmptyState` component (icon, title, text, optional action). Use real data from the API on the temporary style-guide page to check it.

**Done when:** cards render real seeded properties in both themes; skeleton matches the card's size.
**Commit:** `feat(properties): add property card, skeleton and empty state components`

#### Step 9. Home page
**Prompt:**
> Build the home page in the Realteek/Estately style. Sections: (1) Hero — sky-gradient background with a large property image (slow scale-in), headline "Find. Request. *Move in.*" style (serif italic accent), subtitle, and the floating pill search bar overlapping the hero bottom (location input, property type select, max price select, black "Find Property" button) that routes to `/properties` with query params. (2) "Discover handpicked homes that *define elegance*" — category chips row from `GET /categories` with arrow scroll buttons, and a 6-card featured grid from `GET /properties?limit=6` (chip click filters client-side or links to /properties?categoryId). (3) "Latest listings" — tilted infinite marquee of property cards (pause on hover, reduced-motion falls back to a static row). (4) "Your journey to the perfect home *starts with us*" — wide rounded image with 3 overlapping stat cards (use real totals from `meta.total` where possible). (5) How it works — 3 steps for tenants and landlords. (6) Testimonials carousel with stars and 01/0N counter (use real reviews from a few properties if available, otherwise clearly generic copy). (7) CTA banner "Make your dream space *a reality*" → register. Server-render the data, revalidate 60s. Add `loading.tsx` skeletons.

**Done when:** home looks close to the reference on desktop and mobile; search bar navigates with filters applied.
**Commit:** `feat(home): build landing page with hero search and featured listings`

#### Step 10. Browse properties with filters
**Prompt:**
> Build `/properties`. Server component reads searchParams and fetches `GET /properties`; a client `PropertyFilters` component drives the URL. Filters: search term (debounced), city, state (US states select, sent as `division`), property type (chips), category (select from `/categories`), price range (two inputs + slider), amenities (checkbox list built from amenities found in results plus common ones; send comma-separated), availability toggle, sort (newest, price low→high, price high→low, largest). Desktop: sticky left sidebar; mobile: "Filters" button opening a Sheet with an active-filter count. Show active filters as removable chips and a "Clear all". Results header shows "N properties found". Pagination from `meta`. Use `useTransition` so the grid shows a subtle loading state while the URL changes. Add `loading.tsx` and `error.tsx` for this segment, and an EmptyState with a "Clear filters" action.

**Done when:** every filter changes the URL and results, back button restores previous filters, and a nonsense search shows the empty state.
**Commit:** `feat(properties): add browse page with url-synced filters and pagination`

#### Step 11. Property details page
**Prompt:**
> Build `/properties/[id]` like the Estately detail card: large rounded image with a gallery (thumbnail strip + lightbox Dialog with keyboard navigation), title and address, right-side sticky card with the beds / baths / sqft stat trio in big numbers, monthly rent, availability badge, landlord card (avatar initials, name, "Landlord", email/phone if returned) and a full-width black "Request to Rent" button. Below: description, amenities as icon chips, category and property type, and a reviews section from `GET /reviews/property/:id` (average rating, list, empty state). Add `generateMetadata` (title, description, OG image), `notFound()` for a missing id, `loading.tsx` and `error.tsx`. The button behavior comes in the next step — for now it opens nothing.

**Done when:** details render for every seeded property; a random UUID shows the 404 page.
**Commit:** `feat(properties): build property details page with gallery and reviews`

#### Step 12. Request-to-rent flow
**Prompt:**
> Wire the "Request to Rent" button. Logged out → go to `/auth/login?redirect=/properties/<id>`. Logged in as landlord/admin → disabled with a tooltip "Only tenants can request". Property RENTED → disabled "Currently rented". Tenant → open a Dialog with a form: move-in date (date picker, not in the past), lease length (select 1–24 months), live summary (monthly rent × months = total). Zod validation, send `moveInDate` as an ISO datetime string. On success: toast "Request sent — the landlord will review it", close, invalidate the tenant rentals query, and show a link to "View my requests". Map backend errors (e.g. duplicate pending request) to a toast.

**Done when:** tenant1 can submit a request and sees it in the API (`GET /rentals`).
**Commit:** `feat(rentals): add request-to-rent dialog with validation`

### Phase 3 — Dashboards

#### Step 13. Dashboard shell
**Prompt:**
> Create the shared dashboard layout under `app/dashboard`: left sidebar (logo, role-specific nav with icons, active state, user card + logout at the bottom), top bar (page title, theme toggle, avatar menu), mobile Sheet sidebar. Nav — Tenant: Overview, My Requests, Payments, Profile. Landlord: Overview, Properties, Add Property, Requests, Reviews, Profile. Admin: Overview, Users, Properties, Rentals, Categories, Profile. Add reusable `StatCard`, `StatusBadge` (colors from CLAUDE.md), `DataTable` (responsive: table on md+, stacked cards on mobile, built-in loading skeleton rows and empty state), `PageHeader`, and `ConfirmDialog` (AlertDialog). Add `loading.tsx` and `error.tsx` at the dashboard level.

**Done when:** each role sees its own sidebar; layout works on mobile.
**Commit:** `feat(dashboard): add role-based dashboard layout and shared components`

#### Step 14. Tenant dashboard
**Prompt:**
> Build the tenant pages with TanStack Query hooks. Overview: stat cards (total requests, pending, active rentals, total paid), recent requests list, and a "Browse properties" CTA. `/dashboard/tenant/requests`: tabs by status (All, Pending, Approved, Active, Completed, Rejected) using `?status=`, rows with property thumbnail, title, move-in date, lease, total, StatusBadge, and actions: APPROVED → "Pay Now" (link to `/dashboard/tenant/requests/[id]/pay`), ACTIVE/COMPLETED without a review → "Leave Review" (opens dialog in step 16; stub for now), all → "View property". `/dashboard/tenant/payments`: table of `GET /payments` (date, property, amount, status badge PAID/PENDING/FAILED, Stripe session ref truncated with copy button).

**Done when:** tenant1's request from step 12 shows as PENDING; payments table shows an empty state.
**Commit:** `feat(tenant): add tenant dashboard with request and payment history`

#### Step 15. Stripe payment flow
**Prompt:**
> Implement payment. Read the backend payment controller first to confirm the response of `POST /payments/create` and `POST /payments/confirm`. `/dashboard/tenant/requests/[id]/pay`: load `GET /rentals/:id`; if not APPROVED, show why and a back link. Otherwise show an order summary card (property image, title, move-in, months, monthly rent, total in USD, "Secured by Stripe" note) and a "Proceed to Payment" button that calls `/payments/create` and redirects with `window.location.assign(url)`; spinner + disabled while pending; toast on error. `/payment/success`: read `session_id`, call `/payments/confirm` once (guard against React strict-mode double calls), show states — confirming (skeleton), success (animated check, amount, property, "Leave a review" and "Go to dashboard" buttons), already confirmed, and error (retry button). Invalidate rentals and payments queries after success. `/payment/cancel`: friendly "Payment cancelled — nothing was charged", buttons to retry payment and back to requests. Both pages work without being logged in for the static parts, but confirm requires the token.

**Done when:** with landlord1 approving the request in the API (or after step 19), tenant1 pays with 4242… on Stripe, lands on success, and the request becomes ACTIVE with a PAID payment.
**Commit:** `feat(payment): integrate stripe checkout with success and cancel pages`

#### Step 16. Reviews
**Prompt:**
> Build the review dialog: interactive 1–5 star rating (keyboard accessible), comment textarea (min 10 chars), Zod validation, `POST /reviews` with propertyId. Show it from the tenant requests table for ACTIVE or COMPLETED rentals and from the payment success page. Hide the button once a review exists (check the booking's review field or refetch property reviews). On success toast, invalidate property reviews and tenant rentals.

**Done when:** tenant1 reviews the ACTIVE rental and the review appears on the property page.
**Commit:** `feat(reviews): add review submission for active and completed rentals`

#### Step 17. ImgBB upload
**Prompt:**
> Add `app/api/upload/route.ts`: POST multipart image → validate type (jpeg/png/webp) and size (≤ 5 MB) → forward to `https://api.imgbb.com/1/upload` with `IMGBB_API_KEY` from server env → return `{ url }` (use `data.display_url` or `data.url`). Return JSON errors with proper status codes. Then build an `ImageUploader` client component: drag-and-drop zone + file picker, multiple files, per-file progress/spinner, thumbnails with remove and "set as cover" (first image = cover), max 8 images, plus an "or paste an image URL" input. It is a controlled component that outputs `string[]` for React Hook Form.

**Done when:** uploading two images returns i.ibb.co URLs and they preview with next/image.
**Commit:** `feat(upload): add imgbb upload route and image uploader component`

#### Step 18. Landlord property management
**Prompt:**
> Build landlord property CRUD. `/dashboard/landlord/properties`: list from `GET /landlord/properties` (cards or table with thumbnail, title, city, rent, status), availability Switch per row (PUT `availabilityStatus`, optimistic, toast), Edit and Delete (ConfirmDialog, toast, invalidate). `/dashboard/landlord/properties/new` and `/dashboard/landlord/properties/[id]/edit` share one `PropertyForm`: sections Basic info (title, description, type, category), Location (address, city, state — select of the 50 US states + DC, sent as `division`), Details (rent, bedrooms, bathrooms, area sqft), Amenities (tag input with suggestions), Images (ImageUploader). Zod schema mirrors the backend; map errorDetails to fields; on success toast and redirect to the list. Edit sends only changed fields.

**Done when:** landlord1 creates a property with uploaded images, it shows on `/properties`, then edits and deletes it.
**Commit:** `feat(landlord): add property create, edit and delete flows`

#### Step 19. Landlord request management
**Prompt:**
> Build `/dashboard/landlord/requests` from `GET /landlord/requests?status=` with status tabs. Rows: tenant name/email, property, move-in date, lease, total, requested date, StatusBadge. Actions: PENDING → Approve / Reject (Reject asks for confirmation); ACTIVE → "Mark completed" (ConfirmDialog, `PATCH /landlord/requests/:id/complete`). Use optimistic updates with `onMutate` / rollback in `onError` / invalidate in `onSettled`, so the badge changes instantly. Toasts: "Request approved — the tenant can now pay", "Request rejected", "Rental marked as completed". Show a pending-count badge on the sidebar item.

**Done when:** approving tenant1's request flips the badge immediately and tenant1 then sees "Pay Now".
**Commit:** `feat(landlord): manage rental requests with optimistic approve and reject`

#### Step 20. Landlord overview and reviews
**Prompt:**
> Build the landlord overview: stat cards (total properties, available vs rented, pending requests, active rentals, total earnings = sum of `totalRent` for ACTIVE and COMPLETED requests, labelled clearly), a simple earnings-by-month bar chart built with plain divs or SVG from request data (no heavy chart library), recent requests (5) with quick actions, and "Add property" CTA. `/dashboard/landlord/reviews`: list from `GET /landlord/reviews` with property, tenant, stars, comment, date, and the average rating.

**Done when:** numbers match the requests table.
**Commit:** `feat(landlord): add overview stats, earnings and reviews`

#### Step 21. Admin overview and user management
**Prompt:**
> Build the admin overview: stat cards for total users, tenants, landlords, blocked users, total properties, pending requests, active rentals — computed with parallel `limit=1` calls reading `meta.total` (use `useQueries`). Add recent users and recent rentals lists. `/dashboard/admin/users`: DataTable with debounced search, role and status filters, sortable columns, and pagination from `meta` (all in URL params). Each row: name, email, phone, role badge, status badge, joined date, and Ban/Unban button (ConfirmDialog → `PATCH /admin/users/:id { userStatus }`, optimistic update, toast). Disable the button for ADMIN rows and for the current user.

**Done when:** banning tenant2 shows BLOCKED immediately, and tenant2 can no longer log in (friendly blocked message); unban restores access.
**Commit:** `feat(admin): add platform overview and user management with ban and unban`

#### Step 22. Admin moderation and categories
**Prompt:**
> Build `/dashboard/admin/properties` (all listings from `GET /admin/properties` with search, type and availability filters, pagination, owner column, "View" opening the public page in a new tab) and `/dashboard/admin/rentals` (all requests from `GET /admin/rentals` with status tabs, tenant, property, landlord, total, dates, pagination; read-only). Add `/dashboard/admin/categories`: list, create, rename, delete with dialogs and toasts (`/categories` admin endpoints); show a clear error toast if a category in use can't be deleted.

**Done when:** admin can browse all listings and rentals and manage categories.
**Commit:** `feat(admin): add listing, rental and category moderation views`

#### Step 23. Profile page
**Prompt:**
> Add a shared `/dashboard/<role>/profile` page (one component reused by all three roles): shows avatar initials, role, status, member since; form to update name, email, phone via `PATCH /users/me` with the backend's phone regex mirrored in Zod. On success update the Zustand user and toast.

**Done when:** editing your name updates the navbar immediately.
**Commit:** `feat(profile): add profile settings page for all roles`

### Phase 4 — Quality, docs and deploy

#### Step 24. Error boundaries, 404 and loading states
**Prompt:**
> Audit every route segment. Make sure each data-fetching segment has `loading.tsx` with skeletons matching its layout and `error.tsx` with a friendly message, an illustration icon, "Try again" (reset) and "Go home". Add a styled `app/not-found.tsx` ("This home isn't on the market" with search and home buttons), `app/global-error.tsx`, and a dashboard-level not-found. Check that every mutation has success and error toasts and every form maps errorDetails. Remove the temporary `/style-guide` page. List anything you changed.

**Done when:** you can trigger each state (bad URL, backend offline via wrong env URL, slow network in devtools) and none shows a blank page or raw error.
**Commit:** `feat(errors): add error boundaries, not-found pages and loading skeletons`

#### Step 25. Motion, responsiveness and accessibility polish
**Prompt:**
> Do a polish pass: check every page at 375, 768, 1024 and 1440 px and fix overflow, spacing, and table layouts; make sure motion is consistent (section fade-ups, card stagger, marquee, dialog transitions) and fully disabled under prefers-reduced-motion; add focus-visible rings, aria-labels on icon buttons, alt text on images, and correct heading order; check both themes for contrast (badges, muted text, accent). Add `metadata` titles per page ("Properties · RentNest"), a favicon, and OG defaults. Run Lighthouse on home and details and fix the top issues.

**Done when:** no horizontal scroll on mobile; Lighthouse accessibility ≥ 90.
**Commit:** `style: refine motion, responsiveness and accessibility`

#### Step 26. Documentation
**Prompt:**
> Write `API_INTEGRATION.md`: a table mapping every frontend route/component/hook to its backend endpoint, method, auth role, and query/body, grouped by feature (Auth, Properties, Rentals, Payments, Reviews, Landlord, Admin, Upload), plus short sections on the auth flow (token cookie + Bearer + middleware), error handling (ApiError → toast/inline/error boundary), and the Stripe flow (create → redirect → success confirm → ACTIVE). Write `README.md`: project intro, live links (frontend, backend, backend repo), features per role, tech stack, admin credentials for graders, demo tenant/landlord accounts, Stripe test card, local setup (env vars, commands), folder structure, and screenshots placeholders.

**Done when:** a grader could test everything from the README alone.
**Commit:** `docs: add api integration map and project readme`

#### Step 27. Deploy to Vercel
**Prompt:**
> Prepare for Vercel: confirm `npm run build` passes with no warnings worth fixing, check no secrets are committed (`git grep` for keys), and list the env vars I must add in Vercel (NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SITE_URL, IMGBB_API_KEY). Then help me deploy (push to GitHub after asking me, import in Vercel). After deployment, remind me to do backend step B2 and run the smoke test below. Update README live links. Commit any fixes.

**Commit:** `chore: configure production deployment` (plus `fix:` commits for anything the smoke test finds)

---

## Part D — Final smoke test on the live site

Run in order, in an incognito window:

1. Logged out: home loads, filters work, details page loads, "Request to Rent" sends you to login.
2. Register a new tenant → land on tenant dashboard.
3. Tenant requests a property → PENDING badge.
4. Landlord1 logs in → approves it → toast, badge flips instantly.
5. Tenant sees "Pay Now" → Stripe test card → success page → request ACTIVE, payment PAID.
6. Tenant leaves a review → it shows on the property page.
7. Landlord marks the rental completed → COMPLETED (gray).
8. Landlord creates a property with ImgBB uploads, toggles availability, edits, deletes.
9. Admin logs in → overview numbers look right → bans the new tenant → tenant login shows the blocked message → unban.
10. Admin views all listings, all rentals, edits a category.
11. Visit `/dashboard/admin` as a tenant → redirected. Visit `/nope` → 404 page. Toggle dark mode on every page type.

---

## Part E — Submission checklist (the 0-mark items)

- [ ] All required endpoints consumed, `API_INTEGRATION.md` in repo
- [ ] Toasts, inline form errors and error boundaries everywhere
- [ ] ≥ 20 meaningful conventional commits (`git log --oneline | wc -l`), none with Claude trailers (`git log --format=%B | grep -i claude` returns nothing)
- [ ] Working admin email + password in README and submission form
- [ ] Real Stripe Checkout redirect with success and cancel pages working on the live URL
- [ ] 7–10 min video

## Part F — Video outline (7–10 min)

1. (0:30) Intro: what RentNest is, stack, live links.
2. (1:30) Code tour: folder structure, API client + ApiError, query hooks, Zustand store, middleware.
3. (1:30) Public site: home, filters with URL params, details page, loading skeletons.
4. (2:00) Tenant: register → request → (switch to landlord) approve with optimistic update → (back) pay with Stripe → success → review.
5. (1:30) Landlord: create property with image upload, availability toggle, overview stats.
6. (1:30) Admin: stats, ban/unban, moderation views.
7. (0:30) Error handling demo (404, validation errors, wrong-role redirect) and dark mode.
