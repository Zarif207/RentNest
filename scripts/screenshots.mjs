// Captures the README screenshots from a running build:
//   npm run build && npm start   (in another terminal)
//   node scripts/screenshots.mjs [baseUrl]
// Signs in with the seeded demo accounts against the API the build points at
// and writes PNGs to docs/screenshots/. A page that fails is skipped and listed.
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const BASE = (process.argv[2] ?? "http://localhost:3000").replace(/\/+$/, "");
const OUT = "docs/screenshots";
const SETTLE_MS = 1500;
const ACCOUNTS = {
  admin: { email: "admin@rentnest.com", password: "Admin@123" },
  landlord: { email: "landlord1@rentnest.com", password: "Password@123" },
  tenant: { email: "tenant1@rentnest.com", password: "Password@123" },
};
const failed = [];

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();

async function newPage({ width = 1440, height = 900, colorScheme = "light", mobile = false } = {}) {
  const context = await browser.newContext({
    viewport: { width, height },
    colorScheme,
    reducedMotion: "no-preference",
    deviceScaleFactor: mobile ? 2 : 1,
    isMobile: mobile,
    hasTouch: mobile,
  });
  // Skip the cookie banner and the one-time intro so they don't cover the shots.
  await context.addCookies([
    { name: "rn_consent", value: encodeURIComponent(JSON.stringify({ analytics: false, marketing: false, date: new Date().toISOString() })), url: BASE },
  ]);
  await context.addInitScript(() => {
    try {
      sessionStorage.setItem("rn-intro-seen", "1");
    } catch {}
  });
  return context.newPage();
}

async function settle(page) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(SETTLE_MS);
}

async function shot(name, page, action, { fullPage = false } = {}) {
  try {
    await action(page);
    await settle(page);
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage });
    console.log("saved", name);
  } catch (error) {
    failed.push(`${name}: ${error.message.split("\n")[0]}`);
    console.log("FAILED", name);
  }
}

async function login(page, role) {
  const { email, password } = ACCOUNTS[role];
  await page.goto(`${BASE}/auth/login`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: /^(log in|sign in)$/i }).click();
  await page.waitForURL(/\/dashboard\//, { timeout: 30000 });
}

// A home for sale, for the details (payment estimate) and map shots.
async function saleId() {
  const api = process.env.NEXT_PUBLIC_API_URL ?? "https://rentnest-backend-one.vercel.app/api";
  const body = await (await fetch(`${api}/properties?listingType=SALE&limit=1`)).json();
  return body.data?.[0]?.id;
}

// Public, light
{
  const page = await newPage();
  await shot("home-hero", page, (p) => p.goto(`${BASE}/`));
  await shot("home-full", page, (p) => p.goto(`${BASE}/`), { fullPage: true });
  await shot("rent-filters", page, (p) => p.goto(`${BASE}/rent`));
  await shot("buy", page, (p) => p.goto(`${BASE}/buy`));
  const id = await saleId().catch(() => null);
  if (id) {
    await shot("details-sale", page, async (p) => {
      await p.goto(`${BASE}/properties/${id}`);
      await p.getByRole("heading", { name: "Estimate your payment" }).scrollIntoViewIfNeeded();
    });
    await shot("map", page, async (p) => {
      await p.goto(`${BASE}/properties/${id}`);
      // The map loads when its section nears the viewport.
      await p.getByRole("heading", { name: "Location", exact: true }).scrollIntoViewIfNeeded();
      await p.locator(".leaflet-container").first().scrollIntoViewIfNeeded();
      await p.waitForSelector(".leaflet-tile-loaded", { timeout: 15000 });
    });
  } else {
    failed.push("details-sale / map: no sale listing returned by the API");
  }
  await shot("login", page, (p) => p.goto(`${BASE}/auth/login`));
  try {
    await page.goto(`${BASE}/`);
    await settle(page);
    await page.locator("header a[href='/']").first().screenshot({ path: `${OUT}/logo.png` });
    console.log("saved logo");
  } catch (error) {
    failed.push(`logo: ${error.message.split("\n")[0]}`);
  }
  await page.context().close();
}

// Public, dark
{
  const page = await newPage({ colorScheme: "dark" });
  await shot("home-dark", page, (p) => p.goto(`${BASE}/`));
  await page.context().close();
}

// Mobile
{
  const page = await newPage({ width: 390, height: 844, mobile: true });
  await shot("mobile-home", page, (p) => p.goto(`${BASE}/`));
  await shot("mobile-menu", page, async (p) => {
    await p.goto(`${BASE}/`);
    await settle(p);
    await p.getByRole("button", { name: /menu/i }).first().click();
  });
  await page.context().close();
}

// Tenant
{
  const page = await newPage();
  try {
    await login(page, "tenant");
    await shot("tenant-offers", page, (p) => p.goto(`${BASE}/dashboard/tenant/offers`));
  } catch (error) {
    failed.push(`tenant login: ${error.message.split("\n")[0]}`);
  }
  await page.context().close();
}

// Landlord
{
  const page = await newPage();
  try {
    await login(page, "landlord");
    await shot("landlord-properties", page, (p) => p.goto(`${BASE}/dashboard/landlord/properties`));
    await shot("landlord-offers", page, (p) => p.goto(`${BASE}/dashboard/landlord/offers`));
  } catch (error) {
    failed.push(`landlord login: ${error.message.split("\n")[0]}`);
  }
  await page.context().close();
}

// Admin
{
  const page = await newPage();
  try {
    await login(page, "admin");
    await shot("admin-overview", page, (p) => p.goto(`${BASE}/dashboard/admin`));
    await shot("admin-properties-pending", page, (p) => p.goto(`${BASE}/dashboard/admin/properties?review=PENDING`));
    await shot("notifications-open", page, async (p) => {
      await p.goto(`${BASE}/dashboard/admin`);
      await settle(p);
      await p.getByRole("button", { name: /^Notifications/ }).first().click();
    });
  } catch (error) {
    failed.push(`admin login: ${error.message.split("\n")[0]}`);
  }
  await page.context().close();
}

await browser.close();
console.log(failed.length ? `\nFailed:\n- ${failed.join("\n- ")}` : "\nAll screenshots saved.");
