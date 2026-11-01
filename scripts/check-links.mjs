// Broken-link crawl against a running build: `npm run check:links [baseUrl]`.
// Starts at the home page, follows every public internal link (dashboards,
// auth and API routes are skipped), and checks each page, every <img> on it
// (the srcset's largest candidate too) and each external link once.

const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/+$/, "");
const origin = new URL(base).origin;
const MAX_PAGES = 400;
const SKIP = /^\/(dashboard|auth|api|payment)(\/|$)/;

const problems = [];
const pages = new Map(); // url -> first page that linked to it
const queue = [[`${base}/`, "(start)"]];
const assets = new Map(); // image url -> page
const external = new Map(); // external url -> page

const decode = (value) => value.replaceAll("&amp;", "&");
const attrs = (html, tag, name) =>
  [...html.matchAll(new RegExp(`<${tag}\\b[^>]*?\\s${name}="([^"]*)"`, "g"))].map((match) => decode(match[1]));

while (queue.length > 0 && pages.size < MAX_PAGES) {
  const [url, from] = queue.shift();
  if (pages.has(url)) continue;
  pages.set(url, from);

  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) {
    problems.push(`${response.status} page ${url.replace(origin, "")} (linked from ${from.replace(origin, "")})`);
    continue;
  }
  const html = await response.text();
  const path = new URL(url).pathname;

  for (const href of attrs(html, "a", "href")) {
    if (/^(mailto|tel|javascript):|^#/.test(href)) continue;
    const target = new URL(href, url);
    target.hash = "";
    if (target.origin !== origin) external.set(target.toString(), path);
    else if (!SKIP.test(target.pathname)) queue.push([target.toString(), url]);
  }
  for (const src of attrs(html, "img", "src")) if (!src.startsWith("data:")) assets.set(new URL(src, url).toString(), path);
  for (const srcset of attrs(html, "img", "srcset")) {
    const largest = srcset.split(",").map((part) => part.trim().split(/\s+/)[0]).at(-1);
    if (largest) assets.set(new URL(largest, url).toString(), path);
  }
}

async function check(url, kind, page) {
  try {
    let response = await fetch(url, { method: "HEAD", redirect: "follow" });
    // Some hosts don't answer HEAD; ask again with GET.
    if (response.status === 405 || response.status === 403) response = await fetch(url, { redirect: "follow" });
    if (!response.ok) problems.push(`${response.status} ${kind} ${url} (on ${page})`);
  } catch (error) {
    problems.push(`ERR ${kind} ${url} (on ${page}): ${error.cause?.code ?? error.message}`);
  }
}

const jobs = [...[...assets].map(([url, page]) => [url, "image", page]), ...[...external].map(([url, page]) => [url, "link", page])];
for (let index = 0; index < jobs.length; index += 8) {
  await Promise.all(jobs.slice(index, index + 8).map(([url, kind, page]) => check(url, kind, page)));
}

console.log(`${pages.size} pages, ${assets.size} images, ${external.size} external links checked.`);
if (pages.size >= MAX_PAGES) console.log(`(stopped at ${MAX_PAGES} pages)`);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n- ${problems.join("\n- ")}`);
  process.exitCode = 1;
} else {
  console.log("No broken links or images.");
}
