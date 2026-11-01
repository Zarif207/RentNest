# API integration

How the RentNest frontend talks to the backend ([rentnest-backend](https://github.com/Zarif207/rentnest-backend)). Every path below is relative to `NEXT_PUBLIC_API_URL`, which ends in `/api`. The full backend contract is in the backend's `docs/api.md`, and every path in this document was checked against it.

---

## 1. Response envelope and `ApiError`

Every backend response uses one envelope:

```ts
// success
{ success: true, message: string, meta?: { page: number; limit: number; total: number; totalPage?: number }, data: T }
// error
{ success: false, message: string, errorDetails: { path: string; message: string }[] }
```

`src/lib/api/client.ts` unwraps it:

- **Success:** `api.get/post/put/patch/delete<T>()` resolve to `data`. `api.getPaginated<T>()` resolves to `{ data, meta }`.
- **Failure:** any failed response throws a typed **`ApiError`** with:
  - `status`: the HTTP status, or `0` when the network failed or the API URL isn't configured;
  - `message`: the backend's message, or a friendly default per status, e.g. 404 → "The requested resource was not found.";
  - `errorDetails`: per-field errors.
- **Helpers:** `isApiError(error)` narrows an unknown error; `getErrorMessage(error)` gives text that's safe to show in a toast.

Decimal fields from Prisma (`rentAmount`, `salePrice`, `amount`, …) arrive as **strings**, and the UI converts them with `Number()` before any maths or formatting.

## 2. The single fetch wrapper

`apiRequest()` in `lib/api/client.ts` makes **every** backend call; no other code calls `fetch` on the backend.

- **Auth:** it sends `Authorization: Bearer <token>`. The token comes from the auth store, or is passed explicitly when the session is restored on page load. The backend reads no cookies.
- **Query strings:** they're built from objects, and `undefined` values are dropped.
- **Services:** each resource has a service file in `src/lib/api/` (`authService`, `propertiesService`, …), so components never build URLs themselves.
- **Hooks:** components use TanStack Query hooks in `src/hooks/`, which call the services. Public server pages use `src/lib/data/public.ts`, which wraps the same services in cached functions (see §6).
- **Other routes:** two Next.js route handlers (`/api/upload` and `/api/revalidate-home`) call ImgBB and the backend from the server.

### 401 and 403

- **Which errors count.** On an authenticated request, a **401**, or a **403** saying "User is blocked", goes to the session error handler that `AuthProvider` registers. Requests that pass `skipSessionHandling` (login and register, where a 401 just means a wrong password) never trigger it.
- **401.** One 401 can be a backend blip, so `AuthProvider` first re-checks `GET /auth/me`. Only if that also returns 401 does it end the session:
  - it clears the cookie and the store, and removes cached queries;
  - it shows a "Session expired" toast;
  - it calls `router.replace('/auth/login?redirect=<current path>')`.
- **403 blocked.** It ends the session at once, shows "Your account has been blocked" and goes to `/auth/login`.
- **No confirm dialog.** This automatic sign-out skips the logout confirmation dialog that the manual logout buttons use.
- **Page load.** When a page loads, the store restores the session from the `rn_token` cookie through `GET /auth/me`. While that check runs, dashboards show a skeleton (`DashboardSessionGate`) so their queries never run without a token.

## 3. Endpoints the frontend calls

**Roles:**

- **Public:** no token needed.
- **Any:** any signed-in user.
- **Optional:** the token is sent when the user is signed in.

**Service column:** "auth.getMe" is short for `authService.getMe`, and the same goes for the other services. Every service file lives in `src/lib/api/`.

### Auth and profile

| Method | Path | Role | Service | Used by | Body | Response `data` |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/auth/register` | Public | auth.register | `useRegister` (registers, then logs in) | `{ name, email, password, phone?, role: "TENANT" \| "LANDLORD" }` | `User` |
| POST | `/auth/login` | Public | auth.login | `useLogin` | `{ email, password }` | `{ accessToken, user }` |
| GET | `/auth/me` | Any | auth.getMe | auth store `hydrate()` / `refreshUser()` (on tab focus) | — | `User` (includes `landlordStatus`) |
| PATCH | `/users/me` | Any | users.updateMe | `useUpdateProfile` | `{ name?, email?, phone? }` | `User` |

### Properties

| Method | Path | Role | Service | Used by | Body / query | Response `data` |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/properties` | Public | properties.getAll | `getPublicProperties` (home, `/rent`, `/buy`, `/properties`, state pages, nearby homes, sitemap, auth panel stats) | query: `searchTerm, listingType, city, division, propertyType, availabilityStatus, categoryId, amenities, minPrice, maxPrice, page, limit, sortBy, sortOrder` | `PropertyWithRelations[]` + `meta`. Approved only; rented and sold homes are left out unless `availabilityStatus` is passed |
| GET | `/properties/map` | Public | properties.getMap | `getPublicMapProperties` (browse maps, a home's location map) | query: `listingType?` | `MapProperty[]` |
| GET | `/properties/states` | Public | properties.getStates | `getPublicPropertyStates` (state pages, auth panel); `usePropertyStates` (admin homepage editor) | query: `listingType?` | `{ state, propertyCount, availableCount }[]` |
| GET | `/properties/:id` | Optional | properties.getById | `getPublicProperty` (a home's page); `useProperty` (edit form and listing previews, with the token, so owners and admins can read listings that aren't approved yet) | — | `PropertyWithRelations` |

### Categories

| Method | Path | Role | Service | Used by | Body | Response `data` |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/categories` | Public | categories.getAll | `getPublicCategories` (filters); `useCategories` (property form, admin) | — | `Category[]` |
| POST | `/categories` | Admin | categories.create | `useCreateCategory` | `{ name }` | `Category` |
| PUT | `/categories/:id` | Admin | categories.update | `useRenameCategory` | `{ name }` | `Category` |
| DELETE | `/categories/:id` | Admin | categories.remove | `useDeleteCategory` | — | `null` |

### Rentals (Booking)

| Method | Path | Role | Service | Used by | Body / query | Response `data` |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/rentals` | Tenant | rentals.create | `useCreateRental` | `{ propertyId, moveInDate (ISO), leaseMonths }` | `BookingWithProperty` |
| GET | `/rentals` | Tenant | rentals.getMine | `useMyRentals` | query: `status?` | `BookingWithProperty[]` |
| GET | `/rentals/:id` | Tenant | rentals.getById | `useRental` (pay page) | — | `BookingDetail` |

### Payments (rent, Stripe)

| Method | Path | Role | Service | Used by | Body | Response `data` |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/payments/create` | Tenant | payments.createCheckout | `useStartCheckout` | `{ bookingId }` (booking must be APPROVED) | Checkout session; the browser goes to its `url` |
| POST | `/payments/confirm` | Tenant | payments.confirm | `useConfirmPayment` (`/payment/success`) | `{ sessionId }` | `PaymentWithBooking` (idempotent) |
| GET | `/payments` | Tenant | payments.getMine | `useMyPayments` | — | `PaymentWithBooking[]` |
| GET | `/payments/:id` | Tenant | payments.getById | defined in the service; no screen uses it | — | `PaymentWithBooking` |

### Offers and deposits (buying)

| Method | Path | Role | Service | Used by | Body / query | Response `data` |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/offers` | Tenant (buyer) | offers.create | `useCreateOffer` | `{ propertyId, offerAmount, financing, message? }` | `Offer` |
| GET | `/offers` | Tenant | offers.getMine | `useMyOffers` | query: `status?` | `Offer[]` |
| GET | `/offers/:id` | Tenant | offers.getById | defined in the service; no screen uses it | — | `Offer` |
| PATCH | `/offers/:id/withdraw` | Tenant | offers.withdraw | `useWithdrawOffer` | — | `Offer` |
| PATCH | `/offers/:id/accept-counter` | Tenant | offers.acceptCounter | `useAcceptCounter` | — | `Offer` |
| POST | `/offers/:id/deposit` | Tenant | offers.createDeposit | `useStartDeposit` | — | Deposit checkout; the browser goes to its `checkoutUrl` |
| POST | `/offers/confirm` | Tenant | offers.confirmDeposit | `useConfirmDeposit` (`/payment/success?type=deposit`) | `{ sessionId }` | `Offer` |
| GET | `/offers/payments` | Tenant | offers.getMyDeposits | `useMyDeposits` | — | `DepositWithOffer[]` |
| GET | `/landlord/offers` | Landlord | landlordOffers.getAll | `useLandlordOffers`, `usePendingOfferCount` | query: `status?` | `Offer[]` |
| PATCH | `/landlord/offers/:id` | Landlord | landlordOffers.respond | `useRespondToOffer` | `{ action: "ACCEPT" \| "REJECT" \| "COUNTER", counterAmount? }` | `Offer` |
| PATCH | `/landlord/offers/:id/complete-sale` | Landlord | landlordOffers.completeSale | `useCompleteSale` | — | `Offer` |
| GET | `/admin/offers` | Admin | adminOffers.getAll | `useAdminOffers` | query: `status?, page, limit, …` | `Offer[]` + `meta` |

### Reviews

| Method | Path | Role | Service | Used by | Body | Response `data` |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/reviews` | Tenant | reviews.create | `useCreateReview` | `{ propertyId, rating (1–5), comment }`; needs an ACTIVE or COMPLETED rental without a review | `CreatedReview` |
| GET | `/reviews/property/:propertyId` | Public | reviews.getForProperty | `getPublicPropertyReviews` (a home's page); `usePropertyReviews` | — | `Review[]` |
| GET | `/landlord/reviews` | Landlord | landlord.getReviews | `useLandlordReviews` | query: `propertyId?, page, limit, sortBy (createdAt \| rating), sortOrder` | `LandlordReview[]` + `meta` |

### Favorites

| Method | Path | Role | Service | Used by | Body / query | Response `data` |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/favorites` | Any | favorites.getMine | `useMyFavorites` | query: `limit=100, sortOrder=desc` | `FavoriteWithProperty[]` + `meta` |
| GET | `/favorites/ids` | Any | favorites.getIds | `useFavoriteIds` (heart icons) | — | `string[]` |
| POST | `/favorites` | Any | favorites.add | `useToggleFavorite` | `{ propertyId }` | `Favorite` |
| DELETE | `/favorites/:propertyId` | Any | favorites.remove | `useToggleFavorite` | — | `{ removed }` |

### Notifications

| Method | Path | Role | Service | Used by | Body / query | Response `data` |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/notifications` | Any | notifications.getMine | `useNotificationFeed` (bell), `useNotifications` (page) | query: `page, limit, sortBy, sortOrder, unread?` | `AppNotification[]` + `meta` |
| GET | `/notifications/summary` | Any | notifications.getSummary | `useNotificationSummary` (bell total and section badges; polls every 30 s and on focus) | — | `{ unreadTotal, byLink: { link, count }[] }` |
| PATCH | `/notifications/:id/read` | Any | notifications.markRead | `useMarkNotificationRead` | — | `AppNotification` |
| PATCH | `/notifications/read-all` | Any | notifications.markAllRead | `useMarkAllNotificationsRead` | — | `{ updated }` |
| PATCH | `/notifications/read-by-link` | Any | notifications.markReadByLink | `useMarkSectionRead` (opening a dashboard section clears its badge) | `{ linkPrefix }` (starts with `/dashboard/`) | `{ updated }` |

### Landlord

| Method | Path | Role | Service | Used by | Body / query | Response `data` |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/landlord/properties` | Landlord | landlord.getProperties | `useLandlordProperties`, `useAllLandlordProperties` | property filters + `reviewStatus?` | `PropertyWithRelations[]` + `meta` (every review status) |
| POST | `/landlord/properties` | Landlord (approved) | landlord.createProperty | `useCreateProperty` | `title, description, listingType, rentAmount \| salePrice, address, city, division, latitude?, longitude?, bedrooms, bathrooms, area, propertyType, categoryId, amenities[], images[]` | `Property` (`reviewStatus: "PENDING"`) |
| PUT | `/landlord/properties/:id` | Landlord | landlord.updateProperty | `useUpdateProperty`, `useToggleAvailability` | Any subset of the create fields, plus `availabilityStatus` (rentals only). Editing a REJECTED listing sends it back to PENDING | `Property` |
| DELETE | `/landlord/properties/:id` | Landlord | landlord.deleteProperty | `useDeleteProperty` | — | `null` |
| GET | `/landlord/requests` | Landlord | landlord.getRequests | `useLandlordRequests`, `usePendingRequestCount` | query: `status?` | `LandlordBooking[]` |
| PATCH | `/landlord/requests/:id` | Landlord | landlord.updateRequestStatus | `useDecideRequest` | `{ status: "APPROVED" \| "REJECTED" }` | `LandlordBooking` |
| PATCH | `/landlord/requests/:id/complete` | Landlord | landlord.completeRental | `useCompleteRental` | — | `CompletedBooking` |

### Admin

| Method | Path | Role | Service | Used by | Body / query | Response `data` |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/admin/users` | Admin | admin.getUsers | `useAdminUsers`, `usePendingLandlords`, `useAdminStats` | query: `searchTerm, role, userStatus, landlordStatus, page, limit, sortBy, sortOrder` | `User[]` + `meta` |
| PATCH | `/admin/users/:id` | Admin | admin.updateUserStatus | `useUpdateUserStatus` | `{ userStatus: "ACTIVE" \| "BLOCKED" }` | status update |
| PATCH | `/admin/users/:id/landlord-status` | Admin | admin.updateLandlordStatus | `useUpdateLandlordStatus` | `{ landlordStatus: "APPROVED" \| "REJECTED" }` | status update |
| GET | `/admin/properties` | Admin | admin.getProperties | `useAdminProperties`, `usePendingListingCount`, `useAdminStats`, `useCategoryUsage` | property filters + `reviewStatus?` | `PropertyWithRelations[]` + `meta` |
| PATCH | `/admin/properties/:id/review` | Admin | admin.reviewProperty | `useReviewProperty` (optimistic, rolled back on error) | `{ status: "APPROVED", note? }` or `{ status: "REJECTED", note }` (note 3–500 chars) | `PropertyWithRelations`; 409 if another admin decided first |
| GET | `/admin/rentals` | Admin | admin.getRentals | `useAdminRentals`, `useAdminStats` | query: `status?, page, limit` | `AdminBooking[]` + `meta` |

The admin overview has no stats endpoint. Its numbers come from each list's `meta.total`, fetched with `limit=1`.

### Site settings (homepage)

| Method | Path | Role | Service | Used by | Body | Response `data` |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/site-settings/homepage` | Public | siteSettings.getHomepage | `getPublicHomepage` (home page); mobile menu's featured home | — | Resolved homepage: hero, featured, states, types, latest, section order |
| GET | `/admin/site-settings/homepage` | Admin | siteSettings.getHomepageConfig | `useHomepageConfig` | — | `{ config, isDefault, updatedAt }` |
| PUT | `/admin/site-settings/homepage` | Admin | siteSettings.saveHomepageConfig | `useSaveHomepageConfig` | `HomepageConfig` | `{ config, isDefault, updatedAt }` |

### Next.js route handlers (same origin)

| Method | Path | Who | What it does |
| --- | --- | --- | --- |
| POST | `/api/upload` | Landlord or admin (`rn_token` cookie) | Multipart field `image` (JPEG, PNG or WebP, at most 5 MB). Uploads it to ImgBB with the server-only `IMGBB_API_KEY` and returns `{ url }`. Used by the property form's image uploader. |
| POST | `/api/revalidate-home` | Admin | Checks the caller with `GET /auth/me`, then refreshes the cached homepage data and `/` so a saved homepage config shows at once. Called by `useSaveHomepageConfig`. |

A server action, `refreshPublicListings()` in `app/actions/properties.ts`, does the same for the property lists after landlords change a listing or an admin approves one.

---

## 4. Error handling

- **Mutations:** every one shows a Sonner toast on success and on failure. The failure text comes from `getErrorMessage(error)`, which is the backend's message.
- **Forms:** server `errorDetails[].path` holds the bare field name, so `applyServerErrors()` (`lib/forms.ts`) puts each message under its field with `setError`. If no field matches, a toast or a form-level alert shows instead.
  - **Login:** a 401 shows under the password field.
  - **Property form:** a deleted category shows under Category.
- **Optimistic updates:** approving or rejecting rental requests and listings, blocking or unblocking users, marking notifications read and toggling favorites all update the cache first. They roll back from a snapshot on error and refetch when the request settles.
- **Route segments:** every one that fetches data has a `loading.tsx` with skeletons shaped like the content, and an `error.tsx` with a friendly message and a **Try again** button. That button calls the boundary's `retry()`, which re-fetches the segment and renders it again.
- **App-wide pages:** `app/not-found.tsx` is a styled 404 with search, and `app/global-error.tsx` catches errors in the root layout.
- **Empty states:** an icon, a sentence and a next action. The UI never shows raw JSON, stack traces or `undefined`.

## 5. Stripe flows

**Rent payment.**

1. The landlord approves the request, and the tenant sees **Pay now**.
2. `POST /payments/create { bookingId }` returns the Checkout session, and `window.location.assign(url)` takes the tenant to it.
3. Stripe sends the tenant back to `/payment/success?session_id=cs_…` (or `/payment/cancel`). The backend's `CLIENT_SUCCESS_URL` and `CLIENT_CANCEL_URL` set these.
4. The success page calls `POST /payments/confirm { sessionId }` once per visit, guarded by a ref, and the booking becomes **ACTIVE**. The backend's webhook does the same, and the call is idempotent, so a reload or the webhook arriving first is safe. A payment confirmed earlier shows as "already confirmed".

**Offer deposit.**

1. The seller accepts the offer, or the buyer accepts the seller's counter-offer.
2. `POST /offers/:id/deposit` returns `checkoutUrl`, and the browser goes to it.
3. Stripe sends the buyer back to `/payment/success?type=deposit&session_id=…`, which calls `POST /offers/confirm { sessionId }`.
4. The home becomes **UNDER_CONTRACT**, and the seller can then **complete the sale**, which makes it **SOLD**.

## 6. Pagination, filters and caching

- **URL params.** Browse filters live in the URL: `/rent?division=Texas&propertyType=HOUSE&page=2`. Pages are shareable, and the back button works.
  - `useUrlParams()` updates them with `router.replace(…, { scroll: false })`.
  - Text inputs are debounced (~400 ms).
  - Pagination comes from the response's `meta.page` and `meta.totalPage`.
- **Dashboard lists:** these use the same pattern, e.g. the admin's `?review=PENDING` tab and status tabs. The query keys include the filters.
- **Public pages:** these are Server Components, reading through `lib/data/public.ts`.
  - Each read is a `"use cache"` function with `cacheLife({ stale: 60, revalidate: 60, expire: 3600 })`, the Cache Components version of `next: { revalidate: 60 }`.
  - The functions are tagged (`properties`, `categories`, `homepage`, and per-property reviews), so mutations can expire a tag at once.
  - A failed read returns a value instead of throwing, so a backend error is never cached.
- **Dashboards (TanStack Query).**
  - Query keys are defined in `src/lib/query-keys.ts`, grouped by resource: `auth`, `properties`, `categories`, `homepage`, `reviews`, `rentals`, `favorites`, `notifications`, `offers`, `payments`, `landlord`, `admin` and `propertyStates`.
  - Mutations invalidate their group.
  - Any mutation also invalidates `notifications.summary`, so badges stay fresh.
- **Sign-in and sign-out.** Every cached query is cancelled and removed, so no data from the previous user is kept.
