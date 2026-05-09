/**
 * One-off helper: for each school in NEED, tries curated filename candidates
 * first, falls back to Commons search, verifies with GET+Range, returns the
 * first WANT working filenames per school. Outputs JSON to stdout.
 */
export {};
const UA =
  "ExplorisityPhotoVerifier/1.0 (https://explorisity.app; ops@explorisity.app)";
const FP = "https://commons.wikimedia.org/wiki/Special:FilePath";

const WANT = 3;

type Caption = { url: string; caption: string };

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function exists(filename: string, attempt = 0): Promise<boolean> {
  const url = `${FP}/${encodeURIComponent(filename).replace(/%2F/g, "/")}?width=1280`;
  try {
    const r = await fetch(url, {
      method: "GET",
      headers: { "User-Agent": UA, Range: "bytes=0-127", Accept: "image/*" },
      redirect: "follow",
    });
    if (r.status === 429 && attempt < 4) {
      await sleep(1500 * (attempt + 1));
      return exists(filename, attempt + 1);
    }
    return r.ok || r.status === 206;
  } catch {
    return false;
  }
}

async function search(query: string, attempt = 0): Promise<string[]> {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(
    query,
  )}&srnamespace=6&srlimit=40&origin=*`;
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA } });
    if (r.status === 429 && attempt < 4) {
      await sleep(1500 * (attempt + 1));
      return search(query, attempt + 1);
    }
    const j = (await r.json()) as { query?: { search?: { title?: unknown }[] } };
    return (j.query?.search ?? [])
      .map((s) => String(s.title ?? "").replace(/^File:/, "").replace(/ /g, "_"))
      .filter((t: string) => /\.(jpe?g|png)$/i.test(t));
  } catch {
    return [];
  }
}

const BAD =
  /seal|coat[_ ]?of[_ ]?arms|logo|portrait|of[_ ]paris|map|diagram|book|signature|graph|chart|jersey|flag|recruit|head[_ ]?shot|profile[_ ]?photo|yearbook|football|basketball|baseball|cheerleader|mascot|protest|sign[_ ]language|notre[_ ]?dame[_ ]de[_ ]paris|cathedral[_ ]of[_ ]paris|cake|food|menu|sketch|drawing|painting|woodcut|lithograph|coin|stamp|crest|bookplate|pdf$/i;
const GOOD =
  /(campus|hall|library|chapel|tower|quad|building|gate|courtyard|stadium|arch|dome|fountain|memorial|college|university|aerial|main|union|institute|lab|view|panorama|atrium|portal|cloister|garden|colonnade|residential|west|east|north|south|art|skyline|astronomy|observatory|admin|center|centre|lawn|green)/i;

type SchoolDef = {
  key: string; // identifier we use in output
  candidates: { file: string; caption: string }[]; // hand-picked first
  searches: string[]; // fallback Commons searches
  guessCaption: (file: string) => string;
};

const list: SchoolDef[] = [
  {
    key: "harvard",
    candidates: [
      { file: "HarvardYard.jpg", caption: "Harvard Yard" },
      { file: "Widener_Library,_Harvard_University.jpg", caption: "Widener Library" },
      { file: "Memorial_Hall_Harvard.jpg", caption: "Memorial Hall" },
      { file: "Harvard_University_Widener_Library.jpg", caption: "Widener Library" },
      { file: "University_Hall,_Harvard.jpg", caption: "University Hall" },
    ],
    searches: ["Harvard University campus", "Harvard Yard"],
    guessCaption: (f) => f.replace(/_/g, " ").replace(/\.[^.]+$/, ""),
  },
  {
    key: "yale",
    candidates: [
      { file: "Old_Yale_University_Campus.jpg", caption: "Old Campus" },
      { file: "Beinecke_Rare_Book_and_Manuscript_Library.jpg", caption: "Beinecke Library" },
      { file: "Sterling_Memorial_Library.jpg", caption: "Sterling Memorial Library" },
      { file: "Sterling_Memorial_Library_Yale.jpg", caption: "Sterling Memorial Library" },
      { file: "Harkness_Tower_at_Yale_University.jpg", caption: "Harkness Tower" },
      { file: "Harkness_Tower_Yale_University.jpg", caption: "Harkness Tower" },
    ],
    searches: ["Yale University campus", "Sterling Memorial Library Yale", "Harkness Tower Yale"],
    guessCaption: (f) => f.replace(/_/g, " ").replace(/\.[^.]+$/, ""),
  },
  {
    key: "princeton",
    candidates: [
      { file: "Nassau_Hall_Princeton.JPG", caption: "Nassau Hall" },
      { file: "Princeton_University_Chapel_interior_2024.jpg", caption: "University Chapel" },
      { file: "Blair_Hall_Princeton_University_c1907.jpg", caption: "Blair Hall" },
      { file: "Holder_Hall_Princeton.jpg", caption: "Holder Hall" },
      { file: "East_Pyne_Hall_Princeton.jpg", caption: "East Pyne Hall" },
    ],
    searches: ["Princeton University campus", "Nassau Hall Princeton"],
    guessCaption: (f) => f.replace(/_/g, " ").replace(/\.[^.]+$/, ""),
  },
  {
    key: "columbia",
    candidates: [
      { file: "Low_Memorial_Library_-_Columbia_University.jpg", caption: "Low Memorial Library" },
      { file: "Butler_Library_Columbia_University.jpg", caption: "Butler Library" },
      { file: "Alma_Mater_Columbia_University.jpg", caption: "Alma Mater statue" },
      { file: "Low_Library_Columbia_University.jpg", caption: "Low Library" },
    ],
    searches: ["Columbia University campus Manhattan", "Low Memorial Library"],
    guessCaption: (f) => f.replace(/_/g, " ").replace(/\.[^.]+$/, ""),
  },
  {
    key: "upenn",
    candidates: [
      { file: "Autumn_Evening_on_Locust_Walk_at_the_University_of_Pennsylvania.jpg", caption: "Locust Walk" },
      { file: "University_of_Pennsylvania_College_Hall.jpg", caption: "College Hall" },
      { file: "College_Hall_at_the_University_of_Pennsylvania.jpg", caption: "College Hall" },
      { file: "Van_Pelt_Library_Penn.jpg", caption: "Van Pelt Library" },
    ],
    searches: ["University of Pennsylvania campus", "College Hall Penn"],
    guessCaption: (f) => f.replace(/_/g, " ").replace(/\.[^.]+$/, ""),
  },
  {
    key: "brown",
    candidates: [
      { file: "Brown_University_-_Van_Wickle_Gates.jpg", caption: "Van Wickle Gates" },
      { file: "John_Hay_Library.jpg", caption: "John Hay Library" },
      { file: "Sayles_Hall_Brown_University.jpg", caption: "Sayles Hall" },
      { file: "Brown_University_The_Quiet_Green.jpg", caption: "The Quiet Green" },
      { file: "University_Hall_Brown.jpg", caption: "University Hall" },
    ],
    searches: ["Brown University Providence", "University Hall Brown"],
    guessCaption: (f) => f.replace(/_/g, " ").replace(/\.[^.]+$/, ""),
  },
  {
    key: "dartmouth",
    candidates: [
      { file: "Wentworth_Hall,_Dartmouth_Hall,_Thornton_Hall_at_Dartmouth_College.jpg", caption: "Dartmouth Row" },
      { file: "Baker_Memorial_Library_Dartmouth_College.jpg", caption: "Baker Memorial Library" },
      { file: "Baker-Berry_Library_Dartmouth_College.jpg", caption: "Baker-Berry Library" },
      { file: "Dartmouth_Row_2008.jpg", caption: "Dartmouth Row" },
      { file: "Dartmouth_Hall_Dartmouth_College.jpg", caption: "Dartmouth Hall" },
    ],
    searches: ["Dartmouth College Hanover", "Baker-Berry Library"],
    guessCaption: (f) => f.replace(/_/g, " ").replace(/\.[^.]+$/, ""),
  },
  {
    key: "cornell",
    candidates: [
      { file: "McGraw_Tower,_Cornell_University.jpg", caption: "McGraw Tower" },
      { file: "Cornell_University_-_Entrance_to_Uris_Library.jpg", caption: "Uris Library" },
      { file: "Cornell_University_McGraw_Tower.jpg", caption: "McGraw Tower" },
      { file: "Cornell_University_Arts_Quad.jpg", caption: "Arts Quad" },
      { file: "Cornell_University_Arts_Quadrangle.jpg", caption: "Arts Quadrangle" },
      { file: "Cornell_University,_Ithaca,_NY.jpg", caption: "Cornell campus" },
    ],
    searches: ["Cornell University Ithaca campus", "McGraw Tower Cornell", "Cornell Arts Quad"],
    guessCaption: (f) => f.replace(/_/g, " ").replace(/\.[^.]+$/, ""),
  },
  {
    key: "mit",
    candidates: [
      { file: "MIT_Building_10_and_the_Great_Dome,_Cambridge_MA.jpg", caption: "Building 10 & the Great Dome" },
      { file: "Killian_Court,_MIT.jpg", caption: "Killian Court" },
      { file: "Stata_Center_MIT.JPG", caption: "Stata Center" },
      { file: "MIT_Stata_Center,_Cambridge.jpg", caption: "Stata Center" },
      { file: "Massachusetts_Institute_of_Technology_-_Killian_Court.jpg", caption: "Killian Court" },
      { file: "MIT_Main_Campus_Aerial.jpg", caption: "Main Campus aerial" },
    ],
    searches: ["MIT campus Cambridge", "Killian Court MIT", "Great Dome MIT"],
    guessCaption: (f) => f.replace(/_/g, " ").replace(/\.[^.]+$/, ""),
  },
  {
    key: "stanford",
    candidates: [
      { file: "Stanford_Memorial_Church.jpg", caption: "Memorial Church" },
      { file: "Hoover_Tower,_Stanford.jpg", caption: "Hoover Tower" },
      { file: "Stanford_University_Main_Quad_May_2011_panorama.jpg", caption: "Main Quad" },
      { file: "Stanford_Main_Quad.jpg", caption: "Main Quad" },
      { file: "Stanford_University_Main_Quad.jpg", caption: "Main Quad" },
      { file: "Stanford_University_Memorial_Church.jpg", caption: "Memorial Church" },
    ],
    searches: ["Stanford University campus", "Hoover Tower Stanford", "Stanford Main Quad"],
    guessCaption: (f) => f.replace(/_/g, " ").replace(/\.[^.]+$/, ""),
  },
  {
    key: "caltech",
    candidates: [
      { file: "The_Millikan_Library.jpg", caption: "Millikan Library" },
      { file: "Caltech_Beckman_Auditorium.jpg", caption: "Beckman Auditorium" },
      { file: "Beckman_Auditorium_Caltech.jpg", caption: "Beckman Auditorium" },
      { file: "Caltech_Athenaeum.jpg", caption: "Athenaeum" },
      { file: "Caltech_Throop_Hall.jpg", caption: "Throop Hall" },
      { file: "California_Institute_of_Technology.jpg", caption: "Caltech campus" },
    ],
    searches: ["Caltech Pasadena campus", "Beckman Auditorium Caltech"],
    guessCaption: (f) => f.replace(/_/g, " ").replace(/\.[^.]+$/, ""),
  },
  {
    key: "uchicago",
    candidates: [
      { file: "Bond_Chapel_at_the_University_of_Chicago.jpg", caption: "Bond Chapel" },
      { file: "Mitchell_Tower_at_the_University_of_Chicago.jpg", caption: "Mitchell Tower" },
      { file: "Cobb_Hall_University_of_Chicago.jpg", caption: "Cobb Hall" },
      { file: "Hutchinson_Court_2007.jpg", caption: "Hutchinson Court" },
      { file: "University_of_Chicago_Main_Quad.jpg", caption: "Main Quad" },
    ],
    searches: ["University of Chicago Hyde Park", "Rockefeller Chapel Chicago"],
    guessCaption: (f) => f.replace(/_/g, " ").replace(/\.[^.]+$/, ""),
  },
  {
    key: "duke",
    candidates: [
      { file: "2008-07-24_Duke_Chapel.jpg", caption: "Duke Chapel" },
      { file: "Cameron_indoor.jpg", caption: "Cameron Indoor Stadium" },
      { file: "Duke_University_East_Campus_Panorama.jpg", caption: "East Campus" },
      { file: "Duke_West_Campus.jpg", caption: "West Campus" },
      { file: "Duke_University_Allen_Building.jpg", caption: "Allen Building" },
      { file: "Duke_Chapel_2.jpg", caption: "Duke Chapel" },
    ],
    searches: ["Duke University Durham campus", "Duke Chapel"],
    guessCaption: (f) => f.replace(/_/g, " ").replace(/\.[^.]+$/, ""),
  },
  {
    key: "jhu",
    candidates: [
      { file: "Gilman_Hall_-_Johns_Hopkins_University_-_DSC01872.JPG", caption: "Gilman Hall" },
      { file: "Johns_Hopkins_University_Homewood.jpg", caption: "Homewood Campus" },
      { file: "Johns_Hopkins_University_Gilman_Hall.jpg", caption: "Gilman Hall" },
      { file: "Shriver_Hall.jpg", caption: "Shriver Hall" },
      { file: "Johns_Hopkins_University_-_panoramio.jpg", caption: "Johns Hopkins campus" },
      { file: "Levering_Hall_Johns_Hopkins.jpg", caption: "Levering Hall" },
    ],
    searches: ["Johns Hopkins University Homewood", "Gilman Hall Johns Hopkins", "Johns Hopkins campus Baltimore"],
    guessCaption: (f) => f.replace(/_/g, " ").replace(/\.[^.]+$/, ""),
  },
  {
    key: "berkeley",
    candidates: [
      { file: "Memorial_Glade_and_Doe_Library_at_the_University_of_California,_Berkeley_-_The_Daily_Californian.jpg", caption: "Doe Library & Memorial Glade" },
      { file: "UC_Berkeley_Sather_Tower_(Campanile)_and_Bancroft_Library.jpg", caption: "Sather Tower" },
      { file: "Sather_Gate.jpg", caption: "Sather Gate" },
      { file: "UC_Berkeley_Sather_Gate.jpg", caption: "Sather Gate" },
      { file: "UC_Berkeley_Campanile.jpg", caption: "Campanile" },
      { file: "Doe_Library_UC_Berkeley.jpg", caption: "Doe Library" },
    ],
    searches: ["UC Berkeley Sather Tower", "UC Berkeley campus"],
    guessCaption: (f) => f.replace(/_/g, " ").replace(/\.[^.]+$/, ""),
  },
  {
    key: "ucla",
    candidates: [
      { file: "Royce_Hall,_University_of_California,_Los_Angeles_(23-09-2003).jpg", caption: "Royce Hall" },
      { file: "Powell_Library,_UCLA_(10_December_2005).jpg", caption: "Powell Library" },
      { file: "Janss_Steps,_UCLA.jpg", caption: "Janss Steps" },
      { file: "UCLA_Royce_Hall.jpg", caption: "Royce Hall" },
      { file: "Powell_Library_UCLA.JPG", caption: "Powell Library" },
    ],
    searches: ["UCLA campus", "Royce Hall UCLA"],
    guessCaption: (f) => f.replace(/_/g, " ").replace(/\.[^.]+$/, ""),
  },
  {
    key: "umich",
    candidates: [
      { file: "University_Of_Michigan_Law_Quad_(179637351).jpeg", caption: "Law Quadrangle" },
      { file: "Hill_Auditorium,_Ann_Arbor.jpg", caption: "Hill Auditorium" },
      { file: "Michigan_Diag_2007.jpg", caption: "The Diag" },
      { file: "University_of_Michigan_Diag.jpg", caption: "The Diag" },
      { file: "Burton_Memorial_Tower_Ann_Arbor.jpg", caption: "Burton Memorial Tower" },
      { file: "Michigan_Union.jpg", caption: "Michigan Union" },
    ],
    searches: ["University of Michigan Ann Arbor", "Michigan Law Quad"],
    guessCaption: (f) => f.replace(/_/g, " ").replace(/\.[^.]+$/, ""),
  },
  {
    key: "unc",
    candidates: [
      { file: "Old_Well_at_UNC_Chapel_Hill.jpg", caption: "The Old Well" },
      { file: "UNC_chapel_hill_wilson_library.jpg", caption: "Wilson Library" },
      { file: "Wilson_Library_at_the_University_of_North_Carolina_at_Chapel_Hill.jpg", caption: "Wilson Library" },
      { file: "Morehead-Patterson_Bell_Tower.jpg", caption: "Morehead-Patterson Bell Tower" },
      { file: "Bell_Tower_UNC.jpg", caption: "Bell Tower" },
      { file: "Davie_Poplar_UNC.jpg", caption: "Davie Poplar" },
    ],
    searches: ["UNC Chapel Hill Old Well", "UNC Chapel Hill campus"],
    guessCaption: (f) => f.replace(/_/g, " ").replace(/\.[^.]+$/, ""),
  },
  {
    key: "uva",
    candidates: [
      { file: "The_Rotunda_and_Lawn_University_of_Virginia_Charlottesville_VA_March_2011.jpg", caption: "The Rotunda & Lawn" },
      { file: "UVA_Lawn_with_Rotunda,_west_(1981).jpg", caption: "The Lawn" },
      { file: "University_of_Virginia_Rotunda.jpg", caption: "The Rotunda" },
      { file: "Old_Cabell_Hall_interior.jpg", caption: "Old Cabell Hall" },
      { file: "University_of_Virginia_Academical_Village.jpg", caption: "Academical Village" },
    ],
    searches: ["University of Virginia Rotunda", "UVA Lawn"],
    guessCaption: (f) => f.replace(/_/g, " ").replace(/\.[^.]+$/, ""),
  },
  {
    key: "ut-austin",
    candidates: [
      { file: "The_Tower,_University_of_Texas_at_Austin_(ca_1980).jpg", caption: "UT Tower" },
      { file: "UT_Austin_Main_Building,_Gated_Staircase,_2025.jpg", caption: "Main Building" },
      { file: "University_of_Texas_at_Austin_Main_Building.jpg", caption: "Main Building" },
      { file: "Texas_Capitol_Dome_from_UT_South_Mall_2020.jpg", caption: "South Mall view" },
      { file: "UT_Austin_Tower.jpg", caption: "UT Tower" },
    ],
    searches: ["University of Texas Austin Tower", "UT Austin Main Building"],
    guessCaption: (f) => f.replace(/_/g, " ").replace(/\.[^.]+$/, ""),
  },
  // Single-photo schools that broke
  {
    key: "vanderbilt",
    candidates: [
      { file: "Kirkland_Hall,_Vanderbilt_University.jpg", caption: "Kirkland Hall" },
      { file: "Kirkland_Hall_2007.jpg", caption: "Kirkland Hall" },
      { file: "Vanderbilt_University_Kirkland_Hall.jpg", caption: "Kirkland Hall" },
      { file: "Vanderbilt_University_campus.jpg", caption: "Vanderbilt campus" },
    ],
    searches: ["Vanderbilt University Nashville", "Kirkland Hall Vanderbilt"],
    guessCaption: () => "Vanderbilt campus",
  },
  {
    key: "rice",
    candidates: [
      { file: "Lovett_Hall_Rice.jpg", caption: "Lovett Hall" },
      { file: "Lovett_Hall_-_Rice_University.jpg", caption: "Lovett Hall" },
      { file: "Rice_University_Lovett_Hall.jpg", caption: "Lovett Hall" },
      { file: "Rice_University_Sallyport.jpg", caption: "Sallyport" },
    ],
    searches: ["Rice University Houston Lovett Hall"],
    guessCaption: () => "Rice campus",
  },
  {
    key: "notre-dame",
    candidates: [
      { file: "Main_Building_Notre_Dame.jpg", caption: "Main Building & Golden Dome" },
      { file: "University_of_Notre_Dame_-_Main_Building.jpg", caption: "Main Building" },
      { file: "Notre_Dame_Golden_Dome.jpg", caption: "Golden Dome" },
      { file: "Notre_Dame_Indiana_main_building.jpg", caption: "Main Building" },
    ],
    searches: ["University of Notre Dame Indiana main building", "Golden Dome Notre Dame"],
    guessCaption: () => "Notre Dame campus",
  },
  {
    key: "emory",
    candidates: [
      { file: "Candler_Library_Emory.jpg", caption: "Candler Library" },
      { file: "Emory_University_Candler_Library.jpg", caption: "Candler Library" },
      { file: "Emory_University_Quadrangle.jpg", caption: "Emory Quadrangle" },
      { file: "Emory_University_campus.jpg", caption: "Emory campus" },
    ],
    searches: ["Emory University Atlanta campus", "Candler Library Emory"],
    guessCaption: () => "Emory campus",
  },
  {
    key: "washu",
    candidates: [
      { file: "Brookings_Hall_Washington_University.jpg", caption: "Brookings Hall" },
      { file: "Washington_University_in_St._Louis_Brookings_Hall.jpg", caption: "Brookings Hall" },
      { file: "Brookings_Hall.JPG", caption: "Brookings Hall" },
      { file: "WashU_Brookings_Hall.jpg", caption: "Brookings Hall" },
    ],
    searches: ["Washington University St Louis Brookings Hall"],
    guessCaption: () => "WashU campus",
  },
  {
    key: "nyu",
    candidates: [
      { file: "NYU_Bobst_Library.jpg", caption: "Bobst Library" },
      { file: "Bobst_Library_NYU.jpg", caption: "Bobst Library" },
      { file: "Washington_Square_Park_NYU.jpg", caption: "Washington Square Park" },
      { file: "Washington_Square_Arch_NYU.jpg", caption: "Washington Square Arch" },
      { file: "NYU_Silver_Center.jpg", caption: "Silver Center" },
    ],
    searches: ["NYU Bobst Library", "Washington Square Arch NYU"],
    guessCaption: () => "NYU campus",
  },
  {
    key: "cmu",
    candidates: [
      { file: "Hamerschlag_Hall_CMU.jpg", caption: "Hamerschlag Hall" },
      { file: "Carnegie_Mellon_University_Hamerschlag_Hall.jpg", caption: "Hamerschlag Hall" },
      { file: "Hamerschlag_Hall_at_Carnegie_Mellon_University.jpg", caption: "Hamerschlag Hall" },
      { file: "Carnegie_Mellon_University_campus.jpg", caption: "CMU campus" },
    ],
    searches: ["Carnegie Mellon University Pittsburgh Hamerschlag"],
    guessCaption: () => "Carnegie Mellon campus",
  },
  {
    key: "northwestern",
    candidates: [
      { file: "Deering_Library_Northwestern.jpg", caption: "Deering Library" },
      { file: "Northwestern_University_Deering_Library.jpg", caption: "Deering Library" },
      { file: "University_Hall_Northwestern.jpg", caption: "University Hall" },
      { file: "Northwestern_University_Evanston_Campus.jpg", caption: "Evanston Campus" },
    ],
    searches: ["Northwestern University Evanston Deering Library", "Northwestern University campus"],
    guessCaption: () => "Northwestern campus",
  },
  {
    key: "uiuc",
    candidates: [
      { file: "Foellinger_Auditorium_at_the_University_of_Illinois_Urbana-Champaign.jpg", caption: "Foellinger Auditorium" },
      { file: "Altgeld_Hall_UIUC.jpg", caption: "Altgeld Hall" },
      { file: "Memorial_Stadium_Illinois.jpg", caption: "Memorial Stadium" },
      { file: "University_of_Illinois_Main_Quad.jpg", caption: "Main Quad" },
    ],
    searches: ["University of Illinois Urbana Champaign quad", "Altgeld Hall Illinois"],
    guessCaption: () => "Illinois campus",
  },
  {
    key: "mcgill",
    candidates: [
      { file: "McGill_Arts_Building.jpg", caption: "Arts Building" },
      { file: "McGill_University_Arts_Building.jpg", caption: "Arts Building" },
      { file: "McGill_University_campus.jpg", caption: "McGill campus" },
      { file: "Roddick_Gates_McGill.jpg", caption: "Roddick Gates" },
    ],
    searches: ["McGill University Montreal campus", "Roddick Gates McGill"],
    guessCaption: () => "McGill campus",
  },
  {
    key: "ubc",
    candidates: [
      { file: "UBC_Main_Mall.jpg", caption: "Main Mall" },
      { file: "University_of_British_Columbia_campus.jpg", caption: "UBC campus" },
      { file: "UBC_Vancouver_campus.jpg", caption: "UBC Vancouver" },
      { file: "Irving_K._Barber_Learning_Centre.jpg", caption: "Irving K. Barber Learning Centre" },
    ],
    searches: ["University of British Columbia Vancouver campus", "UBC Main Mall"],
    guessCaption: () => "UBC campus",
  },
];

async function findFor(def: SchoolDef): Promise<Caption[]> {
  const found: Caption[] = [];
  const seen = new Set<string>();

  // 1) curated candidates first
  for (const c of def.candidates) {
    if (found.length >= WANT) break;
    if (seen.has(c.file)) continue;
    seen.add(c.file);
    if (await exists(c.file)) {
      found.push({ url: `${FP}/${encodeURIComponent(c.file).replace(/%2F/g, "/")}?width=1280`, caption: c.caption });
    }
  }
  if (found.length >= WANT) return found;

  // 2) Commons search fallback
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
  // process schools serially to be very nice to Wikimedia
  for (const def of list) {
    const r = await findFor(def);
    out[def.key] = r;
    console.error(`${def.key.padEnd(14)} ${r.length}/${WANT}`);
    fs.writeFileSync("/tmp/found.json", JSON.stringify(out, null, 2));
  }
  console.log(JSON.stringify(out, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
