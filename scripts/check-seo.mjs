// SEO smoke check against a running build: `npm run seo:check [baseUrl]`.
// Walks every URL in /sitemap.xml and checks status, one unique <title>, one
// <h1>, a canonical link, landmarks, and that each JSON-LD block parses and
// has its required fields. Also checks robots.txt, the manifest, the
// /properties redirects and that missing pages are 404s (see the note below on unknown listing ids).

const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/+$/, "");
const problems = [];
const fail = (where, message) => problems.push(`${where}: ${message}`);

// Required fields per schema.org type (dot paths into the object).
const REQUIRED = {
  Organization: ["name", "url", "logo"],
  WebSite: ["name", "url", "potentialAction.target.urlTemplate", "potentialAction.query-input"],
  FAQPage: ["mainEntity.0.name", "mainEntity.0.acceptedAnswer.text"],
  BreadcrumbList: ["itemListElement.0.position", "itemListElement.0.name", "itemListElement.0.item"],
  RealEstateListing: [
    "name",
    "url",
    "image.0",
    "datePosted",
    "offers.price",
    "offers.priceCurrency",
    "offers.availability",
    "mainEntity.address.streetAddress",
    "mainEntity.address.addressLocality",
    "mainEntity.address.addressRegion",
    "mainEntity.address.addressCountry",
  ],
};

const get = (object, path) => path.split(".").reduce((value, key) => (value == null ? undefined : value[key]), object);
const text = (html, pattern) => [...html.matchAll(pattern)].map((match) => match[1]);

function checkJsonLd(url, html) {
  const blocks = text(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
  const types = [];
  for (const block of blocks) {
    let data;
    try {
      data = JSON.parse(block);
    } catch (error) {
      fail(url, `JSON-LD doesn't parse (${error.message})`);
      continue;
    }
    for (const item of Array.isArray(data) ? data : [data]) {
      if (item["@context"] !== "https://schema.org") fail(url, `${item["@type"]}: missing @context`);
      const required = REQUIRED[item["@type"]];
      if (!required) fail(url, `unexpected JSON-LD type ${item["@type"]}`);
      for (const field of required ?? []) {
        if (get(item, field) === undefined || get(item, field) === "") fail(url, `${item["@type"]} is missing ${field}`);
      }
      types.push(item["@type"]);
    }
  }
  return types;
}

const sitemap = await fetch(`${base}/sitemap.xml`);
if (!sitemap.ok) fail("/sitemap.xml", `HTTP ${sitemap.status}`);
const urls = text(await sitemap.text(), /<loc>([^<]+)<\/loc>/g);
if (urls.length === 0) fail("/sitemap.xml", "no URLs");

const titles = new Map();
const report = [];
for (const loc of urls) {
  const path = new URL(loc).pathname;
  const response = await fetch(`${base}${path}`);
  const html = await response.text();
  if (response.status !== 200) fail(path, `HTTP ${response.status}`);
  const title = text(html, /<title>([^<]*)<\/title>/g)[0];
  if (!title) fail(path, "no <title>");
  else if (titles.has(title)) fail(path, `duplicate title (also ${titles.get(title)})`);
  else titles.set(title, path);
  const h1s = (html.match(/<h1[\s>]/g) ?? []).length;
  if (h1s !== 1) fail(path, `${h1s} <h1> elements`);
  if (!/<link rel="canonical"/.test(html)) fail(path, "no canonical link");
  if (/<meta name="robots" content="noindex/.test(html)) fail(path, "is in the sitemap but noindex");
  for (const tag of ["<main", "<nav", "<footer"]) if (!html.includes(tag)) fail(path, `no ${tag}> landmark`);
  if (!/<meta property="og:image"/.test(html)) fail(path, "no og:image");
  report.push(`${path}  ${title}  [${checkJsonLd(path, html).join(", ") || "no JSON-LD"}]`);
}

const robots = await (await fetch(`${base}/robots.txt`)).text();
for (const rule of ["Disallow: /dashboard", "Disallow: /auth", "Disallow: /api", "Disallow: /payment", "Sitemap:"]) {
  if (!robots.includes(rule)) fail("/robots.txt", `missing "${rule}"`);
}
const manifest = await fetch(`${base}/manifest.webmanifest`);
if (!manifest.ok || !(await manifest.json()).icons?.length) fail("/manifest.webmanifest", "missing or has no icons");

for (const [from, to] of [["/properties?listingType=SALE", "/buy"], ["/properties?listingType=RENT", "/rent"]]) {
  const response = await fetch(`${base}${from}`, { redirect: "manual" });
  const location = response.headers.get("location") ?? "";
  if (response.status !== 308 || !new URL(location, base).pathname.endsWith(to)) {
    fail(from, `expected a 308 to ${to}, got ${response.status} ${location}`);
  }
}
for (const missing of ["/properties/not-a-real-id", "/rent/atlantis", "/buy/atlantis", "/no-such-page"]) {
  const response = await fetch(`${base}${missing}`);
  if (response.status !== 404) fail(missing, `expected 404, got ${response.status}`);
}
// A well-formed id with no listing: the first request can get the route's
// prerendered 200 shell (then the cached 404), so it must at least be noindex.
const unknownListing = `/properties/${crypto.randomUUID()}`;
for (const attempt of ["first", "repeat"]) {
  const response = await fetch(`${base}${unknownListing}`);
  const html = await response.text();
  if (attempt === "repeat" && response.status !== 404) fail(unknownListing, `expected 404 on repeat, got ${response.status}`);
  if (!/<meta name="robots" content="noindex/.test(html)) fail(unknownListing, `${attempt} request is not noindex`);
}
for (const privatePath of ["/auth/login", "/payment/cancel"]) {
  const html = await (await fetch(`${base}${privatePath}`)).text();
  if (!/<meta name="robots" content="noindex/.test(html)) fail(privatePath, "not noindex");
}

console.log(report.join("\n"));
console.log(`\n${urls.length} sitemap URLs checked.`);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log("No problems found.");
