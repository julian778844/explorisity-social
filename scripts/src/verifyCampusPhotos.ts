/**
 * Verifies that every Wikimedia Commons campus photo URL referenced from
 * artifacts/unimatch/src/lib/schoolPhotos.ts (HERO_PHOTOS + CAMPUS_FALLBACK_POOL)
 * actually returns 200. Reports any broken URLs grouped by school id.
 *
 * Run: pnpm --filter @workspace/scripts run verify-campus-photos
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCE = resolve(__dirname, "../../artifacts/unimatch/src/lib/schoolPhotos.ts");

type Entry = { owner: string; url: string };

function parseEntries(src: string): Entry[] {
  const out: Entry[] = [];
  const heroStart = src.indexOf("export const HERO_PHOTOS");
  const heroEnd = src.indexOf("\n};", heroStart) + 2;
  const heroBlock = src.slice(heroStart, heroEnd);

  // Split each top-level "key: [ ... ]," — we walk line-by-line and track current key.
  const lines = heroBlock.split("\n");
  let currentKey = "(unknown)";
  // Matches: `  uchicago: [` or `  "unc-chapel-hill": [`
  const keyRe = /^\s*"?([a-zA-Z][\w-]*)"?:\s*\[/;
  // Matches a URL like `${W}/Foo.jpg?width=1280` (works in object form OR plain string)
  const urlRe = /\$\{W\}\/([^`"\s]+)/g;
  for (const line of lines) {
    const m = line.match(keyRe);
    if (m) currentKey = m[1]!;
    let um: RegExpExecArray | null;
    urlRe.lastIndex = 0;
    while ((um = urlRe.exec(line)) !== null) {
      out.push({ owner: `HERO_PHOTOS[${currentKey}]`, url: `https://commons.wikimedia.org/wiki/Special:FilePath/${um[1]}` });
    }
  }

  // CAMPUS_FALLBACK_POOL
  const poolStart = src.indexOf("const CAMPUS_FALLBACK_POOL");
  const poolEnd = src.indexOf("];", poolStart) + 2;
  const poolBlock = src.slice(poolStart, poolEnd);
  const poolUrlRe = /\$\{W\}\/([^`"\s]+)/g;
  let pm: RegExpExecArray | null;
  while ((pm = poolUrlRe.exec(poolBlock)) !== null) {
    out.push({ owner: "CAMPUS_FALLBACK_POOL", url: `https://commons.wikimedia.org/wiki/Special:FilePath/${pm[1]}` });
  }
  return out;
}

// Wikimedia's UA policy requires a descriptive UA with contact info.
const UA = "ExplorisityPhotoVerifier/1.0 (https://explorisity.app; ops@explorisity.app)";

async function check(url: string, attempt = 0): Promise<{ ok: boolean; status: number }> {
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "User-Agent": UA, Range: "bytes=0-127", Accept: "image/*" },
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });
    if (res.status === 429 && attempt < 6) {
      // Exponential backoff with jitter to be a polite citizen on Wikimedia.
      const base = 2500 * Math.pow(1.7, attempt);
      const jitter = Math.random() * 1500;
      await new Promise((r) => setTimeout(r, base + jitter));
      return check(url, attempt + 1);
    }
    return { ok: res.ok || res.status === 206, status: res.status };
  } catch {
    if (attempt < 2) {
      await new Promise((r) => setTimeout(r, 2000));
      return check(url, attempt + 1);
    }
    return { ok: false, status: 0 };
  }
}

async function main() {
  const src = readFileSync(SOURCE, "utf8");
  const entries = parseEntries(src);
  // De-dupe across owners while keeping the owner list per URL
  const byUrl = new Map<string, string[]>();
  for (const e of entries) {
    const arr = byUrl.get(e.url) ?? [];
    arr.push(e.owner);
    byUrl.set(e.url, arr);
  }
  const urls = [...byUrl.keys()];
  console.log(`Checking ${urls.length} unique URLs (from ${entries.length} references)…\n`);

  const broken: { url: string; status: number; owners: string[] }[] = [];
  // Concurrency 2 + per-worker spacing + exponential backoff keeps Wikimedia
  // happy and avoids false 429-as-404 results.
  const CONC = 2;
  const PER_WORKER_SPACING_MS = 250;
  let i = 0;
  async function worker() {
    while (i < urls.length) {
      const idx = i++;
      const u = urls[idx]!;
      const r = await check(u);
      if (!r.ok) broken.push({ url: u, status: r.status, owners: byUrl.get(u)! });
      process.stdout.write(r.ok ? "." : "x");
      await new Promise((r) => setTimeout(r, PER_WORKER_SPACING_MS));
    }
  }
  // Optional URL slice for split runs: VERIFY_SLICE="start:end" (zero-indexed).
  const slice = process.env.VERIFY_SLICE;
  if (slice) {
    const [s, e] = slice.split(":").map(Number);
    const sliced = urls.slice(s ?? 0, e ?? urls.length);
    urls.length = 0;
    urls.push(...sliced);
    console.log(`(slice ${slice}: ${urls.length} URLs)`);
  }
  await Promise.all(Array.from({ length: CONC }, () => worker()));
  process.stdout.write("\n\n");

  if (broken.length === 0) {
    console.log("All campus photo URLs return 200. ✓");
    return;
  }
  console.log(`${broken.length} broken URL(s):\n`);
  for (const b of broken) {
    console.log(`  [${b.status || "ERR"}] ${b.url}`);
    for (const o of b.owners) console.log(`     used by: ${o}`);
  }
  process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
