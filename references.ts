// Centralized registry mapping company / accreditor / certification / partnership / conference
// names to their official website (or Wikipedia article when no canonical homepage exists).
// Used by the <Ref> and <RefList> components to render styled external links.

export const REFERENCES: Record<string, string> = {
  // ── Top employers: consulting ──────────────────────────────
  "McKinsey": "https://www.mckinsey.com",
  "McKinsey & Company": "https://www.mckinsey.com",
  "BCG": "https://www.bcg.com",
  "Boston Consulting Group": "https://www.bcg.com",
  "Bain": "https://www.bain.com",
  "Bain & Company": "https://www.bain.com",
  "Deloitte": "https://www.deloitte.com",
  "Accenture": "https://www.accenture.com",
  "PwC": "https://www.pwc.com",
  "EY": "https://www.ey.com",
  "KPMG": "https://kpmg.com",
  "Big 4 Firms": "https://en.wikipedia.org/wiki/Big_Four_accounting_firms",

  // ── Top employers: finance ─────────────────────────────────
  "Goldman Sachs": "https://www.goldmansachs.com",
  "JPMorgan": "https://www.jpmorganchase.com",
  "JPMorgan Chase": "https://www.jpmorganchase.com",
  "Morgan Stanley": "https://www.morganstanley.com",
  "Citi": "https://www.citigroup.com",
  "Citigroup": "https://www.citigroup.com",
  "Bank of America": "https://www.bankofamerica.com",
  "Wells Fargo": "https://www.wellsfargo.com",
  "BlackRock": "https://www.blackrock.com",
  "Blackstone": "https://www.blackstone.com",
  "Citadel": "https://www.citadel.com",

  // ── Top employers: tech ────────────────────────────────────
  "Google": "https://www.google.com",
  "Microsoft": "https://www.microsoft.com",
  "Apple": "https://www.apple.com",
  "Amazon": "https://www.amazon.com",
  "Meta": "https://about.meta.com",
  "Netflix": "https://www.netflix.com",
  "Tesla": "https://www.tesla.com",
  "Rivian": "https://rivian.com",
  "Nvidia": "https://www.nvidia.com",
  "Intel": "https://www.intel.com",
  "Oracle": "https://www.oracle.com",
  "IBM": "https://www.ibm.com",
  "Salesforce": "https://www.salesforce.com",
  "Cisco": "https://www.cisco.com",

  // ── Top employers: industrial / energy / auto / construction ─
  "Ford": "https://www.ford.com",
  "Ford Motor Company": "https://www.ford.com",
  "BMW": "https://www.bmw.com",
  "Cummins": "https://www.cummins.com",
  "NASCAR": "https://www.nascar.com",
  "Penske": "https://www.penske.com",
  "Penske Automotive": "https://www.penskeautomotive.com",
  "Rush Enterprises": "https://www.rushenterprises.com",
  "Carrier": "https://www.carrier.com",
  "Carrier Enterprise": "https://www.carrierenterprise.com",
  "Trane": "https://www.trane.com",
  "Lennox": "https://www.lennox.com",
  "General Motors": "https://www.gm.com",
  "FCA": "https://www.stellantis.com",
  "Bridgestone": "https://www.bridgestone.com",
  "Hendrick Motorsports": "https://www.hendrickmotorsports.com",
  "Hendrick Automotive Group": "https://www.hendrickauto.com",
  "AutoNation": "https://www.autonation.com",
  "Pep Boys": "https://www.pepboys.com",
  "Bosch": "https://www.bosch.com",
  "Anheuser-Busch": "https://www.anheuser-busch.com",
  "Emerson Electric": "https://www.emerson.com",
  "Emerson Climate Tech": "https://climate.emerson.com",
  "Boeing": "https://www.boeing.com",
  "Boeing Defense": "https://www.boeing.com/defense",
  "Williams Companies": "https://www.williams.com",
  "ONEOK": "https://www.oneok.com",
  "Kinder Morgan": "https://www.kindermorgan.com",
  "Sunoco Pipeline": "https://www.energytransfer.com",
  "Eli Lilly": "https://www.lilly.com",
  "Subaru of Indiana": "https://www.subaru-sia.com",
  "Roche Diagnostics": "https://www.roche.com",
  "ExxonMobil": "https://corporate.exxonmobil.com",
  "Shell": "https://www.shell.com",
  "Chevron": "https://www.chevron.com",
  "Chevron Phillips": "https://www.cpchem.com",
  "LyondellBasell": "https://www.lyondellbasell.com",
  "Valero Energy": "https://www.valero.com",
  "Walt Disney World": "https://disneyworld.disney.go.com",
  "Universal Studios": "https://www.universalorlando.com",
  "Marriott": "https://www.marriott.com",
  "AdventHealth": "https://www.adventhealth.com",
  "Con Edison": "https://www.coned.com",
  "Consolidated Edison": "https://www.coned.com",
  "Skanska": "https://www.usa.skanska.com",
  "Turner Construction": "https://www.turnerconstruction.com",
  "Pepper Construction": "https://www.pepperconstruction.com",
  "Power Construction": "https://www.powerconstruction.net",
  "Limbach": "https://www.limbachinc.com",
  "ACCO Brands": "https://www.accobrands.com",
  "Structure Tone": "https://www.structuretone.com",
  "Gilbane Building": "https://www.gilbaneco.com",
  "Aecom": "https://aecom.com",
  "LeChase Construction": "https://www.lechase.com",
  "Welliver": "https://www.welliver.com",
  "EFCO Corp": "https://www.efcocorp.com",
  "Corning Inc": "https://www.corning.com",
  "Delphi Technologies": "https://www.delphi.com",
  "Johnson Controls": "https://www.johnsoncontrols.com",
  "Toyota": "https://www.toyota.com",
  "Cleveland-Cliffs": "https://www.clevelandcliffs.com",
  "Eagle Mine": "https://www.lundinmining.com",
  "Kennecott Upper Michigan": "https://www.riotinto.com",
  "Verso Corporation": "https://www.versoco.com",
  "American Airlines": "https://www.aa.com",
  "Avianca": "https://www.avianca.com",
  "Copa Airlines": "https://www.copaair.com",
  "World Fuel Services": "https://www.wfscorp.com",
  "Bausch + Lomb": "https://www.bausch.com",
  "Optimax": "https://www.optimaxsi.com",
  "II-VI Incorporated": "https://ii-vi.com",
  "Rochester Precision Optics": "https://www.rpoptics.com",
  "Macy's Facilities": "https://www.macysinc.com",
  "Eversource Energy": "https://www.eversource.com",
  "United Illuminating": "https://www.uinet.com",
  "Yale New Haven Health": "https://www.ynhhs.org",
  "Ferguson HVAC": "https://www.ferguson.com",
  "HCA Healthcare": "https://hcahealthcare.com",
  "Dayton Children's Hospital": "https://www.childrensdayton.org",
  "Kettering Health": "https://ketteringhealth.org",
  "Milwaukee Tool": "https://www.milwaukeetool.com",
  "Harley-Davidson": "https://www.harley-davidson.com",
  "Briggs & Stratton": "https://www.briggsandstratton.com",
  "Rockwell Automation": "https://www.rockwellautomation.com",
  "Lambert-St. Louis Airport": "https://www.flystl.com",
  "Enterprise Holdings": "https://www.enterpriseholdings.com",
  "Interlake Steamship": "https://www.interlakesteamship.com",
  "Great Lakes Fleet": "https://www.cn.ca",
  "American Steamship": "https://www.americansteamship.com",
  "US Army Corps of Engineers": "https://www.usace.army.mil",
  "Daimler Truck NA": "https://www.daimlertruck.com",
  "Duke Energy": "https://www.duke-energy.com",
  "Atrium Health": "https://atriumhealth.org",
  "Quality Dealerships Michigan": "https://www.michiganauto.com",
  "MSSC": "https://www.msscusa.org",
  "Port of Houston": "https://porthouston.com",
  "Kirby Corporation": "https://www.kirbycorp.com",
  "MidAmerican Energy": "https://www.midamericanenergy.com",
  "Siemens Gamesa": "https://www.siemensgamesa.com",
  "GE Vernova": "https://www.gevernova.com",
  "Alliant Energy": "https://www.alliantenergy.com",
  "OG&E": "https://www.oge.com",
  "Public Service Company of Oklahoma": "https://www.psoklahoma.com",
  "Cherokee Nation Businesses": "https://cherokeenationbusinesses.com",
  "Caterpillar": "https://www.caterpillar.com",
  "Georgia Power": "https://www.georgiapower.com",
  "Pilgrim's Pride": "https://www.pilgrims.com",
  "Northeast Georgia Medical Center": "https://www.nghs.com",
  "Aldridge Electric": "https://aldridgegroup.com",
  "Intren": "https://intren.com",
  "ComEd": "https://www.comed.com",
  "Rush University Medical Center": "https://www.rush.edu",
  "Penn State Health": "https://www.pennstatehealth.org",
  "Williamsport Bureau of Aviation": "https://www.cityofwilliamsport.org",
  "Kellogg's": "https://www.kelloggs.com",
  "Mack Trucks": "https://www.macktrucks.com",
  "Dormitory Authority of NY": "https://www.dasny.org",
  "NYC School Construction Authority": "https://www.nycsca.org",
  "Dealers Alliance SoCal": "https://www.greaterlosangeles.cars",

  // ── Higher-ed accreditors ──────────────────────────────────
  "ABA": "https://www.americanbar.org/groups/legal_education/",
  "AACSB": "https://www.aacsb.edu",
  "LCME": "https://lcme.org",
  "ACGME": "https://www.acgme.org",
  "NCCER": "https://www.nccer.org",
  "ACCSC": "https://www.accsc.org",
  "ACCJC": "https://accjc.org",
  "Middle States": "https://www.msche.org",
  "SACSCOC": "https://sacscoc.org",
  "Higher Learning Commission": "https://www.hlcommission.org",
  "NEASC": "https://www.neasc.org",
  "WASC": "https://www.wscuc.org",
  "DOL Registered Apprenticeship": "https://www.apprenticeship.gov",

  // ── Trade certifications ───────────────────────────────────
  "ASE": "https://www.ase.com",
  "ASE Master": "https://www.ase.com",
  "EPA": "https://www.epa.gov",
  "EPA 608": "https://www.epa.gov/section608",
  "EPA 609": "https://www.epa.gov/mvac/section-609-technician-training-and-certification-programs",
  "OSHA-10": "https://www.osha.gov/training/outreach",
  "OSHA-30": "https://www.osha.gov/training/outreach",
  "AWS": "https://www.aws.org",
  "AWS D1.1": "https://www.aws.org",
  "API 1104": "https://www.api.org",
  "NATE": "https://www.natex.org",
  "NIMS": "https://www.nims-skills.org",
  "I-CAR": "https://www.i-car.com",
  "FAA A&P": "https://www.faa.gov/mechanics",
  "FAA Part 147": "https://www.faa.gov/mechanics/become/part147",
  "AHA BLS": "https://cpr.heart.org",
  "IBEW Journeyman": "https://www.ibew.org",
  "UA Journeyman": "https://www.ua.org",
  "ASME": "https://www.asme.org",
  "ServSafe": "https://www.servsafe.com",
  "NFPA 70E": "https://www.nfpa.org/70e",
  "GM ASEP": "https://www.gmasep.com",
  "Ford ASSET": "https://corporate.ford.com/operations/training-and-development.html",
  "USCG Third Mate": "https://www.uscg.mil",
  "USCG Engineer": "https://www.uscg.mil",
  "USCG STCW": "https://www.uscg.mil",
  "STCW": "https://www.imo.org",
  "GWO": "https://www.globalwindsafety.org",
  "NY Master Plumber": "https://www1.nyc.gov/site/buildings/index.page",
  "Backflow": "https://www.abpa.org",
  "Medical Gas": "https://www.nfpa.org/99",

  // ── Athletic conferences ───────────────────────────────────
  "Ivy League": "https://ivyleague.com",
  "Big Ten": "https://bigten.org",
  "SEC": "https://www.secsports.com",
  "ACC": "https://theacc.com",
  "Pac-12": "https://pac-12.com",
  "Big 12": "https://big12sports.com",
  "Big East": "https://www.bigeast.com",
  "Patriot League": "https://patriotleague.org",
  "Mountain West": "https://themw.com",
  "Big West": "https://bigwest.org",
  "MAC": "https://getsomemaction.com",
  "MVC": "https://mvc-sports.com",
  "PSAC": "https://psacsports.org",
};

