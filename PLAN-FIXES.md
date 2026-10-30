# RentNest — Phase 6: Fixes and new features (before Step 43)

Steps 1–42 are done. This phase adds the 13 changes, then you continue with **Step 43 (docs)** and **Step 44 (deploy)** from PLAN-REDESIGN.md.

**Why there is backend work:** 9 of the 13 items need data the backend doesn't store yet: favorites, notifications, landlord approval, map coordinates, and homepage settings chosen by the admin. A frontend can't save any of these by itself. So this phase has two parts:

- **Part 1:** 6 backend steps, run in the `rentnest-backend` folder.
- **Part 2:** 13 frontend steps, run in `rentnest-frontend`.

Same rules as before. You handle all git. Claude Code only builds, runs lint and build, and reports.

---

## Part 1 — Backend (run Claude Code in `rentnest-backend`)

**First message in the backend session:**
```
Read README.md, docs/api.md and the Prisma schema. I'll give you backend steps one at a time from PLAN-FIXES.md (I'll paste each one). Rules: follow the existing module pattern (route → validation → controller → service), keep explicit .js import extensions (ESM on Vercel), keep the Stripe webhook raw-body order in app.ts, every new endpoint uses validateRequest + auth like the existing ones, all migrations must be additive (no dropping or renaming columns), update docs/api.md and the Postman collection for new endpoints, run `npm run build` at the end. Do NOT run git commit, git push or create branches — I do git myself. Do not run migrations against the database without asking me first; create them with `npx prisma migrate dev --create-only` and show me the SQL.
```

### B2. Landlord approval (item 10)
> Add landlord approval. Schema: new enum `LandlordStatus { PENDING APPROVED REJECTED }` and nullable `landlordStatus LandlordStatus?` on User. In the migration SQL, set `landlordStatus = 'APPROVED'` for all existing LANDLORD users (so the demo landlords keep working). Register: a LANDLORD gets `PENDING`, a TENANT gets null. Login and `/auth/me` return `landlordStatus`. Add a reusable middleware `requireApprovedLandlord` (after `auth("LANDLORD")`) that loads the user and throws 403 "Your landlord account is waiting for admin approval" (PENDING) or "Your landlord application was rejected. Contact support." (REJECTED). Apply it to every landlord write action: create/update/delete property, approve/reject a request, complete a rental. Leave the read endpoints open, so a pending landlord can still see the dashboard. Admin: `PATCH /admin/users/:id/landlord-status` `{ landlordStatus: "APPROVED" | "REJECTED" }` (404 if the user isn't a landlord), and add a `landlordStatus` filter to `GET /admin/users`. Update the seed so the demo landlords are APPROVED.

### B3. Notifications (item 11)
> Add a notifications module. Model `Notification { id, userId → User, type (enum), title, message, link String?, isRead Boolean @default(false), createdAt; @@index([userId, isRead]) }`. Enum `NotificationType { LANDLORD_REGISTERED LANDLORD_APPROVED LANDLORD_REJECTED RENTAL_REQUESTED RENTAL_APPROVED RENTAL_REJECTED PAYMENT_RECEIVED PAYMENT_SUCCESS RENTAL_COMPLETED REVIEW_RECEIVED ACCOUNT_BLOCKED ACCOUNT_UNBLOCKED }`. Create a `notify()` service (single user or many) that never throws: wrap it in try/catch and log, so a notification failure can't break the main action. Call it *after* the main operation succeeds:
> - Landlord registers → every ADMIN (link `/dashboard/admin/users?landlordStatus=PENDING`).
> - Admin approves or rejects a landlord → that landlord.
> - Tenant creates a rental request → the property's landlord.
> - Landlord approves or rejects a request → the tenant (on approval, link to the pay page).
> - Payment becomes PAID → the tenant (PAYMENT_SUCCESS) and the landlord (PAYMENT_RECEIVED). Only when `markSessionPaid` actually processed it, so the webhook plus `/confirm` doesn't notify twice.
> - Rental completed → the tenant.
> - New review → the landlord.
> - Admin bans or unbans a user → that user.
>
> Endpoints, any logged-in role: `GET /notifications?page&limit&unread=true` (meta includes `unreadCount`), `PATCH /notifications/:id/read` (only your own), `PATCH /notifications/read-all`.

### B4. Favorites (item 6)
> Add a favorites module for tenants. Model `Favorite { id, userId, propertyId, createdAt; @@unique([userId, propertyId]) }` with relations. Endpoints, all `auth("TENANT")`: `GET /favorites` (paginated, includes property with first image, city, division, rent, availability), `GET /favorites/ids` (just an array of property ids, used to fill the hearts), `POST /favorites { propertyId }` (idempotent: already saved returns 200, missing property returns 404), and `DELETE /favorites/:propertyId`.

### B5. Property coordinates and state normalization (items 3, 9)
> 1) Add nullable `latitude Float?` and `longitude Float?` to Property. Create and update accept optional `latitude` (−90..90) and `longitude` (−180..180). If they're missing on create, or the address/city/division changed on update, geocode server-side with OpenStreetMap Nominatim (`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q=<address, city, state>`, a proper `User-Agent: RentNest/1.0 (<my email from config>)`, 5 s timeout). On failure, save without coordinates and never fail the request.
> 2) Add a script `npm run geocode:backfill` that fills missing coordinates for existing properties, waiting 1.1 s between requests (Nominatim allows 1 request per second).
> 3) `division` currently mixes full state names ("Illinois") and codes ("MI"). Add a `US_STATES` constant (code → name, all 50 states plus DC). Normalize `division` to the full state name on create and update (accept the code or the name, case-insensitive; reject unknown values with a validation error). Add a script `npm run states:normalize` that fixes existing rows.
> 4) New public endpoint `GET /properties/map` returning a lightweight list for every property with coordinates: `{ id, title, latitude, longitude, rentAmount, city, division, availabilityStatus, image }`. Cache-friendly, no pagination, max 1000 rows.

