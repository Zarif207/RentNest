# End-to-end tests

Playwright tests against the **production build** and the API in `NEXT_PUBLIC_API_URL`.

```bash
npm run build
npm run test:e2e:smoke   # read-only: safe to run any time
npm run test:e2e         # everything, including the flows below
```

The config starts `next start -p 3100` itself (or reuses one already running).
Set `E2E_BASE_URL` to test a deployed site instead, e.g.
`E2E_BASE_URL=https://your-app.vercel.app npm run test:e2e:smoke`.

## Projects

- **smoke** (read-only): public browsing and filters on `/rent` and `/buy`,
  the Rent | Buy tabs, a details page, login for each role and role
  redirects, wrong credentials, the notifications bell, the pending-landlord
  block (the profile is answered as `PENDING` in the browser, nothing is
  written), real 404s, sitemap and robots.
- **flows** (tests tagged `@writes`) create real records with the demo
  accounts and clean up what the API allows:
  - Saved home: saved and removed again (the favorite ends as it started).
  - Rental request → landlord decision. Rejects by default: an approved,
    unpaid request blocks the home for everyone and the API can't undo it.
    `E2E_RENTAL_DECISION=approve` approves instead. The request stays in the
    database either way (tenants can't cancel one).
  - Offer → counter → accept → deposit, stopping at the Stripe Checkout URL
    (no card is entered); the offer is then withdrawn. Skipped when landlord1
    has no home for sale (run the backend seed). The offer stays in the
    database as withdrawn.

Every test fails on an unexpected `console.error`, page error, failed request
or 4xx/5xx response; a test lists the ones it expects with `allowErrors`.

`E2E_API_URL` points the setup and cleanup calls at another API (it defaults
to `NEXT_PUBLIC_API_URL`, then the live backend).
