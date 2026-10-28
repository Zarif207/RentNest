# CLAUDE.md — RentNest Frontend

Context and rules for Claude Code. Read this before every task. The step-by-step build order is in `PLAN.md`.

## What this project is

RentNest frontend (Assignment 5): a Next.js App Router app for a rental marketplace with three roles (TENANT, LANDLORD, ADMIN). It consumes an existing Express backend. **This repo is frontend only. Never modify the backend from here.**

- Backend repo: https://github.com/Zarif207/rentnest-backend (public; clone it to a sibling folder to read code when unsure)
- Backend base URL: `https://rentnest-backend-one.vercel.app/api` (env: `NEXT_PUBLIC_API_URL`)
- Owner: Zarif

## Tech stack (fixed)

- Next.js (App Router) + TypeScript (strict) + Tailwind CSS
- shadcn/ui components, `lucide-react` icons
- TanStack Query v5 for server state, Zustand for auth state
- React Hook Form + Zod (`@hookform/resolvers`) for forms
- Sonner for toasts, `next-themes` for dark/light mode
- `motion` (import from `motion/react`) for animation
- `jose` (`decodeJwt`) to read the JWT payload in middleware, `js-cookie` for the token cookie
- Stripe Checkout via backend-created session (redirect to `session.url`)
- ImgBB for image uploads, through a Next.js route handler (key stays server-side)

## Backend contract (verified from the backend source)

**Response envelope**
```ts
// success
{ success: true, message: string, meta?: { page: number; limit: number; total: number; totalPage?: number }, data: T }
// error
{ success: false, message: string, errorDetails: { path: string; message: string }[] }
```
`errorDetails[].path` is the bare field name (e.g. `"email"`, `"rentAmount"`), so it maps directly onto React Hook Form `setError(path, …)`. Confirm the exact `meta` field names in `src/app/interfaces/pagination.ts` of the backend.

**Auth**
- `POST /auth/register` body `{ name, email, password (min 6), phone?, role: "TENANT" | "LANDLORD" }` (admins cannot self-register)
- `POST /auth/login` → `data: { accessToken, user }`
- `GET /auth/me` (any role), `PATCH /users/me` `{ name?, email?, phone? }`
- Send `Authorization: Bearer <token>`. No cookies are read by the backend. CORS is open.
- No refresh-token endpoint. On 401 → clear session, toast "Session expired", redirect to `/auth/login?redirect=<path>`.
- 403 "User is blocked" → clear session, show a blocked-account message.
- JWT payload: `{ userId, email, role, iat, exp }`.

**Properties**
- `GET /properties` (public) query: `searchTerm, city, division, propertyType (APARTMENT|HOUSE|STUDIO|VILLA), availabilityStatus (AVAILABLE|RENTED), categoryId, amenities (comma-separated string), minPrice, maxPrice, page, limit (≤100), sortBy (createdAt|rentAmount|area|bedrooms|title), sortOrder (asc|desc)`
- `GET /properties/:id` (public)
- Landlord: `GET /landlord/properties`, `POST /landlord/properties`, `PUT /landlord/properties/:id`, `DELETE /landlord/properties/:id`
- Create body: `title, description, address, city, division, rentAmount, bedrooms, bathrooms, area, propertyType, categoryId (uuid, required), amenities: string[] (min 1), images: string[] of URLs (min 1)`. Update is partial and also accepts `availabilityStatus`.
- `GET /categories` (public). Admin: `POST/PUT/DELETE /categories/:id` with `{ name }`.

**Rentals (Booking model)**
- Tenant: `POST /rentals` `{ propertyId, moveInDate (ISO datetime string), leaseMonths (int > 0) }`, `GET /rentals?status=`, `GET /rentals/:id`
- Landlord: `GET /landlord/requests?status=`, `PATCH /landlord/requests/:id` `{ status: "APPROVED" | "REJECTED" }`, `PATCH /landlord/requests/:id/complete`, `GET /landlord/reviews`
- Statuses: `PENDING, APPROVED, REJECTED, CANCELLED, ACTIVE, COMPLETED`
- Lifecycle: PENDING → (landlord) APPROVED/REJECTED → (tenant pays) ACTIVE → (landlord completes) COMPLETED

