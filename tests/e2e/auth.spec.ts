import { ACCOUNTS, API_URL, expect, session, signIn, test, type Role } from "./fixtures";

const ROLES = Object.keys(ACCOUNTS) as Role[];

test("a signed-out visitor is sent to log in, then back", async ({ page }) => {
  await page.goto("/dashboard/tenant/offers");
  await expect(page).toHaveURL(/\/auth\/login\?redirect=%2Fdashboard%2Ftenant%2Foffers/);

  const { email, password } = ACCOUNTS.TENANT;
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard\/tenant\/offers$/);
});

for (const role of ROLES) {
  test(`${role.toLowerCase()} logs in and lands on their dashboard`, async ({ page }) => {
    const { email, password, home } = ACCOUNTS[role];
    await page.goto("/auth/login");
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Log in", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${home}$`));
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Another role's dashboard and the login page both send them home.
    const other = ACCOUNTS[ROLES.find((r) => r !== role)!].home;
    await page.goto(other);
    await expect(page).toHaveURL(new RegExp(`${home}$`));
    await page.goto("/auth/login");
    await expect(page).toHaveURL(new RegExp(`${home}$`));
  });
}

test("wrong credentials show an error and stay on the page", async ({ page, allowErrors }) => {
  allowErrors.push(/HTTP 401: POST .*\/auth\/login/, /status of 401/);
  await page.goto("/auth/login");
  await page.getByLabel("Email", { exact: true }).fill(ACCOUNTS.TENANT.email);
  await page.getByLabel("Password", { exact: true }).fill("not-the-password");
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page.getByText(/invalid|incorrect|wrong/i).first()).toBeVisible();
  await expect(page).toHaveURL(/\/auth\/login/);
});

test("the notifications bell opens the latest notifications", async ({ page, context, baseURL }) => {
  await signIn(context, "TENANT", baseURL!);
  await page.goto("/dashboard/tenant");
  await page.getByRole("button", { name: /^Notifications/ }).click();
  const menu = page.getByRole("dialog").or(page.getByRole("menu"));
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("link", { name: /all notifications/i })).toBeVisible();
});

test("a landlord waiting for approval can't list homes", async ({ page, context, baseURL }) => {
  // landlord1 is approved; the profile is answered as PENDING, which is what
  // a newly registered landlord gets. Nothing is written.
  const { user } = await session("LANDLORD");
  await page.route(`${API_URL}/auth/me`, async (route) => {
    const response = await route.fetch();
    const body = await response.json();
    await route.fulfill({ response, json: { ...body, data: { ...body.data, landlordStatus: "PENDING" } } });
  });
  await signIn(context, "LANDLORD", baseURL!);

  await page.goto("/dashboard/landlord");
  await expect(page.getByRole("status").filter({ hasText: "Waiting for admin approval" })).toBeVisible();
  await expect(page.getByText(user.name.split(" ")[0]).first()).toBeVisible();

  await page.goto("/dashboard/landlord/properties/new");
  await expect(page.getByRole("heading", { name: "Waiting for admin approval" })).toBeVisible();
  await expect(page.getByLabel(/title/i)).toHaveCount(0);
});
