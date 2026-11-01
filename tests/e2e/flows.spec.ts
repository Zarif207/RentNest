import type { Page } from "@playwright/test";
import { api, expect, session, signIn, switchUser, test } from "./fixtures";

// These tests write real records through the API (see tests/e2e/README.md).
// Each one undoes what the API allows in a `finally` block.

type Listing = {
  id: string;
  title: string;
  listingType: "RENT" | "SALE";
  salePrice: string | null;
  availabilityStatus: string;
  owner: { email: string };
};

const OWNER_EMAIL = "landlord1@rentnest.com";

async function ownersListings(listingType: "RENT" | "SALE") {
  const listings = await api<Listing[]>(`/properties?listingType=${listingType}&availabilityStatus=AVAILABLE&limit=100`);
  return listings.filter((listing) => listing.owner.email === OWNER_EMAIL);
}

/** A row (card or table row) in a dashboard list that mentions `text`. */
const rowWith = (page: Page, text: string, button: string | RegExp) =>
  page
    .locator("li, tr, article")
    .filter({ hasText: text })
    .filter({ has: page.getByRole("button", { name: button }) })
    .last();

test("a tenant saves a home and removes it again @writes", async ({ page, context, baseURL }) => {
  const { token } = await session("TENANT");
  const [listing] = await ownersListings("RENT");
  test.skip(!listing, "No available rental to save");
  const savedBefore = (await api<string[]>("/favorites/ids", { token })).includes(listing.id);

  try {
    await signIn(context, "TENANT", baseURL!);
    await page.goto(`/properties/${listing.id}`);
    const save = page.getByRole("button", { name: `Save ${listing.title}` });
    const remove = page.getByRole("button", { name: `Remove ${listing.title} from saved homes` });

    if (savedBefore) {
      await remove.first().click();
      await expect(page.getByText("Removed from your favorites")).toBeVisible();
    }
    await save.first().click();
    // The heart fills at once (optimistic); the toast means the API has it.
    await expect(remove.first()).toBeVisible();
    await expect(page.getByText("Saved to your favorites")).toBeVisible();

    await page.goto("/dashboard/tenant/favorites");
    await expect(page.getByText(listing.title).first()).toBeVisible();
    await remove.first().click();
    await expect(page.getByText("Removed from your favorites")).toBeVisible();
  } finally {
    const savedNow = (await api<string[]>("/favorites/ids", { token })).includes(listing.id);
    if (savedNow && !savedBefore) await api(`/favorites/${listing.id}`, { token, method: "DELETE" });
    if (!savedNow && savedBefore) await api("/favorites", { token, method: "POST", body: { propertyId: listing.id } });
  }
});

// Approving locks the home for every other tenant until the lease is paid, and
// nothing in the API undoes it, so the test rejects unless asked to approve.
const DECISION = process.env.E2E_RENTAL_DECISION === "approve" ? "Approve" : "Reject";

test(`a rental request goes from tenant to landlord (${DECISION.toLowerCase()}) @writes`, async ({
  page,
  context,
  baseURL,
}) => {
  const tenant = await session("TENANT");
  const pending = await api<{ propertyId: string }[]>("/rentals?status=PENDING", { token: tenant.token });
  const listing = (await ownersListings("RENT")).find((home) => !pending.some((rental) => rental.propertyId === home.id));
  test.skip(!listing, "Every available rental already has a pending request from tenant1");

  // Tenant: request the home.
  await signIn(context, "TENANT", baseURL!);
  await page.goto(`/properties/${listing!.id}`);
  await page.getByRole("button", { name: "Request to Rent" }).click();
  const dialog = page.getByRole("dialog", { name: "Request to rent" });
  await dialog.getByRole("button", { name: /pick a date|move-in/i }).click();
  await page.getByRole("button", { name: /next month/i }).click();
  await page.getByRole("button", { name: /15th/ }).click();
  await dialog.locator("#leaseMonths").click();
  await page.getByRole("option", { name: "12 months" }).click();
  await dialog.getByRole("button", { name: "Send request" }).click();
  await expect(page.getByText("Request sent — the landlord will review it")).toBeVisible();

  const request = (await api<{ id: string; propertyId: string }[]>("/rentals?status=PENDING", { token: tenant.token })).find(
    (rental) => rental.propertyId === listing!.id,
  );
  expect(request, "the new request is pending").toBeTruthy();

  // Landlord: decide it.
  await switchUser(page, "LANDLORD", baseURL!);
  await page.goto("/dashboard/landlord/requests");
  await rowWith(page, listing!.title, DECISION).getByRole("button", { name: DECISION }).click();
  if (DECISION === "Reject") await page.getByRole("button", { name: "Reject request" }).click();
  await expect(
    page.getByText(DECISION === "Approve" ? "Request approved — the tenant can now pay" : "Request rejected", { exact: true }),
  ).toBeVisible();

  const after = await api<{ bookingStatus: string }>(`/rentals/${request!.id}`, { token: tenant.token });
  expect(after.bookingStatus).toBe(DECISION === "Approve" ? "APPROVED" : "REJECTED");
});

