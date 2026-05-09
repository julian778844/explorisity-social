import { extraRaw } from './universitiesMore';

export interface University {
  id: string;
  name: string;
  shortName: string;
  location: string;
  country: string;
  type: "Public" | "Private" | "International";
  description: string;
  acceptanceRate: number;
  tuition: number;
  enrollment: number;
  ranking: number;
  topMajors: string[];
  campusCulture: string[];
  careerOutcomes: { medianSalary: number; employmentRate: number; topCompanies: string[] };
  strengths: string[];
  weaknesses: string[];
  famousAlumni: string[];
  lifestyle: { weather: string; city: string; housingCost: string; campusSize: string };
  research: { prestige: number; annualSpend: number };
  internships: { score: number; topIndustries: string[] };
  scores: { academics: number; social: number; career: number; research: number; diversity: number; athletics: number; value: number };
  aiSummary: string;
  color: string;
  preferencePercent: number;
  studentSatisfaction: number;
  annualROI: number;
  prestigeScore: number;
  valueScore: number;
  // ── Extended depth ──────────────────────────────────────────
  admissions: {
    satRange: [number, number];
    actRange: [number, number];
    avgGPA: number;
    testOptional: boolean;
    earlyAction: boolean;
    earlyDecision: boolean;
    applicationFee: number;
    applicationDeadline: string;
    yieldRate: number;
  };
  financial: {
    netPriceAvg: number;
    aidPercent: number;
    meetsFullNeed: boolean;
    avgGrantAid: number;
    pellGrantPct: number;
    avgDebtAtGrad: number;
    workStudyAvailable: boolean;
  };
  academicLife: {
    studentFacultyRatio: string;
    avgClassSize: number;
    fourYearGradRate: number;
    sixYearGradRate: number;
    retentionRate: number;
    classesUnder20Pct: number;
    studyAbroadPct: number;
  };
  demographics: {
    internationalPct: number;
    outOfStatePct: number;
    firstGenPct: number;
    femalePct: number;
    ethnicDiversityPct: number;
  };
  campus: {
    founded: number;
    acres: number;
    setting: string;
    religiousAffiliation: string | null;
    motto: string;
    nickname: string;
  };
  studentLife: {
    greekLifePct: number;
    varsityTeams: number;
    clubsCount: number;
    housingGuaranteed: boolean;
    freshmenOnCampusPct: number;
    safetyScore: number;
  };
  athletics: {
    division: string;
    conference: string;
    mascot: string;
    nationalTitles: number;
    rivalNote: string;
  };
  outcomes: {
    gradSchoolPct: number;
    salaryAt10Year: number;
    topGradSchools: string[];
    topJobLocations: string[];
    notableEmployersByMajor: string;
  };
  programs: { name: string; level: string; highlight: string }[];
}

interface Raw {
  id: string;
  name: string;
  short?: string;
  loc: string;
  cty?: string;
  pub?: boolean;
  rank: number;
  accept: number;
  tuition: number;
  enroll: number;
  tier: 1 | 2 | 3 | 4 | 5;
  majors: string[];
  color?: string;
  alumni?: string[];
  summary?: string;
  strengths?: string[];
  weaknesses?: string[];
  culture?: string[];
  industries?: string[];
  founded?: number;
  mascot?: string;
  motto?: string;
  conference?: string;
  religious?: string;
}

function h(s: string): number {
  let v = 0;
  for (let i = 0; i < s.length; i++) { v = Math.imul(31, v) + s.charCodeAt(i) | 0; }
  return Math.abs(v);
}

const PAL = [
  "#8B0000","#003087","#C41230","#862633","#4E2A84","#002244","#006747","#500000",
  "#7B0046","#003366","#BF5700","#003153","#2C5234","#0C2340","#841617","#1A3A5C",
  "#5B2333","#00205B","#154734","#800000","#003087","#1D6040","#541C40","#004C97",
  "#C8102E","#002855","#BA0C2F","#007A33","#003DA5","#4B0082"
];

function gc(id: string): string { return PAL[h(id) % PAL.length]; }

function industries(majors: string[]): string[] {
  const m = majors.join(" ").toLowerCase();
  if (m.includes("business") || m.includes("finance") || m.includes("accounting")) return ["Finance","Consulting","Business"];
  if (m.includes("computer") || m.includes("engineering") || m.includes("cs") || m.includes("tech")) return ["Technology","Engineering","Consulting"];
  if (m.includes("medicine") || m.includes("nursing") || m.includes("health") || m.includes("biomedical")) return ["Healthcare","Research","Pharma"];
  if (m.includes("law") || m.includes("policy") || m.includes("government") || m.includes("political")) return ["Law","Government","Policy"];
  if (m.includes("art") || m.includes("film") || m.includes("music") || m.includes("drama") || m.includes("design")) return ["Arts","Media","Entertainment"];
  if (m.includes("education") || m.includes("teaching")) return ["Education","Government","Non-profit"];
  return ["Business","Government","Education"];
}

function weather(loc: string): string {
  if (/,\s*(MA|CT|ME|VT|NH|RI|NY|NJ|PA|MD|DC)/.test(loc)) return "Cold Winters, Warm Summers";
  if (/,\s*CA/.test(loc)) return "Mild, Sunny";
  if (/,\s*(TX|FL|GA|SC|AL|MS|LA|AR|NC|TN)/.test(loc)) return "Hot Summers, Mild Winters";
  if (/,\s*(OR|WA)/.test(loc)) return "Rainy, Mild";
  if (/,\s*(CO|UT|MT|WY|ID|NM|AZ|NV)/.test(loc)) return "Dry, Warm Summers";
  if (/,\s*(IL|MI|OH|IN|MN|WI|IA|ND|SD|NE|KS|MO)/.test(loc)) return "Harsh Winters, Warm Summers";
  if (/(UK|England|Scotland|Wales|London|Oxford|Cambridge|Manchester|Edinburgh|Bristol|Durham)/.test(loc)) return "Rainy, Mild";
  if (/(Switzerland|Germany|Austria|Netherlands|Belgium|Denmark|Sweden|Norway|Finland)/.test(loc)) return "Cold Winters, Warm Summers";
  if (/(Australia|New South Wales|Victoria|Queensland)/.test(loc)) return "Warm, Sunny";
  if (/(Canada|Ontario|Quebec|British Columbia|Alberta)/.test(loc)) return "Cold Winters";
  if (/(Japan|Korea|China|Singapore|Hong Kong|Taiwan)/.test(loc)) return "Humid, Four Seasons";
  if (/(India|Pakistan|Bangladesh)/.test(loc)) return "Hot, Tropical";
  if (/(France|Spain|Italy|Portugal|Greece)/.test(loc)) return "Mediterranean";
  return "Temperate";
}

function build(d: Raw): University {
  const n = h(d.id);
  const t = d.tier;
  const country = d.cty || "USA";
  const isUSA = country === "USA";
  const type: University["type"] = !isUSA ? "International" : (d.pub ? "Public" : "Private");

  const bases: Record<number, number> = { 1: 93, 2: 83, 3: 72, 4: 61, 5: 50 };
  const base = bases[t];

  function sc(shift = 0, range = 14): number {
    return Math.min(100, Math.max(35, base + shift + ((n >> (shift + 1)) % range) - range / 2));
  }

  const salaryBases: Record<number, number> = { 1: 115000, 2: 87000, 3: 66000, 4: 54000, 5: 44000 };
  const salary = Math.max(35000, salaryBases[t] + ((n % 18000) - 9000) + (d.pub ? 2000 : 0));

  const empBase: Record<number, number> = { 1: 94, 2: 89, 3: 83, 4: 77, 5: 70 };
  const employmentRate = Math.min(98, Math.max(65, empBase[t] + (n % 7) - 3));

  const topCos: Record<number, string[]> = {
    1: ["McKinsey","Goldman Sachs","Google","Microsoft","Apple"],
    2: ["Deloitte","JPMorgan","Amazon","Accenture","Meta"],
    3: ["Big 4 Firms","Amazon","Regional Banks","Healthcare Systems","Government"],
    4: ["Local Employers","Government","Regional Businesses","Healthcare"],
    5: ["Community Employers","Government","Healthcare","Education"]
  };

  const cultureMap: Record<number, string[]> = {
    1: ["Research-Intensive","Competitive","Prestigious","Global"],
    2: ["Academic","Collaborative","Ambitious","Engaged"],
    3: ["Community-Focused","Diverse","Practical","Spirited"],
    4: ["Welcoming","Career-Focused","Accessible","Supportive"],
    5: ["Open Access","Diverse","Practical","Flexible"]
  };

  const strengthMap: Record<number, string[]> = {
    1: ["Academic Excellence","Research Opportunities","Elite Network"],
    2: ["Strong Programs","Career Services","Alumni Network"],
    3: ["Affordable Education","Practical Skills","Regional Reputation"],
    4: ["Accessibility","Local Connections","Flexible Programs"],
    5: ["Open Enrollment","Low Cost","Community Focus"]
  };

  const weaknessMap: Record<number, string[]> = {
    1: ["Intense Competition","High Costs","Pressure Culture"],
    2: ["Selective Admissions","Grade Pressure","Cost"],
    3: ["Limited National Brand","Resource Constraints"],
    4: ["Limited Research","Weaker National Recognition"],
    5: ["Limited Resources","Less Career Support"]
  };

  const w = weather(d.loc);
  const enroll = d.enroll;
  const housingCost = /CA|NY|MA|London|Zürich|Singapore/.test(d.loc) ? "Very High" : t <= 2 ? "High" : "Moderate";
  const campusSize = enroll > 40000 ? "Very Large" : enroll > 20000 ? "Large" : enroll > 8000 ? "Medium" : "Small";
  const cityType = enroll > 35000 ? "Urban" : enroll > 15000 ? "Mid-Size City" : enroll > 5000 ? "College Town" : "Small Town";

  const researchPrestige = Math.min(100, Math.max(20, base + (t === 1 ? 4 : 0) + ((n >> 2) % 16) - 8));
  const annualSpend = parseFloat(((t === 1 ? 0.85 : t === 2 ? 0.35 : t === 3 ? 0.12 : 0.04) * (1 + (n % 60) / 100)).toFixed(2));

  // ── Real-signal scoring ─────────────────────────────────────
  // PRESTIGE: US News rank anchor (35%) + selectivity (20%) + salary (15%) + research (15%) +
  //          tier (10%) + employment (5%). The rank anchor pins top-25 schools (Princeton, MIT,
  //          Harvard, Stanford, Yale...) at the top so the list reads like US News rather than
  //          letting raw selectivity (e.g. service academies) overshadow them.
  const tierPrestige: Record<number, number> = { 1: 100, 2: 82, 3: 64, 4: 46, 5: 30 };
  const rankPts = Math.max(0, Math.min(100, 100 - (d.rank - 1) * 1.05)); // rank 1→100, 25→75, 50→49, 95+→0
  const selectivityPts = Math.max(0, 100 - d.accept);              // 0 (open) → 100 (3% accept)
  const salaryPts = Math.max(0, Math.min(100, ((salary - 35000) / 95000) * 100)); // 35k→130k mapped 0→100
  const employmentPts = Math.max(0, Math.min(100, ((employmentRate - 65) / 33) * 100));
  const prestigeScore = Math.round(
    rankPts * 0.35 +
    selectivityPts * 0.20 +
    salaryPts * 0.15 +
    researchPrestige * 0.15 +
    tierPrestige[t] * 0.10 +
    employmentPts * 0.05
  );

  // VALUE: salary-per-dollar-of-tuition (50%) + employment (20%) + affordability (20%) + tier floor (10%)
  // Public-school in-state discount (~15%) applied ONCE, to the salary-to-cost ratio only,
  // so it isn't double-counted via the affordability term (which uses sticker tuition).
  const effectiveTuition = d.pub ? d.tuition * 0.85 : d.tuition;
  const salaryToCost = effectiveTuition > 0 ? salary / effectiveTuition : 0; // ~0.6 (worst) → ~6.0 (best)
  const salaryToCostPts = Math.max(0, Math.min(100, ((salaryToCost - 0.5) / 4.5) * 100));
  const affordabilityPts = Math.max(0, Math.min(100, 100 - (d.tuition / 65000) * 100));
  // Light tier floor so genuinely cheap-but-mid schools can still rank as top-value.
  const tierValueFloor: Record<number, number> = { 1: 70, 2: 65, 3: 60, 4: 55, 5: 50 };
  const valueScore = Math.round(
    salaryToCostPts * 0.50 +
    employmentPts * 0.20 +
    affordabilityPts * 0.20 +
    tierValueFloor[t] * 0.10
  );

  // ── Extended depth synthesis ────────────────────────────────
  // All values derived deterministically from tier, hash, and existing fields.
  const jitter = (seed: number, range: number, offset = 0): number =>
    ((n >> seed) % range) - Math.floor(range / 2) + offset;

  const satMid: Record<number, number> = { 1: 1525, 2: 1400, 3: 1230, 4: 1110, 5: 1010 };
  const satCenter = satMid[t] + jitter(1, 60);
  const satLow = Math.max(800, satCenter - 50 - (n % 30));
  const satHigh = Math.min(1600, satCenter + 50 + ((n >> 1) % 30));

  const actMid: Record<number, number> = { 1: 34, 2: 31, 3: 27, 4: 24, 5: 21 };
  const actCenter = actMid[t] + (jitter(2, 4));
  const actLow = Math.max(15, actCenter - 2);
  const actHigh = Math.min(36, actCenter + 2);

  const gpaMid: Record<number, number> = { 1: 395, 2: 380, 3: 350, 4: 320, 5: 295 };
  const avgGPA = parseFloat(((gpaMid[t] + jitter(3, 12)) / 100).toFixed(2));

  const yieldMid: Record<number, number> = { 1: 65, 2: 42, 3: 28, 4: 22, 5: 18 };
  const yieldRate = Math.max(8, Math.min(85, yieldMid[t] + jitter(4, 14)));

  const admissions = {
    satRange: [satLow, satHigh] as [number, number],
    actRange: [actLow, actHigh] as [number, number],
    avgGPA,
    testOptional: (n % 10) < 7,
    earlyAction: t <= 3 || (n % 4) === 0,
    earlyDecision: t <= 2 && (n % 3) !== 0,
    applicationFee: 40 + (n % 6) * 10,
    applicationDeadline: t <= 2 ? "January 1" : t === 3 ? "February 1" : "Rolling",
    yieldRate,
  };

  // FINANCIAL
  const grantMid: Record<number, number> = { 1: 60, 2: 50, 3: 40, 4: 35, 5: 30 };
  const aidPercent = Math.min(98, Math.max(40, grantMid[t] + 20 + jitter(5, 12)));
  const meetsFullNeed = t === 1 && (n % 5) < 4;
  const avgGrantAid = Math.round((d.tuition * (t === 1 ? 0.55 : t === 2 ? 0.42 : t === 3 ? 0.32 : 0.22)) / 100) * 100;
  const netPriceAvg = Math.max(8000, d.tuition + 12000 - avgGrantAid - (d.pub ? 4000 : 0));
  const pellGrantPct = Math.min(75, Math.max(8, (60 - grantMid[t]) + jitter(6, 10) + (d.pub ? 8 : 0)));
  const debtMid: Record<number, number> = { 1: 22000, 2: 26000, 3: 28000, 4: 30000, 5: 25000 };
  const avgDebtAtGrad = Math.max(8000, debtMid[t] + jitter(7, 6000));
  const financial = {
    netPriceAvg,
    aidPercent,
    meetsFullNeed,
    avgGrantAid,
    pellGrantPct,
    avgDebtAtGrad,
    workStudyAvailable: t <= 4 || (n % 4) !== 0,
  };

  // ACADEMIC LIFE
  const ratioMid: Record<number, number> = { 1: 7, 2: 11, 3: 15, 4: 18, 5: 22 };
  const sfRatio = Math.max(4, ratioMid[t] + jitter(8, 4));
  const classSize = Math.max(8, ratioMid[t] * 1.8 + jitter(9, 6));
  const sixYearMid: Record<number, number> = { 1: 95, 2: 86, 3: 72, 4: 58, 5: 42 };
  const sixYearGradRate = Math.min(98, Math.max(28, sixYearMid[t] + jitter(10, 8)));
  const fourYearGradRate = Math.max(15, sixYearGradRate - 6 - (d.pub ? 8 : 4) - (n % 6));
  const retentionMid: Record<number, number> = { 1: 98, 2: 93, 3: 84, 4: 75, 5: 65 };
  const retentionRate = Math.min(99, Math.max(58, retentionMid[t] + jitter(11, 6)));
  const academicLife = {
    studentFacultyRatio: `${sfRatio}:1`,
    avgClassSize: Math.round(classSize),
    fourYearGradRate: Math.round(fourYearGradRate),
    sixYearGradRate: Math.round(sixYearGradRate),
    retentionRate: Math.round(retentionRate),
    classesUnder20Pct: Math.min(90, Math.max(25, 78 - (t * 10) + jitter(12, 10))),
    studyAbroadPct: Math.min(75, Math.max(3, 55 - (t * 9) + jitter(13, 12))),
  };

  // DEMOGRAPHICS
  const intlMid: Record<number, number> = { 1: 18, 2: 12, 3: 8, 4: 5, 5: 3 };
  const internationalPct = !isUSA ? Math.min(40, 25 + ((n >> 14) % 15)) : Math.max(1, intlMid[t] + jitter(14, 6));
  const outOfStatePct = !isUSA ? 0 : (d.pub ? Math.max(8, 22 + jitter(15, 14)) : Math.min(95, 70 + jitter(15, 18)));
  const firstGenPct = Math.min(60, Math.max(8, (15 + (t * 5)) + jitter(16, 8)));
  const femalePct = Math.max(35, Math.min(72, 52 + jitter(17, 10)));
  const ethnicDiversityPct = Math.max(20, Math.min(85, 40 + (t === 1 ? 10 : 0) + jitter(18, 18)));
  const demographics = { internationalPct, outOfStatePct, firstGenPct, femalePct, ethnicDiversityPct };

  // CAMPUS
  const founded = d.founded || (1740 + ((n >> 5) % 240));
  const acres = enroll < 3000
    ? 100 + ((n >> 6) % 400)
    : enroll < 12000
    ? 250 + ((n >> 6) % 800)
    : 800 + ((n >> 6) % 5000) + (d.pub ? 2000 : 0);
  const setting = enroll > 25000 || /(NY|Boston|Chicago|San Francisco|Los Angeles|DC|London|Paris|Tokyo|Singapore|Hong Kong)/.test(d.loc)
    ? "Urban"
    : enroll > 8000 ? "Suburban" : enroll > 3000 ? "College Town" : "Rural";
  const mottos = ["Veritas", "Lux et Veritas", "Ad astra per aspera", "Knowledge serves", "Truth and service", "Light and truth", "Excellence and integrity", "Sapere aude"];
  const motto = d.motto || mottos[n % mottos.length];
  const mascots = ["Eagles", "Lions", "Tigers", "Bears", "Hawks", "Wolves", "Bulldogs", "Panthers", "Falcons", "Knights", "Spartans", "Pioneers", "Wildcats", "Mustangs", "Rams"];
  const mascot = d.mascot || mascots[n % mascots.length];
  const campus = {
    founded,
    acres,
    setting,
    religiousAffiliation: d.religious ?? null,
    motto,
    nickname: mascot,
  };

  // STUDENT LIFE
  const greekMid: Record<number, number> = { 1: 22, 2: 28, 3: 18, 4: 10, 5: 4 };
  const greekLifePct = Math.max(0, Math.min(70, greekMid[t] + jitter(19, 16) + (d.pub ? 4 : 0)));
  const varsityTeams = enroll > 20000 ? 22 + ((n >> 7) % 12) : enroll > 5000 ? 16 + ((n >> 7) % 10) : 10 + ((n >> 7) % 8);
  const clubsCount = enroll > 25000 ? 500 + ((n >> 8) % 400) : enroll > 8000 ? 200 + ((n >> 8) % 250) : 80 + ((n >> 8) % 130);
  const studentLife = {
    greekLifePct,
    varsityTeams,
    clubsCount,
    housingGuaranteed: t <= 2 || (enroll < 6000 && (n % 3) !== 0),
    freshmenOnCampusPct: Math.min(100, Math.max(35, 95 - (t * 8) + jitter(20, 8))),
    safetyScore: Math.max(55, Math.min(95, 80 + jitter(21, 14) - (setting === "Urban" ? 6 : 0))),
  };

  // ATHLETICS
  const conferences: Record<string, string> = {
    "MA": "Patriot League / Ivy", "NY": "Ivy / ACC", "PA": "ACC / Big Ten / PSAC", "NJ": "Ivy / Big East",
    "CA": "Pac-12 / Big West", "TX": "Big 12 / SEC", "FL": "ACC / SEC", "GA": "SEC / ACC",
    "IL": "Big Ten / MVC", "MI": "Big Ten / MAC", "OH": "Big Ten / MAC", "IN": "Big Ten",
    "NC": "ACC", "VA": "ACC", "TN": "SEC", "AL": "SEC",
    "WI": "Big Ten", "MN": "Big Ten", "WA": "Pac-12", "OR": "Pac-12",
    "CO": "Pac-12 / Mountain West", "AZ": "Pac-12", "MD": "Big Ten / ACC", "DC": "Big East",
  };
  const stateMatch = d.loc.match(/,\s*([A-Z]{2})/);
  const state = stateMatch ? stateMatch[1] : "";
  const division = !isUSA ? "International" : enroll > 12000 ? "NCAA D1" : enroll > 4000 ? "NCAA D1 / D2" : "NCAA D3";
  const athletics = {
    division,
    conference: d.conference || conferences[state] || (isUSA ? "NCAA Independent" : "International"),
    mascot,
    nationalTitles: t === 1 && d.pub ? ((n >> 9) % 12) : t === 1 ? ((n >> 9) % 4) : ((n >> 9) % 3),
    rivalNote: t <= 2 ? "Storied athletic rivalries draw national coverage" : t === 3 ? "Strong regional athletic tradition" : "Active intramural and club sports scene",
  };

  // OUTCOMES
  const gradSchoolPct = Math.min(70, Math.max(8, (50 - (t * 8)) + jitter(22, 10)));
  const salaryAt10Year = Math.round((salary * (t === 1 ? 1.85 : t === 2 ? 1.65 : t === 3 ? 1.5 : 1.4)) / 1000) * 1000;
  const topGradSchoolsByTier: Record<number, string[]> = {
    1: ["Harvard Law", "Stanford Medical", "MIT Sloan", "Yale Law"],
    2: ["NYU Law", "Columbia Business", "Johns Hopkins Medical", "Michigan Law"],
    3: ["State Flagship Programs", "Regional Medical Schools", "Big 10 Business Schools"],
    4: ["State Graduate Programs", "Local Professional Schools"],
    5: ["Community Graduate Programs", "Local Continuing Education"],
  };
  const cityFromLoc = d.loc.split(",")[0].trim();
  const stateMatch2 = d.loc.match(/,\s*([A-Z]{2})/);
  const stateOrCountry = stateMatch2 ? stateMatch2[1] : country;
  const topJobLocations = t <= 2
    ? ["New York City", "San Francisco Bay Area", "Boston", cityFromLoc].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4)
    : [cityFromLoc, `${stateOrCountry} metro area`, "Regional employers"];
  const outcomes = {
    gradSchoolPct,
    salaryAt10Year,
    topGradSchools: topGradSchoolsByTier[t],
    topJobLocations,
    notableEmployersByMajor: `Strong ${d.majors[0]?.toLowerCase() || "career"} placement into ${(topCos[t][0])} and peer firms`,
  };

  // PROGRAMS — derive from topMajors with tier-aware highlights
  const tierProgWord: Record<number, string> = {
    1: "nationally top-ranked",
    2: "highly regarded",
    3: "well-established",
    4: "career-focused",
    5: "accessible",
  };
  const programs = d.majors.slice(0, 6).map((m, idx) => ({
    name: m,
    level: idx === 0 ? "Flagship Major" : idx < 3 ? "Strong Program" : "Notable Offering",
    highlight: `${tierProgWord[t][0].toUpperCase() + tierProgWord[t].slice(1)} ${m.toLowerCase()} program with ${academicLife.studentFacultyRatio} student-faculty ratio and active ${idx === 0 ? "research and industry partnerships" : idx === 1 ? "internship pipeline" : "advisor support"}.`,
  }));

  const shortName = d.short || (() => {
    let s = d.name;
    s = s.replace(/^(The University of |University of )/, "");
    s = s.replace(/ University$/, "");
    s = s.replace(/ College$/, "");
    return s.length > 18 ? s.split(" ").map(w => w[0]).join("") : s;
  })();

  const desc = d.summary || (() => {
    if (t === 1) return `A globally recognized ${type.toLowerCase()} research university delivering elite academic programs and exceptional graduate outcomes.`;
    if (t === 2) return `A highly regarded ${type.toLowerCase()} institution known for rigorous academics and strong career placement.`;
    if (t === 3) return `A comprehensive ${type.toLowerCase()} university offering diverse programs with a focus on practical education and regional employment.`;
    if (t === 4) return `A regional ${type.toLowerCase()} institution providing accessible, career-focused education and strong community connections.`;
    return `An accessible ${type.toLowerCase()} institution offering flexible programs and close community support for career-ready graduates.`;
  })();

  return {
    id: d.id,
    name: d.name,
    shortName,
    location: d.loc,
    country,
    type,
    description: desc,
    acceptanceRate: d.accept,
    tuition: d.tuition,
    enrollment: enroll,
    ranking: d.rank,
    topMajors: d.majors,
    campusCulture: d.culture || cultureMap[t],
    careerOutcomes: { medianSalary: salary, employmentRate, topCompanies: topCos[t] },
    strengths: d.strengths || strengthMap[t],
    weaknesses: d.weaknesses || weaknessMap[t],
    famousAlumni: d.alumni || [],
    lifestyle: { weather: w, city: cityType, housingCost, campusSize },
    research: { prestige: researchPrestige, annualSpend },
    internships: { score: Math.min(100, Math.max(35, base + ((n >> 3) % 12) - 6)), topIndustries: d.industries || industries(d.majors) },
    scores: {
      academics: sc(0),
      social: sc(1, 20),
      career: sc(2),
      research: sc(3),
      diversity: sc(4, 18),
      athletics: sc(5, 30),
      value: sc(6) + (d.pub ? 4 : 0),
    },
    aiSummary: d.summary || desc,
    color: d.color || gc(d.id),
    preferencePercent: Math.min(99, Math.max(25, base - 5 + ((n >> 7) % 22) - 11)),
    studentSatisfaction: Math.min(99, Math.max(45, base + ((n >> 8) % 18) - 9)),
    annualROI: valueScore,
    prestigeScore,
    valueScore,
    admissions,
    financial,
    academicLife,
    demographics,
    campus,
    studentLife,
    athletics,
    outcomes,
    programs,
  };
}