function normalize(s: string): string {
  return s.trim().replace(/[.,;:!?'"]+$/g, "").toLowerCase();
}

const NORMALIZED: Map<string, string> = new Map(
  Object.entries(REFERENCES).map(([k, v]) => [normalize(k), v]),
);

export function lookupReference(name: string): string | undefined {
  if (!name) return undefined;
  return NORMALIZED.get(normalize(name));
}

// ── Inline summary linker ────────────────────────────────────
// Tokenize a free-text string and split it into runs of plain text and
// registered entity matches. Longer names match first so e.g.
// "McKinsey & Company" wins over "McKinsey".
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const KEYS_BY_LENGTH = Object.keys(REFERENCES).sort((a, b) => b.length - a.length);
const TOKEN_REGEX = new RegExp(
  `(?<![A-Za-z0-9])(${KEYS_BY_LENGTH.map(escapeRegex).join("|")})(?![A-Za-z0-9])`,
  "g",
);

export type LinkifyChunk =
  | { kind: "text"; value: string }
  | { kind: "ref"; value: string; href: string };

export function linkifyText(text: string): LinkifyChunk[] {
  if (!text) return [];
  const out: LinkifyChunk[] = [];
  let last = 0;
  TOKEN_REGEX.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = TOKEN_REGEX.exec(text))) {
    if (m.index > last) out.push({ kind: "text", value: text.slice(last, m.index) });
    const matched = m[1];
    const href = REFERENCES[matched] ?? lookupReference(matched);
    if (href) out.push({ kind: "ref", value: matched, href });
    else out.push({ kind: "text", value: matched });
    last = m.index + matched.length;
  }
  if (last < text.length) out.push({ kind: "text", value: text.slice(last) });
  return out;
}