**Payments (Stripe)**
- `POST /payments/create` `{ bookingId }` → returns the Checkout Session (use its `url`; inspect the controller for the exact field). Booking must be APPROVED.
- Stripe redirects to `<CLIENT_SUCCESS_URL>?session_id=cs_...` or `<CLIENT_CANCEL_URL>` (configured in the backend's env).
- `POST /payments/confirm` `{ sessionId }` → marks paid and moves the booking to ACTIVE (idempotent; the webhook does the same).
- `GET /payments` (my payments), `GET /payments/:id`. Currency is **USD**.

**Reviews**
- `POST /reviews` `{ propertyId, rating (1–5), comment }` — allowed when the tenant has an ACTIVE or COMPLETED booking for that property without a review (backend change in PLAN step B1).
- `GET /reviews/property/:propertyId` (public)

**Admin**
- `GET /admin/users?searchTerm&role&userStatus&page&limit&sortBy&sortOrder`
- `PATCH /admin/users/:id` `{ userStatus: "ACTIVE" | "BLOCKED" }` (this is ban/unban)
- `GET /admin/properties`, `GET /admin/rentals?status&page&limit`
- No stats endpoint: compute dashboard numbers from each list's `meta.total` (e.g. `limit=1`).

**Data notes**
- Prisma `Decimal` fields (`rentAmount`, `totalRent`, `amount`) arrive as **strings**. Always `Number()` before math/formatting.
- `images` is a JSON array of URL strings.
- Seed images come from `images.unsplash.com`; uploads come from `i.ibb.co`. Add both to `next.config` `images.remotePatterns`.

## Architecture rules

- Folder layout (under `src/`):
  - `app/` routes. Groups: `(public)`, `auth`, `dashboard/{tenant,landlord,admin}`, `payment/{success,cancel}`, `api/upload` (route handler)
  - `components/ui` (shadcn), `components/shared`, `components/<feature>`
  - `lib/api/` (client, per-resource service files), `lib/query-keys.ts`, `lib/utils.ts`, `lib/format.ts`
  - `hooks/` (TanStack Query hooks per resource), `store/auth-store.ts`, `types/`, `schemas/` (Zod form schemas)
- One fetch wrapper (`lib/api/client.ts`) for every backend call. It attaches the Bearer token, parses the envelope, and throws a typed `ApiError { status, message, errorDetails }`. No raw `fetch` to the backend elsewhere.
- Public pages (home, properties, details) are Server Components that fetch with `next: { revalidate: 60 }`; interactive parts (filters, modal, gallery) are small Client Components.
- Dashboards are Client Components using TanStack Query hooks. Mutations invalidate the right query keys; approve/reject and ban/unban use optimistic updates with rollback.
- Filters on `/properties` live in the URL search params (shareable, back-button friendly). Debounce text inputs (~400 ms).
- Route protection lives in Next.js middleware: `src/middleware.ts` on Next ≤15, or `src/proxy.ts` on Next 16+ (check `package.json`; the file was renamed in Next 16). It decodes the token cookie with `decodeJwt` (no secret on the frontend; the backend still enforces auth), checks `exp`, and redirects by role.
- Token cookie name: `rn_token`, `sameSite: "lax"`, `secure` in production, expiry from the JWT `exp`.

## Error handling rules (mandatory for grading)

- Every mutation shows a Sonner toast on success and on failure (failure text = `ApiError.message`).
- Form submissions map `errorDetails` onto fields with `setError`, plus a toast.
- Every route segment that fetches has `loading.tsx` (skeletons, not spinners) and `error.tsx` (friendly message + "Try again" calling `reset()`).
- `app/not-found.tsx` and `app/global-error.tsx` exist and are styled.
- Empty states (no properties, no requests, no payments) have an illustration/icon, a sentence, and a next action.
- Never show raw JSON, stack traces, or `undefined` in the UI.

## Design system

Reference: Dribbble "Real Estate Website" shots (Realteek / Estately style). Clean, airy, editorial.

- **Colors:** ink `#171717` (text, primary buttons), accent `#ff291b` (used sparingly: active filter dot, price highlight, key CTA hover, notification badges), surface `#f8f9fa`, white `#ffffff`, muted text `#6b7280`, soft sky gradient for the hero (`#c9dcef` → `#eef4fa`), accent-serif blue `#5b8fd1` for italic words.
- **Dark mode:** background `#0e0e0f`, surfaces `#171717`/`#1f1f21`, text `#f5f5f5`, same accent.
- **Type:** Craftwork Grotesk is paid, so use **Hanken Grotesk** (Google, closest free match) for everything, and **Instrument Serif italic** for one emphasized word or phrase per heading ("Discover handpicked homes that *define elegance*"). Load both with `next/font/google`.
- **Shapes:** pill buttons and chips (`rounded-full`), cards and images `rounded-2xl`/`rounded-3xl`, soft shadows only on floating elements (search bar, dialogs).
- **Signature pieces:** floating pill search bar overlapping the hero's bottom edge (location · type · price · black "Find Property" button); horizontal category chip row with circular arrow buttons; property card = large image, title, pin + city, one-line description, price in bold italic; details page stat trio (big numbers: beds / baths / sqft) and black full-width "Request to Rent" button; stats cards overlapping a wide image; testimonial carousel with stars and `01/08` counter; rounded CTA banner.
- **Status badges:** PENDING amber, APPROVED blue (shows "Pay Now"), REJECTED red, ACTIVE green (shows "Leave Review"), COMPLETED gray, CANCELLED gray outline.
- **Motion** (`motion/react`): fade-up + stagger on scroll for sections and card grids; hero image slow scale (1.08 → 1); a tilted (≈ -10°) infinite marquee of property cards for the "Latest listings" section; card hover lift and image zoom; dialogs scale-in. Respect `prefers-reduced-motion` (`useReducedMotion`). Keep durations 0.3–0.6 s, ease-out.
- Mobile first. Check 375 px, 768 px, 1280 px. Dashboards: sidebar on desktop, sheet drawer on mobile; tables become stacked cards under `md`.

## Git and commit rules

- Conventional Commits: `feat(scope): …`, `fix(scope): …`, `style:`, `refactor:`, `docs:`, `chore:`. Lowercase, imperative, specific (e.g. `feat(landlord): manage rental requests with optimistic approve and reject`).
- **One commit per PLAN step**, after `npm run lint` and `npm run build` pass. Do not bundle steps; do not create noise commits.
- **Never add `Co-Authored-By`, `Claude-Session`, or "Generated with Claude Code" lines** to commits or PR descriptions. Commits are authored by the repo owner's git identity only.
- Never commit `.env.local` or any secret. `CLAUDE.md`, `PLAN.md`, and `.claude/` are gitignored.
- Ask before pushing, force-pushing, rewriting history, or deleting files outside the step's scope.

## Working rules

- Before using an endpoint you haven't used yet, read its controller/service in the backend repo to confirm the response shape. Write the TypeScript type from what you see; don't guess.
- Keep components small; share the property form between create and edit.
- No `any`. No unused code. Prefer server-safe utilities in `lib/`.
- After each step: run lint + build, fix errors, then commit with the message given in PLAN.md.
- If a step reveals a backend bug or gap, stop and describe it instead of hacking around it in the frontend.