### B6. Homepage settings chosen by the admin (items 2, 3, 5)
> Add a site-settings module. Model `SiteSetting { key String @id, value Json, updatedAt @updatedAt }`. Store the homepage config under key `"homepage"` with this Zod-validated shape:
> ```
> {
>   hero:          { propertyIds: string[] (exactly 0–3) },
>   featured:      { enabled: boolean, title?: string, propertyIds: string[] (max 12) },
>   states:        { enabled: boolean, items: { state: string (full US state name), imageUrl: string (url) }[] (max 8) },
>   propertyTypes: { enabled: boolean, items: { type: PropertyType, imageUrl?: string (url) }[] },
>   latest:        { enabled: boolean, count: number (4–16) },
>   sectionOrder:  ("featured" | "states" | "propertyTypes" | "latest" | "statement" | "stats" | "howItWorks" | "whyUs" | "reviews" | "faq")[]
> }
> ```
> Endpoints: `GET /site-settings/homepage` (public) returns the stored config **resolved**: hero and featured properties as full property objects in the chosen order (silently drop ids that no longer exist); each state item with live `propertyCount` and `startingPrice` (AVAILABLE properties where `division` = state); property type items with live counts; latest = the newest N properties. If nothing is saved yet, return sensible defaults (newest 3 for the hero, newest 8 featured, the top states by count). `GET /admin/site-settings/homepage` returns the raw config for the editor. `PUT /admin/site-settings/homepage` validates and saves (ADMIN only). Also add `GET /properties/states`, public, returning every state that has properties, with counts (for the admin state picker).

### B7. Apply to production
> Show me all migrations created in B2–B6 and confirm each one is additive. Then tell me the exact commands, in order, to (1) apply them to the database in my `.env` (`npx prisma migrate deploy`), (2) run `npm run states:normalize` and `npm run geocode:backfill`, (3) re-run the seed only if needed. Don't run anything until I confirm.

**You:** after the migrations run, commit and push the backend so Vercel redeploys. Then test `GET /api/site-settings/homepage` and `GET /api/properties/map` in the browser.

> Vercel's build (`prisma generate && tsc`) does **not** run migrations, which is why B7 applies them manually. The `DATABASE_URL` in your local `.env` is probably your production database, so this is the moment that changes it. All of these migrations only *add* tables and columns, so existing data is safe.

---

## Part 2 — Frontend (run Claude Code in `rentnest-frontend`)

