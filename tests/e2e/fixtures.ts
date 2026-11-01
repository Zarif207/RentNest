import { test as base, expect, type BrowserContext, type Page } from "@playwright/test";

// The backend the build talks to (Playwright doesn't read .env.local).
export const API_URL = (
  process.env.E2E_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://rentnest-backend-one.vercel.app/api"
).replace(/\/+$/, "");

export type Role = "TENANT" | "LANDLORD" | "ADMIN";

// The seeded demo accounts (see the backend README).
export const ACCOUNTS: Record<Role, { email: string; password: string; home: string }> = {
  TENANT: { email: "tenant1@rentnest.com", password: "Password@123", home: "/dashboard/tenant" },
  LANDLORD: { email: "landlord1@rentnest.com", password: "Password@123", home: "/dashboard/landlord" },
  ADMIN: { email: "admin@rentnest.com", password: "Admin@123", home: "/dashboard/admin" },
};

type Session = { token: string; user: { id: string; name: string; email: string; role: Role } };
const sessions = new Map<Role, Session>();

/** Calls the API directly (test setup and cleanup); throws on an error envelope. */
export async function api<T>(path: string, init: { token?: string; method?: string; body?: unknown } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    method: init.method ?? "GET",
    headers: {
      "content-type": "application/json",
      ...(init.token && { authorization: `Bearer ${init.token}` }),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  const json = (await response.json()) as { success: boolean; message: string; data: T };
  if (!response.ok || !json.success) throw new Error(`${init.method ?? "GET"} ${path}: ${response.status} ${json.message}`);
  return json.data;
}

/** Logs in through the API once per run and role. */
export async function session(role: Role) {
  const cached = sessions.get(role);
  if (cached) return cached;
  const { email, password } = ACCOUNTS[role];
  const data = await api<{ accessToken: string; user: Session["user"] }>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  const value = { token: data.accessToken, user: data.user };
  sessions.set(role, value);
  return value;
}

/** Signs the browser in as `role` by setting the token cookie the app reads. */
export async function signIn(context: BrowserContext, role: Role, baseURL: string) {
  const { token } = await session(role);
  await context.addCookies([{ name: "rn_token", value: token, url: baseURL, sameSite: "Lax" }]);
}

/**
 * Changes who's signed in. Leaves the page first: swapping the cookie under a
 * live page would turn its background prefetches into login redirects.
 */
export async function switchUser(page: Page, role: Role, baseURL: string) {
  await page.goto("about:blank");
  await page.context().clearCookies({ name: "rn_token" });
  await signIn(page.context(), role, baseURL);
}

// Noise that isn't a bug: prefetches and navigations the browser cancels.
const ALWAYS_ALLOWED = [/net::ERR_ABORTED/, /checkout\.stripe\.com/];

type Fixtures = {
  /** Patterns of console errors or failed requests this test expects. */
  allowErrors: RegExp[];
  /** Fails the test on any other console.error, failed request or 4xx/5xx response. */
  errorGuard: void;
};

export const test = base.extend<Fixtures>({
  // Fixture callbacks are named `provide`, not Playwright's usual `use`, so
  // the React hooks lint rule doesn't mistake them for React's use().
  allowErrors: async ({}, provide) => {
    await provide([]);
  },
  errorGuard: [
    async ({ page, context, baseURL, allowErrors }, provide) => {
      // A saved cookie choice, so the banner doesn't cover the page.
      await context.addCookies([
        {
          name: "rn_consent",
          value: JSON.stringify({ analytics: false, marketing: false, date: new Date().toISOString() }),
          url: baseURL!,
          sameSite: "Lax",
        },
      ]);

      const problems: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "error") problems.push(`console.error: ${message.text()}`);
      });
      page.on("pageerror", (error) => problems.push(`page error: ${error.message}`));
      page.on("requestfailed", (request) => {
        problems.push(`request failed: ${request.method()} ${request.url()} (${request.failure()?.errorText})`);
      });
      page.on("response", (response) => {
        if (response.status() >= 400) problems.push(`HTTP ${response.status()}: ${response.request().method()} ${response.url()}`);
      });

      await provide();

      const unexpected = problems.filter(
        (problem) => ![...ALWAYS_ALLOWED, ...allowErrors].some((pattern) => pattern.test(problem)),
      );
      expect(unexpected, "unexpected console errors or failed requests").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
