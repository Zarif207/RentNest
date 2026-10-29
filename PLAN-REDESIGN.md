# RentNest Frontend — Phase 5: Premium Redesign (after Step 25)

Steps 1–25 stay as they are (everything works). This phase changes the **look and feel**, not the functionality. The old steps 26 (docs) and 27 (deploy) move to the end as **Step 43 and 44**.

Same rhythm as before: paste a step's prompt → test in the browser → say `commit`. One step = one commit. Never any Co-Authored-By lines.

---

## The new direction: "Quiet luxury"

| | Old | New |
|---|---|---|
| Mood | Bright, airy, friendly | Dark-ink + ivory, editorial, cinematic |
| Palette | White, black, red accent | Ivory `#F6F3EE`, sand `#E9E2D6`, ink `#12100E`, espresso `#1C1815`, champagne `#C2A878`, bronze `#8A6D3B` (gold text on light), stone `#6F685F` (muted) |
| Dark mode | Add-on | First-class: bg `#0C0B0A`, surface `#161412`, text `#F2EEE7`, same champagne accent |
| Fonts | Hanken Grotesk + Instrument Serif | **Cormorant Garamond** (headings, large and light, with italic for emphasis) + **Manrope** (UI and body) |
| Logo | Plain wordmark | Monogram: an "R" whose leg forms a roof-line/arch, in a thin circle; wordmark "RENTNEST" in wide-tracked small caps |
| Shapes | Pills and rounded cards | Same pills for buttons, but larger radius cards (`rounded-3xl`), hairline borders (`border-black/10`), glass panels (blur) over images |
| Motion | Fade-ups | Smooth scroll (Lenis), scroll-scrubbed 3D (GSAP ScrollTrigger), pinned sections, intro preloader |
| Dashboards | Sidebar + tables | Bento grid like your Aurex Living shot: soft canvas, big rounded cards, floating pill top-nav |

**Tech additions:** `lenis` (smooth scroll), `gsap` + `@gsap/react` (ScrollTrigger, pinned and scrubbed animations), CSS 3D transforms (`perspective`, `rotateX/Y`, `translateZ`). No Three.js: it needs 3D model files, adds heavy weight, and hurts mobile. Real "3D feel" comes from layered depth, tilt and perspective. If you later have a `.glb` house model, we can add it as an optional step.

**Rules for this phase**
- Work on a new git branch `redesign` (Step 26 creates it). `main` stays safe at Step 25. We merge when you're happy.
- Informational sections use **real API data** (counts, cities, reviews). Don't invent numbers or fake testimonials. If there are no reviews yet, show a clearly generic "what tenants say" layout built from the review API, or hide the section.
- Every animation: disabled under `prefers-reduced-motion`; 3D/pinning simplified under 768 px.
- All existing functionality, routes, and error/loading states must keep working.

---

## Step 26. Reference images, branch, and design reset

**Do first (you):** create a folder `design-refs/` in the frontend project. Save into it: your Aurex Living dashboard screenshot, and screenshots (or downloads) of the 4 Dribbble references, named `ref-1.png` … `ref-5.png`. Add `design-refs/` to `.gitignore`. Then, in Claude Code:

**Prompt:**
> Read CLAUDE.md and PLAN-REDESIGN.md. Create and switch to branch `redesign`. Look at every image in `design-refs/` and write me a short summary of the shared design traits you see (palette, type, spacing, card style, hero style, motion hints) so I can confirm you understood them. Then apply the new direction from PLAN-REDESIGN.md: replace the "Design system" section in CLAUDE.md with the new palette/fonts/shapes/motion rules (keep everything else), swap fonts to Cormorant Garamond + Manrope via next/font, rewrite the CSS variables for light (ivory) and dark (ink) themes mapped to shadcn tokens, restyle button (pill; primary = ink in light / champagne-on-ink in dark; outline; ghost; "gold" variant), badge, card (rounded-3xl, hairline border), input, dialog, sheet, table, tabs, skeleton. Update StatusBadge to muted premium tones (same meanings). Remove the red accent everywhere. Install `lenis gsap @gsap/react`. Create a temporary `/style-guide` page to review it in both themes. Don't redesign pages yet.

**Done when:** you confirmed the summary matches your taste; `/style-guide` looks premium in light and dark; the site still works (colors changed everywhere).
**Commit:** `style: introduce premium design system with new palette and typography`

## Step 27. Logo and brand