**First message in the frontend session:**
```
Read CLAUDE.md, PLAN-REDESIGN.md (steps 26–42 are done) and PLAN-FIXES.md. The backend now has new endpoints (Part 1 of PLAN-FIXES.md) — read ../rentnest-backend/docs/api.md and the new modules before using them, and add their service functions and types. We do the Part 2 steps one at a time, only the step I name. After each step run lint and build and give me a summary and the "Done when" list. Do NOT run git commit, git push or create branches — I do git myself. Start with Step F1.
```

### F1. Layout fixes: properties and contact pages (items 6 and 8, layout part)
> Fix these layout bugs. (1) On `/properties` and `/contact`, the page header sits under the floating navbar (the "BROWSE" eyebrow is cut off) and the bottom touches the footer. Create a shared `PageShell` (top padding = navbar height + spacing, consistent bottom padding before the footer) and use it on every public page except the home page, so this can't happen again. (2) The filter sidebar on `/properties`: its inner scrollbar is awkward and the column height isn't fixed. Make the sidebar `sticky top-[navbar+16px]` with `max-h-[calc(100svh-…)]`, a thin styled scrollbar that only appears on hover, fade masks at the top and bottom, and collapsible sections (Keyword, Location, Type, Category, Rent, Amenities, Availability) with an "Apply"-free live update and a "Clear all" button pinned at the bottom of the sidebar. Make sure the results column and the sidebar don't create a double scroll, and that long result lists don't make the sidebar jump. (3) Check `/about`, the auth pages and the property details page for the same navbar overlap. (4) Fix the error behind the "1 Issue" Next.js dev indicator and tell me what it was.

**Done when:** no page header is hidden under the navbar; the filter sidebar scrolls smoothly on its own and stays in place; the dev indicator shows no issues.

### F2. Hero: text search and admin-picked cards (items 1, 2)
> Replace the hero's "Any city" select with a text input ("City or state…") with autocomplete suggestions from real cities and states (from `/properties/states` plus distinct cities; keyboard navigable). On submit, send it as `searchTerm` (or `division` when it exactly matches a state) to `/properties`. The 3 floating hero cards now come from `GET /site-settings/homepage` → `hero` (admin-chosen, in order). If fewer than 3 are set, show only those. Clicking a card opens the property.

**Done when:** typing "new" suggests New York; the hero cards match what the admin picks in F4.

### F3. Home page driven by admin settings (items 3, 5)
> Make the home page read `GET /site-settings/homepage` (server-side, revalidate 60, plus on-demand revalidation in F4) and render sections in `sectionOrder`, skipping any with `enabled: false`. Featured collection = the admin's properties. Rename "Homes across the country" to group by **state**: each tile shows the state name, the admin's image, the live property count and the starting price, and links to `/properties?division=<state>`. Keep the existing expand animation exactly as it is. Property types use the admin images and live counts. Latest listings shows `count` items. If a section has no data, hide it instead of showing an empty block.

**Done when:** the home page shows states (New York, Illinois, Michigan…), not cities like Rochester, and changes when the admin edits settings.

### F4. Admin "Homepage" editor (items 2, 3, 5)
> Add `/dashboard/admin/homepage` (nav item "Homepage") in the bento style, with a sticky "Save changes" bar (disabled until something changes, warns before leaving with unsaved changes) and "View homepage" link. Panels:
> - **Hero cards:** pick up to 3 properties.
> - **Featured collection:** toggle, optional title, pick up to 12 properties, drag to reorder.
> - **States:** toggle, add states from `/properties/states` (shows counts), upload an image per state with the existing ImgBB `ImageUploader`, drag to reorder, max 8.
> - **Property types:** toggle, image per type.
> - **Latest listings:** toggle plus a count slider.
> - **Section order:** a drag list of all sections with show/hide switches.
>
> The property picker is a dialog with search, thumbnails and type/state filters (from `/admin/properties`). Use `@dnd-kit` for drag and drop (keyboard accessible). Saving calls `PUT /admin/site-settings/homepage`, toasts, and calls a Next.js route handler `POST /api/revalidate-home` (checks the admin token server-side with `/auth/me`, then `revalidatePath("/")`) so the home page updates immediately.

**Done when:** changing the hero cards, states and their images, then saving, shows the change on the home page after a refresh.

