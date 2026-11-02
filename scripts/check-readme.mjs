// Checks README.md (and the docs it links to) against the code:
//   npm run check:readme
// Links and images, table-of-contents anchors, npm scripts, env variables,
// routes, quoted versions, Mermaid diagrams, text hygiene and credentials.
// Plain Node, no dependencies. Exits 1 and lists every problem it finds.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SELF = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(SELF), "..");
const DOCS = ["README.md", "API_INTEGRATION.md", "tests/e2e/README.md"];
// The one value the owner fills in by hand; allowed once, in README.md only.
const PLACEHOLDER = "YOUR-FRONTEND-URL";

const read = (file) => readFileSync(join(ROOT, file), "utf8");
const problems = {};
const fail = (check, message) => (problems[check] ??= []).push(message);
const checks = [];
const check = (name, run) => checks.push([name, run]);

/** The text outside fenced code blocks, line by line (code lines become ""). */
function proseLines(text) {
  let inFence = false;
  return text.split("\n").map((line) => {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      return "";
    }
    return inFence ? "" : line;
  });
}

/** Fenced code blocks with their language. */
function codeBlocks(text) {
  return [...text.matchAll(/^```(\w*)\n([\s\S]*?)^```/gm)].map(([, lang, body]) => ({ lang, body }));
}

/** GitHub's heading anchors: lowercase, punctuation dropped, spaces to hyphens, duplicates numbered. */
function headingAnchors(text) {
  const seen = new Map();
  const anchors = new Set([...text.matchAll(/\bid="([^"]+)"/g)].map(([, id]) => id));
  for (const line of proseLines(text)) {
    const match = /^#{1,6}\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;
    const base = match[1]
      .replace(/<[^>]+>/g, "")
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s_-]/gu, "")
      .replace(/\s/g, "-");
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    anchors.add(count ? `${base}-${count}` : base);
  }
  return anchors;
}

const docs = Object.fromEntries(DOCS.map((file) => [file, read(file)]));
const readme = docs["README.md"];
const pkg = JSON.parse(read("package.json"));

// 1. Relative links and images point at real files; in-page anchors exist.
check("links and images", () => {
  for (const [file, text] of Object.entries(docs)) {
    const prose = proseLines(text).join("\n");
    const targets = [
      ...[...prose.matchAll(/!?\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)].map(([, target]) => target),
      ...[...prose.matchAll(/\b(?:src|href)="([^"]+)"/g)].map(([, target]) => target),
    ];
    const anchors = headingAnchors(text);
    for (const target of targets) {
      if (/^(https?:|mailto:)/.test(target)) continue;
      const [path, hash] = target.split("#");
      if (!path) {
        if (!anchors.has(hash)) fail("links and images", `${file}: no heading for #${hash}`);
        continue;
      }
      const full = resolve(ROOT, dirname(file), decodeURI(path));
      if (!existsSync(full)) fail("links and images", `${file}: missing ${target}`);
    }
  }
});