test("an offer is countered, accepted and sent to Stripe for the deposit @writes", async ({
  page,
  context,
  baseURL,
}) => {
  const tenant = await session("TENANT");
  const open = await api<{ propertyId: string; status: string }[]>("/offers", { token: tenant.token });
  const listing = (await ownersListings("SALE")).find(
    (home) => !open.some((offer) => offer.propertyId === home.id && ["PENDING", "COUNTERED", "ACCEPTED"].includes(offer.status)),
  );
  test.skip(!listing, "No home for sale by landlord1 without an open offer (run the backend seed for sale homes)");

  const asking = Number(listing!.salePrice);
  const offerAmount = Math.round(asking * 0.95);
  const counterAmount = Math.round(asking * 0.98);
  let offerId: string | undefined;

  // Stripe's page itself isn't part of the test: stop at its URL.
  await page.route("https://checkout.stripe.com/**", (route) => route.fulfill({ body: "Stripe Checkout" }));

  try {
    // Buyer: make the offer.
    await signIn(context, "TENANT", baseURL!);
    await page.goto(`/properties/${listing!.id}`);
    await page.getByRole("button", { name: "Make an offer" }).click();
    const dialog = page.getByRole("dialog", { name: "Make an offer" });
    await dialog.getByLabel("Your offer").fill(String(offerAmount));
    await dialog.locator("#financing").click();
    await page.getByRole("option").first().click();
    await dialog.getByRole("button", { name: "Send offer" }).click();
    await expect(page.getByText("Offer sent — the owner will reply")).toBeVisible();

    offerId = (await api<{ id: string; propertyId: string; status: string }[]>("/offers", { token: tenant.token })).find(
      (offer) => offer.propertyId === listing!.id && offer.status === "PENDING",
    )?.id;
    expect(offerId, "the new offer is pending").toBeTruthy();

    // Owner: counter it.
    await switchUser(page, "LANDLORD", baseURL!);
    await page.goto("/dashboard/landlord/offers");
    await rowWith(page, listing!.title, "Counter").getByRole("button", { name: "Counter" }).click();
    const counter = page.getByRole("dialog", { name: "Counter this offer" });
    await counter.getByLabel("Your counter price").fill(String(counterAmount));
    await counter.getByRole("button", { name: "Send counteroffer" }).click();
    await expect(page.getByText("Counteroffer sent")).toBeVisible();

    // Buyer: accept the counter and start the deposit.
    await switchUser(page, "TENANT", baseURL!);
    await page.goto("/dashboard/tenant/offers");
    await rowWith(page, listing!.title, /^Accept/).getByRole("button", { name: /^Accept/ }).click();
    await expect(page.getByText("Counteroffer accepted")).toBeVisible();
    await rowWith(page, listing!.title, /^Pay deposit/).getByRole("button", { name: /^Pay deposit/ }).click();
    await page.waitForURL(/checkout\.stripe\.com/);
  } finally {
    // Withdrawing is allowed until the deposit is paid; this run never pays it.
    if (offerId) await api(`/offers/${offerId}/withdraw`, { token: tenant.token, method: "PATCH" }).catch(() => undefined);
  }
});