### F5. Redesign "A place for every chapter" (item 4)
> Redesign the "A place for every chapter" section on the home page. New design: an **interactive type index**. On the left, a large list of property types in huge Cormorant serif (Apartment, House, Studio, Villa), each with a live count in small numerals and an arrow. Hovering a row slides a gold underline in, dims the others, and makes the admin image for that type appear in a rounded frame that follows the cursor with a slight 3D tilt and lag (a "hover image reveal"). The right side shows a sticky large image of the active type that crossfades as you hover, with one short line of copy and "Browse apartments →". On scroll, the list lines reveal one by one. On mobile: horizontal snap cards with the image, name, count and link. Keep it data-driven (counts and images from homepage settings). Show me the result. If I don't like it, offer 2 alternative layouts as screenshots-in-words before rebuilding.

**Done when:** the section feels interactive and premium and is different from every other section.

### F6. Favorites (item 6, heart icon)
> Make the heart work everywhere it appears (property cards, details page, featured collection).
> - Tenant: optimistic toggle via `POST/DELETE /favorites` with a small heart pop animation and a toast ("Saved to your favorites" / "Removed"). On error, roll back and show the error.
> - Fill the hearts from `GET /favorites/ids`, cached with TanStack Query.
> - Logged-out user clicks the heart → go to `/auth/login?redirect=<current page>`.
> - Landlord or admin → hide the heart.
>
> Add `/dashboard/tenant/favorites` ("Saved homes": a grid of saved properties, a remove button, an empty state with "Browse homes") and add it to the tenant nav and overview (a "Saved" metric).

**Done when:** a tenant saves 2 homes from the browse page, they show as filled after a reload, and they appear on the Saved homes page.

### F7. Maps (items 8, 9)
> Install `leaflet`, `react-leaflet` and `leaflet.markercluster` (or a maintained React wrapper). Load maps with `next/dynamic` and `ssr: false`, using OpenStreetMap / CARTO tiles (light and dark variants that match the theme, with attribution).
> 1) **Property details:** a "Location" card with a map fitted to the continental US, all properties from `GET /properties/map` as small dark/gold markers (clustered), and **this property as a larger red marker**, opened by default and zoomed in moderately. Clicking another marker shows a popup (image, title, price, "View"). An "Expand map" button opens a full-screen dialog. If this property has no coordinates, show the US map with the other markers and a note "Exact location not available".
> 2) **Landlord property form:** a location picker. "Find from address" geocodes via the backend on save, but also let the landlord click or drag a pin to set the exact spot (sends `latitude`/`longitude`). Replace the free-text division field with a US state select (all 50 + DC).
> 3) **Contact page:** replace the current map with a Google Maps embed of the whole United States (`https://www.google.com/maps?q=United%20States&z=4&output=embed`, no API key needed), in a rounded container with `aspect-[16/9] md:aspect-[21/9]`, lazy-loaded, with a dark overlay frame in dark mode. Make the contact page fully responsive at 375/768/1280 px.

**Done when:** the details page shows the US with all listings and this one in red; the contact map shows the whole USA and resizes smoothly.

### F8. Landlord approval UI (item 10)
> Use the new `landlordStatus`.
> - **Register:** after a landlord signs up, show "Your landlord account was created. An admin will review it shortly. You can explore your dashboard meanwhile."
> - **Landlord dashboard:** for PENDING, a prominent banner ("Waiting for admin approval — you can't list properties or manage requests yet"). For REJECTED, a red banner with a contact link. Disable (with a tooltip) Add property, Edit, Delete, availability toggles, and Approve/Reject/Complete. Guard `/dashboard/landlord/properties/new` and the edit page with a friendly blocked screen. If the backend returns the 403 anyway, show its message as a toast.
> - **Refresh status:** re-fetch `/auth/me` on window focus, so approval takes effect without logging out.
> - **Admin Users page:** add a "Landlord status" column, a "Pending landlords" filter tab with a count badge, and Approve/Reject buttons (confirm dialog, optimistic update, toast). Add an "Awaiting approval" card on the admin overview linking to that tab.

**Done when:** a new landlord can't add a property; the admin approves them; after switching back to the tab, the landlord can add one.