// 2. Every table-of-contents entry matches a heading.
check("table of contents", () => {
  const anchors = headingAnchors(readme);
  const toc = readme.slice(readme.indexOf("## Contents"), readme.indexOf("---", readme.indexOf("## Contents")));
  const entries = [...toc.matchAll(/\]\(#([^)]+)\)/g)].map(([, anchor]) => anchor);
  if (entries.length === 0) fail("table of contents", "README.md: no Contents list found");
  for (const anchor of entries) if (!anchors.has(anchor)) fail("table of contents", `#${anchor} has no heading`);
});

// 3. Every `npm run <script>` (and `npm start`) exists in package.json.
check("npm scripts", () => {
  for (const [file, text] of Object.entries(docs)) {
    const names = [
      ...[...text.matchAll(/npm run ([\w:.-]+)/g)].map(([, name]) => name),
      ...(/\bnpm start\b/.test(text) ? ["start"] : []),
    ];
    for (const name of new Set(names)) {
      if (!pkg.scripts?.[name]) fail("npm scripts", `${file}: "npm run ${name}" isn't in package.json`);
    }
  }
});

// 4. App env variables named in the README match .env.example, both ways.
check("env variables", () => {
  const example = new Set([...read(".env.example").matchAll(/^([A-Z][A-Z0-9_]*)=/gm)].map(([, name]) => name));
  const section = readme.slice(readme.indexOf("### Environment variables"), readme.indexOf("### Scripts"));
  const inTable = [...section.matchAll(/^\| `([A-Z][A-Z0-9_]*)` \|/gm)].map(([, name]) => name);
  const named = [...readme.matchAll(/\b((?:NEXT_PUBLIC|IMGBB)_[A-Z0-9_]+)\b/g)].map(([, name]) => name);
  const documented = new Set([...inTable, ...named]);
  const notInExample = [...documented].filter((name) => !example.has(name));
  const notInReadme = [...example].filter((name) => !inTable.includes(name));
  if (notInExample.length) fail("env variables", `in README but not .env.example: ${notInExample.join(", ")}`);
  if (notInReadme.length) fail("env variables", `in .env.example but not the README table: ${notInReadme.join(", ")}`);
});

// 5. Every route in the README is a page (or route handler / metadata file) in src/app.
check("routes", () => {
  const routes = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (/^(page|route)\.tsx?$/.test(name)) routes.push(relative(join(ROOT, "src/app"), dir));
      else if (/^(sitemap|robots|manifest)\.ts$/.test(name)) routes.push(name.replace(/\.ts$/, ""));
    }
  };
  walk(join(ROOT, "src/app"));
  const patterns = routes.map((route) => {
    const parts = route.split("/").filter((part) => part && !/^\(.*\)$/.test(part));
    return parts.map((part) => (part.startsWith("[...") ? ".+" : part.startsWith("[") ? "[^/]+" : part)).join("/");
  });
  const metadata = { "sitemap.xml": "sitemap", "robots.txt": "robots", "manifest.webmanifest": "manifest" };
  for (const line of proseLines(readme)) {
    for (const [, path] of line.matchAll(/(?<!(?:GET|POST|PUT|PATCH|DELETE)\s)`(\/[\w[\]/.-]*)[^`]*`/g)) {
      const clean = path.replace(/\/$/, "").slice(1);
      const target = metadata[clean] ?? clean;
      if (!patterns.some((pattern) => new RegExp(`^${pattern}$`).test(target) || pattern === target)) {
        fail("routes", `README.md: no page for ${path}`);
      }
    }
  }
});

// 6. Quoted major versions match the installed packages.
check("versions", () => {
  const LIBS = {
    "Next.js": "next",
    Next: "next",
    React: "react",
    "Tailwind CSS": "tailwindcss",
    "TanStack Query": "@tanstack/react-query",
    TypeScript: "typescript",
    Playwright: "@playwright/test",
    Zod: "zod",
    Zustand: "zustand",
    GSAP: "gsap",
  };
  const installed = (name) => {
    try {
      return JSON.parse(read(`node_modules/${name}/package.json`)).version;
    } catch {
      return (pkg.dependencies?.[name] ?? pkg.devDependencies?.[name] ?? "").replace(/^[^\d]*/, "");
    }
  };
  for (const [file, text] of Object.entries(docs)) {
    const pattern = new RegExp(`(${Object.keys(LIBS).map((key) => key.replace(".", "\\.")).join("|")})[ _]v?(\\d+)\\b`, "g");
    for (const [, lib, major] of text.matchAll(pattern)) {
      const actual = installed(LIBS[lib]).split(".")[0];
      if (actual !== major) fail("versions", `${file}: says ${lib} ${major}, package.json has ${actual}`);
    }
  }
});

// 7. Mermaid blocks: a known diagram type first, balanced brackets and alt/end.
check("mermaid", () => {
  const TYPES = /^(flowchart|graph|sequenceDiagram|stateDiagram(-v2)?|classDiagram|erDiagram|gantt|pie|journey|mindmap|timeline)\b/;
  for (const [file, text] of Object.entries(docs)) {
    codeBlocks(text)
      .filter((block) => block.lang === "mermaid")
      .forEach(({ body }, index) => {
        const label = `${file}: diagram ${index + 1}`;
        if (!TYPES.test(body.trim().split("\n")[0])) fail("mermaid", `${label} doesn't start with a diagram type`);
        const stack = [];
        const pairs = { ")": "(", "]": "[", "}": "{" };
        for (const char of body.replace(/"[^"\n]*"/g, '""')) {
          if ("([{".includes(char)) stack.push(char);
          else if (pairs[char] && stack.pop() !== pairs[char]) {
            fail("mermaid", `${label} has an unmatched "${char}"`);
            break;
          }
        }
        if (stack.length) fail("mermaid", `${label} has an unclosed "${stack.at(-1)}"`);
        const opens = (body.match(/^\s*(alt|opt|loop|par|critical|rect)\b/gm) ?? []).length;
        const ends = (body.match(/^\s*end\s*$/gm) ?? []).length;
        if (opens !== ends) fail("mermaid", `${label} has ${opens} blocks but ${ends} "end"`);
      });
  }
});