**Prompt:**
> Create a new brand: an SVG `Logo` component (monogram "R" in a thin circle where the leg of the R forms a roof-line/arch; currentColor so it works in both themes) plus a `Wordmark` ("RENTNEST", wide letter-spacing, Cormorant small caps) and a combined `BrandLogo` with `size` and `variant` (full/mark-only). Generate favicon, apple-touch icon, and an OG image (1200×630, ink background, champagne monogram, tagline "Find a home worth coming home to") with the Next.js `icon.tsx`/`opengraph-image.tsx` conventions. Replace the logo everywhere (navbar, footer, auth pages, dashboard, loading screens). Show me 3 logo variations on `/style-guide` first and wait for me to pick one before applying it.

**Done when:** you picked a logo you like; it shows crisp at 24 px and 200 px in both themes.
**Commit:** `feat(brand): add monogram logo, favicon and og image`

## Step 28. Smooth scroll and motion foundation

**Prompt:**
> Build the motion foundation. (1) `SmoothScrollProvider` with Lenis, synced with GSAP ScrollTrigger (`lenis.on('scroll', ScrollTrigger.update)`, gsap ticker), disabled for reduced motion and for dashboard routes. (2) Reusable primitives in `components/motion/`: `Reveal` (fade/slide up, stagger children), `SplitText` (line/word reveal for headings; implement without paid plugins), `WordScrub` (words go from 20% to 100% opacity as you scroll), `Parallax` (y-offset by speed), `Magnetic` (button follows cursor slightly), `Counter` (animates a number when visible), `TiltCard` (3D tilt toward the mouse using perspective, with a soft glare), `Marquee`. (3) A `useIsDesktop` hook and a `useMotionOk` hook (false for reduced motion) used by all of them. (4) Page transition: soft fade between routes. (5) Intro preloader: ink screen, monogram draws itself, a 0→100 counter, curtain lifts to reveal the page; play once per browser session (sessionStorage) and skip for reduced motion; never block more than 2.2 s. Demo each on `/style-guide`.

**Done when:** scrolling is smooth; each primitive works on `/style-guide`; reduced-motion shows plain content.
**Commit:** `feat(motion): add smooth scroll, scroll animation primitives and intro preloader`

## Step 29. Navbar

**Prompt:**
> Redesign the header: a floating glass pill that sits 16 px from the top, centered, with the logo on the left, links (Home, Properties, About, Contact) in the middle with an animated underline/dot on the active link, and on the right a theme toggle and either a "Sign in" outline pill + "Get started" filled pill, or an avatar dropdown (name, role, Dashboard, Profile, Log out). It's transparent with light text over the hero and turns into a blurred ink/ivory panel after scrolling, and hides on scroll-down and reappears on scroll-up. Mobile: a full-screen menu overlay with large serif links, staggered reveal, and the CTA at the bottom. Magnetic hover on the CTAs. Keep role-aware links.

**Done when:** header looks right over the hero image in both themes; mobile menu feels good.
**Commit:** `feat(layout): redesign floating glass navbar with full-screen mobile menu`

## Step 30. Hero (the "wow" first screen)

**Prompt:**
> Rebuild the home hero as a cinematic first screen. Full-viewport (100svh) premium property photo (use a high-quality `images.unsplash.com` luxury home/architecture image; pick 3 candidates, preload the best with next/image `priority`, and tell me the URLs so I can swap them). Dark gradient overlay for legibility. Headline in huge Cormorant Garamond, two lines with SplitText line reveal: "Live somewhere" / "*extraordinary*" (italic champagne), a one-line subtitle, and a glass search panel (location select from real cities, property type, max price, and a champagne "Search homes" button → `/properties` with params). Depth: 3 small floating glass property cards (real featured properties: image, price, city) positioned at different depths that drift with mouse movement (parallax, translateZ) and gently bob; a rotating circular badge ("Premium rentals · Bangladesh ·") that spins slowly; a scroll cue. Scroll-scrub with ScrollTrigger: as you scroll the image scales 1 → 1.35, the text moves up and fades, and the glass cards fly outward, creating a "dolly into the building" feel before the next section arrives. Mobile: no mouse parallax, simplified scroll effect, search panel stacked. LCP must stay good (no layout shift, image sized).

**Done when:** first load shows preloader → hero reveal; scroll feels like moving through the image; mobile looks excellent.
**Commit:** `feat(home): build cinematic hero with 3d depth and scroll-driven zoom`

## Step 31. Home sections part 1 — statement, stats, featured collection

