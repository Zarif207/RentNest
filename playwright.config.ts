import { defineConfig, devices } from "@playwright/test";

// End-to-end tests against the production build (`npm run build` first) and
// the API in NEXT_PUBLIC_API_URL. Two projects:
// - smoke: read-only checks, safe to run any time.
// - flows: tests tagged @writes create real records (a rental request, an
//   offer, a saved home) and clean up what the API allows. See tests/e2e/README.md.

const PORT = Number(process.env.E2E_PORT ?? 3100);
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  // The demo accounts are shared, so the flows run one at a time.
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL,
    // No intro curtain or scroll animations: steadier and faster tests.
    reducedMotion: "reduce",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "smoke", grepInvert: /@writes/, use: { ...devices["Desktop Chrome"] } },
    { name: "flows", grep: /@writes/, use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npx next start -p ${PORT}`,
        url: `${baseURL}/robots.txt`,
        reuseExistingServer: true,
        timeout: 60_000,
      },
});