// 8. Text hygiene: placeholders, spelling of the name, headings and tables.
check("text", () => {
  const placeholders = (readme.match(new RegExp(PLACEHOLDER, "g")) ?? []).length;
  if (placeholders > 1) fail("text", `README.md: ${PLACEHOLDER} appears ${placeholders} times; keep it in one place`);
  for (const [file, text] of Object.entries(docs)) {
    const lines = proseLines(text);
    lines.forEach((line, index) => {
      const at = `${file}:${index + 1}`;
      const leftover = /\b(TODO|TBD|FIXME|XXX)\b|lorem|placeholder|to measure|YOUR-(?!FRONTEND-URL)/i.exec(line);
      if (leftover) fail("text", `${at}: leftover "${leftover[0]}"`);
      if (file !== "README.md" && line.includes(PLACEHOLDER)) fail("text", `${at}: ${PLACEHOLDER} belongs in README.md only`);
      if (/\bRent\s+Nest\b|\bRentnest\b|\bRentNEST\b|\bRENTnest\b/.test(line)) fail("text", `${at}: spell it "RentNest"`);
      if (/^#{1,6} /.test(line) && / {2,}|\s$/.test(line.replace(/^#+ /, ""))) fail("text", `${at}: extra spaces in a heading`);
      if (line.startsWith("|") && line.includes("\t")) fail("text", `${at}: tab in a table`);
    });
    // Tables: every row has the header's column count.
    const cells = (line) =>
      line
        .replace(/`[^`]*`/g, "code")
        .replace(/\\\|/g, "")
        .replace(/^\||\|$/g, "")
        .split("|").length;
    let columns = null;
    lines.forEach((line, index) => {
      if (!line.trim().startsWith("|")) return void (columns = null);
      const count = cells(line.trim());
      if (columns === null) columns = count;
      else if (count !== columns) fail("text", `${file}:${index + 1}: table row has ${count} columns, expected ${columns}`);
    });
  }
});

/** A small .gitignore matcher (names and `*` globs, `!` exceptions), for files that never reach the repo. */
function gitignored() {
  const rules = read(".gitignore")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const negate = line.startsWith("!");
      const glob = line.replace(/^!/, "").replace(/^\/|\/$/g, "");
      const source = glob.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]*");
      return { negate, pattern: new RegExp(`(^|/)${source}(/|$)`) };
    });
  return (file) => rules.reduce((ignored, rule) => (rule.pattern.test(file) ? !rule.negate : ignored), false);
}

// 9. No admin or landlord credentials anywhere in the repo (the tenant demo may stay).
check("credentials", () => {
  const ignored = gitignored();
  const banned = new RegExp(["admin", "landlord\\d*"].map((user) => `${user}@rentnest\\.`).join("|") + "|Admin@" + "123", "i");
  const SKIP = new Set(["node_modules", ".next", ".git", "test-results", "playwright-report", ".vercel"]);
  const self = relative(ROOT, SELF);
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      if (SKIP.has(name)) continue;
      const full = join(dir, name);
      const stat = statSync(full);
      if (stat.isDirectory()) walk(full);
      else if (stat.size < 2_000_000 && /\.(md|mdx|ts|tsx|js|mjs|cjs|json|ya?ml|txt)$|^\.env/.test(name)) {
        const file = relative(ROOT, full);
        if (file === self || ignored(file)) continue;
        readFileSync(full, "utf8")
          .split("\n")
          .forEach((line, index) => banned.test(line) && fail("credentials", `${file}:${index + 1}`));
      }
    }
  };
  walk(ROOT);
});

for (const [name, run] of checks) run(name);

const failed = Object.keys(problems);
for (const [name] of checks) {
  console.log(`${failed.includes(name) ? "✗" : "✓"} ${name}`);
  for (const message of problems[name] ?? []) console.log(`    ${message}`);
}
if (readme.includes(PLACEHOLDER)) console.log(`\nTo fill in by hand: ${PLACEHOLDER} (the live site's URL) in README.md.`);
console.log(`\n${checks.length - failed.length}/${checks.length} checks passed.`);
process.exit(failed.length ? 1 : 0);