**Prompt:**
> Under the hero, build: (1) **Statement** — a big paragraph (e.g. "We connect people to homes worth staying in — vetted landlords, transparent pricing, secure payments.") revealed word-by-word with WordScrub as you scroll. (2) **Live stats row** — 4 counters from real data via `meta.total` and aggregates (properties listed, available now, cities covered, landlords if obtainable; skip anything you can't get truthfully). (3) **Featured collection** — a pinned section (GSAP ScrollTrigger `pin`) where featured properties (real, `limit=8`) scroll **horizontally** while you scroll vertically; each card is large (image, price, city, beds/baths/area, "View") and has 3D perspective: cards entering from the right are rotated on Y (~-18°) and flatten as they reach the center, and scale/blur slightly when leaving. A progress bar and "01 / 08" counter update. Under 768 px: a normal horizontal swipe carousel without pinning. Server-fetch data with revalidate 60 and pass to client components.

**Done when:** pinned horizontal scroll is smooth with no jump at the end; cards tilt in 3D; stats are real.
**Commit:** `feat(home): add scroll-scrubbed statement, live stats and 3d featured collection`

## Step 32. Home sections part 2 — cities, types, how it works

**Prompt:**
> Build: (1) **Explore by city** — group real properties by city/division (fetch `limit=100`, aggregate server-side), show the top 5–6 as tall image tiles in an accordion-style row: hovering/tapping expands one tile (flex-grow) revealing city name, property count, starting price, and an "Explore" link to `/properties?city=…`; mobile = vertical stack. Use the first property image of each city as the tile photo. (2) **Property types** — Apartment / House / Studio / Villa as 4 tall cards with counts, a subtle 3D tilt on hover, linking to filtered browse. (3) **How it works** — a sticky split section: left side has a segmented toggle "For tenants / For landlords" and the step list (Browse → Request → Get approved → Pay securely → Move in; List → Review requests → Approve → Get paid); right side is a 3D card stack whose cards rotateX/translateZ in sequence as you scroll through the section, each showing a mini UI mock (property card, request dialog, status badges, Stripe checkout lock) built with real components, not images. Mobile: stacked steps with reveal.

**Done when:** city tiles use real data; the toggle swaps the story; the 3D stack advances with scroll.
**Commit:** `feat(home): add city explorer, property types and 3d how-it-works stack`

## Step 33. Home sections part 3 — why us, reviews, FAQ, CTA

**Prompt:**
> Build: (1) **Why RentNest** — a bento grid of 5–6 tiles of different sizes: Secure Stripe payments, Verified listings, Instant request approvals, Transparent monthly pricing, Dashboards for every role, Dark/light comfort. Each tile has a short line, an icon or tiny animated illustration (CSS/SVG), and hover glow that follows the cursor. (2) **Voices** — real reviews from `GET /reviews/property/:id` across a few featured properties (aggregate server-side). Large serif quote carousel with star rating, property name, reviewer name, `01 / 0N` counter and arrow buttons; if fewer than 3 real reviews exist, show a different truthful block ("Built for renters and landlords in Bangladesh" with the rating summary) instead of fake quotes. (3) **FAQ** — 6 real questions (how requests work, how payment works, are payments secure, can I cancel, how do landlords get approved, which cities) in an accordion with smooth height animation. (4) **Final CTA** — full-width image with parallax, dark overlay, big headline "Your next chapter starts *here*", two buttons (Find a home / List your property → register as landlord). Each section reveals on scroll.

**Done when:** the whole home page flows from hero to CTA without a boring/flat section.
**Commit:** `feat(home): add bento features, reviews, faq and closing call to action`

## Step 34. Footer

**Prompt:**
> Redesign the footer as a statement piece on an ink background: a huge "RENTNEST" wordmark spanning the full width in outlined/very low-contrast type that fills with champagne on hover (or parallax-rises as the footer enters); above it a newsletter row (email input + button, toast on submit — UI only), 4 link columns (Explore, For landlords, Company, Support), contact details, social icons with magnetic hover, a "Back to top" circular button that scrolls smoothly, and a thin marquee strip ("Find · Request · Move in · ") above the footer. Bottom bar with copyright and small legal links. Fully responsive; in light mode the footer stays dark for contrast.

**Done when:** the footer feels like a finale, not an afterthought.
**Commit:** `feat(layout): redesign footer with oversized wordmark and marquee`

## Step 35. Properties browse and details restyle

**Prompt:**
> Restyle `/properties` and `/properties/[id]` to the new system without changing behavior: an editorial page header with a serif title and result count; a refined filter bar (glass, sticky, with active-filter chips); property cards with larger radius, image zoom, a gold price tag, favorite-heart UI (local state only, no API) and a subtle 3D tilt on hover (desktop only); stagger reveal when results change. Details page: full-bleed gallery with a bento layout (1 large + 4 small, lightbox on click), a sticky booking panel (glass card with price, stat trio in serif numerals, "Request to Rent"), amenities as icon tiles, landlord card, a "Similar properties" row (same city, real data), and reviews in the new quote style. Keep loading skeletons and error states in the new style.

**Done when:** browsing and details feel consistent with the new home page.
**Commit:** `style(properties): restyle browse and details pages with premium layout`

## Step 36. About page

**Prompt:**
> Create `/about` (the navbar link exists but the page was never designed). Sections: a hero with a big serif statement and parallax image; "Our story" (two columns, text + image with reveal); "What we believe" — 3 values in a pinned/stacked card sequence with 3D flip-in; real platform numbers using the same stats helper as the home page; "How we keep it safe" (Stripe payments, role-based access, verified landlords, blocked-user moderation) as a timeline; a "Built by" short section with the project owner's name (Zarif Hasan) and a one-line mission, no invented team members or fake photos; a CTA. Add metadata and a `loading.tsx`.

**Done when:** page is informative, not filler, and has no fabricated people or claims.
**Commit:** `feat(about): add story, values and trust timeline page`

## Step 37. Contact page

**Prompt:**
> Create `/contact`. Left: large serif heading, short intro, contact details (email, phone, address in Dhaka — use placeholders I can edit in a single `site-config.ts`), office hours, and social links. Right: a glass form card with name, email, subject (select: General, Tenant support, Landlord support, Payments, Partnership), and message, with Zod validation, inline errors, a loading state, and a success state that replaces the form with a thank-you message (the backend has no contact endpoint, so the submission is UI-only: simulate a short delay and show a toast; add a clear code comment saying so, and don't claim the message was emailed). Below: an embedded OpenStreetMap iframe in a rounded container (lazy loaded) and a small FAQ link strip.

**Done when:** form validates and succeeds visually; layout is excellent on mobile.
**Commit:** `feat(contact): add contact page with validated form and map`

## Step 38. Auth pages restyle

**Prompt:**
> Restyle `/auth/login` and `/auth/register`: full-height split screen with a cinematic property image panel (slow Ken Burns zoom, glass quote card, logo) and a clean form panel with serif heading, floating-label inputs, password strength hint, role-picker cards with an animated selection state (register), the demo-account buttons from before, and smooth step transitions. Keep all validation, error mapping, redirect logic, and blocked-account handling. Mobile: image becomes a short banner on top.

**Done when:** login and register match the premium look; every error state still works.
**Commit:** `style(auth): redesign login and register with cinematic split layout`

## Step 39. Dashboard shell — bento system

**Prompt:**
> Look at the Aurex Living dashboard image in `design-refs/`. Redesign the dashboard shell in that spirit: a soft canvas background (`#EFEDE8` light / `#0C0B0A` dark), a floating top bar with the logo, a centered **pill navigation** (active item = filled ink pill, others = soft gray pills; items depend on role), and on the right search, notifications (UI-only dropdown showing recent request/payment events from real data), theme toggle and avatar menu. Mobile: top bar + a bottom floating tab bar with 4–5 key items and a "More" sheet. Build reusable bento primitives: `BentoGrid`, `BentoCard` (rounded-3xl, soft inner shadow, title + small arrow button), `MetricCard` (big serif number, label, tiny bar/sparkline), `ProgressPair` (two labeled bars like "Sold / Rented"), `StatusPill`, `FilterPill` selects, and a restyled `DataTable` (rounded container, pill filters above, row hover, avatar/thumbnail cell, pill status, action icon button; stacked cards on mobile). Keep loading skeletons shaped like the new cards. Don't change page data logic yet.

**Done when:** the shell looks like the reference in both themes; existing pages still render inside it.
**Commit:** `style(dashboard): introduce bento layout, pill navigation and new data table`

## Step 40. Tenant dashboard redesign

**Prompt:**
> Rebuild the tenant overview as a bento layout using the new primitives and the existing hooks: a welcome card ("Good morning, <name>" + next action, e.g. "You have 1 request ready to pay" with a Pay button), MetricCards (requests, pending, active rentals, total paid), a ProgressPair of requests by status, an "Active home" feature card with the rented property's image and details, a request timeline list (status pills, quick actions Pay Now / Leave Review), and a recent-payments card. Restyle My Requests (status filter pills, rich rows with property thumbnail) and Payments (summary on top, table below) and Profile. Add helpful empty states with a clear next step. Keep every action working.

**Done when:** a tenant can see at a glance what to do next; all actions still work.
**Commit:** `style(tenant): redesign tenant dashboard with bento overview and timeline`

## Step 41. Landlord dashboard redesign

**Prompt:**
> Rebuild the landlord overview in the Aurex-style bento: a hero metric card (total earnings, label clearly) with a ProgressPair (available vs rented), MetricCards (properties, pending requests, active rentals, average rating), an "Earnings by month" card with a clean SVG bar chart, a "Property objects" card with 3 property mini-cards (image, status chip, price, quick toggle), and an "Incoming requests" card with approve/reject buttons (optimistic, same as before). Restyle Properties list (grid/table toggle, filter pills, availability switch), the create/edit form (stepper layout with progress, sticky save bar, image uploader as a bento of thumbnails), Requests, and Reviews. Keep all behavior.

**Done when:** landlord overview resembles the reference style and every action still works.
**Commit:** `style(landlord): redesign landlord dashboard, listings and request management`

## Step 42. Admin dashboard redesign and polish pass

**Prompt:**
> Rebuild the admin overview as a bento: platform health metric cards (users, tenants, landlords, blocked, properties, pending requests), a users-by-role ProgressPair, a "Latest users" card, a "Latest rentals" card, and quick actions. Restyle Users (pill filters, avatar cells, role/status pills, ban/unban with the same optimistic flow), Properties, Rentals, and Categories to the new table. Then run a **final polish pass across the whole site**: check 375/768/1024/1440 px in both themes; fix contrast on gold-on-ivory text (use bronze); make sure every animation respects reduced motion and is simplified on mobile; test performance (Lighthouse mobile ≥ 80 performance on home, ≥ 90 accessibility; lazy-load below-the-fold sections, avoid layout shift, `will-change` only where needed, kill ScrollTrigger instances on unmount); delete `/style-guide`; verify no console errors; confirm all earlier requirements still work (auth, middleware, Stripe flow, 404/error pages, toasts).

**Done when:** the whole app feels like one premium product and is smooth on a mid-range phone.
**Commit:** `style(admin): redesign admin dashboard and finalize premium polish`

## Step 43. Documentation (was Step 26)

**Prompt:**
> Update `README.md` and `API_INTEGRATION.md` for the final app: new routes (`/about`, `/contact`), the design system and tech (Lenis, GSAP, CSS 3D), screenshots section placeholders, local setup, admin credentials for graders, demo accounts, Stripe test card. Mention that the contact form is UI-only. Keep the API mapping accurate.

**Commit:** `docs: update readme and api integration for redesigned app`

## Step 44. Merge and deploy (was Step 27)

**Prompt:**
> Run lint and build on branch `redesign`. Show me `git log --oneline main..redesign`. When I confirm, merge `redesign` into `main` (merge commit, no force push), ask me before pushing, then help me deploy to Vercel and run the smoke test from PLAN.md Part D plus: home preloader plays once, hero scroll effect works on mobile Safari/Chrome, dark mode on every page.

**Commit:** `chore: merge premium redesign and configure production deployment`

---

## How to start (you)

1. Save the reference images into `design-refs/` (step 26).
2. Put this file next to `PLAN.md` and `CLAUDE.md` and add `PLAN-REDESIGN.md` to `.gitignore`.
3. Open Claude Code in the frontend folder and send:

```
Read CLAUDE.md, PLAN.md (steps 1–25 are done) and PLAN-REDESIGN.md. We are now doing the redesign phase, one step at a time, same rules as before: only the step I name, lint and build before finishing, wait for my "commit", no Co-Authored-By lines, no pushing without asking. Start with Step 26 of PLAN-REDESIGN.md.
```

Then continue with `Do Step 27 of PLAN-REDESIGN.md.` and so on.

## Tips for the "blow-up" result

- **Images decide 50% of the premium feel.** Hero and city tiles need great photos. Choose 5–6 architectural/luxury interior photos from Unsplash yourself and give Claude Code the URLs. Mediocre stock makes even good animation look cheap.
- **Update your seed data.** The properties on the site use the backend's seed images. After the redesign, update a few properties through the landlord form with better photos (ImgBB upload) so the featured collection looks its best.
- **Check on a real phone** after steps 30, 31 and 32. Scroll effects are where mobile problems show up first.
- If a step gets too heavy or glitchy, tell Claude Code "simplify this effect for performance" instead of adding more code.
