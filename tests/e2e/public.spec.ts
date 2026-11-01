import { expect, test } from "./fixtures";

test.describe("public pages", () => {
  test("home shows the hero and its search", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Live somewhere");
    await expect(page.getByRole("button", { name: "Search homes" })).toBeVisible();
  });

  for (const { path, heading, type } of [
    { path: "/rent", heading: "Rent your next", type: "House" },
    { path: "/buy", heading: "Find a home", type: "House" },
  ]) {
    test(`${path} filters by property type and clears it`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toContainText(heading);

      const filters = page.getByRole("complementary", { name: "Filters" });
      await filters.getByRole("button", { name: type, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`propertyType=${type.toUpperCase()}`));
      await expect(filters.getByRole("button", { name: type, exact: true })).toHaveAttribute("aria-pressed", "true");

      // Every result is that type (its photo's alt names it), or the empty state explains there are none.
      const results = page.getByRole("region", { name: "Results" });
      const cards = results.getByRole("article");
      const empty = results.getByText(/match your filters/);
      await expect(cards.first().or(empty)).toBeVisible();
      for (const card of await cards.all()) {
        await expect(card.getByRole("img").first()).toHaveAttribute("alt", new RegExp(type, "i"));
      }

      await page.getByRole("button", { name: `Remove filter: ${type}` }).first().click();
      await expect(page).not.toHaveURL(/propertyType=/);
    });
  }

  test("the Rent | Buy tabs switch listing type and keep filters", async ({ page }) => {
    await page.goto("/rent?propertyType=APARTMENT");
    await page.getByRole("navigation", { name: "Listing type" }).getByRole("link", { name: "Buy" }).click();
    await expect(page).toHaveURL(/\/buy\?propertyType=APARTMENT/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Find a home");
  });

  test("a listing opens its details page", async ({ page }) => {
    await page.goto("/rent");
    const first = page.getByRole("region", { name: "Results" }).getByRole("article").first();
    const title = (await first.getByRole("heading").first().textContent())?.trim();
    await first.getByRole("link").first().click();
    await expect(page).toHaveURL(/\/properties\/[0-9a-f-]{36}$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title!);
  });
});

test.describe("errors and crawling", () => {
  test("unknown pages and listings are real 404s", async ({ page, allowErrors }) => {
    allowErrors.push(/status of 404/, /HTTP 404/);
    for (const path of ["/no-such-page", "/properties/not-a-real-id", "/rent/atlantis"]) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(404);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });

  test("sitemap and robots respond", async ({ request }) => {
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBe(true);
    expect(await sitemap.text()).toContain("<loc>");
    const robots = await request.get("/robots.txt");
    expect(robots.ok()).toBe(true);
    expect(await robots.text()).toMatch(/Sitemap: .*\/sitemap\.xml/);
  });
});
