/** Same as findCampusPhotos but only the last 6 schools. */
export {};
const UA = "ExplorisityPhotoVerifier/1.0 (https://explorisity.app; ops@explorisity.app)";
const FP = "https://commons.wikimedia.org/wiki/Special:FilePath";
const WANT = 3;
type Caption = { url: string; caption: string };

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }
async function exists(filename: string, attempt = 0): Promise<boolean> {
  const url = `${FP}/${encodeURIComponent(filename).replace(/%2F/g, "/")}?width=1280`;
  try {
    const r = await fetch(url, { method: "GET", headers: { "User-Agent": UA, Range: "bytes=0-127", Accept: "image/*" }, redirect: "follow" });
    if (r.status === 429 && attempt < 4) { await sleep(1500 * (attempt + 1)); return exists(filename, attempt + 1); }
    return r.ok || r.status === 206;
  } catch { return false; }
}
async function search(query: string, attempt = 0): Promise<string[]> {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=40&origin=*`;
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA } });
    if (r.status === 429 && attempt < 4) { await sleep(1500 * (attempt + 1)); return search(query, attempt + 1); }
    const j = (await r.json()) as { query?: { search?: { title?: unknown }[] } };
    return (j.query?.search ?? []).map((s) => String(s.title ?? "").replace(/^File:/, "").replace(/ /g, "_")).filter((t) => /\.(jpe?g|png)$/i.test(t));
  } catch { return []; }
}
const BAD = /seal|coat[_ ]?of[_ ]?arms|logo|portrait|map|diagram|book|signature|graph|chart|jersey|flag|recruit|head[_ ]?shot|profile[_ ]?photo|yearbook|football|basketball|baseball|cheerleader|mascot|protest|cake|food|menu|sketch|drawing|painting|woodcut|lithograph|coin|stamp|crest|bookplate|pdf$/i;
const GOOD = /(campus|hall|library|chapel|tower|quad|building|gate|courtyard|stadium|arch|dome|fountain|memorial|college|university|aerial|main|union|institute|lab|view|panorama|atrium|portal|cloister|garden|colonnade|residential|art|skyline|astronomy|observatory|admin|center|centre|lawn|green|park|street|square)/i;

type SchoolDef = { key: string; candidates: { file: string; caption: string }[]; searches: string[]; guessCaption: (f: string) => string };

const list: SchoolDef[] = [
  { key: "nyu", candidates: [
      { file: "NYU_Bobst_Library.jpg", caption: "Bobst Library" },
      { file: "Bobst_Library_NYU.jpg", caption: "Bobst Library" },
      { file: "Washington_Square_Park_NYU.jpg", caption: "Washington Square Park" },
      { file: "Washington_Square_Arch_NYU.jpg", caption: "Washington Square Arch" },
      { file: "NYU_Silver_Center.jpg", caption: "Silver Center" },
    ], searches: ["NYU Bobst Library", "Washington Square Arch NYU", "New York University campus"], guessCaption: () => "NYU campus" },
  { key: "cmu", candidates: [
      { file: "Hamerschlag_Hall_CMU.jpg", caption: "Hamerschlag Hall" },
      { file: "Carnegie_Mellon_University_Hamerschlag_Hall.jpg", caption: "Hamerschlag Hall" },
      { file: "Hamerschlag_Hall_at_Carnegie_Mellon_University.jpg", caption: "Hamerschlag Hall" },
      { file: "Carnegie_Mellon_University_campus.jpg", caption: "CMU campus" },
    ], searches: ["Carnegie Mellon University Pittsburgh Hamerschlag", "Carnegie Mellon University campus"], guessCaption: () => "Carnegie Mellon campus" },
  { key: "northwestern", candidates: [
      { file: "Deering_Library_Northwestern.jpg", caption: "Deering Library" },
      { file: "Northwestern_University_Deering_Library.jpg", caption: "Deering Library" },
      { file: "University_Hall_Northwestern.jpg", caption: "University Hall" },
      { file: "Northwestern_University_Evanston_Campus.jpg", caption: "Evanston Campus" },
    ], searches: ["Northwestern University Evanston Deering Library", "Northwestern University campus"], guessCaption: () => "Northwestern campus" },
  { key: "uiuc", candidates: [
      { file: "Foellinger_Auditorium_at_the_University_of_Illinois_Urbana-Champaign.jpg", caption: "Foellinger Auditorium" },
      { file: "Altgeld_Hall_UIUC.jpg", caption: "Altgeld Hall" },
      { file: "Memorial_Stadium_Illinois.jpg", caption: "Memorial Stadium" },
      { file: "University_of_Illinois_Main_Quad.jpg", caption: "Main Quad" },
    ], searches: ["University of Illinois Urbana Champaign quad", "Altgeld Hall Illinois"], guessCaption: () => "Illinois campus" },
  { key: "mcgill", candidates: [
      { file: "McGill_Arts_Building.jpg", caption: "Arts Building" },
      { file: "McGill_University_Arts_Building.jpg", caption: "Arts Building" },
      { file: "McGill_University_campus.jpg", caption: "McGill campus" },
      { file: "Roddick_Gates_McGill.jpg", caption: "Roddick Gates" },
    ], searches: ["McGill University Montreal campus", "Roddick Gates McGill"], guessCaption: () => "McGill campus" },
  { key: "ubc", candidates: [
      { file: "UBC_Main_Mall.jpg", caption: "Main Mall" },
      { file: "University_of_British_Columbia_campus.jpg", caption: "UBC campus" },
      { file: "UBC_Vancouver_campus.jpg", caption: "UBC Vancouver" },
      { file: "Irving_K._Barber_Learning_Centre.jpg", caption: "Irving K. Barber Learning Centre" },
    ], searches: ["University of British Columbia Vancouver campus", "UBC Main Mall"], guessCaption: () => "UBC campus" },
];

async function findFor(def: SchoolDef): Promise<Caption[]> {
  const found: Caption[] = [];
  const seen = new Set<string>();
  for (const c of def.candidates) {
    if (found.length >= WANT) break;
    if (seen.has(c.file)) continue;
    seen.add(c.file);
    if (await exists(c.file)) {
      found.push({ url: `${FP}/${encodeURIComponent(c.file).replace(/%2F/g, "/")}?width=1280`, caption: c.caption });
    }
  }
  if (found.length >= WANT) return found;
  for (const q of def.searches) {
    if (found.length >= WANT) break;
    const titles = await search(q);
    for (const t of titles) {
      if (found.length >= WANT) break;
      if (seen.has(t)) continue;
      seen.add(t);
      if (BAD.test(t)) continue;
      if (!GOOD.test(t)) continue;
      if (await exists(t)) {
        const cap = def.guessCaption(t);
        found.push({ url: `${FP}/${encodeURIComponent(t).replace(/%2F/g, "/")}?width=1280`, caption: cap });
      }
    }
  }
  return found;
}

async function main() {
  const fs = await import("node:fs");
  const out: Record<string, Caption[]> = {};
  for (const def of list) {
    const r = await findFor(def);
    out[def.key] = r;
    console.error(`${def.key.padEnd(14)} ${r.length}/${WANT}`);
    fs.writeFileSync("/tmp/found_rest.json", JSON.stringify(out, null, 2));
  }
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