### F9. Notifications (item 11)
> Replace the UI-only bell from step 39 with real notifications for all roles. Bell with an unread badge, using `GET /notifications?limit=8` and polling every 30 s (`refetchInterval`, paused when the tab is hidden, refetch on focus). The dropdown has an icon per type, title, message, relative time and an unread dot; clicking marks it read and navigates to `link`; "Mark all as read" sits at the top. When a new unread notification arrives (compare ids), show a Sonner toast with an action button. Add a full page `/dashboard/<role>/notifications` with All/Unread tabs and pagination. Update the landlord and admin overviews with a "Recent activity" card built from notifications.

**Done when:** a tenant sends a request, and within 30 s the landlord's bell shows it; a new landlord registering notifies the admin.

### F10. Signature on the About page (item 7)
> Copy my signature file (I put it in the project root as `signature.png` — a transparent PNG with white strokes) to `public/brand/signature.png`. In the "Built by Zarif Hasan" section, show it under the name, about 220 px wide (160 px on mobile), with `alt="Signature of Zarif Hasan"`. In light mode, apply `invert` so the strokes become dark; in dark mode, show it as is. Add a left-to-right "handwriting" reveal (`clip-path: inset(0 100% 0 0)` → `inset(0 0 0 0)`, about 1.4 s, ease-in-out) when it scrolls into view. Show it fully, with no animation, under reduced motion. Don't change anything else on the page.

**Done when:** the signature looks clean in both themes and "writes itself" once.

### F11. WhatsApp button (item 12)
> Add a floating WhatsApp button at the bottom right on public pages (not dashboards or auth pages). Get the number from `NEXT_PUBLIC_WHATSAPP_NUMBER` in international format with no plus sign, via `site-config.ts`. Open `https://wa.me/<number>?text=<message>` in a new tab. The prefilled message depends on the page ("Hi RentNest, I'm interested in <property title> (<url>)" on a details page, otherwise "Hi RentNest, I have a question."). Design: a 56 px green circle with the WhatsApp glyph (inline SVG), a soft pulse ring every few seconds, and a small greeting bubble ("Questions? Chat with us") that appears once after 4 s and can be dismissed (remembered in localStorage). Respect safe-area insets. Make sure it doesn't overlap the cookie banner, the back-to-top button or the mobile bottom bar. Hide it when the number env var is missing.

**Done when:** tapping on a phone opens WhatsApp with the message filled in.

### F12. Cookie consent banner (item 13)
> Add a cookie consent banner on first visit, in the premium style: a glass card at the bottom left on desktop, a bottom sheet on mobile, sliding up after the preloader finishes. Text: "We use essential cookies to keep you signed in. With your permission we'd also use analytics cookies to improve RentNest." Buttons: "Accept all", "Reject non-essential" (equal visual weight, as regulations expect), and "Customize", which opens a dialog with switches for Essential (always on, disabled), Analytics and Marketing, each with a one-line description. Save the choice in a `rn_consent` cookie for 6 months (`{ analytics, marketing, date }`) and expose `useConsent()`, so any future analytics script loads only if allowed. Add a "Cookie settings" link in the footer that reopens the dialog, and a short `/cookies` page explaining which cookies exist (`rn_token`, `rn_consent`, theme). Don't show the banner again once a choice is saved.

**Done when:** first visit shows the banner; the choice survives reloads; "Cookie settings" in the footer reopens it.

### F13. Regression pass
> Do a full regression check after this phase:
> - All 3 roles: login, middleware redirects, tenant request → landlord approve (approved landlord) → Stripe pay → success → review → complete.
> - The pending landlord flow, favorites, notifications for each event, homepage settings round-trip, and maps in both themes.
> - The contact form, cookie banner, the WhatsApp button on mobile, and the 404/error pages.
>
> Check 375/768/1440 px and run Lighthouse on home and details (performance ≥ 80 on mobile; lazy-load the map and the Leaflet CSS). Fix what you find and give me a list of everything you changed.

---

## Then: back to the main plan

Continue with **Step 43** in PLAN-REDESIGN.md, and add this to its prompt:
> Also document everything from PLAN-FIXES.md: landlord approval, notifications, favorites, maps, homepage settings, the WhatsApp button and the cookie banner. Add the new backend endpoints to API_INTEGRATION.md, and add the env vars `NEXT_PUBLIC_WHATSAPP_NUMBER` and `IMGBB_API_KEY`.

Then **Step 44**, without the merge part, because you work on `main`. Remember to add `NEXT_PUBLIC_WHATSAPP_NUMBER` in Vercel.