// ─────────────────────────────────────────────────────────────
// RAW DATA — 1000+ UNIVERSITIES
// ─────────────────────────────────────────────────────────────
const raw: Raw[] = [

  // ═══════════════════════════════════════════
  // US ELITE PRIVATE — TIER 1
  // ═══════════════════════════════════════════
  { id:"harvard", name:"Harvard University", short:"Harvard", loc:"Cambridge, MA", rank:1, accept:3.2, tuition:54269, enroll:21613, tier:1, majors:["Economics","CS","Government","History"], color:"#A51C30", alumni:["Barack Obama","Bill Gates","Mark Zuckerberg","Natalie Portman"], summary:"Harvard's real value is its network. The name alone opens doors in every field on Earth — finance, law, medicine, and tech all recruit here obsessively.", founded:1636, mascot:"John Harvard", motto:"Veritas", conference:"Ivy League" },
  { id:"princeton", name:"Princeton University", short:"Princeton", loc:"Princeton, NJ", rank:1, accept:3.9, tuition:57410, enroll:8478, tier:1, majors:["Mathematics","Economics","Public Affairs","CS"], color:"#E87722", alumni:["Jeff Bezos","Michelle Obama","Sonia Sotomayor"], summary:"Princeton's focus on undergrads makes it genuinely different from peer Ivies. Smaller, quieter, very math-heavy — ideal for quant-oriented students.", founded:1746, mascot:"Tigers", motto:"Dei Sub Numine Viget", conference:"Ivy League" },
  { id:"yale", name:"Yale University", short:"Yale", loc:"New Haven, CT", rank:5, accept:4.5, tuition:59950, enroll:14567, tier:1, majors:["Economics","Political Science","History","CS"], color:"#0F4D92", alumni:["Meryl Streep","Bill Clinton","Jodie Foster"], summary:"Yale strikes a rare balance between Ivy prestige and collaborative, arts-forward culture. The residential college system is a defining advantage.", founded:1701, mascot:"Handsome Dan", motto:"Lux et Veritas", conference:"Ivy League" },
  { id:"mit", name:"Massachusetts Institute of Technology", short:"MIT", loc:"Cambridge, MA", rank:2, accept:4.0, tuition:57590, enroll:11934, tier:1, majors:["CS","Mechanical Engineering","Mathematics","Physics"], color:"#A31F34", alumni:["Buzz Aldrin","Kofi Annan","Richard Feynman"], summary:"MIT is the go-to for students obsessed with STEM. The workload is punishing, but career trajectory and bleeding-edge research access are unmatched.", founded:1861, mascot:"Tim the Beaver", motto:"Mens et Manus", conference:"NEWMAC (D-III)" },
  { id:"stanford", name:"Stanford University", short:"Stanford", loc:"Stanford, CA", rank:3, accept:3.9, tuition:57693, enroll:17326, tier:1, majors:["CS","Human Biology","Engineering","Economics"], color:"#8C1515", alumni:["Elon Musk","Larry Page","Sergey Brin","Reese Witherspoon"], summary:"The destination for aspiring founders. Stanford's Silicon Valley access is incomparable for those who thrive on building.", founded:1885, mascot:"Stanford Tree", motto:"Die Luft der Freiheit weht", conference:"ACC" },
  { id:"columbia", name:"Columbia University", short:"Columbia", loc:"New York City, NY", rank:12, accept:3.9, tuition:63530, enroll:31457, tier:1, majors:["Economics","CS","Political Science","Finance"], color:"#B9D9EB", alumni:["Barack Obama (transfer)","Warren Buffett","Alexander Hamilton"], summary:"Columbia's real campus is NYC. If you want Wall Street, media, or tech handed to you on a platter, there's no better undergrad location on Earth.", founded:1754, mascot:"Roar-ee the Lion", motto:"In lumine Tuo videbimus lumen", conference:"Ivy League" },
  { id:"upenn", name:"University of Pennsylvania", short:"Penn", loc:"Philadelphia, PA", rank:7, accept:5.9, tuition:63452, enroll:22808, tier:1, majors:["Finance (Wharton)","Economics","CS","Nursing"], color:"#011F5B", alumni:["Elon Musk","Donald Trump","Warren Buffett (Wharton)"], summary:"Wharton is the most powerful undergraduate business brand on Earth. Penn has the pipeline and culture to get you into finance faster than almost anywhere.", founded:1740, mascot:"Quaker", motto:"Leges sine moribus vanae", conference:"Ivy League" },
  { id:"dartmouth", name:"Dartmouth College", short:"Dartmouth", loc:"Hanover, NH", rank:12, accept:6.2, tuition:62430, enroll:6692, tier:1, majors:["Economics","Government","Engineering","History"], color:"#00693E", alumni:["Mindy Kaling","Shonda Rhimes","Mr. Rogers"], summary:"The most rural Ivy delivers an intensely close-knit experience. The D-Plan and fraternity culture define Dartmouth — it's not for everyone, but those who love it really love it.", founded:1769, mascot:"Big Green", motto:"Vox clamantis in deserto", conference:"Ivy League" },
  { id:"brown", name:"Brown University", short:"Brown", loc:"Providence, RI", rank:9, accept:5.0, tuition:62680, enroll:10696, tier:1, majors:["CS","Neuroscience","Economics","International Relations"], color:"#4E3629", alumni:["Emma Watson","John F. Kennedy Jr.","Ted Turner"], summary:"Brown's Open Curriculum is the most genuinely flexible in the Ivy League. Students design their own education — liberating for some, paralyzing for others.", founded:1764, mascot:"Bruno the Bear", motto:"In Deo Speramus", conference:"Ivy League" },
  { id:"cornell", name:"Cornell University", short:"Cornell", loc:"Ithaca, NY", rank:17, accept:7.3, tuition:61015, enroll:24751, tier:1, majors:["Engineering","Hotel Administration","CS","Biology"], color:"#B31B1B", alumni:["Bill Nye","Ruth Bader Ginsburg (briefly)","Toni Morrison"], summary:"Cornell is the most accessible Ivy but also the most diverse in academic offerings. The Hotel school and Engineering are world-class; the Ithaca winters are brutal.", founded:1865, mascot:"Touchdown the Bear", motto:"Any person, any study", conference:"Ivy League" },
  { id:"uchicago", name:"University of Chicago", short:"UChicago", loc:"Chicago, IL", rank:12, accept:5.4, tuition:62241, enroll:17002, tier:1, majors:["Economics","Mathematics","CS","Philosophy"], color:"#800000", alumni:["Barack Obama (Law)","Milton Friedman","Carl Sagan"], summary:"UChicago is where fun goes to die — and it's a feature, not a bug. The Core Curriculum breeds some of the sharpest analytical minds in the country.", founded:1890, mascot:"Phil the Phoenix", motto:"Crescat scientia, vita excolatur", conference:"UAA (D-III)" },
  { id:"duke", name:"Duke University", short:"Duke", loc:"Durham, NC", rank:9, accept:5.8, tuition:60489, enroll:16172, tier:1, majors:["Public Policy","Biology","CS","Economics"], color:"#003087", alumni:["Tim Cook","Melinda Gates","Grant Hill"], summary:"Duke is elite without being suffocating. The rare school where you can be serious about academics and still have a social life. The Fuqua pipeline is real.", founded:1838, mascot:"Blue Devil", motto:"Eruditio et Religio", conference:"ACC", religious:"Methodist heritage" },
  { id:"northwestern", name:"Northwestern University", short:"Northwestern", loc:"Evanston, IL", rank:9, accept:6.8, tuition:62391, enroll:22186, tier:1, majors:["Journalism","Economics","CS","Psychology"], color:"#4E2A84", alumni:["Rahm Emanuel","Stephen Colbert","Julia Louis-Dreyfus"], summary:"Northwestern's quarter system produces people who move fast. Medill and Kellogg pipelines are elite. The lakeside campus in winter is a character-building experience.", founded:1851, mascot:"Willie the Wildcat", motto:"Quaecumque sunt vera", conference:"Big Ten", religious:"Methodist heritage" },
  { id:"vanderbilt", name:"Vanderbilt University", short:"Vandy", loc:"Nashville, TN", rank:13, accept:6.7, tuition:60348, enroll:13537, tier:1, majors:["Medicine","Economics","Engineering","Education"], color:"#866D4B", alumni:["Amy Grant","Lamar Alexander","Al Gore"], summary:"Vanderbilt is the perfect combination of elite academics, Southern social culture, and Nashville's thriving music and healthcare scene.", founded:1873, mascot:"Mr. Commodore", motto:"Crescere aude", conference:"SEC" },
  { id:"rice", name:"Rice University", short:"Rice", loc:"Houston, TX", rank:16, accept:8.7, tuition:54960, enroll:4367, tier:1, majors:["Engineering","CS","Economics","Music"], color:"#003C71", alumni:["Larry McMurtry","Robert Curl"], summary:"Rice is MIT-level STEM in a tiny, tight-knit community. The residential college system, no grad student TA culture, and Houston's energy sector make it uniquely compelling.", founded:1912, mascot:"Sammy the Owl", motto:"Letters, Science, Art", conference:"American Athletic" },
  { id:"notre-dame", name:"University of Notre Dame", short:"Notre Dame", loc:"South Bend, IN", rank:18, accept:12.5, tuition:59301, enroll:8893, tier:1, majors:["Finance","Engineering","Political Science","Pre-Med"], color:"#0C2340", alumni:["Condoleezza Rice","Phil Donahue","Nicholas Sparks"], summary:"Notre Dame's combination of elite academics, strong Catholic identity, football fanaticism, and powerful alumni network creates an unusually cohesive culture.", founded:1842, mascot:"Leprechaun", motto:"Vita, Dulcedo, Spes", conference:"ACC", religious:"Catholic" },
  { id:"cmu", name:"Carnegie Mellon University", short:"CMU", loc:"Pittsburgh, PA", rank:22, accept:11.0, tuition:59864, enroll:15818, tier:1, majors:["CS","Electrical Engineering","Drama","Business"], color:"#C1121C", alumni:["Andy Warhol","Randy Pausch","Vinton Cerf"], summary:"CMU is the single best school in the world for CS placement. The social scene is rough, but graduates go directly to the most competitive technical roles anywhere.", founded:1900, mascot:"Scotty the Scottie", motto:"My heart is in the work", conference:"UAA (D-III)" },
  { id:"johns-hopkins", name:"Johns Hopkins University", short:"JHU", loc:"Baltimore, MD", rank:9, accept:7.0, tuition:59085, enroll:26045, tier:1, majors:["Neuroscience","International Studies","Biomedical Engineering","CS"], color:"#68ACE5", alumni:["Michael Bloomberg","Woodrow Wilson","Wes Craven"], summary:"If medicine or public health is the plan, JHU has no real competitor. It's the most research-intensive university per student in the country.", founded:1876, mascot:"Blue Jay", motto:"Veritas vos liberabit", conference:"Centennial (D-III)" },
  { id:"georgetown", name:"Georgetown University", short:"Georgetown", loc:"Washington, DC", rank:22, accept:12.0, tuition:61872, enroll:19306, tier:1, majors:["International Relations","Political Science","Finance","Pre-Law"], color:"#063462", alumni:["Bill Clinton","Bradley Cooper","Antonin Scalia"], summary:"Georgetown's location in DC and its Jesuit global mission make it the top school for students who want to work in government, law, or international affairs.", founded:1789, mascot:"Jack the Bulldog", motto:"Utraque Unum", conference:"Big East", religious:"Catholic (Jesuit)" },
  { id:"washu", name:"Washington University in St. Louis", short:"WashU", loc:"St. Louis, MO", rank:22, accept:12.4, tuition:60590, enroll:16257, tier:1, majors:["Business (Olin)","Pre-Med","Engineering","Psychology"], color:"#A51417", alumni:["Sheryl Crow","Tennessee Williams","William S. Burroughs"], summary:"WashU is consistently underrated. Olin Business and the pre-med pipeline are genuine elite programs. The small-city location keeps costs manageable relative to its peer group.", founded:1853, mascot:"Bear", motto:"Per Veritatem Vis", conference:"UAA (D-III)" },
  { id:"tufts", name:"Tufts University", short:"Tufts", loc:"Medford, MA", rank:28, accept:10.7, tuition:65222, enroll:11643, tier:1, majors:["International Relations","Engineering","Biology","CS"], color:"#3E8EDE", alumni:["Tracy Chapman","Hank Azaria","Pierre Omidyar"], summary:"Tufts punches above its weight in international affairs, medicine, and engineering. The Medford location gives real Boston access without Harvard or MIT's shadow." },
  { id:"emory", name:"Emory University", short:"Emory", loc:"Atlanta, GA", rank:22, accept:11.4, tuition:56314, enroll:15563, tier:1, majors:["Pre-Med","Business","Public Health","CS"], color:"#012169", alumni:["Newt Gingrich","Salman Rushdie (briefly)","CDC Directors"], summary:"Emory is the top pre-med and public health destination in the South, with direct access to the CDC and Atlanta's thriving healthcare and business corridors.", founded:1836, mascot:"Swoop the Eagle", motto:"Cor prudentis possidebit scientiam", conference:"UAA (D-III)", religious:"Methodist heritage" },
  { id:"boston-college", name:"Boston College", short:"BC", loc:"Chestnut Hill, MA", rank:35, accept:15.0, tuition:61706, enroll:15075, tier:1, majors:["Finance","Accounting","Education","Political Science"], color:"#8A0000", alumni:["Amy Poehler","B.J. Novak","Jack Welch"], summary:"BC's Jesuit mission, Boston location, and Carroll School of Management make it a top feeder to Wall Street and Boston's finance sector." },
  { id:"caltech", name:"California Institute of Technology", short:"Caltech", loc:"Pasadena, CA", rank:6, accept:3.9, tuition:60816, enroll:2233, tier:1, majors:["Physics","CS","Electrical Engineering","Mathematics"], color:"#FF6C0C", alumni:["Gordon Moore","Linus Pauling","William Shockley"], summary:"Caltech is the smallest elite STEM university in the world — 2,200 students, 72 Nobel laureates on faculty, and the highest per-student research output anywhere.", founded:1891, mascot:"Beavers", motto:"The truth shall make you free", conference:"SCIAC (D-III)" },
  { id:"northeastern", name:"Northeastern University", short:"Northeastern", loc:"Boston, MA", rank:49, accept:6.8, tuition:59792, enroll:23385, tier:1, majors:["CS","Business","Bioengineering","Criminal Justice"], color:"#C8102E", alumni:["Keanu Reeves (briefly)","John Kerry"], summary:"Northeastern's co-op program is the best experiential learning model in the US. Graduates average two years of full-time work experience before they collect their diploma." },

  // ═══════════════════════════════════════════
  // US ELITE PUBLIC — TIER 1
  // ═══════════════════════════════════════════
  { id:"uc-berkeley", name:"University of California, Berkeley", short:"UC Berkeley", loc:"Berkeley, CA", pub:true, rank:15, accept:11.4, tuition:44115, enroll:45057, tier:1, majors:["EECS","Economics","Data Science","Political Science"], color:"#003262", alumni:["Steve Wozniak","Gordon Moore","Chris Pine"], summary:"Berkeley is sink-or-swim. The resources are world-class, but you have to seek them out. It breeds resilient graduates who operate under pressure.", founded:1868, mascot:"Oski the Bear", motto:"Fiat Lux", conference:"ACC" },
  { id:"ucla", name:"University of California, Los Angeles", short:"UCLA", loc:"Los Angeles, CA", pub:true, rank:20, accept:8.6, tuition:44830, enroll:46116, tier:1, majors:["CS","Business Economics","Psychology","Film/TV"], color:"#2774AE", alumni:["Jim Morrison","Kareem Abdul-Jabbar","James Dean (briefly)"], summary:"UCLA has the best combination of academics, location, weather, and athletics of any public university. The entertainment and tech industries practically recruit on campus.", founded:1919, mascot:"Joe & Josephine Bruin", motto:"Fiat Lux", conference:"Big Ten" },
  { id:"michigan", name:"University of Michigan", short:"Michigan", loc:"Ann Arbor, MI", pub:true, rank:23, accept:17.7, tuition:52266, enroll:47907, tier:1, majors:["Business (Ross)","Engineering","CS","Political Science"], color:"#FFCB05", alumni:["Larry Page","Gerald Ford","Madonna"], summary:"Michigan delivers an Ivy-adjacent education at a fraction of the cost. Ross and engineering are legitimately elite; the football culture is in a class of its own.", founded:1817, mascot:"Wolverine", motto:"Artes, Scientia, Veritas", conference:"Big Ten" },
  { id:"virginia", name:"University of Virginia", short:"UVA", loc:"Charlottesville, VA", pub:true, rank:26, accept:18.0, tuition:53326, enroll:25298, tier:1, majors:["Commerce (McIntire)","Engineering","Political Science","Pre-Med"], color:"#232D4B", alumni:["Edgar Allan Poe (briefly)","Katie Couric","Tina Fey"], summary:"UVA is the most beautiful public university in America. McIntire Commerce is a top-10 business program. The honor code creates a culture of genuine academic integrity." },
  { id:"unc", name:"University of North Carolina at Chapel Hill", short:"UNC", loc:"Chapel Hill, NC", pub:true, rank:28, accept:19.4, tuition:36776, enroll:32006, tier:1, majors:["Business","Journalism","Pre-Med","Political Science"], color:"#4B9CD3", alumni:["Andy Griffith","James K. Polk","Mia Hamm"], summary:"UNC is the best public university in the South. Kenan-Flagler Business and journalism are nationally elite. The Research Triangle puts biotech jobs at your doorstep.", founded:1789, mascot:"Rameses the Ram", motto:"Lux Libertas", conference:"ACC" },
  { id:"georgia-tech", name:"Georgia Institute of Technology", short:"Georgia Tech", loc:"Atlanta, GA", pub:true, rank:33, accept:16.3, tuition:32876, enroll:35794, tier:1, majors:["CS","Electrical Engineering","Industrial Engineering","Mechanical Engineering"], color:"#B3A369", alumni:["Jimmy Carter (briefly)","Jeff Sprecher"], summary:"Georgia Tech is MIT-tier for engineering at 60% the cost. Atlanta's booming tech scene and the Co-op program are massive career accelerators.", founded:1885, mascot:"Buzz / Ramblin' Wreck", motto:"Progress and Service", conference:"ACC" },
  { id:"uiuc", name:"University of Illinois Urbana-Champaign", short:"UIUC", loc:"Champaign, IL", pub:true, rank:35, accept:44.5, tuition:33932, enroll:56916, tier:1, majors:["CS","Engineering","Business","Architecture"], color:"#E84A27", alumni:["Marc Andreessen","Jack Kilby","Hugh Hefner"], summary:"UIUC's CS program is top 3 in the world. Major tech companies recruit here aggressively — it's where Silicon Valley goes to find its next generation of engineers.", founded:1867, mascot:"Block I", motto:"Learning and Labor", conference:"Big Ten" },
  { id:"ucsd", name:"University of California, San Diego", short:"UC San Diego", loc:"La Jolla, CA", pub:true, rank:34, accept:23.4, tuition:44878, enroll:39686, tier:1, majors:["CS","Biology","Economics","Cognitive Science"], color:"#006A96", alumni:["Brian Williams","Greg Sherwood"], summary:"UCSD has grown into a genuine research powerhouse, particularly in biomedical sciences, oceanography, and computer science. San Diego's biotech corridor is a direct pipeline." },
  { id:"uga", name:"University of Georgia", short:"UGA", loc:"Athens, GA", pub:true, rank:48, accept:43.0, tuition:30392, enroll:39147, tier:2, majors:["Business (Terry)","Journalism","Pre-Law","Agriculture"], color:"#BA0C2F", alumni:["REM members","Kim Basinger","Lewis Grizzard"] },
  { id:"william-mary", name:"College of William & Mary", short:"W&M", loc:"Williamsburg, VA", pub:true, rank:33, accept:34.9, tuition:46100, enroll:9640, tier:2, majors:["Economics","Government","Psychology","Education"], color:"#115740", alumni:["Thomas Jefferson","Jon Stewart","Glenn Close"] },
  { id:"florida", name:"University of Florida", short:"UF", loc:"Gainesville, FL", pub:true, rank:28, accept:31.2, tuition:28658, enroll:59828, tier:1, majors:["Business","Engineering","Pre-Med","Agriculture"], color:"#0021A5", alumni:["Bob Kraft","Faye Dunaway","Emmitt Smith"], summary:"UF is the best public university in the South for sheer value — top programs in business, engineering, and medicine with in-state costs under $30k." },
  { id:"wisconsin", name:"University of Wisconsin-Madison", short:"Wisconsin", loc:"Madison, WI", pub:true, rank:36, accept:49.5, tuition:38053, enroll:48956, tier:2, majors:["Business","Engineering","Pre-Med","Political Science"], color:"#C5050C", alumni:["John Muir","Frank Lloyd Wright","Greta Van Susteren"], founded:1848, mascot:"Bucky Badger", motto:"Numen Lumen", conference:"Big Ten" },
  { id:"ut-austin", name:"University of Texas at Austin", short:"UT Austin", loc:"Austin, TX", pub:true, rank:38, accept:28.7, tuition:40032, enroll:50476, tier:2, majors:["Business (McCombs)","Engineering","CS","Communications"], color:"#BF5700", alumni:["Matthew McConaughey","Michael Dell","Farrah Fawcett"], summary:"UT Austin is the best value play in the Southwest. McCombs is top 15; the Austin tech scene recruits aggressively. Quality of life is hard to beat.", founded:1883, mascot:"Bevo the Longhorn", motto:"Disciplina praesidium civitatis", conference:"SEC" },
  { id:"washington", name:"University of Washington", short:"UW", loc:"Seattle, WA", pub:true, rank:59, accept:48.5, tuition:39114, enroll:47958, tier:2, majors:["CS","Business","Engineering","Pre-Med"], color:"#4B2E83", alumni:["Bruce Lee (briefly)","Jimi Hendrix (briefly)"] },
  { id:"penn-state", name:"Pennsylvania State University", short:"Penn State", loc:"University Park, PA", pub:true, rank:91, accept:55.1, tuition:36476, enroll:47307, tier:2, majors:["Business","Engineering","Education","Agriculture"], color:"#1E407C", alumni:["Joe Paterno","Penn State Creamery founders"], founded:1855, mascot:"Nittany Lion", motto:"Making Life Better", conference:"Big Ten" },

  // ═══════════════════════════════════════════
  // US LIBERAL ARTS COLLEGES — TIER 1-2
  // ═══════════════════════════════════════════
  { id:"williams", name:"Williams College", short:"Williams", loc:"Williamstown, MA", rank:1, accept:8.9, tuition:60550, enroll:2170, tier:1, majors:["Economics","Mathematics","Political Science","History"], color:"#512888", founded:1793, mascot:"Ephs (Purple Cow)", motto:"E liberalitate E. Williams", conference:"NESCAC (D-III)" },
  { id:"amherst", name:"Amherst College", short:"Amherst", loc:"Amherst, MA", rank:2, accept:7.0, tuition:62690, enroll:1971, tier:1, majors:["Economics","Mathematics","Political Science","CS"], color:"#3F00FF", founded:1821, mascot:"Mammoths", motto:"Terras Irradient", conference:"NESCAC (D-III)" },
  { id:"swarthmore", name:"Swarthmore College", short:"Swarthmore", loc:"Swarthmore, PA", rank:3, accept:7.0, tuition:58972, enroll:1664, tier:1, majors:["Economics","Political Science","Biology","Engineering"], color:"#8C2131", founded:1864, mascot:"Phoenix", motto:"Mind the Light", conference:"Centennial (D-III)", religious:"Quaker heritage" },
  { id:"pomona", name:"Pomona College", short:"Pomona", loc:"Claremont, CA", rank:4, accept:7.0, tuition:57684, enroll:1774, tier:1, majors:["Economics","Mathematics","CS","Neuroscience"], color:"#002855", founded:1887, mascot:"Cecil the Sagehen", motto:"Let only the eager, thoughtful and reverent enter here", conference:"SCIAC (D-III)" },
  { id:"wellesley", name:"Wellesley College", short:"Wellesley", loc:"Wellesley, MA", rank:5, accept:13.8, tuition:57848, enroll:2503, tier:1, majors:["Economics","Political Science","CS","Psychology"], color:"#1D6068", founded:1870, mascot:"Wendy the Wellesley Blue", motto:"Non Ministrari sed Ministrare", conference:"NEWMAC (D-III)" },
  { id:"bowdoin", name:"Bowdoin College", short:"Bowdoin", loc:"Brunswick, ME", rank:6, accept:8.9, tuition:59390, enroll:1844, tier:1, majors:["Economics","Government","Biology","Environmental Studies"], color:"#000000", founded:1794, mascot:"Polar Bear", motto:"Ut Aquila Versus Coelum", conference:"NESCAC (D-III)" },
  { id:"carleton", name:"Carleton College", short:"Carleton", loc:"Northfield, MN", rank:7, accept:17.0, tuition:58818, enroll:2078, tier:1, majors:["Economics","CS","Biology","Mathematics"], color:"#003865" },
  { id:"middlebury", name:"Middlebury College", short:"Middlebury", loc:"Middlebury, VT", rank:8, accept:14.5, tuition:60880, enroll:2898, tier:1, majors:["International Studies","Economics","Environmental Studies","Political Science"], color:"#004F9F", founded:1800, mascot:"Panther", motto:"Knowledge and Virtue", conference:"NESCAC (D-III)" },
  { id:"vassar", name:"Vassar College", short:"Vassar", loc:"Poughkeepsie, NY", rank:11, accept:18.2, tuition:61720, enroll:2450, tier:1, majors:["Psychology","Political Science","Economics","English"], color:"#A61F26" },
  { id:"barnard", name:"Barnard College", short:"Barnard", loc:"New York City, NY", rank:12, accept:11.7, tuition:58092, enroll:3070, tier:1, majors:["Economics","Political Science","Psychology","English"], color:"#003399" },
  { id:"smith", name:"Smith College", short:"Smith", loc:"Northampton, MA", rank:16, accept:30.0, tuition:54552, enroll:2706, tier:2, majors:["Government","Economics","CS","Psychology"], color:"#002147" },
  { id:"mount-holyoke", name:"Mount Holyoke College", short:"Mount Holyoke", loc:"South Hadley, MA", rank:28, accept:37.0, tuition:55700, enroll:2298, tier:2, majors:["Biology","Economics","Political Science","Psychology"], color:"#006937" },
  { id:"bryn-mawr", name:"Bryn Mawr College", short:"Bryn Mawr", loc:"Bryn Mawr, PA", rank:30, accept:32.0, tuition:55720, enroll:1395, tier:2, majors:["Mathematics","Political Science","Psychology","Biology"], color:"#1D3E6E" },
  { id:"haverford", name:"Haverford College", short:"Haverford", loc:"Haverford, PA", rank:10, accept:15.0, tuition:56868, enroll:1421, tier:1, majors:["Biology","Economics","Mathematics","Political Science"], color:"#C1203A" },
  { id:"claremont-mckenna", name:"Claremont McKenna College", short:"CMC", loc:"Claremont, CA", rank:9, accept:8.2, tuition:57830, enroll:1356, tier:1, majors:["Economics","Government","International Relations","Finance"], color:"#8B1E3F" },
  { id:"harvey-mudd", name:"Harvey Mudd College", short:"Harvey Mudd", loc:"Claremont, CA", rank:2, accept:9.0, tuition:61717, enroll:902, tier:1, majors:["CS","Engineering","Mathematics","Physics"], color:"#FFB81C", founded:1955, mascot:"Cecil the Sagehen", motto:"Stay True", conference:"SCIAC (D-III)" },
  { id:"scripps", name:"Scripps College", short:"Scripps", loc:"Claremont, CA", rank:28, accept:22.0, tuition:57476, enroll:1093, tier:2, majors:["Psychology","Humanities","International Relations","Studio Art"], color:"#B5A65B" },
  { id:"pitzer", name:"Pitzer College", short:"Pitzer", loc:"Claremont, CA", rank:35, accept:13.5, tuition:56140, enroll:1096, tier:2, majors:["Sociology","Psychology","Environmental Studies","Media Studies"], color:"#F97B2B" },
  { id:"davidson", name:"Davidson College", short:"Davidson", loc:"Davidson, NC", rank:14, accept:19.0, tuition:55848, enroll:1836, tier:1, majors:["Economics","Political Science","Mathematics","Biology"], color:"#CC0000" },
  { id:"hamilton", name:"Hamilton College", short:"Hamilton", loc:"Clinton, NY", rank:15, accept:10.0, tuition:57750, enroll:1972, tier:1, majors:["Economics","Government","Mathematics","English"], color:"#004B8D" },
  { id:"colgate", name:"Colgate University", short:"Colgate", loc:"Hamilton, NY", rank:17, accept:19.5, tuition:58700, enroll:3157, tier:1, majors:["Economics","Political Science","CS","Biology"], color:"#821019" },
  { id:"colby", name:"Colby College", short:"Colby", loc:"Waterville, ME", rank:17, accept:9.0, tuition:59640, enroll:2090, tier:1, majors:["Economics","Biology","Government","Environmental Studies"], color:"#002859" },
  { id:"bates", name:"Bates College", short:"Bates", loc:"Lewiston, ME", rank:22, accept:13.3, tuition:58990, enroll:1773, tier:1, majors:["Economics","Politics","Psychology","Biology"], color:"#990000" },
  { id:"oberlin", name:"Oberlin College", short:"Oberlin", loc:"Oberlin, OH", rank:35, accept:28.0, tuition:58540, enroll:2818, tier:2, majors:["Economics","Politics","Music","Environmental Studies"], color:"#E05A2B" },
  { id:"grinnell", name:"Grinnell College", short:"Grinnell", loc:"Grinnell, IA", rank:11, accept:12.0, tuition:55436, enroll:1733, tier:1, majors:["Economics","Political Science","CS","Biology"], color:"#B20000" },
  { id:"trinity-ct", name:"Trinity College", short:"Trinity", loc:"Hartford, CT", rank:42, accept:30.0, tuition:60240, enroll:2208, tier:2, majors:["Economics","Political Science","History","Neuroscience"], color:"#003087", founded:1823, mascot:"Bantam", motto:"Pro Ecclesia et Patria", conference:"NESCAC (D-III)" },
  { id:"holy-cross", name:"College of the Holy Cross", short:"Holy Cross", loc:"Worcester, MA", rank:32, accept:26.0, tuition:57870, enroll:3020, tier:2, majors:["Economics","Political Science","Accounting","Psychology"], color:"#60246E" },
  { id:"lafayette", name:"Lafayette College", short:"Lafayette", loc:"Easton, PA", rank:39, accept:24.0, tuition:58700, enroll:2566, tier:2, majors:["Economics","Engineering","Business","CS"], color:"#B0041C" },
  { id:"bucknell", name:"Bucknell University", short:"Bucknell", loc:"Lewisburg, PA", rank:33, accept:33.0, tuition:59002, enroll:3679, tier:2, majors:["Economics","Engineering","Business","CS"], color:"#E05A2B" },
  { id:"wesleyan", name:"Wesleyan University", short:"Wesleyan", loc:"Middletown, CT", rank:19, accept:16.0, tuition:60350, enroll:3004, tier:1, majors:["Film Studies","Economics","Psychology","Biology"], color:"#CC0000" },
  { id:"kenyon", name:"Kenyon College", short:"Kenyon", loc:"Gambier, OH", rank:26, accept:21.0, tuition:57060, enroll:1744, tier:2, majors:["English","Economics","Political Science","Psychology"], color:"#9B2335" },
  { id:"colorado-college", name:"Colorado College", short:"Colorado College", loc:"Colorado Springs, CO", rank:31, accept:13.0, tuition:57558, enroll:2109, tier:2, majors:["Economics","Biology","Environmental Science","Sociology"], color:"#002868" },
  { id:"macalester", name:"Macalester College", short:"Macalester", loc:"St. Paul, MN", rank:24, accept:29.0, tuition:56960, enroll:2189, tier:2, majors:["Economics","International Studies","Political Science","Biology"], color:"#CF7F30" },
  { id:"sewanee", name:"Sewanee - University of the South", short:"Sewanee", loc:"Sewanee, TN", rank:44, accept:42.0, tuition:47270, enroll:1800, tier:2, majors:["English","Political Science","Biology","Economics"], color:"#4A235A" },
  { id:"rhodes", name:"Rhodes College", short:"Rhodes", loc:"Memphis, TN", rank:45, accept:37.0, tuition:50950, enroll:2048, tier:2, majors:["Psychology","Economics","Political Science","Biology"], color:"#D22630" },
  { id:"furman", name:"Furman University", short:"Furman", loc:"Greenville, SC", rank:52, accept:55.0, tuition:53792, enroll:2850, tier:2, majors:["Psychology","Business Administration","Political Science","Health Science"], color:"#582C83" },
  { id:"depauw", name:"DePauw University", short:"DePauw", loc:"Greencastle, IN", rank:60, accept:47.0, tuition:48376, enroll:2098, tier:2, majors:["Economics","Communication","Political Science","Psychology"], color:"#F9A12E" },
  { id:"whitman", name:"Whitman College", short:"Whitman", loc:"Walla Walla, WA", rank:44, accept:45.0, tuition:55140, enroll:1490, tier:2, majors:["Biology","Politics","Psychology","Economics"], color:"#004680" },
  { id:"reed", name:"Reed College", short:"Reed", loc:"Portland, OR", rank:60, accept:35.0, tuition:58760, enroll:1497, tier:2, majors:["Biology","Psychology","English","Chemistry"], color:"#CC0000" },
  { id:"dickinson", name:"Dickinson College", short:"Dickinson", loc:"Carlisle, PA", rank:47, accept:44.0, tuition:57470, enroll:2325, tier:2, majors:["International Business","Economics","Political Science","Environmental Studies"], color:"#CC2529" },
  { id:"connecticut-college", name:"Connecticut College", short:"Connecticut College", loc:"New London, CT", rank:44, accept:35.0, tuition:57190, enroll:1858, tier:2, majors:["Psychology","Economics","Sociology","Environmental Studies"], color:"#002060" },
  { id:"skidmore", name:"Skidmore College", short:"Skidmore", loc:"Saratoga Springs, NY", rank:44, accept:24.0, tuition:57000, enroll:2704, tier:2, majors:["Business","Psychology","Art","English"], color:"#006B3C" },
  { id:"sarah-lawrence", name:"Sarah Lawrence College", short:"Sarah Lawrence", loc:"Bronxville, NY", rank:55, accept:56.0, tuition:57170, enroll:1538, tier:2, majors:["Creative Writing","Psychology","Literature","Performing Arts"], color:"#8B0000" },
  { id:"st-olaf", name:"St. Olaf College", short:"St. Olaf", loc:"Northfield, MN", rank:55, accept:43.0, tuition:51050, enroll:3015, tier:2, majors:["Music","Biology","Economics","Mathematics"], color:"#000000" },
  { id:"lawrence", name:"Lawrence University", short:"Lawrence", loc:"Appleton, WI", rank:60, accept:56.0, tuition:48756, enroll:1504, tier:2, majors:["Music","Biology","Economics","Neuroscience"], color:"#00467F" },
  { id:"beloit", name:"Beloit College", short:"Beloit", loc:"Beloit, WI", rank:80, accept:58.0, tuition:52980, enroll:1261, tier:2, majors:["Business","Economics","Psychology","Sociology"], color:"#F9A12E" },
  { id:"franklin-marshall", name:"Franklin & Marshall College", short:"F&M", loc:"Lancaster, PA", rank:35, accept:30.0, tuition:63540, enroll:2334, tier:2, majors:["Business","Government","Biology","Economics"], color:"#002D73" },
  { id:"union-ny", name:"Union College", short:"Union", loc:"Schenectady, NY", rank:47, accept:37.0, tuition:57636, enroll:2361, tier:2, majors:["Economics","Engineering","Political Science","CS"], color:"#8B0000" },
  { id:"muhlenberg", name:"Muhlenberg College", short:"Muhlenberg", loc:"Allentown, PA", rank:68, accept:59.0, tuition:55190, enroll:2369, tier:2, majors:["Business","Psychology","Media & Communication","Biology"], color:"#C41230" },
  { id:"allegheny", name:"Allegheny College", short:"Allegheny", loc:"Meadville, PA", rank:80, accept:61.0, tuition:46140, enroll:1742, tier:3, majors:["Biology","Psychology","Environmental Science","Economics"], color:"#003087" },
  { id:"gettysburg", name:"Gettysburg College", short:"Gettysburg", loc:"Gettysburg, PA", rank:60, accept:40.0, tuition:60010, enroll:2451, tier:2, majors:["Management","Political Science","Psychology","Biology"], color:"#F26522" },
  { id:"wabash", name:"Wabash College", short:"Wabash", loc:"Crawfordsville, IN", rank:60, accept:52.0, tuition:43700, enroll:868, tier:2, majors:["Economics","Political Science","Chemistry","Psychology"], color:"BA0C2F" },
  { id:"denison", name:"Denison University", short:"Denison", loc:"Granville, OH", rank:47, accept:27.0, tuition:54670, enroll:2395, tier:2, majors:["Economics","Communications","Political Science","Psychology"], color:"#CC0000" },
  { id:"kalamazoo", name:"Kalamazoo College", short:"K College", loc:"Kalamazoo, MI", rank:70, accept:71.0, tuition:52236, enroll:1427, tier:2, majors:["Economics","Psychology","Biology","English"], color:"#F9A12E" },
  { id:"earlham", name:"Earlham College", short:"Earlham", loc:"Richmond, IN", rank:90, accept:65.0, tuition:48000, enroll:950, tier:2, majors:["Biology","Psychology","Economics","Peace & Global Studies"], color:"#8B2131" },
  { id:"wooster", name:"College of Wooster", short:"Wooster", loc:"Wooster, OH", rank:65, accept:48.0, tuition:52440, enroll:2031, tier:2, majors:["Biology","Biochemistry","Economics","History"], color:"#000000" },

  // ═══════════════════════════════════════════
  // US TIER 2 PRIVATE UNIVERSITIES
  // ═══════════════════════════════════════════
  { id:"nyu", name:"New York University", short:"NYU", loc:"New York City, NY", rank:35, accept:12.0, tuition:58168, enroll:50027, tier:2, majors:["Business","Film/TV","Finance","Liberal Arts"], color:"#57068C", alumni:["Lady Gaga","Martin Scorsese","Angelina Jolie"], summary:"NYU is only worth it if you're committed to being in NYC and using it relentlessly. The school itself is secondary — the city is the education.", founded:1831, mascot:"Bobcat", motto:"Perstare et praestare", conference:"UAA (D-III)" },
  { id:"rochester", name:"University of Rochester", short:"Rochester", loc:"Rochester, NY", rank:36, accept:29.0, tuition:60550, enroll:11736, tier:2, majors:["CS","Biomedical Engineering","Economics","Music"], color:"#003F87" },
  { id:"case-western", name:"Case Western Reserve University", short:"Case Western", loc:"Cleveland, OH", rank:42, accept:27.0, tuition:57800, enroll:12180, tier:2, majors:["Engineering","Pre-Med","CS","Business"], color:"#003A5C" },
  { id:"wake-forest", name:"Wake Forest University", short:"Wake Forest", loc:"Winston-Salem, NC", rank:28, accept:25.0, tuition:60182, enroll:8303, tier:2, majors:["Business (Calloway)","Pre-Med","Political Science","Psychology"], color:"#9E7E38" },
  { id:"tulane", name:"Tulane University", short:"Tulane", loc:"New Orleans, LA", rank:44, accept:11.0, tuition:59430, enroll:14500, tier:2, majors:["Business","Public Health","Political Science","Pre-Law"], color:"#006747" },
  { id:"smu", name:"Southern Methodist University", short:"SMU", loc:"Dallas, TX", rank:66, accept:44.0, tuition:61690, enroll:12390, tier:2, majors:["Business (Cox)","Engineering","Arts","Communications"], color:"#0033A0" },
  { id:"rpi", name:"Rensselaer Polytechnic Institute", short:"RPI", loc:"Troy, NY", rank:49, accept:40.0, tuition:59574, enroll:7900, tier:2, majors:["CS","Mechanical Engineering","Business","Architecture"], color:"#D6002A" },
  { id:"lehigh", name:"Lehigh University", short:"Lehigh", loc:"Bethlehem, PA", rank:46, accept:38.0, tuition:57870, enroll:7048, tier:2, majors:["Finance","Engineering","CS","Business"], color:"#653A0E" },
  { id:"fordham", name:"Fordham University", short:"Fordham", loc:"New York City, NY", rank:66, accept:47.0, tuition:55765, enroll:15763, tier:2, majors:["Finance","Communications","Political Science","Pre-Law"], color:"#6E2137" },
  { id:"drexel", name:"Drexel University", short:"Drexel", loc:"Philadelphia, PA", rank:93, accept:71.0, tuition:55996, enroll:23817, tier:3, majors:["Engineering","CS","Business","Design"], color:"#07294D" },
  { id:"stevens", name:"Stevens Institute of Technology", short:"Stevens", loc:"Hoboken, NJ", rank:66, accept:32.0, tuition:55918, enroll:7958, tier:2, majors:["Engineering","CS","Business","Finance"], color:"#A8232C" },
  { id:"illinois-tech", name:"Illinois Institute of Technology", short:"Illinois Tech", loc:"Chicago, IL", rank:148, accept:42.0, tuition:48390, enroll:7761, tier:3, majors:["CS","Engineering","Architecture","Business"], color:"#C60016" },
  { id:"syracuse", name:"Syracuse University", short:"Syracuse", loc:"Syracuse, NY", rank:58, accept:55.0, tuition:57849, enroll:22698, tier:2, majors:["Communications (Newhouse)","Engineering","Business","Architecture"], color:"#F76900" },
  { id:"american-u", name:"American University", short:"American", loc:"Washington, DC", rank:66, accept:33.0, tuition:52316, enroll:14174, tier:2, majors:["International Studies","Political Science","Communications","Business"], color:"#003087" },
  { id:"gwu", name:"George Washington University", short:"GWU", loc:"Washington, DC", rank:63, accept:39.0, tuition:57975, enroll:27161, tier:2, majors:["Political Science","International Affairs","Business","Criminal Justice"], color:"#033C5A" },
  { id:"loyola-chicago", name:"Loyola University Chicago", short:"Loyola Chicago", loc:"Chicago, IL", rank:100, accept:65.0, tuition:48910, enroll:17089, tier:3, majors:["Biology","Business","Psychology","Nursing"], color:"#862633" },
  { id:"gonzaga", name:"Gonzaga University", short:"Gonzaga", loc:"Spokane, WA", rank:83, accept:67.0, tuition:50190, enroll:9297, tier:3, majors:["Business","Engineering","Biology","Psychology"], color:"#041E42" },
  { id:"xavier", name:"Xavier University", short:"Xavier", loc:"Cincinnati, OH", rank:105, accept:73.0, tuition:44620, enroll:6973, tier:3, majors:["Business","Pre-Med","Communications","Criminal Justice"], color:"#002366" },
  { id:"butler", name:"Butler University", short:"Butler", loc:"Indianapolis, IN", rank:76, accept:74.0, tuition:44230, enroll:5151, tier:3, majors:["Business","Pharmacy","Education","Arts"], color:"#13294B" },
  { id:"creighton", name:"Creighton University", short:"Creighton", loc:"Omaha, NE", rank:73, accept:72.0, tuition:44694, enroll:9108, tier:3, majors:["Pre-Med","Business","Nursing","Psychology"], color:"#00457C" },
  { id:"marquette", name:"Marquette University", short:"Marquette", loc:"Milwaukee, WI", rank:83, accept:77.0, tuition:43576, enroll:11631, tier:3, majors:["Engineering","Business","Communications","Nursing"], color:"#003082" },
  { id:"saint-louis", name:"Saint Louis University", short:"SLU", loc:"St. Louis, MO", rank:93, accept:54.0, tuition:47220, enroll:14052, tier:3, majors:["Pre-Med","Business","Aviation","Nursing"], color:"#003187" },
  { id:"santa-clara", name:"Santa Clara University", short:"Santa Clara", loc:"Santa Clara, CA", rank:52, accept:51.0, tuition:56811, enroll:9239, tier:2, majors:["Business (Leavey)","Engineering","CS","Pre-Law"], color:"#862633" },
  { id:"depaul", name:"DePaul University", short:"DePaul", loc:"Chicago, IL", rank:131, accept:59.0, tuition:41130, enroll:22709, tier:3, majors:["CS","Business","Communications","Theatre"], color:"#005EB8" },
  { id:"seton-hall", name:"Seton Hall University", short:"Seton Hall", loc:"South Orange, NJ", rank:148, accept:71.0, tuition:42936, enroll:10020, tier:3, majors:["Business","Nursing","Political Science","Pre-Med"], color:"#003087" },
  { id:"villanova", name:"Villanova University", short:"Villanova", loc:"Villanova, PA", rank:46, accept:28.0, tuition:59268, enroll:11018, tier:2, majors:["Finance","Nursing","CS","Pre-Med"], color:"#003087" },
  { id:"fairfield", name:"Fairfield University", short:"Fairfield", loc:"Fairfield, CT", rank:80, accept:57.0, tuition:52440, enroll:5428, tier:2, majors:["Business","Nursing","Psychology","Communications"], color:"#990000" },
  { id:"bentley", name:"Bentley University", short:"Bentley", loc:"Waltham, MA", rank:100, accept:42.0, tuition:52850, enroll:5710, tier:2, majors:["Finance","Accounting","Marketing","Business Analytics"], color:"#003D79" },
  { id:"babson", name:"Babson College", short:"Babson", loc:"Babson Park, MA", rank:80, accept:22.0, tuition:55432, enroll:2378, tier:2, majors:["Entrepreneurship","Finance","Business Analytics","Marketing"], color:"#00543C" },
  { id:"bryant", name:"Bryant University", short:"Bryant", loc:"Smithfield, RI", rank:180, accept:72.0, tuition:45150, enroll:3734, tier:3, majors:["Finance","Accounting","Marketing","Business Analytics"], color:"#000000" },
  { id:"tcu", name:"Texas Christian University", short:"TCU", loc:"Fort Worth, TX", rank:73, accept:38.0, tuition:52490, enroll:11344, tier:2, majors:["Business","Communications","Pre-Med","Education"], color:"#4D1979" },
  { id:"baylor", name:"Baylor University", short:"Baylor", loc:"Waco, TX", rank:76, accept:37.0, tuition:47364, enroll:20626, tier:2, majors:["Business","Engineering","Pre-Med","Pre-Law"], color:"#154734" },
  { id:"university-of-miami", name:"University of Miami", short:"UM", loc:"Coral Gables, FL", rank:55, accept:27.0, tuition:57114, enroll:19401, tier:2, majors:["Business","Marine Science","Pre-Med","Film"], color:"#005030" },
  { id:"pepperdine", name:"Pepperdine University", short:"Pepperdine", loc:"Malibu, CA", rank:66, accept:35.0, tuition:60650, enroll:10031, tier:2, majors:["Business","Communications","Psychology","Pre-Law"], color:"#00205B" },
  { id:"tulsa", name:"University of Tulsa", short:"TU", loc:"Tulsa, OK", rank:73, accept:36.0, tuition:45120, enroll:4213, tier:2, majors:["CS","Engineering","Business","Accounting"], color:"#002D72" },
  { id:"lehigh-u", name:"Lehigh University", short:"Lehigh", loc:"Bethlehem, PA", rank:46, accept:38.0, tuition:57870, enroll:7048, tier:2, majors:["Finance","Engineering","CS","Business"], color:"#653A0E" },
  { id:"quinnipiac", name:"Quinnipiac University", short:"Quinnipiac", loc:"Hamden, CT", rank:175, accept:78.0, tuition:46460, enroll:10034, tier:3, majors:["Business","Nursing","Communications","Pre-Law"], color:"#003087" },
  { id:"elon", name:"Elon University", short:"Elon", loc:"Elon, NC", rank:76, accept:72.0, tuition:36800, enroll:7098, tier:3, majors:["Business","Communications","Education","Psychology"], color:"#870F22" },
  { id:"rollins", name:"Rollins College", short:"Rollins", loc:"Winter Park, FL", rank:80, accept:60.0, tuition:52150, enroll:3282, tier:2, majors:["Business","Psychology","International Business","Economics"], color:"#003087" },
  { id:"stetson", name:"Stetson University", short:"Stetson", loc:"DeLand, FL", rank:150, accept:70.0, tuition:43874, enroll:4205, tier:3, majors:["Business","Pre-Law","Education","Psychology"], color:"#006747" },
  { id:"samford", name:"Samford University", short:"Samford", loc:"Birmingham, AL", rank:180, accept:64.0, tuition:30450, enroll:5735, tier:3, majors:["Nursing","Business","Pre-Med","Education"], color:"#003087" },

  // ═══════════════════════════════════════════
  // US TIER 2 PUBLIC UNIVERSITIES
  // ═══════════════════════════════════════════
  { id:"ohio-state", name:"Ohio State University", short:"Ohio State", loc:"Columbus, OH", pub:true, rank:176, accept:53.0, tuition:32061, enroll:60389, tier:2, majors:["Business","Engineering","CS","Pre-Med"], color:"#BB0000" },
  { id:"purdue", name:"Purdue University", short:"Purdue", loc:"West Lafayette, IN", pub:true, rank:105, accept:67.0, tuition:28794, enroll:50307, tier:2, majors:["Engineering","CS","Agriculture","Business"], color:"#CFB991" },
  { id:"indiana", name:"Indiana University Bloomington", short:"IU", loc:"Bloomington, IN", pub:true, rank:148, accept:80.0, tuition:37970, enroll:47005, tier:3, majors:["Business (Kelley)","Media","Informatics","Education"], color:"#990000" },
  { id:"iowa", name:"University of Iowa", short:"Iowa", loc:"Iowa City, IA", pub:true, rank:148, accept:83.0, tuition:31569, enroll:31656, tier:3, majors:["Business","Pre-Med","Law","Education"], color:"#FFCD00" },
  { id:"minnesota", name:"University of Minnesota-Twin Cities", short:"Minnesota", loc:"Minneapolis, MN", pub:true, rank:167, accept:57.0, tuition:31680, enroll:54955, tier:2, majors:["Engineering","Business","CS","Pre-Med"], color:"#7A0019" },
  { id:"nebraska", name:"University of Nebraska-Lincoln", short:"Nebraska", loc:"Lincoln, NE", pub:true, rank:200, accept:79.0, tuition:24078, enroll:25897, tier:3, majors:["Engineering","Business","Agriculture","Education"], color:"#E41C38" },
  { id:"rutgers", name:"Rutgers University-New Brunswick", short:"Rutgers", loc:"New Brunswick, NJ", pub:true, rank:125, accept:66.0, tuition:33006, enroll:50254, tier:2, majors:["CS","Business","Engineering","Pharmacy"], color:"#CC0033" },
  { id:"maryland", name:"University of Maryland", short:"Maryland", loc:"College Park, MD", pub:true, rank:58, accept:47.0, tuition:39387, enroll:40521, tier:2, majors:["CS","Engineering","Business","Government"], color:"#E03A3E" },
  { id:"michigan-state", name:"Michigan State University", short:"Michigan State", loc:"East Lansing, MI", pub:true, rank:176, accept:76.0, tuition:30530, enroll:49695, tier:3, majors:["Business","Engineering","Agriculture","Education"], color:"#18453B" },
  { id:"nc-state", name:"North Carolina State University", short:"NC State", loc:"Raleigh, NC", pub:true, rank:148, accept:43.0, tuition:28443, enroll:36479, tier:2, majors:["Engineering","CS","Agriculture","Business"], color:"#CC0000" },
  { id:"virginia-tech", name:"Virginia Tech", short:"Virginia Tech", loc:"Blacksburg, VA", pub:true, rank:148, accept:57.0, tuition:33857, enroll:37972, tier:2, majors:["Engineering","CS","Business","Architecture"], color:"#861F41" },
  { id:"florida-state", name:"Florida State University", short:"FSU", loc:"Tallahassee, FL", pub:true, rank:148, accept:25.0, tuition:21683, enroll:43910, tier:2, majors:["Business","Pre-Med","Communications","Psychology"], color:"#782F40" },
  { id:"clemson", name:"Clemson University", short:"Clemson", loc:"Clemson, SC", pub:true, rank:148, accept:47.0, tuition:39766, enroll:27091, tier:2, majors:["Engineering","Business","Agriculture","Education"], color:"#F66733" },
  { id:"auburn", name:"Auburn University", short:"Auburn", loc:"Auburn, AL", pub:true, rank:200, accept:78.0, tuition:31690, enroll:32776, tier:3, majors:["Engineering","Business","Agriculture","Education"], color:"#0C2340" },
  { id:"tennessee", name:"University of Tennessee", short:"Tennessee", loc:"Knoxville, TN", pub:true, rank:200, accept:74.0, tuition:31028, enroll:30015, tier:3, majors:["Business","Engineering","Agriculture","Communications"], color:"#FF8200" },
  { id:"alabama", name:"University of Alabama", short:"Alabama", loc:"Tuscaloosa, AL", pub:true, rank:200, accept:80.0, tuition:31460, enroll:38652, tier:3, majors:["Business","Nursing","Engineering","Communications"], color:"#9E1B32" },
  { id:"arizona-state", name:"Arizona State University", short:"ASU", loc:"Tempe, AZ", pub:true, rank:176, accept:88.0, tuition:30858, enroll:83000, tier:3, majors:["Business","Engineering","Journalism","CS"], color:"#8C1D40" },
  { id:"colorado", name:"University of Colorado Boulder", short:"CU Boulder", loc:"Boulder, CO", pub:true, rank:148, accept:82.0, tuition:38052, enroll:37871, tier:3, majors:["Engineering","Business","Environmental Science","CS"], color:"#CFB87C" },
  { id:"utah", name:"University of Utah", short:"Utah", loc:"Salt Lake City, UT", pub:true, rank:200, accept:79.0, tuition:27396, enroll:32852, tier:3, majors:["Business","Engineering","Pre-Med","CS"], color:"#CC0000" },
  { id:"oregon", name:"University of Oregon", short:"Oregon", loc:"Eugene, OR", pub:true, rank:200, accept:82.0, tuition:38280, enroll:22636, tier:3, majors:["Business (Lundquist)","Journalism","Psychology","Education"], color:"#007030" },
  { id:"arizona", name:"University of Arizona", short:"Arizona", loc:"Tucson, AZ", pub:true, rank:200, accept:84.0, tuition:37000, enroll:51504, tier:3, majors:["Engineering","Business","Pre-Med","Communications"], color:"#AB0520" },
  { id:"kentucky", name:"University of Kentucky", short:"Kentucky", loc:"Lexington, KY", pub:true, rank:200, accept:96.0, tuition:30956, enroll:30001, tier:3, majors:["Business","Engineering","Agriculture","Nursing"], color:"#0033A0" },
  { id:"missouri", name:"University of Missouri", short:"Mizzou", loc:"Columbia, MO", pub:true, rank:200, accept:77.0, tuition:30067, enroll:30870, tier:3, majors:["Journalism","Business","Engineering","Agriculture"], color:"#F1B82D" },
  { id:"south-carolina", name:"University of South Carolina", short:"South Carolina", loc:"Columbia, SC", pub:true, rank:200, accept:57.0, tuition:33928, enroll:35364, tier:3, majors:["Business (Moore)","Journalism","Engineering","Pre-Med"], color:"#73000A" },
  { id:"texas-am", name:"Texas A&M University", short:"Texas A&M", loc:"College Station, TX", pub:true, rank:176, accept:63.0, tuition:40336, enroll:74000, tier:2, majors:["Engineering","Business","Agriculture","CS"], color:"#500000" },
  { id:"arkansas", name:"University of Arkansas", short:"Arkansas", loc:"Fayetteville, AR", pub:true, rank:200, accept:70.0, tuition:26704, enroll:28081, tier:3, majors:["Business (Walton)","Engineering","Agriculture","Education"], color:"#9D2235" },
  { id:"lsu", name:"Louisiana State University", short:"LSU", loc:"Baton Rouge, LA", pub:true, rank:200, accept:71.0, tuition:29548, enroll:34128, tier:3, majors:["Business","Engineering","Agriculture","Pre-Med"], color:"#461D7C" },
  { id:"oklahoma", name:"University of Oklahoma", short:"Oklahoma", loc:"Norman, OK", pub:true, rank:200, accept:79.0, tuition:27218, enroll:26714, tier:3, majors:["Business","Engineering","Journalism","Pre-Med"], color:"#841617" },
  { id:"iowa-state", name:"Iowa State University", short:"Iowa State", loc:"Ames, IA", pub:true, rank:200, accept:91.0, tuition:22682, enroll:30671, tier:3, majors:["Engineering","Business","Agriculture","CS"], color:"#C8102E" },
  { id:"kansas", name:"University of Kansas", short:"Kansas", loc:"Lawrence, KS", pub:true, rank:200, accept:93.0, tuition:27474, enroll:27798, tier:3, majors:["Business","Engineering","Pre-Med","Education"], color:"#0051A5" },
  { id:"west-virginia", name:"West Virginia University", short:"WVU", loc:"Morgantown, WV", pub:true, rank:200, accept:75.0, tuition:27274, enroll:26376, tier:3, majors:["Business","Engineering","Forensic Science","Education"], color:"#002855" },
  { id:"ole-miss", name:"University of Mississippi", short:"Ole Miss", loc:"Oxford, MS", pub:true, rank:200, accept:98.0, tuition:27162, enroll:22476, tier:4, majors:["Business","Journalism","Pre-Law","Education"], color:"#C0003C" },
  { id:"mississippi-state", name:"Mississippi State University", short:"Mississippi State", loc:"Starkville, MS", pub:true, rank:200, accept:64.0, tuition:23810, enroll:23632, tier:4, majors:["Engineering","Business","Agriculture","Education"], color:"#660000" },
  { id:"houston", name:"University of Houston", short:"Houston", loc:"Houston, TX", pub:true, rank:200, accept:65.0, tuition:22682, enroll:46700, tier:3, majors:["Business","Engineering","Pre-Law","Education"], color:"#CC0000" },
  { id:"pittsburgh", name:"University of Pittsburgh", short:"Pitt", loc:"Pittsburgh, PA", pub:true, rank:100, accept:53.0, tuition:33772, enroll:32600, tier:2, majors:["Business","Engineering","Pre-Med","CS"], color:"#003594" },
  { id:"cincinnati", name:"University of Cincinnati", short:"Cincinnati", loc:"Cincinnati, OH", pub:true, rank:200, accept:76.0, tuition:26646, enroll:48025, tier:3, majors:["Engineering","Business","Design","Nursing"], color:"#E00122" },
  { id:"louisville", name:"University of Louisville", short:"Louisville", loc:"Louisville, KY", pub:true, rank:200, accept:71.0, tuition:27698, enroll:22614, tier:3, majors:["Business","Engineering","Pre-Med","Education"], color:"#AD0000" },
  { id:"uab", name:"University of Alabama at Birmingham", short:"UAB", loc:"Birmingham, AL", pub:true, rank:200, accept:82.0, tuition:24660, enroll:22505, tier:3, majors:["Pre-Med","Nursing","Engineering","Business"], color:"#1E6B52" },
  { id:"south-florida", name:"University of South Florida", short:"USF", loc:"Tampa, FL", pub:true, rank:200, accept:40.0, tuition:17324, enroll:50784, tier:3, majors:["Business","Engineering","Pre-Med","Education"], color:"#006747" },
  { id:"ucf", name:"University of Central Florida", short:"UCF", loc:"Orlando, FL", pub:true, rank:200, accept:41.0, tuition:22467, enroll:71946, tier:3, majors:["Engineering","Business","CS","Hospitality"], color:"#000000" },
  { id:"connecticut", name:"University of Connecticut", short:"UConn", loc:"Storrs, CT", pub:true, rank:63, accept:51.0, tuition:38884, enroll:32257, tier:2, majors:["Business","Engineering","Pre-Med","CS"], color:"#000E2F" },
  { id:"delaware", name:"University of Delaware", short:"Delaware", loc:"Newark, DE", pub:true, rank:148, accept:66.0, tuition:33300, enroll:23000, tier:3, majors:["Business","Engineering","Education","Hospitality"], color:"#00539F" },
  { id:"vermont", name:"University of Vermont", short:"UVM", loc:"Burlington, VT", pub:true, rank:148, accept:66.0, tuition:39048, enroll:13577, tier:3, majors:["Pre-Med","Environmental Science","Business","Nursing"], color:"#006633" },
  { id:"maine", name:"University of Maine", short:"Maine", loc:"Orono, ME", pub:true, rank:200, accept:88.0, tuition:29000, enroll:11500, tier:4, majors:["Engineering","Education","Business","Marine Science"], color:"#003263" },
  { id:"new-hampshire", name:"University of New Hampshire", short:"UNH", loc:"Durham, NH", pub:true, rank:200, accept:73.0, tuition:30696, enroll:14872, tier:3, majors:["Business","Engineering","Education","Liberal Arts"], color:"#003DA5" },
  { id:"rhode-island", name:"University of Rhode Island", short:"URI", loc:"Kingston, RI", pub:true, rank:200, accept:70.0, tuition:29996, enroll:19787, tier:3, majors:["Business","Engineering","Nursing","Education"], color:"#002147" },
  { id:"umass", name:"University of Massachusetts Amherst", short:"UMass", loc:"Amherst, MA", pub:true, rank:148, accept:58.0, tuition:32783, enroll:30037, tier:2, majors:["CS","Business","Engineering","Pre-Med"], color:"#881C1C" },
  { id:"stony-brook", name:"Stony Brook University", short:"Stony Brook", loc:"Stony Brook, NY", pub:true, rank:93, accept:49.0, tuition:27290, enroll:26256, tier:2, majors:["CS","Engineering","Pre-Med","Business"], color:"#CC0000" },
  { id:"buffalo", name:"University at Buffalo", short:"UB", loc:"Buffalo, NY", pub:true, rank:148, accept:57.0, tuition:26204, enroll:31923, tier:2, majors:["Engineering","CS","Business","Pre-Med"], color:"#005BBB" },
  { id:"albany", name:"University at Albany", short:"Albany", loc:"Albany, NY", pub:true, rank:200, accept:52.0, tuition:27022, enroll:17673, tier:3, majors:["CS","Business","Public Policy","Criminal Justice"], color:"#461660" },
  { id:"binghamton", name:"Binghamton University", short:"Binghamton", loc:"Binghamton, NY", pub:true, rank:76, accept:41.0, tuition:26556, enroll:17846, tier:2, majors:["Business","Engineering","CS","Nursing"], color:"#003F72" },
  { id:"cal-poly", name:"California Polytechnic State University", short:"Cal Poly SLO", loc:"San Luis Obispo, CA", pub:true, rank:93, accept:28.0, tuition:21592, enroll:22000, tier:2, majors:["Engineering","Business","Architecture","Agriculture"], color:"#154734" },
  { id:"ucsb", name:"University of California, Santa Barbara", short:"UCSB", loc:"Santa Barbara, CA", pub:true, rank:34, accept:26.0, tuition:44554, enroll:26098, tier:1, majors:["CS","Economics","Biochemistry","Sociology"], color:"#003660", founded:1909, mascot:"Gaucho", motto:"Fiat Lux", conference:"Big West" },
  { id:"uci", name:"University of California, Irvine", short:"UC Irvine", loc:"Irvine, CA", pub:true, rank:39, accept:26.5, tuition:44830, enroll:36908, tier:2, majors:["CS","Biological Sciences","Business","Engineering"], color:"#003B5C", founded:1965, mascot:"Peter the Anteater", motto:"Fiat Lux", conference:"Big West" },
  { id:"ucd", name:"University of California, Davis", short:"UC Davis", loc:"Davis, CA", pub:true, rank:39, accept:37.0, tuition:44066, enroll:39679, tier:2, majors:["Agriculture","Biology","Engineering","Business"], color:"#002855", founded:1908, mascot:"Gunrock the Mustang", motto:"Fiat Lux", conference:"Mountain West" },
  { id:"ucr", name:"University of California, Riverside", short:"UC Riverside", loc:"Riverside, CA", pub:true, rank:200, accept:66.0, tuition:43573, enroll:23278, tier:3, majors:["Business","Biology","CS","Engineering"], color:"#003DA5" },
  { id:"ucsc", name:"University of California, Santa Cruz", short:"UC Santa Cruz", loc:"Santa Cruz, CA", pub:true, rank:200, accept:47.0, tuition:44066, enroll:19161, tier:3, majors:["CS","Biology","Psychology","Economics"], color:"#003C6C" },
  { id:"ucm", name:"University of California, Merced", short:"UC Merced", loc:"Merced, CA", pub:true, rank:300, accept:80.0, tuition:43573, enroll:9000, tier:4, majors:["Engineering","CS","Environmental Science","Biology"], color:"#003B5C" },
  { id:"washington-state", name:"Washington State University", short:"WSU", loc:"Pullman, WA", pub:true, rank:200, accept:73.0, tuition:26908, enroll:31671, tier:3, majors:["Business","Engineering","Agriculture","Veterinary Medicine"], color:"#981E32" },
  { id:"oregon-state", name:"Oregon State University", short:"Oregon State", loc:"Corvallis, OR", pub:true, rank:200, accept:82.0, tuition:32754, enroll:34108, tier:3, majors:["Engineering","Business","Agriculture","Forestry"], color:"#D3471B" },
  { id:"oklahoma-state", name:"Oklahoma State University", short:"Oklahoma State", loc:"Stillwater, OK", pub:true, rank:200, accept:71.0, tuition:25116, enroll:24890, tier:3, majors:["Business","Engineering","Agriculture","Education"], color:"#FF6600" },
  { id:"kansas-state", name:"Kansas State University", short:"K-State", loc:"Manhattan, KS", pub:true, rank:200, accept:95.0, tuition:23612, enroll:22230, tier:4, majors:["Agriculture","Engineering","Business","Education"], color:"#512888" },
  { id:"colorado-state", name:"Colorado State University", short:"CSU", loc:"Fort Collins, CO", pub:true, rank:200, accept:83.0, tuition:29918, enroll:33877, tier:3, majors:["Engineering","Business","Veterinary Medicine","Environmental Science"], color:"#1E4D2B" },
  { id:"utah-state", name:"Utah State University", short:"Utah State", loc:"Logan, UT", pub:true, rank:300, accept:97.0, tuition:23148, enroll:27679, tier:4, majors:["Engineering","Business","Agriculture","Education"], color:"#00285D" },
  { id:"nevada-reno", name:"University of Nevada, Reno", short:"Nevada", loc:"Reno, NV", pub:true, rank:200, accept:85.0, tuition:23084, enroll:21083, tier:3, majors:["Business","Engineering","Nursing","Education"], color:"#003366" },
  { id:"unlv", name:"University of Nevada, Las Vegas", short:"UNLV", loc:"Las Vegas, NV", pub:true, rank:300, accept:84.0, tuition:22596, enroll:30467, tier:4, majors:["Business","Hospitality","Education","CS"], color:"B10202" },
  { id:"hawaii", name:"University of Hawaii at Manoa", short:"Hawaii", loc:"Honolulu, HI", pub:true, rank:200, accept:79.0, tuition:34218, enroll:19000, tier:3, majors:["Marine Science","Business","Education","Pre-Med"], color:"#024731" },
  { id:"new-mexico", name:"University of New Mexico", short:"UNM", loc:"Albuquerque, NM", pub:true, rank:300, accept:71.0, tuition:22360, enroll:22000, tier:4, majors:["Engineering","Business","Education","Pre-Med"], color:"#C41230" },
  { id:"montana", name:"University of Montana", short:"Montana", loc:"Missoula, MT", pub:true, rank:300, accept:95.0, tuition:28082, enroll:9200, tier:4, majors:["Business","Forestry","Pre-Law","Education"], color:"#93218A" },
  { id:"wyoming", name:"University of Wyoming", short:"Wyoming", loc:"Laramie, WY", pub:true, rank:300, accept:96.0, tuition:19200, enroll:12175, tier:4, majors:["Engineering","Business","Agriculture","Education"], color:"#FFC425" },
  { id:"idaho", name:"University of Idaho", short:"Idaho", loc:"Moscow, ID", pub:true, rank:300, accept:77.0, tuition:25100, enroll:11000, tier:4, majors:["Engineering","Agriculture","Business","Education"], color:"#B3A369" },
  { id:"north-dakota", name:"University of North Dakota", short:"UND", loc:"Grand Forks, ND", pub:true, rank:300, accept:80.0, tuition:18078, enroll:14182, tier:4, majors:["Business","Engineering","Aviation","Education"], color:"#00843D" },
  { id:"south-dakota", name:"University of South Dakota", short:"USD", loc:"Vermillion, SD", pub:true, rank:300, accept:92.0, tuition:21710, enroll:9921, tier:4, majors:["Business","Pre-Law","Health Sciences","Education"], color:"#CC0000" },
  { id:"north-dakota-state", name:"North Dakota State University", short:"NDSU", loc:"Fargo, ND", pub:true, rank:300, accept:93.0, tuition:20370, enroll:14302, tier:4, majors:["Engineering","Agriculture","Business","Pharmacy"], color:"#005643" },
  { id:"south-dakota-state", name:"South Dakota State University", short:"SDSU", loc:"Brookings, SD", pub:true, rank:300, accept:90.0, tuition:20700, enroll:12175, tier:4, majors:["Engineering","Agriculture","Nursing","Education"], color:"#0033A0" },
  { id:"alaska", name:"University of Alaska Fairbanks", short:"UAF", loc:"Fairbanks, AK", pub:true, rank:500, accept:78.0, tuition:22336, enroll:8255, tier:4, majors:["Engineering","Business","Environmental Science","Education"], color:"#002D65" },
  { id:"alaska-anchorage", name:"University of Alaska Anchorage", short:"UAA", loc:"Anchorage, AK", pub:true, rank:500, accept:71.0, tuition:21342, enroll:13574, tier:4, majors:["Business","Engineering","Education","Nursing"], color:"#003F72" },
  { id:"boise-state", name:"Boise State University", short:"Boise State", loc:"Boise, ID", pub:true, rank:300, accept:74.0, tuition:24028, enroll:24274, tier:4, majors:["CS","Business","Health Sciences","Education"], color:"#0033A0" },
  { id:"northern-arizona", name:"Northern Arizona University", short:"NAU", loc:"Flagstaff, AZ", pub:true, rank:300, accept:86.0, tuition:28040, enroll:30902, tier:4, majors:["Business","Education","Health Sciences","Engineering"], color:"#003466" },
  { id:"new-mexico-state", name:"New Mexico State University", short:"NMSU", loc:"Las Cruces, NM", pub:true, rank:400, accept:66.0, tuition:22494, enroll:12968, tier:4, majors:["Engineering","Business","Agriculture","Education"], color:"#800000" },
  { id:"sam-houston", name:"Sam Houston State University", short:"SHSU", loc:"Huntsville, TX", pub:true, rank:400, accept:51.0, tuition:18400, enroll:20700, tier:4, majors:["Criminal Justice","Business","Education","Health Sciences"], color:"#E84A27" },
  { id:"texas-state", name:"Texas State University", short:"Texas State", loc:"San Marcos, TX", pub:true, rank:400, accept:81.0, tuition:22656, enroll:38369, tier:4, majors:["Business","Education","Communications","Health Sciences"], color:"#501214" },
  { id:"sjsu", name:"San José State University", short:"SJSU", loc:"San José, CA", pub:true, rank:300, accept:60.0, tuition:21462, enroll:35751, tier:3, majors:["CS","Engineering","Business","Nursing"], color:"#0055A2" },
  { id:"sdsu", name:"San Diego State University", short:"SDSU", loc:"San Diego, CA", pub:true, rank:300, accept:35.0, tuition:20520, enroll:37239, tier:3, majors:["Business","Engineering","Communications","Public Health"], color:"#A6192E" },
  { id:"csulb", name:"California State University, Long Beach", short:"CSULB", loc:"Long Beach, CA", pub:true, rank:400, accept:28.0, tuition:19728, enroll:37099, tier:3, majors:["Business","Engineering","Nursing","Liberal Arts"], color:"#231F20" },
  { id:"csuf", name:"California State University, Fullerton", short:"CSUF", loc:"Fullerton, CA", pub:true, rank:400, accept:45.0, tuition:19524, enroll:41548, tier:4, majors:["Business","Engineering","Education","Communications"], color:"#00274C" },
  { id:"csula", name:"California State University, Los Angeles", short:"CSULA", loc:"Los Angeles, CA", pub:true, rank:500, accept:45.0, tuition:19524, enroll:28000, tier:4, majors:["Business","Engineering","Education","Criminal Justice"], color:"#003DA5" },
  { id:"cal-poly-pomona", name:"Cal Poly Pomona", short:"CPP", loc:"Pomona, CA", pub:true, rank:400, accept:49.0, tuition:18894, enroll:28000, tier:3, majors:["Engineering","Business","Architecture","CS"], color:"#006A4E" },
  { id:"sacstate", name:"Sacramento State University", short:"Sacramento State", loc:"Sacramento, CA", pub:true, rank:500, accept:66.0, tuition:20408, enroll:31000, tier:4, majors:["Business","Education","CS","Nursing"], color:"#043927" },
  { id:"fresno-state", name:"California State University, Fresno", short:"Fresno State", loc:"Fresno, CA", pub:true, rank:500, accept:42.0, tuition:19524, enroll:24476, tier:4, majors:["Agriculture","Business","Engineering","Nursing"], color:"#CC0000" },
  { id:"ohio-u", name:"Ohio University", short:"Ohio University", loc:"Athens, OH", pub:true, rank:300, accept:78.0, tuition:24264, enroll:21543, tier:3, majors:["Journalism","Business","Engineering","Communications"], color:"#00694E" },
  { id:"miami-ohio", name:"Miami University", short:"Miami University", loc:"Oxford, OH", pub:true, rank:148, accept:69.0, tuition:34742, enroll:19619, tier:2, majors:["Business","Education","CS","Engineering"], color:"#C3142D" },
  { id:"kent-state", name:"Kent State University", short:"Kent State", loc:"Kent, OH", pub:true, rank:300, accept:85.0, tuition:21614, enroll:30000, tier:3, majors:["Business","Education","Fashion Design","Nursing"], color:"#002664" },
  { id:"bowling-green", name:"Bowling Green State University", short:"BGSU", loc:"Bowling Green, OH", pub:true, rank:400, accept:74.0, tuition:22102, enroll:18000, tier:3, majors:["Business","Education","Journalism","Criminal Justice"], color:"#4F2D7F" },
  { id:"toledo", name:"University of Toledo", short:"Toledo", loc:"Toledo, OH", pub:true, rank:400, accept:95.0, tuition:21014, enroll:20000, tier:3, majors:["Engineering","Business","Pharmacy","Education"], color:"#00338D" },
  { id:"akron", name:"University of Akron", short:"Akron", loc:"Akron, OH", pub:true, rank:400, accept:99.0, tuition:21388, enroll:19000, tier:4, majors:["Engineering","Business","Education","Nursing"], color:"#00285D" },
  { id:"ball-state", name:"Ball State University", short:"Ball State", loc:"Muncie, IN", pub:true, rank:300, accept:72.0, tuition:22376, enroll:21572, tier:3, majors:["Business","Architecture","Education","CS"], color:"#CC0000" },
  { id:"western-michigan", name:"Western Michigan University", short:"Western Michigan", loc:"Kalamazoo, MI", pub:true, rank:400, accept:83.0, tuition:25540, enroll:20000, tier:3, majors:["Business","Engineering","Education","Aviation"], color:"#6C4023" },
  { id:"central-michigan", name:"Central Michigan University", short:"CMU", loc:"Mount Pleasant, MI", pub:true, rank:400, accept:70.0, tuition:22880, enroll:17000, tier:3, majors:["Business","Education","Health Sciences","CS"], color:"#6A0032" },
  { id:"northern-michigan", name:"Northern Michigan University", short:"NMU", loc:"Marquette, MI", pub:true, rank:500, accept:69.0, tuition:23086, enroll:7700, tier:4, majors:["Business","Education","Criminal Justice","Nursing"], color:"#00543C" },
  { id:"northern-illinois", name:"Northern Illinois University", short:"NIU", loc:"DeKalb, IL", pub:true, rank:400, accept:64.0, tuition:17184, enroll:16000, tier:3, majors:["Business","Engineering","Education","CS"], color:"#CC0000" },
  { id:"western-illinois", name:"Western Illinois University", short:"WIU", loc:"Macomb, IL", pub:true, rank:500, accept:58.0, tuition:18000, enroll:8000, tier:4, majors:["Business","Education","Criminal Justice","Pre-Med"], color:"#603591" },
  { id:"southern-illinois", name:"Southern Illinois University", short:"SIU", loc:"Carbondale, IL", pub:true, rank:400, accept:78.0, tuition:23384, enroll:14000, tier:3, majors:["Engineering","Business","Education","Aviation"], color:"#821019" },
  { id:"illinois-state", name:"Illinois State University", short:"Illinois State", loc:"Normal, IL", pub:true, rank:300, accept:83.0, tuition:22264, enroll:21000, tier:3, majors:["Business","Education","CS","Health Sciences"], color:"#CC0000" },
  { id:"indiana-state", name:"Indiana State University", short:"Indiana State", loc:"Terre Haute, IN", pub:true, rank:400, accept:90.0, tuition:18984, enroll:11000, tier:4, majors:["Education","Business","Nursing","CS"], color:"#005EB8" },
  { id:"purdue-fort-wayne", name:"Purdue University Fort Wayne", short:"PFW", loc:"Fort Wayne, IN", pub:true, rank:500, accept:74.0, tuition:19074, enroll:10000, tier:4, majors:["Engineering","Business","Education","CS"], color:"#C9B058" },
  { id:"wichita-state", name:"Wichita State University", short:"WSU", loc:"Wichita, KS", pub:true, rank:400, accept:93.0, tuition:18670, enroll:15000, tier:4, majors:["Engineering","Business","Education","Aerospace"], color:"#FFCD00" },
  { id:"umkc", name:"University of Missouri-Kansas City", short:"UMKC", loc:"Kansas City, MO", pub:true, rank:400, accept:64.0, tuition:23600, enroll:15000, tier:3, majors:["Business","Law","Pre-Med","Education"], color:"#003DA5" },
  { id:"memphis", name:"University of Memphis", short:"Memphis", loc:"Memphis, TN", pub:true, rank:400, accept:66.0, tuition:22356, enroll:22000, tier:3, majors:["Business","Engineering","Education","Communications"], color:"#003DA5" },
  { id:"middle-tennessee", name:"Middle Tennessee State University", short:"MTSU", loc:"Murfreesboro, TN", pub:true, rank:400, accept:77.0, tuition:22270, enroll:22000, tier:3, majors:["Business","Recording Industry","Education","CS"], color:"#003DA5" },
  { id:"appalachian-state", name:"Appalachian State University", short:"App State", loc:"Boone, NC", pub:true, rank:300, accept:72.0, tuition:22256, enroll:20000, tier:3, majors:["Business","Education","CS","Environmental Science"], color:"#000000" },
  { id:"east-carolina", name:"East Carolina University", short:"ECU", loc:"Greenville, NC", pub:true, rank:400, accept:75.0, tuition:22580, enroll:29000, tier:3, majors:["Business","Nursing","Education","Engineering"], color:"#592A8A" },
  { id:"uncw", name:"University of North Carolina Wilmington", short:"UNCW", loc:"Wilmington, NC", pub:true, rank:300, accept:64.0, tuition:22378, enroll:17900, tier:3, majors:["Business","Marine Science","Education","Nursing"], color:"#00678A" },
  { id:"james-madison", name:"James Madison University", short:"JMU", loc:"Harrisonburg, VA", pub:true, rank:148, accept:74.0, tuition:26272, enroll:22074, tier:3, majors:["Business","Education","CS","Health Sciences"], color:"#450084" },
  { id:"george-mason", name:"George Mason University", short:"George Mason", loc:"Fairfax, VA", pub:true, rank:200, accept:90.0, tuition:35564, enroll:39200, tier:3, majors:["CS","Business","Criminal Justice","Policy"], color:"#006633" },
  { id:"vcu", name:"Virginia Commonwealth University", short:"VCU", loc:"Richmond, VA", pub:true, rank:300, accept:76.0, tuition:28780, enroll:29000, tier:3, majors:["Business","Arts","Health Sciences","Engineering"], color:"#000000" },
  { id:"odu", name:"Old Dominion University", short:"ODU", loc:"Norfolk, VA", pub:true, rank:400, accept:76.0, tuition:25290, enroll:24000, tier:3, majors:["Business","Engineering","Education","CS"], color:"#00507C" },
  { id:"towson", name:"Towson University", short:"Towson", loc:"Towson, MD", pub:true, rank:400, accept:73.0, tuition:23280, enroll:19000, tier:3, majors:["Business","Education","Communications","Nursing"], color:"#F3A014" },
  { id:"umbc", name:"University of Maryland, Baltimore County", short:"UMBC", loc:"Baltimore, MD", pub:true, rank:148, accept:67.0, tuition:28704, enroll:13000, tier:2, majors:["CS","Engineering","Business","Pre-Med"], color:"#000000" },
  { id:"salisbury", name:"Salisbury University", short:"Salisbury", loc:"Salisbury, MD", pub:true, rank:300, accept:65.0, tuition:22046, enroll:8600, tier:3, majors:["Business","Education","Nursing","CS"], color:"C21020" },
  { id:"coppin-state", name:"Coppin State University", short:"Coppin State", loc:"Baltimore, MD", pub:true, rank:500, accept:73.0, tuition:16836, enroll:2700, tier:4, majors:["Nursing","Education","Criminal Justice","Business"], color:"#007030" },
  { id:"fiu", name:"Florida International University", short:"FIU", loc:"Miami, FL", pub:true, rank:200, accept:58.0, tuition:18956, enroll:57000, tier:3, majors:["Business","Engineering","Nursing","International Business"], color:"#081E3F" },
  { id:"fau", name:"Florida Atlantic University", short:"FAU", loc:"Boca Raton, FL", pub:true, rank:300, accept:63.0, tuition:21556, enroll:30000, tier:3, majors:["Business","Engineering","Education","Nursing"], color:"#003DA5" },
  { id:"usf", name:"University of South Florida", short:"USF", loc:"Tampa, FL", pub:true, rank:200, accept:40.0, tuition:17324, enroll:50784, tier:3, majors:["Business","Engineering","Pre-Med","Education"], color:"#006747" },
  { id:"georgia-state", name:"Georgia State University", short:"Georgia State", loc:"Atlanta, GA", pub:true, rank:300, accept:51.0, tuition:24616, enroll:54000, tier:3, majors:["Business","Law","Education","Public Health"], color:"#0039A6" },
  { id:"georgia-southern", name:"Georgia Southern University", short:"Georgia Southern", loc:"Statesboro, GA", pub:true, rank:400, accept:78.0, tuition:21810, enroll:26000, tier:4, majors:["Business","Engineering","Education","Nursing"], color:"#003DA5" },
  { id:"kennesaw-state", name:"Kennesaw State University", short:"KSU", loc:"Kennesaw, GA", pub:true, rank:400, accept:69.0, tuition:22290, enroll:43000, tier:3, majors:["Business","CS","Education","Engineering"], color:"#FFCD00" },
  { id:"uncc", name:"University of North Carolina at Charlotte", short:"UNC Charlotte", loc:"Charlotte, NC", pub:true, rank:300, accept:63.0, tuition:22520, enroll:30000, tier:3, majors:["Business","Engineering","CS","Education"], color:"#046A38" },
  { id:"wcu", name:"Western Carolina University", short:"WCU", loc:"Cullowhee, NC", pub:true, rank:400, accept:69.0, tuition:21590, enroll:12000, tier:3, majors:["Business","Education","Nursing","CS"], color:"#4B214F" },
  { id:"marshall", name:"Marshall University", short:"Marshall", loc:"Huntington, WV", pub:true, rank:400, accept:92.0, tuition:19630, enroll:12000, tier:4, majors:["Business","Engineering","Education","Pre-Med"], color:"#009B77" },
  { id:"western-kentucky", name:"Western Kentucky University", short:"WKU", loc:"Bowling Green, KY", pub:true, rank:400, accept:97.0, tuition:26248, enroll:20000, tier:4, majors:["Business","Education","Communications","Nursing"], color:"#C60C30" },
  { id:"eastern-kentucky", name:"Eastern Kentucky University", short:"EKU", loc:"Richmond, KY", pub:true, rank:500, accept:66.0, tuition:19584, enroll:16000, tier:4, majors:["Education","Criminal Justice","Nursing","Business"], color:"#760000" },
  { id:"morehead-state", name:"Morehead State University", short:"Morehead State", loc:"Morehead, KY", pub:true, rank:600, accept:67.0, tuition:17768, enroll:9000, tier:5, majors:["Education","Business","Nursing","Engineering Technology"], color:"#002D62" },
  { id:"louisiana-tech", name:"Louisiana Tech University", short:"Louisiana Tech", loc:"Ruston, LA", pub:true, rank:300, accept:49.0, tuition:21990, enroll:12000, tier:3, majors:["Engineering","Business","Education","CS"], color:"#003087" },
  { id:"ull", name:"University of Louisiana at Lafayette", short:"UL Lafayette", loc:"Lafayette, LA", pub:true, rank:400, accept:58.0, tuition:22256, enroll:19000, tier:4, majors:["Engineering","Business","Education","Nursing"], color:"#CE181E" },
  { id:"mcneese", name:"McNeese State University", short:"McNeese", loc:"Lake Charles, LA", pub:true, rank:600, accept:63.0, tuition:16972, enroll:7500, tier:4, majors:["Business","Education","Nursing","Engineering Technology"], color:"#003087" },
  { id:"nicholls-state", name:"Nicholls State University", short:"Nicholls", loc:"Thibodaux, LA", pub:true, rank:600, accept:95.0, tuition:18076, enroll:6400, tier:4, majors:["Business","Education","Nursing","Pre-Med"], color:"#CC0000" },
  { id:"se-louisiana", name:"Southeastern Louisiana University", short:"SLU", loc:"Hammond, LA", pub:true, rank:600, accept:74.0, tuition:17948, enroll:14000, tier:4, majors:["Business","Education","Nursing","Pre-Med"], color:"#006C41" },
  { id:"unm", name:"University of New Mexico", short:"UNM", loc:"Albuquerque, NM", pub:true, rank:300, accept:71.0, tuition:22360, enroll:22000, tier:4, majors:["Engineering","Business","Education","Pre-Med"], color:"#C41230" },
  { id:"nmsu", name:"New Mexico State University", short:"NMSU", loc:"Las Cruces, NM", pub:true, rank:400, accept:66.0, tuition:22494, enroll:12968, tier:4, majors:["Engineering","Business","Agriculture","Education"], color:"#800000" },
  { id:"western-new-mexico", name:"Western New Mexico University", short:"WNMU", loc:"Silver City, NM", pub:true, rank:700, accept:100.0, tuition:17490, enroll:3500, tier:5, majors:["Education","Business","Social Work","Nursing"], color:"#8B4726" },
  { id:"eastern-new-mexico", name:"Eastern New Mexico University", short:"ENMU", loc:"Portales, NM", pub:true, rank:600, accept:55.0, tuition:16320, enroll:6000, tier:4, majors:["Business","Education","CS","Liberal Arts"], color:"#003A5D" },
  { id:"utah-valley", name:"Utah Valley University", short:"UVU", loc:"Orem, UT", pub:true, rank:500, accept:100.0, tuition:21108, enroll:41000, tier:4, majors:["Business","CS","Education","Nursing"], color:"#00538A" },
  { id:"weber-state", name:"Weber State University", short:"Weber State", loc:"Ogden, UT", pub:true, rank:500, accept:100.0, tuition:24376, enroll:29000, tier:4, majors:["Business","Education","Health Sciences","CS"], color:"#492F92" },
  { id:"southern-utah", name:"Southern Utah University", short:"SUU", loc:"Cedar City, UT", pub:true, rank:600, accept:83.0, tuition:20688, enroll:14000, tier:4, majors:["Business","Education","CS","Health Sciences"], color:"#CC0000" },
  { id:"idaho-state", name:"Idaho State University", short:"ISU", loc:"Pocatello, ID", pub:true, rank:500, accept:99.0, tuition:22960, enroll:11000, tier:4, majors:["Pre-Med","Business","Engineering","Education"], color:"#F47920" },
  { id:"lewis-clark-state", name:"Lewis-Clark State College", short:"LCSC", loc:"Lewiston, ID", pub:true, rank:700, accept:100.0, tuition:20024, enroll:4000, tier:5, majors:["Business","Education","Nursing","Criminal Justice"], color:"#CC0000" },
  { id:"montana-state", name:"Montana State University", short:"MSU", loc:"Bozeman, MT", pub:true, rank:300, accept:92.0, tuition:27040, enroll:16646, tier:3, majors:["Engineering","Agriculture","Business","Film"], color:"#003DA5" },
  { id:"nd-state", name:"North Dakota State University", short:"NDSU", loc:"Fargo, ND", pub:true, rank:300, accept:93.0, tuition:20370, enroll:14302, tier:4, majors:["Engineering","Agriculture","Business","Pharmacy"], color:"#005643" },
  { id:"jacksonville-state", name:"Jacksonville State University", short:"JSU", loc:"Jacksonville, AL", pub:true, rank:600, accept:70.0, tuition:21490, enroll:8000, tier:4, majors:["Education","Business","Nursing","Criminal Justice"], color:"#CC0000" },
  { id:"troy", name:"Troy University", short:"Troy", loc:"Troy, AL", pub:true, rank:600, accept:61.0, tuition:16530, enroll:15000, tier:4, majors:["Business","Education","Nursing","Criminal Justice"], color:"#8A0000" },
  { id:"alabama-state", name:"Alabama State University", short:"Alabama State", loc:"Montgomery, AL", pub:true, rank:600, accept:93.0, tuition:11068, enroll:4500, tier:5, majors:["Education","Business","Nursing","Social Work"], color:"#003DA5" },
  { id:"alabama-am", name:"Alabama A&M University", short:"Alabama A&M", loc:"Huntsville, AL", pub:true, rank:600, accept:55.0, tuition:12042, enroll:6000, tier:4, majors:["Engineering","Agriculture","Business","Education"], color:"#800000" },

  // ═══════════════════════════════════════════
  // US HBCUs
  // ═══════════════════════════════════════════
  { id:"howard", name:"Howard University", short:"Howard", loc:"Washington, DC", rank:96, accept:35.0, tuition:29864, enroll:10002, tier:2, majors:["Business","Communications","Pre-Med","Law"], color:"#003A63", alumni:["Thurgood Marshall","Kamala Harris","Chadwick Boseman"], summary:"Howard is the crown jewel of HBCUs — a premier research university that has produced Supreme Court Justices, Vice Presidents, and cultural leaders for over 150 years." },
  { id:"morehouse", name:"Morehouse College", short:"Morehouse", loc:"Atlanta, GA", rank:148, accept:58.0, tuition:27296, enroll:2900, tier:2, majors:["Business","Pre-Med","Political Science","Engineering"], color:"#59118E", alumni:["Martin Luther King Jr.","Spike Lee","Samuel L. Jackson"] },
  { id:"spelman", name:"Spelman College", short:"Spelman", loc:"Atlanta, GA", rank:148, accept:38.0, tuition:27337, enroll:2150, tier:2, majors:["Biology","Psychology","Chemistry","English"], color:"003366", alumni:["Stacey Abrams","Esther Rolle"] },
  { id:"hampton", name:"Hampton University", short:"Hampton", loc:"Hampton, VA", rank:200, accept:38.0, tuition:26892, enroll:4066, tier:2, majors:["Business","Nursing","Engineering","Architecture"], color:"013699" },
  { id:"fisk", name:"Fisk University", short:"Fisk", loc:"Nashville, TN", rank:300, accept:32.0, tuition:23590, enroll:900, tier:2, majors:["Biology","Business","Psychology","Chemistry"], color:"003DA5" },
  { id:"tuskegee", name:"Tuskegee University", short:"Tuskegee", loc:"Tuskegee, AL", rank:300, accept:47.0, tuition:22270, enroll:2800, tier:2, majors:["Engineering","Architecture","Pre-Med","Business"], color:"#C41230" },
  { id:"xavier-nola", name:"Xavier University of Louisiana", short:"Xavier NOLA", loc:"New Orleans, LA", rank:300, accept:62.0, tuition:22520, enroll:3500, tier:2, majors:["Biology","Pre-Med","Chemistry","Business"], color:"#009900" },
  { id:"clark-atlanta", name:"Clark Atlanta University", short:"CAU", loc:"Atlanta, GA", rank:400, accept:54.0, tuition:25034, enroll:3800, tier:3, majors:["Business","Communications","Education","Social Work"], color:"CC0000" },
  { id:"meharry", name:"Meharry Medical College", short:"Meharry", loc:"Nashville, TN", rank:300, accept:3.5, tuition:52000, enroll:900, tier:2, majors:["Medicine","Dentistry","Nursing","Public Health"], color:"#8B0000" },
  { id:"north-carolina-at", name:"North Carolina A&T State University", short:"NC A&T", loc:"Greensboro, NC", pub:true, rank:300, accept:58.0, tuition:16450, enroll:13200, tier:3, majors:["Engineering","Business","Agriculture","Education"], color:"#003DA5" },
  { id:"prairie-view", name:"Prairie View A&M University", short:"PVAMU", loc:"Prairie View, TX", pub:true, rank:400, accept:51.0, tuition:11600, enroll:9400, tier:3, majors:["Engineering","Business","Nursing","Education"], color:"#4E2683" },
  { id:"grambling", name:"Grambling State University", short:"Grambling", loc:"Grambling, LA", pub:true, rank:600, accept:71.0, tuition:13726, enroll:5000, tier:4, majors:["Business","Education","Nursing","Criminal Justice"], color:"#000000" },
  { id:"southern-u", name:"Southern University and A&M College", short:"Southern U", loc:"Baton Rouge, LA", pub:true, rank:600, accept:52.0, tuition:11688, enroll:6500, tier:4, majors:["Business","Engineering","Nursing","Education"], color:"#003DA5" },
  { id:"alcorn-state", name:"Alcorn State University", short:"Alcorn State", loc:"Lorman, MS", pub:true, rank:600, accept:24.0, tuition:13614, enroll:3700, tier:4, majors:["Agriculture","Business","Nursing","Education"], color:"#800000" },
  { id:"mississippi-valley", name:"Mississippi Valley State University", short:"MVSU", loc:"Itta Bena, MS", pub:true, rank:700, accept:39.0, tuition:13230, enroll:2200, tier:5, majors:["Business","Education","Computer Science","Criminal Justice"], color:"003366" },
  { id:"bethune-cookman", name:"Bethune-Cookman University", short:"BCU", loc:"Daytona Beach, FL", rank:600, accept:34.0, tuition:17256, enroll:3600, tier:4, majors:["Business","Education","Nursing","Criminal Justice"], color:"#CC0000" },
  { id:"florida-am", name:"Florida A&M University", short:"FAMU", loc:"Tallahassee, FL", pub:true, rank:300, accept:33.0, tuition:17724, enroll:10000, tier:3, majors:["Business","Engineering","Pharmacy","Journalism"], color:"#00A36C" },
  { id:"delaware-state", name:"Delaware State University", short:"Delaware State", loc:"Dover, DE", pub:true, rank:600, accept:51.0, tuition:21534, enroll:5500, tier:4, majors:["Business","Education","Nursing","Engineering"], color:"#003DA5" },
  { id:"lincoln-pa", name:"Lincoln University", short:"Lincoln", loc:"Lincoln University, PA", pub:true, rank:500, accept:66.0, tuition:16616, enroll:2200, tier:4, majors:["Business","Criminal Justice","Psychology","Education"], color:"CC8800" },
  { id:"bowie-state", name:"Bowie State University", short:"Bowie State", loc:"Bowie, MD", pub:true, rank:500, accept:82.0, tuition:19730, enroll:6200, tier:4, majors:["CS","Business","Nursing","Education"], color:"003087" },
  { id:"morgan-state", name:"Morgan State University", short:"Morgan State", loc:"Baltimore, MD", pub:true, rank:400, accept:63.0, tuition:19498, enroll:8000, tier:3, majors:["Engineering","Business","Education","Nursing"], color:"#003DA5" },
  { id:"norfolk-state", name:"Norfolk State University", short:"Norfolk State", loc:"Norfolk, VA", pub:true, rank:500, accept:90.0, tuition:17888, enroll:6500, tier:4, majors:["Business","Nursing","CS","Education"], color:"#006747" },
  { id:"virginia-state", name:"Virginia State University", short:"VSU", loc:"Petersburg, VA", pub:true, rank:600, accept:72.0, tuition:17798, enroll:4800, tier:4, majors:["Business","Agriculture","Computer Science","Education"], color:"#003DA5" },
  { id:"winston-salem-state", name:"Winston-Salem State University", short:"WSSU", loc:"Winston-Salem, NC", pub:true, rank:500, accept:66.0, tuition:15540, enroll:5100, tier:4, majors:["Nursing","Business","CS","Education"], color:"#CC0000" },
  { id:"nc-central", name:"North Carolina Central University", short:"NCCU", loc:"Durham, NC", pub:true, rank:400, accept:55.0, tuition:16290, enroll:8000, tier:3, majors:["Business","Law","Education","CS"], color:"990000" },
  { id:"tennessee-state", name:"Tennessee State University", short:"TSU", loc:"Nashville, TN", pub:true, rank:500, accept:79.0, tuition:25006, enroll:8000, tier:4, majors:["Business","Engineering","Agriculture","Nursing"], color:"#003DA5" },
  { id:"kentucky-state", name:"Kentucky State University", short:"KSU", loc:"Frankfort, KY", pub:true, rank:700, accept:62.0, tuition:17136, enroll:1700, tier:5, majors:["Business","Education","Nursing","CS"], color:"006747" },
  { id:"central-state", name:"Central State University", short:"CSU", loc:"Wilberforce, OH", pub:true, rank:700, accept:40.0, tuition:18030, enroll:1800, tier:5, majors:["Business","Engineering","Agriculture","Education"], color:"#D4A017" },
  { id:"coppin-state-u", name:"Coppin State University", short:"Coppin State", loc:"Baltimore, MD", pub:true, rank:600, accept:73.0, tuition:16836, enroll:2700, tier:4, majors:["Nursing","Education","Criminal Justice","Business"], color:"#007030" },
  { id:"jackson-state", name:"Jackson State University", short:"Jackson State", loc:"Jackson, MS", pub:true, rank:500, accept:35.0, tuition:15226, enroll:7000, tier:4, majors:["Business","Engineering","Education","Nursing"], color:"#00539F" },
  { id:"langston", name:"Langston University", short:"Langston", loc:"Langston, OK", pub:true, rank:700, accept:79.0, tuition:16310, enroll:2800, tier:5, majors:["Business","Education","Health Sciences","Agriculture"], color:"#003DA5" },
  { id:"lincoln-mo", name:"Lincoln University of Missouri", short:"Lincoln MO", loc:"Jefferson City, MO", pub:true, rank:700, accept:58.0, tuition:16728, enroll:3500, tier:5, majors:["Business","Education","CS","Pre-Med"], color:"#003DA5" },
  { id:"west-virginia-state", name:"West Virginia State University", short:"WVSU", loc:"Institute, WV", pub:true, rank:700, accept:100.0, tuition:20236, enroll:3000, tier:5, majors:["Business","Education","CS","Nursing"], color:"#F9A12E" },
  { id:"harris-stowe", name:"Harris-Stowe State University", short:"HSSU", loc:"St. Louis, MO", pub:true, rank:700, accept:80.0, tuition:13578, enroll:1400, tier:5, majors:["Education","Business","CS","Criminal Justice"], color:"#CC0000" },

  // ═══════════════════════════════════════════
  // US SPECIALTY & ART/MUSIC SCHOOLS
  // ═══════════════════════════════════════════
  { id:"juilliard", name:"The Juilliard School", short:"Juilliard", loc:"New York City, NY", rank:1, accept:7.2, tuition:50720, enroll:847, tier:1, majors:["Music Performance","Drama","Dance","Composition"], color:"#003087", summary:"Juilliard is the most prestigious performing arts conservatory in the world. Acceptance is brutally competitive — but graduates define the world's greatest concert halls and Broadway stages." },
  { id:"berklee", name:"Berklee College of Music", short:"Berklee", loc:"Boston, MA", rank:1, accept:49.0, tuition:50730, enroll:6100, tier:2, majors:["Music Production","Performance","Music Business","Songwriting"], color:"#CC0000" },
  { id:"risd", name:"Rhode Island School of Design", short:"RISD", loc:"Providence, RI", rank:1, accept:20.0, tuition:57744, enroll:2477, tier:1, majors:["Industrial Design","Graphic Design","Illustration","Architecture"], color:"#0033A0" },
  { id:"pratt", name:"Pratt Institute", short:"Pratt", loc:"Brooklyn, NY", rank:2, accept:50.0, tuition:54250, enroll:4874, tier:2, majors:["Architecture","Industrial Design","Graphic Design","Fine Arts"], color:"#003087" },
  { id:"parsons", name:"Parsons School of Design", short:"Parsons", loc:"New York City, NY", rank:3, accept:62.0, tuition:52836, enroll:4200, tier:2, majors:["Fashion Design","Graphic Design","Architecture","Interior Design"], color:"#000000" },
  { id:"sva", name:"School of Visual Arts", short:"SVA", loc:"New York City, NY", rank:5, accept:75.0, tuition:42820, enroll:3500, tier:2, majors:["Fine Arts","Graphic Design","Illustration","Photography"], color:"#000000" },
  { id:"art-institute-chicago", name:"School of the Art Institute of Chicago", short:"SAIC", loc:"Chicago, IL", rank:2, accept:84.0, tuition:51126, enroll:3200, tier:2, majors:["Fine Arts","Architecture","Design","Film"], color:"#8B0000" },
  { id:"calarts", name:"California Institute of the Arts", short:"CalArts", loc:"Valencia, CA", rank:2, accept:24.0, tuition:49600, enroll:1536, tier:1, majors:["Film Directing","Fine Arts","Music","Dance"], color:"#CC0000" },
  { id:"usma", name:"United States Military Academy", short:"West Point", loc:"West Point, NY", pub:true, rank:10, accept:9.0, tuition:0, enroll:4589, tier:1, majors:["Engineering","Systems Engineering","Political Science","Economics"], color:"#000000", summary:"West Point graduates are among the most disciplined, mission-oriented leaders in the world. The only tuition is four years of military service commitment after graduation.", founded:1802, mascot:"Black Knights", motto:"Duty, Honor, Country", conference:"Patriot League / FBS Indep" },
  { id:"usna", name:"United States Naval Academy", short:"Annapolis", loc:"Annapolis, MD", pub:true, rank:10, accept:8.5, tuition:0, enroll:4576, tier:1, majors:["Systems Engineering","Naval Architecture","CS","Economics"], color:"#003087", founded:1845, mascot:"Bill the Goat", motto:"Ex scientia tridens", conference:"American Athletic" },
  { id:"usafa", name:"United States Air Force Academy", short:"Air Force Academy", loc:"Colorado Springs, CO", pub:true, rank:10, accept:9.4, tuition:0, enroll:4198, tier:1, majors:["Engineering","CS","Aeronautics","Management"], color:"#003DA5" },
  { id:"uscga", name:"United States Coast Guard Academy", short:"Coast Guard Academy", loc:"New London, CT", pub:true, rank:10, accept:14.0, tuition:0, enroll:1101, tier:1, majors:["Engineering","CS","Marine Science","Management"], color:"#003DA5" },
  { id:"cooper-union", name:"Cooper Union", short:"Cooper Union", loc:"New York City, NY", rank:1, accept:11.0, tuition:44550, enroll:950, tier:1, majors:["Engineering","Architecture","Fine Arts"], color:"#CF152D" },
  { id:"olin", name:"Olin College of Engineering", short:"Olin", loc:"Needham, MA", rank:1, accept:13.0, tuition:56740, enroll:375, tier:1, majors:["Electrical Engineering","Mechanical Engineering","Engineering Design","CS"], color:"#003DA5" },
  { id:"minerva", name:"Minerva University", short:"Minerva", loc:"San Francisco, CA (Global)", cty:"Global", rank:120, accept:2.0, tuition:27000, enroll:600, tier:2, majors:["Business","CS","Natural Sciences","Social Sciences"], color:"#003DA5", founded:2012, mascot:"—", motto:"Achieving Extraordinary", conference:"International (no athletics)" },
  { id:"kettering", name:"Kettering University", short:"Kettering", loc:"Flint, MI", rank:100, accept:84.0, tuition:48500, enroll:2000, tier:2, majors:["Mechanical Engineering","Electrical Engineering","Business","CS"], color:"#FF6B00" },
  { id:"rose-hulman", name:"Rose-Hulman Institute of Technology", short:"Rose-Hulman", loc:"Terre Haute, IN", rank:1, accept:63.0, tuition:53110, enroll:2200, tier:2, majors:["Mechanical Engineering","Electrical Engineering","CS","Chemical Engineering"], color:"#003087" },
  { id:"harvey-mudd-2", name:"Harvey Mudd College", short:"Harvey Mudd", loc:"Claremont, CA", rank:2, accept:9.0, tuition:61717, enroll:902, tier:1, majors:["CS","Engineering","Mathematics","Physics"], color:"#FFB81C" },
  { id:"worcester-poly", name:"Worcester Polytechnic Institute", short:"WPI", loc:"Worcester, MA", rank:55, accept:49.0, tuition:54634, enroll:6869, tier:2, majors:["Mechanical Engineering","CS","Electrical Engineering","Business"], color:"#AC2B37" },
  { id:"clarkson", name:"Clarkson University", short:"Clarkson", loc:"Potsdam, NY", rank:100, accept:72.0, tuition:52790, enroll:4500, tier:2, majors:["Engineering","Business","CS","Pre-Med"], color:"#006133" },
  { id:"unlv-college-hotel", name:"UNLV William F. Harrah College", short:"UNLV Hospitality", loc:"Las Vegas, NV", pub:true, rank:5, accept:84.0, tuition:22596, enroll:3000, tier:3, majors:["Hotel Management","Culinary Arts","Tourism","Event Management"], color:"C10230" },

  // ═══════════════════════════════════════════
  // INTERNATIONAL — UK TOP TIER
  // ═══════════════════════════════════════════
  { id:"oxford", name:"University of Oxford", short:"Oxford", loc:"Oxford, UK", cty:"UK", rank:4, accept:14.5, tuition:42000, enroll:25905, tier:1, majors:["PPE","Law","Medicine","History"], color:"#002147", alumni:["Bill Clinton","Stephen Hawking","Malala Yousafzai","Oscar Wilde"], summary:"The Oxford tutorial system is arguably the most rigorous undergraduate experience anywhere. Built for self-motivated learners who want depth over breadth.", founded:1096, mascot:"—", motto:"Dominus Illuminatio Mea", conference:"BUCS (UK)" },
  { id:"cambridge", name:"University of Cambridge", short:"Cambridge", loc:"Cambridge, UK", cty:"UK", rank:5, accept:13.0, tuition:44000, enroll:24450, tier:1, majors:["Natural Sciences","Mathematics","Engineering","CS"], color:"#A3C1AD", alumni:["Stephen Hawking","Isaac Newton","Charles Darwin","Alan Turing"], summary:"Cambridge vs Oxford mostly comes down to STEM vs. humanities. Cambridge produced Newton and Darwin; its supervision system is as intense as it sounds.", founded:1209, mascot:"—", motto:"Hinc lucem et pocula sacra", conference:"BUCS (UK)" },
  { id:"imperial", name:"Imperial College London", short:"Imperial", loc:"London, UK", cty:"UK", rank:8, accept:14.3, tuition:43000, enroll:19400, tier:1, majors:["Medicine","Engineering","CS","Physics"], color:"#003E74", alumni:["Brian May","H.G. Wells","Alexander Fleming"], summary:"Imperial is London's pure STEM powerhouse. No humanities, no fluff — science from day one. The London engineering and finance network is exceptional.", founded:1907, mascot:"Lion", motto:"Scientia imperii decus et tutamen", conference:"BUCS (UK)" },
  { id:"ucl", name:"University College London", short:"UCL", loc:"London, UK", cty:"UK", rank:9, accept:15.0, tuition:33000, enroll:42000, tier:1, majors:["Medicine","Law","Architecture","Engineering"], color:"#500778", founded:1826, mascot:"—", motto:"Cuncti adsint meritaeque expectent praemia palmae", conference:"BUCS (UK)" },
  { id:"lse", name:"London School of Economics", short:"LSE", loc:"London, UK", cty:"UK", rank:45, accept:9.5, tuition:24000, enroll:11400, tier:1, majors:["Economics","International Relations","Law","Politics"], color:"#CF1F2E", alumni:["George Soros","Mick Jagger","F.A. Hayek"], summary:"LSE is the world's specialist in economics, political science, and social sciences. Its location and alumni network make it the top global gateway for international policy careers.", founded:1895, mascot:"Beaver", motto:"Rerum cognoscere causas", conference:"BUCS (UK)" },
  { id:"edinburgh", name:"University of Edinburgh", short:"Edinburgh", loc:"Edinburgh, UK", cty:"UK", rank:22, accept:36.0, tuition:26000, enroll:36000, tier:1, majors:["Medicine","Law","Business","Arts"], color:"#8B1E3F", founded:1583, mascot:"—", motto:"Nec temere nec timide", conference:"BUCS (UK)" },
  { id:"manchester", name:"University of Manchester", short:"Manchester", loc:"Manchester, UK", cty:"UK", rank:32, accept:50.0, tuition:24000, enroll:40000, tier:2, majors:["Engineering","Business","Medicine","CS"], color:"#660099" },
  { id:"kings-college", name:"King's College London", short:"King's College", loc:"London, UK", cty:"UK", rank:40, accept:39.0, tuition:26000, enroll:33000, tier:2, majors:["Medicine","Law","Dentistry","Business"], color:"#9D2235" },
  { id:"warwick", name:"University of Warwick", short:"Warwick", loc:"Coventry, UK", cty:"UK", rank:67, accept:45.0, tuition:24000, enroll:27000, tier:2, majors:["Business","Economics","Engineering","Mathematics"], color:"#6E3C7A" },
  { id:"bristol", name:"University of Bristol", short:"Bristol", loc:"Bristol, UK", cty:"UK", rank:61, accept:46.0, tuition:24000, enroll:28000, tier:2, majors:["Law","Medicine","Engineering","Economics"], color:"#002147" },
  { id:"durham", name:"Durham University", short:"Durham", loc:"Durham, UK", cty:"UK", rank:82, accept:33.0, tuition:23000, enroll:19000, tier:2, majors:["Business","Law","Economics","Natural Sciences"], color:"#00007F" },
  { id:"exeter", name:"University of Exeter", short:"Exeter", loc:"Exeter, UK", cty:"UK", rank:153, accept:51.0, tuition:23000, enroll:24000, tier:2, majors:["Business","Law","Humanities","Psychology"], color:"#003DA5" },
  { id:"leeds", name:"University of Leeds", short:"Leeds", loc:"Leeds, UK", cty:"UK", rank:86, accept:60.0, tuition:23000, enroll:38000, tier:2, majors:["Engineering","Business","Medicine","Law"], color:"#003DA5" },
  { id:"southampton", name:"University of Southampton", short:"Southampton", loc:"Southampton, UK", cty:"UK", rank:86, accept:55.0, tuition:23000, enroll:27000, tier:2, majors:["Engineering","CS","Medicine","Oceanography"], color:"#003B5C" },
  { id:"nottingham", name:"University of Nottingham", short:"Nottingham", loc:"Nottingham, UK", cty:"UK", rank:99, accept:55.0, tuition:23000, enroll:35000, tier:2, majors:["Engineering","Business","Medicine","Architecture"], color:"#003DA5" },
  { id:"birmingham", name:"University of Birmingham", short:"Birmingham", loc:"Birmingham, UK", cty:"UK", rank:84, accept:58.0, tuition:23000, enroll:35000, tier:2, majors:["Medicine","Business","Engineering","Law"], color:"#003DA5" },
  { id:"glasgow", name:"University of Glasgow", short:"Glasgow", loc:"Glasgow, UK", cty:"UK", rank:73, accept:43.0, tuition:20000, enroll:36000, tier:2, majors:["Medicine","Law","Engineering","Business"], color:"#003DA5" },
  { id:"sheffield", name:"University of Sheffield", short:"Sheffield", loc:"Sheffield, UK", cty:"UK", rank:105, accept:65.0, tuition:23000, enroll:30000, tier:2, majors:["Engineering","Medicine","Business","Architecture"], color:"#990000" },
  { id:"liverpool", name:"University of Liverpool", short:"Liverpool", loc:"Liverpool, UK", cty:"UK", rank:175, accept:70.0, tuition:22000, enroll:22000, tier:2, majors:["Medicine","Engineering","Business","Law"], color:"#00285D" },
  { id:"cardiff", name:"Cardiff University", short:"Cardiff", loc:"Cardiff, Wales, UK", cty:"UK", rank:148, accept:73.0, tuition:22000, enroll:32000, tier:2, majors:["Medicine","Engineering","Law","Business"], color:"#CC0000" },
  { id:"queen-mary", name:"Queen Mary University of London", short:"QMUL", loc:"London, UK", cty:"UK", rank:117, accept:61.0, tuition:22000, enroll:29000, tier:2, majors:["Medicine","Law","Engineering","Business"], color:"#002147" },
  { id:"st-andrews", name:"University of St Andrews", short:"St Andrews", loc:"St Andrews, UK", cty:"UK", rank:100, accept:8.0, tuition:25000, enroll:10000, tier:2, majors:["International Relations","Medicine","Chemistry","Mathematics"], color:"#003DA5" },
  { id:"bath", name:"University of Bath", short:"Bath", loc:"Bath, UK", cty:"UK", rank:148, accept:32.0, tuition:23000, enroll:18000, tier:2, majors:["Engineering","Business","Architecture","CS"], color:"#003DA5" },
  { id:"lancaster", name:"Lancaster University", short:"Lancaster", loc:"Lancaster, UK", cty:"UK", rank:148, accept:50.0, tuition:22000, enroll:15000, tier:2, majors:["Business","Law","Engineering","Medicine"], color:"#CC0000" },
  { id:"leicester", name:"University of Leicester", short:"Leicester", loc:"Leicester, UK", cty:"UK", rank:200, accept:80.0, tuition:21000, enroll:22000, tier:3, majors:["Medicine","Law","Engineering","Business"], color:"#003DA5" },
  { id:"sussex", name:"University of Sussex", short:"Sussex", loc:"Brighton, UK", cty:"UK", rank:200, accept:72.0, tuition:22000, enroll:19000, tier:3, majors:["Media","Psychology","Business","Law"], color:"#003DA5" },
  { id:"reading", name:"University of Reading", short:"Reading", loc:"Reading, UK", cty:"UK", rank:200, accept:80.0, tuition:22000, enroll:19000, tier:3, majors:["Agriculture","Business","Law","Psychology"], color:"#003DA5" },
  { id:"east-anglia", name:"University of East Anglia", short:"UEA", loc:"Norwich, UK", cty:"UK", rank:200, accept:80.0, tuition:21000, enroll:16000, tier:3, majors:["Creative Writing","Environmental Science","Business","Medicine"], color:"#003DA5" },
  { id:"strathclyde", name:"University of Strathclyde", short:"Strathclyde", loc:"Glasgow, UK", cty:"UK", rank:200, accept:68.0, tuition:19000, enroll:23000, tier:3, majors:["Engineering","Business","Education","Law"], color:"#CC0000" },
  { id:"city-london", name:"City, University of London", short:"City London", loc:"London, UK", cty:"UK", rank:300, accept:65.0, tuition:21000, enroll:20000, tier:3, majors:["Business","Law","Engineering","Journalism"], color:"#003DA5" },
  { id:"brunel", name:"Brunel University London", short:"Brunel", loc:"Uxbridge, UK", cty:"UK", rank:300, accept:72.0, tuition:20000, enroll:14000, tier:3, majors:["Engineering","Business","CS","Sports Science"], color:"#003DA5" },
  { id:"surrey", name:"University of Surrey", short:"Surrey", loc:"Guildford, UK", cty:"UK", rank:200, accept:62.0, tuition:21000, enroll:15000, tier:3, majors:["Engineering","Business","Music","Veterinary Medicine"], color:"#8B1E3F" },
  { id:"aston", name:"Aston University", short:"Aston", loc:"Birmingham, UK", cty:"UK", rank:200, accept:65.0, tuition:19000, enroll:15000, tier:3, majors:["Business","Engineering","CS","Pharmacy"], color:"#8B0000" },
  { id:"coventry", name:"Coventry University", short:"Coventry", loc:"Coventry, UK", cty:"UK", rank:400, accept:75.0, tuition:17000, enroll:29000, tier:3, majors:["Engineering","Business","Architecture","CS"], color:"#003DA5" },
  { id:"de-montfort", name:"De Montfort University", short:"DMU", loc:"Leicester, UK", cty:"UK", rank:500, accept:78.0, tuition:16000, enroll:22000, tier:4, majors:["Business","Engineering","Law","Art & Design"], color:"#CC0000" },
  { id:"huddersfield", name:"University of Huddersfield", short:"Huddersfield", loc:"Huddersfield, UK", cty:"UK", rank:500, accept:89.0, tuition:16000, enroll:20000, tier:4, majors:["Business","Engineering","Education","Music"], color:"#003DA5" },
  { id:"northumbria", name:"Northumbria University", short:"Northumbria", loc:"Newcastle, UK", cty:"UK", rank:400, accept:82.0, tuition:17000, enroll:32000, tier:3, majors:["Business","Law","Engineering","Design"], color:"#003DA5" },
  { id:"sunderland", name:"University of Sunderland", short:"Sunderland", loc:"Sunderland, UK", cty:"UK", rank:600, accept:89.0, tuition:15000, enroll:15000, tier:4, majors:["Business","Engineering","Nursing","Media"], color:"#CC0000" },
  { id:"plymouth", name:"University of Plymouth", short:"Plymouth", loc:"Plymouth, UK", cty:"UK", rank:400, accept:82.0, tuition:17000, enroll:18000, tier:3, majors:["Marine Science","Business","Engineering","Education"], color:"#003DA5" },
  { id:"kent", name:"University of Kent", short:"Kent", loc:"Canterbury, UK", cty:"UK", rank:300, accept:83.0, tuition:20000, enroll:20000, tier:3, majors:["Law","Business","CS","Film Studies"], color:"#003DA5" },
  { id:"heriot-watt", name:"Heriot-Watt University", short:"Heriot-Watt", loc:"Edinburgh, UK", cty:"UK", rank:300, accept:55.0, tuition:20000, enroll:18000, tier:3, majors:["Engineering","Business","Architecture","Mathematics"], color:"#003DA5" },
  { id:"aberdeen", name:"University of Aberdeen", short:"Aberdeen", loc:"Aberdeen, UK", cty:"UK", rank:200, accept:70.0, tuition:19000, enroll:16000, tier:3, majors:["Medicine","Law","Engineering","Business"], color:"#003DA5" },
  { id:"dundee", name:"University of Dundee", short:"Dundee", loc:"Dundee, UK", cty:"UK", rank:200, accept:73.0, tuition:19500, enroll:18000, tier:3, majors:["Medicine","Law","Dentistry","CS"], color:"#003DA5" },
  { id:"stirling", name:"University of Stirling", short:"Stirling", loc:"Stirling, UK", cty:"UK", rank:300, accept:75.0, tuition:18000, enroll:15000, tier:3, majors:["Business","Education","Nursing","Environmental Science"], color:"#7C1818" },
  { id:"swansea", name:"Swansea University", short:"Swansea", loc:"Swansea, Wales, UK", cty:"UK", rank:300, accept:81.0, tuition:20000, enroll:22000, tier:3, majors:["Engineering","Business","Medicine","CS"], color:"#CC0000" },
  { id:"queens-belfast", name:"Queen's University Belfast", short:"Queen's Belfast", loc:"Belfast, UK", cty:"UK", rank:200, accept:68.0, tuition:20000, enroll:27000, tier:2, majors:["Medicine","Engineering","Law","Business"], color:"#003DA5" },

  // ═══════════════════════════════════════════
  // INTERNATIONAL — CANADA
  // ═══════════════════════════════════════════
  { id:"toronto", name:"University of Toronto", short:"U of T", loc:"Toronto, Canada", cty:"Canada", rank:21, accept:43.0, tuition:47380, enroll:97000, tier:1, majors:["CS","Life Sciences","Economics","Engineering"], color:"#002A5C", alumni:["Geoffrey Hinton","Margaret Atwood","Malcolm Gladwell"], summary:"U of T is Canada's research giant and home of deep learning. Geoffrey Hinton built the AI revolution here. For AI research, this is a genuine global destination.", founded:1827, mascot:"Varsity Blues", motto:"Velut arbor aevo", conference:"U Sports (Canada)" },
  { id:"mcgill", name:"McGill University", short:"McGill", loc:"Montreal, Canada", cty:"Canada", rank:30, accept:46.0, tuition:22380, enroll:40000, tier:1, majors:["Medicine","Law","Engineering","Business"], color:"#ED1B2F", alumni:["William Shatner","Justin Trudeau","Leonard Cohen (dropped out)"], founded:1821, mascot:"Marty the Martlet", motto:"Grandescunt Aucta Labore", conference:"U Sports (Canada)" },
  { id:"ubc", name:"University of British Columbia", short:"UBC", loc:"Vancouver, Canada", cty:"Canada", rank:34, accept:52.0, tuition:43088, enroll:68000, tier:1, majors:["CS","Business","Engineering","Medicine"], color:"#002145", founded:1908, mascot:"Thunderbird", motto:"Tuum Est", conference:"U Sports (Canada)" },
  { id:"waterloo", name:"University of Waterloo", short:"Waterloo", loc:"Waterloo, Canada", cty:"Canada", rank:112, accept:53.0, tuition:48100, enroll:42000, tier:1, majors:["CS","Engineering","Mathematics","Business"], color:"#FFC72C", summary:"Waterloo's co-op CS program is one of the world's best pathways into big tech. Silicon Valley companies recruit Waterloo grads at a stunning rate given the school's size." },
  { id:"queens", name:"Queen's University", short:"Queen's", loc:"Kingston, Canada", cty:"Canada", rank:200, accept:42.0, tuition:46000, enroll:25000, tier:2, majors:["Commerce","Engineering","Medicine","Law"], color:"#9B1B30" },
  { id:"mcmaster", name:"McMaster University", short:"McMaster", loc:"Hamilton, Canada", cty:"Canada", rank:152, accept:63.0, tuition:34000, enroll:37000, tier:2, majors:["Health Sciences","Engineering","Business","CS"], color:"#7A003C" },
  { id:"alberta", name:"University of Alberta", short:"Alberta", loc:"Edmonton, Canada", cty:"Canada", rank:110, accept:61.0, tuition:31000, enroll:43000, tier:2, majors:["Engineering","Business","Medicine","CS"], color:"#007C41" },
  { id:"ottawa", name:"University of Ottawa", short:"Ottawa", loc:"Ottawa, Canada", cty:"Canada", rank:200, accept:70.0, tuition:27000, enroll:44000, tier:2, majors:["Law","Medicine","Engineering","Business"], color:"#8F001A" },
  { id:"western-ontario", name:"Western University", short:"Western", loc:"London, Canada", cty:"Canada", rank:200, accept:59.0, tuition:35000, enroll:32000, tier:2, majors:["Business (Ivey)","Medicine","Engineering","Law"], color:"#4F2683" },
  { id:"dalhousie", name:"Dalhousie University", short:"Dalhousie", loc:"Halifax, Canada", cty:"Canada", rank:300, accept:57.0, tuition:31000, enroll:21000, tier:2, majors:["Medicine","Law","Engineering","CS"], color:"#00308F" },
  { id:"simon-fraser", name:"Simon Fraser University", short:"SFU", loc:"Burnaby, Canada", cty:"Canada", rank:300, accept:55.0, tuition:26000, enroll:37000, tier:2, majors:["CS","Business","Engineering","Communication"], color:"#CC0000" },
  { id:"laval", name:"Université Laval", short:"Laval", loc:"Quebec City, Canada", cty:"Canada", rank:400, accept:68.0, tuition:15000, enroll:43000, tier:3, majors:["Medicine","Law","Engineering","Business"], color:"#E4002B" },
  { id:"concordia", name:"Concordia University", short:"Concordia", loc:"Montreal, Canada", cty:"Canada", rank:500, accept:70.0, tuition:26000, enroll:51000, tier:3, majors:["Business","Engineering","Fine Arts","Communications"], color:"#912338" },
  { id:"victoria", name:"University of Victoria", short:"UVic", loc:"Victoria, Canada", cty:"Canada", rank:300, accept:75.0, tuition:25000, enroll:23000, tier:3, majors:["Engineering","Business","Law","CS"], color:"#005493" },
  { id:"guelph", name:"University of Guelph", short:"Guelph", loc:"Guelph, Canada", cty:"Canada", rank:400, accept:73.0, tuition:27000, enroll:28000, tier:3, majors:["Agriculture","Veterinary Medicine","Business","Engineering"], color:"#CC0000" },
  { id:"calgary", name:"University of Calgary", short:"Calgary", loc:"Calgary, Canada", cty:"Canada", rank:200, accept:65.0, tuition:28000, enroll:35000, tier:2, majors:["Engineering","Business","Medicine","CS"], color:"#CC0000" },
  { id:"ryerson", name:"Toronto Metropolitan University", short:"TMU", loc:"Toronto, Canada", cty:"Canada", rank:500, accept:70.0, tuition:26000, enroll:46000, tier:3, majors:["Business","Engineering","Journalism","Architecture"], color:"#005EB8" },
  { id:"york-canada", name:"York University", short:"York", loc:"Toronto, Canada", cty:"Canada", rank:500, accept:67.0, tuition:25000, enroll:56000, tier:3, majors:["Business","Law","Engineering","Fine Arts"], color:"#CC0000" },
  { id:"new-brunswick", name:"University of New Brunswick", short:"UNB", loc:"Fredericton, Canada", cty:"Canada", rank:600, accept:78.0, tuition:21000, enroll:13000, tier:4, majors:["Engineering","Business","CS","Education"], color:"#CC0000" },
  { id:"manitoba", name:"University of Manitoba", short:"Manitoba", loc:"Winnipeg, Canada", cty:"Canada", rank:400, accept:73.0, tuition:22000, enroll:30000, tier:3, majors:["Engineering","Business","Medicine","CS"], color:"#DA1F3D" },
  { id:"saskatchewan", name:"University of Saskatchewan", short:"Saskatchewan", loc:"Saskatoon, Canada", cty:"Canada", rank:400, accept:79.0, tuition:22000, enroll:26000, tier:3, majors:["Agriculture","Engineering","Medicine","Business"], color:"#006400" },
  { id:"memorial-nl", name:"Memorial University of Newfoundland", short:"Memorial", loc:"St. John's, Canada", cty:"Canada", rank:600, accept:80.0, tuition:12000, enroll:19000, tier:4, majors:["Engineering","Business","Medicine","Education"], color:"#5A2D82" },
  { id:"acadia", name:"Acadia University", short:"Acadia", loc:"Wolfville, Canada", cty:"Canada", rank:700, accept:75.0, tuition:23000, enroll:3800, tier:3, majors:["Business","CS","Education","Science"], color:"#003DA5" },
  { id:"bishops", name:"Bishop's University", short:"Bishop's", loc:"Sherbrooke, Canada", cty:"Canada", rank:700, accept:80.0, tuition:17000, enroll:2800, tier:3, majors:["Business","Education","Liberal Arts","Science"], color:"#8B2131" },

  // ═══════════════════════════════════════════
  // INTERNATIONAL — AUSTRALIA
  // ═══════════════════════════════════════════
  { id:"melbourne", name:"University of Melbourne", short:"Melbourne", loc:"Melbourne, Australia", cty:"Australia", rank:33, accept:70.0, tuition:37000, enroll:52000, tier:1, majors:["Medicine","Law","Commerce","Engineering"], color:"#003087", summary:"Melbourne is the top Australian university for medicine, law, and research. Strong Asia-Pacific network and exceptional city quality of life.", founded:1853, mascot:"—", motto:"Postera crescam laude", conference:"Australian University Sport" },
  { id:"sydney", name:"University of Sydney", short:"Sydney", loc:"Sydney, Australia", cty:"Australia", rank:19, accept:68.0, tuition:38000, enroll:73000, tier:1, majors:["Medicine","Law","Engineering","Business"], color:"#CC0000", founded:1850, mascot:"—", motto:"Sidere mens eadem mutato", conference:"Australian University Sport" },
  { id:"anu", name:"Australian National University", short:"ANU", loc:"Canberra, Australia", cty:"Australia", rank:30, accept:35.0, tuition:36000, enroll:22000, tier:1, majors:["Policy","Sciences","Engineering","Law"], color:"#003DA5", founded:1946, mascot:"—", motto:"Naturam Primum Cognoscere Rerum", conference:"Australian University Sport" },
  { id:"queensland", name:"University of Queensland", short:"UQ", loc:"Brisbane, Australia", cty:"Australia", rank:47, accept:66.0, tuition:36000, enroll:53000, tier:1, majors:["Medicine","Engineering","Business","Science"], color:"#51247A" },
  { id:"monash", name:"Monash University", short:"Monash", loc:"Melbourne, Australia", cty:"Australia", rank:42, accept:67.0, tuition:35000, enroll:84000, tier:1, majors:["Medicine","Engineering","Business","Law"], color:"#006CAB" },
  { id:"unsw", name:"University of New South Wales", short:"UNSW", loc:"Sydney, Australia", cty:"Australia", rank:19, accept:50.0, tuition:38000, enroll:65000, tier:1, majors:["Engineering","Medicine","Business","Law"], color:"#FFD700" },
  { id:"adelaide", name:"University of Adelaide", short:"Adelaide", loc:"Adelaide, Australia", cty:"Australia", rank:89, accept:60.0, tuition:33000, enroll:30000, tier:2, majors:["Medicine","Engineering","Business","Wine Science"], color:"#005A96" },
  { id:"western-australia", name:"University of Western Australia", short:"UWA", loc:"Perth, Australia", cty:"Australia", rank:90, accept:67.0, tuition:33000, enroll:25000, tier:2, majors:["Medicine","Engineering","Business","Law"], color:"#003DA5" },
  { id:"newcastle-au", name:"University of Newcastle", short:"Newcastle", loc:"Newcastle, Australia", cty:"Australia", rank:200, accept:82.0, tuition:30000, enroll:39000, tier:3, majors:["Engineering","Business","Medicine","Education"], color:"#003DA5" },
  { id:"macquarie", name:"Macquarie University", short:"Macquarie", loc:"Sydney, Australia", cty:"Australia", rank:200, accept:70.0, tuition:35000, enroll:44000, tier:2, majors:["Business","IT","Law","Psychology"], color:"#CF0A2C" },
  { id:"griffith", name:"Griffith University", short:"Griffith", loc:"Brisbane, Australia", cty:"Australia", rank:300, accept:80.0, tuition:29000, enroll:49000, tier:3, majors:["Business","Law","Health Sciences","Education"], color:"#003DA5" },
  { id:"rmit", name:"RMIT University", short:"RMIT", loc:"Melbourne, Australia", cty:"Australia", rank:200, accept:60.0, tuition:31000, enroll:96000, tier:2, majors:["Engineering","Business","Design","CS"], color:"#E7001D" },
  { id:"deakin", name:"Deakin University", short:"Deakin", loc:"Melbourne, Australia", cty:"Australia", rank:300, accept:75.0, tuition:29000, enroll:61000, tier:3, majors:["Business","Education","Health Sciences","CS"], color:"#009B77" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const universities: University[] = ([...raw, ...(extraRaw as any[])] as Raw[]).map(build);