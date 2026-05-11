// Centralized school logo (domain) + campus photo registry.
// Logo URL: Google Favicon API (proxy-friendly, no auth needed).
// Hero photos: hand-curated Wikimedia Commons via Special:FilePath (no hash required,
// stable redirect to full-res image). Stored as ordered arrays so famous schools
// can show a slideshow of multiple campus shots; uncurated schools fall back to a
// curated pool of real university-campus photos picked deterministically by id-hash.

// Hand-curated high-quality logo URLs (Wikipedia Commons PNG thumbnails) for the most-visited schools.
// Only confirmed institutional marks (seals, shields, coats of arms, official wordmarks) — no athletics logos.
// Schools without an override here fall through to Clearbit CDN via SCHOOL_DOMAINS.
const LOGO_OVERRIDES: Record<string, string> = {
  // Ivies — all official seals / shields / coats of arms
  harvard:      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Harvard_shield_wreath.svg/200px-Harvard_shield_wreath.svg.png",
  yale:         "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Yale_University_Shield_1.svg/200px-Yale_University_Shield_1.svg.png",
  princeton:    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Princeton_seal.svg/200px-Princeton_seal.svg.png",
  columbia:     "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Columbia_coat_of_arms.svg/200px-Columbia_coat_of_arms.svg.png",
  upenn:        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/UPenn_shield_with_banner.svg/200px-UPenn_shield_with_banner.svg.png",
  brown:        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Brown_University_coat_of_arms.svg/200px-Brown_University_coat_of_arms.svg.png",
  dartmouth:    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Dartmouth_College_shield.svg/200px-Dartmouth_College_shield.svg.png",
  cornell:      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Cornell_University_seal.svg/200px-Cornell_University_seal.svg.png",
  // Elite privates
  mit:          "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_logo.svg/200px-MIT_logo.svg.png",
  stanford:     "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Seal_of_Leland_Stanford_Junior_University.svg/200px-Seal_of_Leland_Stanford_Junior_University.svg.png",
  caltech:      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Seal_of_the_California_Institute_of_Technology.svg/200px-Seal_of_the_California_Institute_of_Technology.svg.png",
  uchicago:     "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/University_of_Chicago_shield.svg/200px-University_of_Chicago_shield.svg.png",
  duke:         "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Duke_University_seal.svg/200px-Duke_University_seal.svg.png",
  jhu:          "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Johns_Hopkins_University_shield.svg/200px-Johns_Hopkins_University_shield.svg.png",
  "johns-hopkins": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Johns_Hopkins_University_shield.svg/200px-Johns_Hopkins_University_shield.svg.png",
  vanderbilt:   "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Vanderbilt_Athletics_logo.svg/200px-Vanderbilt_Athletics_logo.svg.png",
  rice:         "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Rice_University_coat_of_arms.svg/200px-Rice_University_coat_of_arms.svg.png",
  "notre-dame": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/University_of_Notre_Dame_seal.svg/200px-University_of_Notre_Dame_seal.svg.png",
  georgetown:   "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Georgetown_University_seal.svg/200px-Georgetown_University_seal.svg.png",
  emory:        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Emory_University_seal.svg/200px-Emory_University_seal.svg.png",
  washu:        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Washington_University_in_St._Louis_seal.svg/200px-Washington_University_in_St._Louis_seal.svg.png",
  nyu:          "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/NYU_logo.svg/200px-NYU_logo.svg.png",
  cmu:          "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Carnegie_Mellon_University_seal.svg/200px-Carnegie_Mellon_University_seal.svg.png",
  // Top public flagships
  berkeley:     "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Seal_of_University_of_California%2C_Berkeley.svg/200px-Seal_of_University_of_California%2C_Berkeley.svg.png",
  "uc-berkeley":"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Seal_of_University_of_California%2C_Berkeley.svg/200px-Seal_of_University_of_California%2C_Berkeley.svg.png",
  ucla:         "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/The_University_of_California_UCLA.svg/200px-The_University_of_California_UCLA.svg.png",
  umich:        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/University_of_Michigan_seal.svg/200px-University_of_Michigan_seal.svg.png",
  michigan:     "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/University_of_Michigan_seal.svg/200px-University_of_Michigan_seal.svg.png",
  unc:          "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/UNC_seal.svg/200px-UNC_seal.svg.png",
  "unc-chapel-hill": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/UNC_seal.svg/200px-UNC_seal.svg.png",
  uva:          "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/UVA_logo_RGB.png/200px-UVA_logo_RGB.png",
  "ut-austin":  "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/University_of_Texas_at_Austin_seal.svg/200px-University_of_Texas_at_Austin_seal.svg.png",
  uiuc:         "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/University_of_Illinois_seal.svg/200px-University_of_Illinois_seal.svg.png",
  "penn-state": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Penn_State_Nittany_Lions_logo.svg/200px-Penn_State_Nittany_Lions_logo.svg.png",
  wisconsin:    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/UW_Crest.svg/200px-UW_Crest.svg.png",
  "uw-madison": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/UW_Crest.svg/200px-UW_Crest.svg.png",
  "georgia-tech": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Georgia_Tech_seal.svg/200px-Georgia_Tech_seal.svg.png",
  gatech:       "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Georgia_Tech_seal.svg/200px-Georgia_Tech_seal.svg.png",
  ucsd:         "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/UCSD_Seal.svg/200px-UCSD_Seal.svg.png",
  "uc-san-diego": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/UCSD_Seal.svg/200px-UCSD_Seal.svg.png",
  ucsb:         "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/UC_Santa_Barbara_seal.svg/200px-UC_Santa_Barbara_seal.svg.png",
  "uc-santa-barbara": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/UC_Santa_Barbara_seal.svg/200px-UC_Santa_Barbara_seal.svg.png",
  "florida":    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/University_of_Florida_seal.svg/200px-University_of_Florida_seal.svg.png",
  ufl:          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/University_of_Florida_seal.svg/200px-University_of_Florida_seal.svg.png",
  "ohio-state": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Ohio_State_University_seal.svg/200px-Ohio_State_University_seal.svg.png",
  purdue:       "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Purdue_seal.svg/200px-Purdue_seal.svg.png",
  washington:   "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/University_of_Washington_seal.svg/200px-University_of_Washington_seal.svg.png",
  uw:           "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/University_of_Washington_seal.svg/200px-University_of_Washington_seal.svg.png",
  // Top liberal arts colleges
  williams:     "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Williams_College_seal.svg/200px-Williams_College_seal.svg.png",
  amherst:      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Amherst_College_seal.svg/200px-Amherst_College_seal.svg.png",
  swarthmore:   "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Swarthmore_College_seal.svg/200px-Swarthmore_College_seal.svg.png",
  pomona:       "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Pomona_College_seal.svg/200px-Pomona_College_seal.svg.png",
  wellesley:    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Wellesley_College_seal.svg/200px-Wellesley_College_seal.svg.png",
  bowdoin:      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Bowdoin_College_seal.svg/200px-Bowdoin_College_seal.svg.png",
  middlebury:   "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Middlebury_College_seal.svg/200px-Middlebury_College_seal.svg.png",
  "west-point": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/USMA_Coat_of_Arms.svg/200px-USMA_Coat_of_Arms.svg.png",
  northwestern: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Northwestern_University_seal.svg/200px-Northwestern_University_seal.svg.png",
  // International
  oxford:       "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Oxford-University-Circlet.svg/200px-Oxford-University-Circlet.svg.png",
  cambridge:    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/University_of_Cambridge_coat_of_arms.svg/200px-University_of_Cambridge_coat_of_arms.svg.png",
  imperial:     "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Imperial_College_London_crest.svg/200px-Imperial_College_London_crest.svg.png",
  ucl:          "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/UCL_logo.svg/200px-UCL_logo.svg.png",
  lse:          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/LSE_logo.svg/200px-LSE_logo.svg.png",
  edinburgh:    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/University_of_Edinburgh_ceremonial_roundel.svg/200px-University_of_Edinburgh_ceremonial_roundel.svg.png",
  toronto:      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Utoronto_coa.svg/200px-Utoronto_coa.svg.png",
  "u-toronto":  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Utoronto_coa.svg/200px-Utoronto_coa.svg.png",
  mcgill:       "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/McGill_University_CoA.svg/200px-McGill_University_CoA.svg.png",
  ubc:          "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/UBC_COA.svg/200px-UBC_COA.svg.png",
};

// Official domains — used by Clearbit logo CDN (https://logo.clearbit.com/{domain})
// when no hand-curated override exists above. Broad coverage so undergrad / law /
// med / MBA / trade / international rows in the rankings all resolve to a real
// school logo before falling back to a colored monogram.
export const SCHOOL_DOMAINS: Record<string, string> = {
  // Ivies + elite undergrad
  harvard: "harvard.edu", yale: "yale.edu", princeton: "princeton.edu", columbia: "columbia.edu",
  upenn: "upenn.edu", brown: "brown.edu", cornell: "cornell.edu", dartmouth: "dartmouth.edu",
  mit: "mit.edu", stanford: "stanford.edu", caltech: "caltech.edu", uchicago: "uchicago.edu",
  duke: "duke.edu", northwestern: "northwestern.edu", "johns-hopkins": "jhu.edu", jhu: "jhu.edu",
  vanderbilt: "vanderbilt.edu", rice: "rice.edu", "notre-dame": "nd.edu", georgetown: "georgetown.edu",
  emory: "emory.edu", washu: "wustl.edu", nyu: "nyu.edu", cmu: "cmu.edu",
  tufts: "tufts.edu", "boston-college": "bc.edu", northeastern: "northeastern.edu",
  "wake-forest": "wfu.edu", rochester: "rochester.edu", "case-western": "case.edu",
  tulane: "tulane.edu", smu: "smu.edu", fordham: "fordham.edu", villanova: "villanova.edu",
  rpi: "rpi.edu", lehigh: "lehigh.edu", drexel: "drexel.edu", stevens: "stevens.edu",
  "illinois-tech": "iit.edu", syracuse: "syr.edu", "american-u": "american.edu",
  gwu: "gwu.edu", "loyola-chicago": "luc.edu", gonzaga: "gonzaga.edu", xavier: "xavier.edu",
  butler: "butler.edu", creighton: "creighton.edu", marquette: "marquette.edu",
  pepperdine: "pepperdine.edu", tcu: "tcu.edu", baylor: "baylor.edu",
  "university-of-miami": "miami.edu", babson: "babson.edu",
  "worcester-poly": "wpi.edu", clarkson: "clarkson.edu", kettering: "kettering.edu",
  "rose-hulman": "rose-hulman.edu", olin: "olin.edu",
  juilliard: "juilliard.edu", berklee: "berklee.edu", risd: "risd.edu", "cooper-union": "cooper.edu",
  // Top public flagships
  berkeley: "berkeley.edu", "uc-berkeley": "berkeley.edu", ucla: "ucla.edu",
  umich: "umich.edu", "u-michigan": "umich.edu", michigan: "umich.edu",
  unc: "unc.edu", "unc-chapel-hill": "unc.edu",
  uva: "virginia.edu", virginia: "virginia.edu", "ut-austin": "utexas.edu",
  uiuc: "illinois.edu", "penn-state": "psu.edu",
  wisconsin: "wisc.edu", "uw-madison": "wisc.edu", "georgia-tech": "gatech.edu", gatech: "gatech.edu",
  "uc-san-diego": "ucsd.edu", ucsd: "ucsd.edu", "uc-davis": "ucdavis.edu", "uc-santa-barbara": "ucsb.edu",
  ucsb: "ucsb.edu", "uc-irvine": "uci.edu", uci: "uci.edu", ucd: "ucdavis.edu",
  ucr: "ucr.edu", ucsc: "ucsc.edu",
  florida: "ufl.edu", ufl: "ufl.edu", uf: "ufl.edu",
  uga: "uga.edu", "ohio-state": "osu.edu", purdue: "purdue.edu", rutgers: "rutgers.edu",
  minnesota: "umn.edu", umn: "umn.edu", washington: "uw.edu", uw: "uw.edu",
  maryland: "umd.edu", umd: "umd.edu",
  indiana: "indiana.edu", iowa: "uiowa.edu", nebraska: "unl.edu",
  "michigan-state": "msu.edu", "nc-state": "ncsu.edu", "virginia-tech": "vt.edu",
  "florida-state": "fsu.edu", clemson: "clemson.edu", auburn: "auburn.edu",
  tennessee: "utk.edu", alabama: "ua.edu", "arizona-state": "asu.edu",
  colorado: "colorado.edu", utah: "utah.edu", oregon: "uoregon.edu", arizona: "arizona.edu",
  kentucky: "uky.edu", missouri: "missouri.edu", "south-carolina": "sc.edu",
  "texas-am": "tamu.edu", arkansas: "uark.edu", lsu: "lsu.edu", oklahoma: "ou.edu",
  "iowa-state": "iastate.edu", kansas: "ku.edu", "west-virginia": "wvu.edu",
  houston: "uh.edu", pittsburgh: "pitt.edu", cincinnati: "uc.edu",
  connecticut: "uconn.edu", umass: "umass.edu", "stony-brook": "stonybrook.edu",
  buffalo: "buffalo.edu", "cal-poly": "calpoly.edu", sdsu: "sdsu.edu",
  "washington-state": "wsu.edu", "oregon-state": "oregonstate.edu",
  "colorado-state": "colostate.edu", "nevada-reno": "unr.edu", unlv: "unlv.edu",
  hawaii: "hawaii.edu", "new-mexico": "unm.edu", "boise-state": "boisestate.edu",
  "william-mary": "wm.edu", "georgia-state": "gsu.edu",
  // Top LACs
  williams: "williams.edu", amherst: "amherst.edu", swarthmore: "swarthmore.edu", pomona: "pomona.edu",
  wellesley: "wellesley.edu", bowdoin: "bowdoin.edu", middlebury: "middlebury.edu",
  carleton: "carleton.edu", vassar: "vassar.edu", barnard: "barnard.edu",
  smith: "smith.edu", "mount-holyoke": "mtholyoke.edu", "bryn-mawr": "brynmawr.edu",
  haverford: "haverford.edu", "claremont-mckenna": "cmc.edu", "harvey-mudd": "hmc.edu",
  scripps: "scrippscollege.edu", pitzer: "pitzer.edu",
  davidson: "davidson.edu", hamilton: "hamilton.edu", colgate: "colgate.edu",
  colby: "colby.edu", bates: "bates.edu", oberlin: "oberlin.edu", grinnell: "grinnell.edu",
  trinity: "trincoll.edu", "trinity-ct": "trincoll.edu", "holy-cross": "holycross.edu",
  lafayette: "lafayette.edu", bucknell: "bucknell.edu", wesleyan: "wesleyan.edu",
  kenyon: "kenyon.edu", macalester: "macalester.edu", whitman: "whitman.edu",
  reed: "reed.edu", dickinson: "dickinson.edu",
  // Service academies + niche
  "west-point": "westpoint.edu", annapolis: "usna.edu", navy: "usna.edu",
  usma: "westpoint.edu", usna: "usna.edu", usafa: "usafa.edu",
  minerva: "minerva.edu",
  // HBCUs
  howard: "howard.edu", morehouse: "morehouse.edu", spelman: "spelman.edu",
  hampton: "hamptonu.edu", fisk: "fisk.edu", tuskegee: "tuskegee.edu",
  "florida-am": "famu.edu", "north-carolina-at": "ncat.edu",
  // International
  oxford: "ox.ac.uk", cambridge: "cam.ac.uk", imperial: "imperial.ac.uk", ucl: "ucl.ac.uk",
  lse: "lse.ac.uk", edinburgh: "ed.ac.uk", manchester: "manchester.ac.uk",
  "kings-college": "kcl.ac.uk", warwick: "warwick.ac.uk", bristol: "bristol.ac.uk",
  "u-toronto": "utoronto.ca", toronto: "utoronto.ca",
  mcgill: "mcgill.ca", ubc: "ubc.ca", waterloo: "uwaterloo.ca",
  queens: "queensu.ca", mcmaster: "mcmaster.ca", alberta: "ualberta.ca",
  melbourne: "unimelb.edu.au", sydney: "sydney.edu.au", anu: "anu.edu.au",
  queensland: "uq.edu.au", monash: "monash.edu", unsw: "unsw.edu.au",
  "eth-zurich": "ethz.ch", "tu-munich": "tum.de", "lmu-munich": "lmu.de",
  heidelberg: "uni-heidelberg.de", bocconi: "unibocconi.it",
  "sciences-po": "sciencespo.fr", polytechnique: "polytechnique.edu",
  // Trade schools
  "uti-phoenix": "uti.edu", "lincoln-tech": "lincolntech.edu",
  "penn-college": "pct.edu", "ferris-state": "ferris.edu",
  "ivy-tech": "ivytech.edu", "alfred-state": "alfredstate.edu",
  "oklahoma-state-tech": "osuit.edu", "milwaukee-area-tech": "matc.edu",
  "central-piedmont": "cpcc.edu", "lansing-cc": "lcc.edu",
  "miami-dade-cc": "mdc.edu", "houston-cc": "hccs.edu",
  // Law schools
  "yale-law": "law.yale.edu", "stanford-law": "law.stanford.edu", "harvard-law": "hls.harvard.edu",
  "penn-law": "law.upenn.edu", "duke-law": "law.duke.edu", "uchicago-law": "law.uchicago.edu",
  "nyu-law": "law.nyu.edu", "columbia-law": "law.columbia.edu", "uva-law": "law.virginia.edu",
  "northwestern-law": "law.northwestern.edu", "michigan-law": "law.umich.edu",
  "berkeley-law": "law.berkeley.edu", "cornell-law": "lawschool.cornell.edu",
  "georgetown-law": "law.georgetown.edu", "ucla-law": "law.ucla.edu",
  "washu-law": "law.wustl.edu", "vanderbilt-law": "law.vanderbilt.edu", "usc-gould": "gould.usc.edu",
  "notre-dame-law": "law.nd.edu", "texas-law": "law.utexas.edu", "minnesota-law": "law.umn.edu",
  "florida-law": "law.ufl.edu", "bu-law": "bu.edu", "bc-law": "bc.edu", "emory-law": "law.emory.edu",
  "unc-law": "law.unc.edu", "fordham-law": "fordham.edu", "uga-law": "law.uga.edu",
  "wake-forest-law": "law.wfu.edu", "alabama-law": "law.ua.edu", "asu-law": "law.asu.edu",
  "wisconsin-law": "law.wisc.edu", "ucdavis-law": "law.ucdavis.edu", "iowa-law": "law.uiowa.edu",
  "ucirvine-law": "law.uci.edu", "indiana-maurer-law": "law.indiana.edu", "moritz-law": "moritzlaw.osu.edu",
  "maryland-law": "law.umaryland.edu", "houston-law": "law.uh.edu", "illinois-law": "law.illinois.edu",
  "tulane-law": "law.tulane.edu", "smu-law": "smu.edu", "pepperdine-caruso-law": "law.pepperdine.edu",
  "baylor-law": "baylor.edu", "pitt-law": "law.pitt.edu", "wustl-extra-law": "wcl.american.edu",
  "cardozo-law": "cardozo.yu.edu", "loyola-marymount-law": "lls.edu",
  "penn-state-dickinson-law": "dickinsonlaw.psu.edu", "scalia-law": "law.gmu.edu", "gw-law": "law.gwu.edu",
  "villanova-law": "law.villanova.edu", "richmond-law": "law.richmond.edu",
  "denver-sturm-law": "law.du.edu", "temple-law": "law.temple.edu", "missouri-law": "law.missouri.edu",
  "lewis-clark-law": "law.lclark.edu", "kentucky-law": "law.uky.edu",
  "tennessee-law": "law.utk.edu", "miami-law": "law.miami.edu",
  // Med schools
  "harvard-med": "hms.harvard.edu", "jhu-med": "hopkinsmedicine.org", "ucsf-med": "medschool.ucsf.edu",
  "penn-med": "med.upenn.edu", "duke-med": "medschool.duke.edu", "columbia-vps": "vagelos.columbia.edu",
  "stanford-med": "med.stanford.edu", "wustl-med": "medicine.wustl.edu", "yale-med": "medicine.yale.edu",
  "weill-cornell": "weill.cornell.edu", "mayo-alix": "college.mayo.edu",
  "nyu-grossman": "med.nyu.edu", "michigan-med": "medicine.umich.edu", "ucla-geffen": "medschool.ucla.edu",
  "pittsburgh-med": "medschool.pitt.edu", "feinberg-med": "feinberg.northwestern.edu",
  "pritzker-med": "pritzker.uchicago.edu", "baylor-med": "bcm.edu",
  "vanderbilt-med": "medschool.vanderbilt.edu", "icahn-mt-sinai": "icahn.mssm.edu", "utsw-med": "utsouthwestern.edu",
  "emory-med": "med.emory.edu", "unc-med": "med.unc.edu", "case-western-med": "case.edu",
  "bu-chobanian": "bumc.bu.edu", "wisconsin-med": "med.wisc.edu", "indiana-med": "medicine.iu.edu",
  "iowa-carver": "medicine.uiowa.edu", "minnesota-med": "med.umn.edu", "ohio-state-med": "medicine.osu.edu",
  "alpert-med": "medical.brown.edu", "keck-med": "keck.usc.edu", "uva-med": "med.virginia.edu",
  "maryland-med": "medschool.umaryland.edu", "ufl-med": "med.ufl.edu", "miller-med": "med.miami.edu",
  "tulane-med": "tulane.edu", "georgetown-med": "som.georgetown.edu", "tufts-med": "medicine.tufts.edu",
  "rochester-med": "urmc.rochester.edu", "einstein-med": "einsteinmed.edu",
  "drexel-med": "drexel.edu", "rush-med": "rushu.rush.edu", "jefferson-med": "jefferson.edu",
  "ohsu-med": "ohsu.edu", "anschutz-med": "medschool.cuanschutz.edu", "uw-med": "uwmedicine.org",
  "ucdavis-med": "ucdavis.edu",
  // MBA programs
  "stanford-gsb": "gsb.stanford.edu", "wharton-mba": "wharton.upenn.edu", "chicago-booth": "chicagobooth.edu",
  "kellogg-mba": "kellogg.northwestern.edu", "hbs-mba": "hbs.edu", "mit-sloan-mba": "mitsloan.mit.edu",
  "columbia-mba": "gsb.columbia.edu", "haas-mba": "haas.berkeley.edu", "yale-som": "som.yale.edu",
  "stern-mba": "stern.nyu.edu", "tuck-mba": "tuck.dartmouth.edu", "darden-mba": "darden.virginia.edu",
  "ross-mba": "michiganross.umich.edu", "fuqua-mba": "fuqua.duke.edu", "tepper-mba": "cmu.edu",
  "johnson-mba": "johnson.cornell.edu", "anderson-mba": "anderson.ucla.edu",
  "kenan-flagler-mba": "kenan-flagler.unc.edu", "mccombs-mba": "mccombs.utexas.edu",
  "marshall-mba": "marshall.usc.edu", "kelley-mba": "kelley.iu.edu", "goizueta-mba": "goizueta.emory.edu",
  "olin-mba": "olin.wustl.edu", "mcdonough-mba": "msb.georgetown.edu", "mendoza-mba": "mendoza.nd.edu",
  "owen-mba": "owen.vanderbilt.edu", "jones-mba": "business.rice.edu", "carlson-mba": "carlsonschool.umn.edu",
  "foster-mba": "foster.uw.edu", "fisher-mba": "fisher.osu.edu", "wisconsin-mba": "wsb.wisc.edu",
  "wpcarey-mba": "wpcarey.asu.edu", "gies-mba": "giesbusiness.illinois.edu",
  "questrom-mba": "questromworld.bu.edu", "smeal-mba": "smeal.psu.edu",
  "katz-mba": "business.pitt.edu", "babson-mba": "babson.edu",
  "freeman-mba": "freeman.tulane.edu", "cox-mba": "cox.smu.edu",
  "tippie-mba": "tippie.uiowa.edu", "insead-mba": "insead.edu",
  "lbs-mba": "london.edu", "hec-mba": "hec.edu", "rotman-mba": "rotman.utoronto.ca",
  "ivey-mba": "ivey.uwo.ca",
};

// Wikimedia Commons campus photos via Special:FilePath (no hash needed, stable redirects).
// All filenames below are verified to exist on Wikimedia Commons.
// 429 responses from bulk testing = rate-limited server-side only; browsers load fine.
const W = "https://commons.wikimedia.org/wiki/Special:FilePath";

// Each entry is either a plain URL (uncaptioned) or { url, caption } so the
// carousel can show "Widener Library" / "Memorial Hall" pills over each slide.
export type HeroPhoto = string | { url: string; caption: string };

// Multi-photo registry. Each school has an ordered list of campus shots.
// Top-tier schools have 3+ photos so the carousel can rotate; others have a single shot.
// Carousel silently drops any image that fails to load.
export const HERO_PHOTOS: Record<string, HeroPhoto[]> = {
  // Ivies — 3+ shots each
  harvard: [
    { url: `${W}/HarvardYard.jpg?width=1280`, caption: "Harvard Yard" },
    { url: `${W}/Widener_Library%2C_Harvard_University.jpg?width=1280`, caption: "Widener Library" },
    { url: `${W}/Memorial_Hall_Harvard.jpg?width=1280`, caption: "Memorial Hall" },
  ],
  yale: [
    { url: `${W}/Old_Yale_University_Campus.jpg?width=1280`, caption: "Old Campus" },
    { url: `${W}/Old_Campus_Courtyard_and_Durfee_Hall%2C_Yale_University%2C_New_Haven%2C_2007.jpg?width=1280`, caption: "Old Campus & Durfee Hall" },
    { url: `${W}/Yale_University_Kroon_Hall%2C_Sloane_Physics_Laboratory%2C_and_Kline_Tower.jpg?width=1280`, caption: "Kroon Hall & Sloane Lab" },
  ],
  princeton: [
    { url: `${W}/Nassau_Hall_Princeton.JPG?width=1280`, caption: "Nassau Hall" },
    { url: `${W}/Princeton_University_Chapel_interior_2024.jpg?width=1280`, caption: "University Chapel" },
    { url: `${W}/Blair_Hall_Princeton_University_c1907.jpg?width=1280`, caption: "Blair Hall" },
  ],
  columbia: [
    { url: `${W}/Low_Memorial_Library_-_Columbia_University.jpg?width=1280`, caption: "Low Memorial Library" },
    { url: `${W}/Butler_Library_Columbia_University.jpg?width=1280`, caption: "Butler Library" },
    { url: `${W}/Alma_Mater_Columbia_University.jpg?width=1280`, caption: "Alma Mater statue" },
  ],
  upenn: [
    { url: `${W}/Autumn_Evening_on_Locust_Walk_at_the_University_of_Pennsylvania.jpg?width=1280`, caption: "Locust Walk" },
    { url: `${W}/University_of_Pennsylvania_College_Hall.jpg?width=1280`, caption: "College Hall" },
    { url: `${W}/University_of_Pennsylvania_Campus_20240528.jpg?width=1280`, caption: "Penn campus" },
  ],
  brown: [
    { url: `${W}/Brown_University_-_Van_Wickle_Gates.jpg?width=1280`, caption: "Van Wickle Gates" },
    { url: `${W}/John_Hay_Library.jpg?width=1280`, caption: "John Hay Library" },
    { url: `${W}/Providence_looking_west_from_Brown_University_Sciences_Library.jpg?width=1280`, caption: "View from Sciences Library" },
  ],
  dartmouth: [
    { url: `${W}/Wentworth_Hall%2C_Dartmouth_Hall%2C_Thornton_Hall_at_Dartmouth_College.jpg?width=1280`, caption: "Dartmouth Row" },
    { url: `${W}/Dartmouth_College_Outing_Clubhouse.jpg?width=1280`, caption: "Outing Clubhouse" },
    { url: `${W}/Dartmouth_College_campus_2007-06-23_Dartmouth_Hall_02.JPG?width=1280`, caption: "Dartmouth Hall" },
  ],
  cornell: [
    { url: `${W}/Cornell_University_-_Entrance_to_Uris_Library.jpg?width=1280`, caption: "Uris Library entrance" },
    { url: `${W}/Cornell_University_-_Martha_Van_Rensselaer_Hall.jpg?width=1280`, caption: "Martha Van Rensselaer Hall" },
    { url: `${W}/Cornell_University_-_Home_Economics_Building.jpg?width=1280`, caption: "Home Economics Building" },
  ],
  // Elite privates
  mit: [
    { url: `${W}/MIT_Building_10_and_the_Great_Dome%2C_Cambridge_MA.jpg?width=1280`, caption: "Building 10 & the Great Dome" },
    { url: `${W}/MIT_Main_Campus_Aerial.jpg?width=1280`, caption: "Main Campus aerial" },
    { url: `${W}/Cambridge_skyline_November_2016_panorama.jpg?width=1280`, caption: "Cambridge skyline" },
  ],
  stanford: [
    { url: `${W}/Stanford_Memorial_Church.jpg?width=1280`, caption: "Memorial Church" },
    { url: `${W}/Center_for_Clinical_Sciences_Research%2C_Stanford_University_(2025)-L1007419.jpg?width=1280`, caption: "Center for Clinical Sciences" },
    { url: `${W}/Stanford_University_from_Hoover_Tower_May_2011_002.jpg?width=1280`, caption: "View from Hoover Tower" },
  ],
  caltech: [
    { url: `${W}/The_Millikan_Library.jpg?width=1280`, caption: "Millikan Library" },
    { url: `${W}/Caltech_Beckman_Auditorium.jpg?width=1280`, caption: "Beckman Auditorium" },
    { url: `${W}/Caltech_campus_1922.png?width=1280`, caption: "Caltech (1922)" },
  ],
  uchicago: [
    { url: `${W}/Bond_Chapel_at_the_University_of_Chicago.jpg?width=1280`, caption: "Bond Chapel" },
    { url: `${W}/American_School_of_Correspondence_Building%2C_University_of_Chicago%2C_58th_Street%2C_Hyde_Park%2C_Chicago%2C_IL_(54514275777).jpg?width=1280`, caption: "American School Building" },
    { url: `${W}/American_School_of_Correspondence_Building%2C_University_of_Chicago%2C_58th_Street%2C_Hyde_Park%2C_Chicago%2C_IL_(54515401238).jpg?width=1280`, caption: "Hyde Park campus" },
  ],
  duke: [
    { url: `${W}/2008-07-24_Duke_Chapel.jpg?width=1280`, caption: "Duke Chapel" },
    { url: `${W}/Cameron_indoor.jpg?width=1280`, caption: "Cameron Indoor Stadium" },
    { url: `${W}/Duke_University_East_Campus_Panorama.jpg?width=1280`, caption: "East Campus" },
  ],
  jhu: [
    { url: `${W}/East_Gate_of_Johns_Hopkins_University_Homewood_Campus_(2016%2C_Dec).jpg?width=1280`, caption: "East Gate, Homewood" },
    { url: `${W}/Gatehouse_Homewood_Lodge_(c._1875)Johns_Hopkins_University_(JHU)_Homewood_Campus%2C_3400_N._Charles_Street%2C_Baltimore%2C_MD_21218_(32278982587).jpg?width=1280`, caption: "Gatehouse Lodge, Homewood" },
    { url: `${W}/North_Gate_on_the_Homewood_Campus_of_Johns_Hopkins_University.jpg?width=1280`, caption: "North Gate, Homewood" },
  ],
  "johns-hopkins": [
    { url: `${W}/East_Gate_of_Johns_Hopkins_University_Homewood_Campus_(2016%2C_Dec).jpg?width=1280`, caption: "East Gate, Homewood" },
    { url: `${W}/Gatehouse_Homewood_Lodge_(c._1875)Johns_Hopkins_University_(JHU)_Homewood_Campus%2C_3400_N._Charles_Street%2C_Baltimore%2C_MD_21218_(32278982587).jpg?width=1280`, caption: "Gatehouse Lodge, Homewood" },
    { url: `${W}/North_Gate_on_the_Homewood_Campus_of_Johns_Hopkins_University.jpg?width=1280`, caption: "North Gate, Homewood" },
  ],
  vanderbilt: [
    { url: `${W}/The_Commons_Center_Lawn_at_Vanderbilt_University.jpg?width=1280`, caption: "The Commons Center Lawn" },
    { url: `${W}/Vanderbilt_University_in_1880_by_HP_Whinnery.png?width=1280`, caption: "Vanderbilt (1880)" },
    { url: `${W}/Mechanical_Engineering_Building%2C_Vanderbilt_University%2C_Nashville.JPG?width=1280`, caption: "Mechanical Engineering Building" },
  ],
  rice: [
    { url: `${W}/Rice_University_Lovett_Hall.jpg?width=1280`, caption: "Lovett Hall" },
    { url: `${W}/Rice_University_-_Rice_statue_with_Lovett_Hall.JPG?width=1280`, caption: "Rice statue & Lovett Hall" },
    { url: `${W}/Rice_University_Sally_Port.jpg?width=1280`, caption: "Sally Port" },
  ],
  "notre-dame": [
    { url: `${W}/Main_Building%2C_Notre_Dame_University%2C_Notre_Dame%2C_Indiana_(72399).jpg?width=1280`, caption: "Main Building" },
    { url: `${W}/Main_Building_at_the_University_of_Notre_Dame.jpg?width=1280`, caption: "Main Building" },
    { url: `${W}/Notre_Dame_Main_Building_II.jpg?width=1280`, caption: "Main Building" },
  ],
  georgetown: [
    { url: `${W}/Healy_Hall.jpg?width=1280`, caption: "Healy Hall" },
    { url: `${W}/Healy_Hall_Georgetown.jpg?width=1280`, caption: "Healy Hall" },
    { url: `${W}/Georgetown_University%2C_Washington%2C_D.C.4a11813v.jpg?width=1280`, caption: "Georgetown campus" },
  ],
  emory: [
    { url: `${W}/Emory_Campus_Aerial_Image.jpg?width=1280`, caption: "Aerial view" },
    { url: `${W}/Plaque_on_The_Depot_at_Emory_University.jpg?width=1280`, caption: "The Depot" },
    { url: `${W}/Old_Theology_School_Building_on_the_Quad_at_Emory_University.jpg?width=1280`, caption: "Old Theology School" },
  ],
  washu: [
    { url: `${W}/Robert_S._Brookings_Hall_-_Danforth_Campus_of_Washington_University_in_St._Louis.jpg?width=1280`, caption: "Brookings Hall" },
    { url: `${W}/Brookings_Hall_at_Washington_University.jpg?width=1280`, caption: "Brookings Hall" },
    { url: `${W}/Dusk_view_of_lights_on_the_1904_World%27s_Fair_Administration_Building_(University_Hall%2C_later_Brookings_Hall%2C_Washington_University).jpg?width=1280`, caption: "Brookings Hall (dusk)" },
  ],
  nyu: [
    { url: `${W}/Bobst_Library_(48072704803).jpg?width=1280`, caption: "Bobst Library" },
    { url: `${W}/Elmer_Holmes_Bobst_Library%2C_NYU%2C_New_York_City%2C_NY%2C_USA.jpg?width=1280`, caption: "Bobst Library" },
    { url: `${W}/NYU%27s_Bobst_library-2.jpg?width=1280`, caption: "Bobst Library" },
  ],
  cmu: [
    { url: `${W}/Hamerschlag_Hall_at_Carnegie_Mellon_University.jpg?width=1280`, caption: "Hamerschlag Hall" },
    { url: `${W}/Carnegie_Mellon_Hamerschlag_Hall_and_Scott_Hall.jpg?width=1280`, caption: "Hamerschlag & Scott Hall" },
    { url: `${W}/Carnegie_Mellon_Scott_Hall_under_construction.jpg?width=1280`, caption: "Scott Hall" },
  ],
  northwestern: [
    { url: `${W}/Deering_Library_Northwestern.jpg?width=1280`, caption: "Deering Library" },
    { url: `${W}/University_Hall_Northwestern.jpg?width=1280`, caption: "University Hall" },
    { url: `${W}/Northwestern_Deering_Library.jpg?width=1280`, caption: "Deering Library" },
  ],
  // Top public flagships — 2-3 shots for biggest names
  berkeley: [
    { url: `${W}/Memorial_Glade_and_Doe_Library_at_the_University_of_California%2C_Berkeley_-_The_Daily_Californian.jpg?width=1280`, caption: "Doe Library & Memorial Glade" },
    { url: `${W}/Sather_Tower_-_UC_Berkeley_(15862067865).jpg?width=1280`, caption: "Sather Tower" },
    { url: `${W}/UC_Berkeley_Sather_Tower.jpg?width=1280`, caption: "Sather Tower" },
  ],
  "uc-berkeley": [
    { url: `${W}/Memorial_Glade_and_Doe_Library_at_the_University_of_California%2C_Berkeley_-_The_Daily_Californian.jpg?width=1280`, caption: "Doe Library & Memorial Glade" },
    { url: `${W}/Sather_Tower_-_UC_Berkeley_(15862067865).jpg?width=1280`, caption: "Sather Tower" },
    { url: `${W}/UC_Berkeley_Sather_Tower.jpg?width=1280`, caption: "Sather Tower" },
  ],
  ucla: [
    { url: `${W}/Royce_Hall%2C_University_of_California%2C_Los_Angeles_(23-09-2003).jpg?width=1280`, caption: "Royce Hall" },
    { url: `${W}/Powell_Library%2C_UCLA_(10_December_2005).jpg?width=1280`, caption: "Powell Library" },
    { url: `${W}/Janss_Steps%2C_UCLA.jpg?width=1280`, caption: "Janss Steps" },
  ],
  umich: [
    { url: `${W}/University_Of_Michigan_Law_Quad_(179637351).jpeg?width=1280`, caption: "Law Quadrangle" },
    { url: `${W}/Michigan_Union.jpg?width=1280`, caption: "Michigan Union" },
    { url: `${W}/Chemistry_Building%2C_University_of_Michigan%2C_University_Avenue%2C_Ann_Arbor%2C_MI_-_54380289997.jpg?width=1280`, caption: "Chemistry Building" },
  ],
  michigan: [
    { url: `${W}/University_Of_Michigan_Law_Quad_(179637351).jpeg?width=1280`, caption: "Law Quadrangle" },
    { url: `${W}/Michigan_Union.jpg?width=1280`, caption: "Michigan Union" },
    { url: `${W}/Chemistry_Building%2C_University_of_Michigan%2C_University_Avenue%2C_Ann_Arbor%2C_MI_-_54380289997.jpg?width=1280`, caption: "Chemistry Building" },
  ],
  unc: [
    { url: `${W}/UNC_chapel_hill_wilson_library.jpg?width=1280`, caption: "Wilson Library" },
    { url: `${W}/Morehead-Patterson_Bell_Tower.jpg?width=1280`, caption: "Morehead-Patterson Bell Tower" },
    { url: `${W}/UNC_Chapel_Hill_-_Old_Well_with_flowers.jpg?width=1280`, caption: "The Old Well" },
  ],
  "unc-chapel-hill": [
    { url: `${W}/UNC_chapel_hill_wilson_library.jpg?width=1280`, caption: "Wilson Library" },
    { url: `${W}/Morehead-Patterson_Bell_Tower.jpg?width=1280`, caption: "Morehead-Patterson Bell Tower" },
    { url: `${W}/UNC_Chapel_Hill_-_Old_Well_with_flowers.jpg?width=1280`, caption: "The Old Well" },
  ],
  uva: [
    { url: `${W}/The_Rotunda_and_Lawn_University_of_Virginia_Charlottesville_VA_March_2011.jpg?width=1280`, caption: "The Rotunda & Lawn" },
    { url: `${W}/UVA_Lawn_with_Rotunda%2C_west_(1981).jpg?width=1280`, caption: "The Lawn" },
    { url: `${W}/University_of_Virginia_Rotunda.jpg?width=1280`, caption: "The Rotunda" },
  ],
  "ut-austin": [
    { url: `${W}/The_Tower%2C_University_of_Texas_at_Austin_(ca_1980).jpg?width=1280`, caption: "UT Tower" },
    { url: `${W}/UT_Austin_Main_Building%2C_Gated_Staircase%2C_2025.jpg?width=1280`, caption: "Main Building" },
    { url: `${W}/Texas_Capitol_Dome_from_UT_South_Mall_2020.jpg?width=1280`, caption: "South Mall view" },
  ],
  uiuc: [
    { url: `${W}/%22Quad_Day%22_at_the_University_of_Illinois_at_Urbana-Champaign.jpg?width=1280`, caption: "Quad Day" },
    { url: `${W}/University_of_Illinois_at_Urbana-Champaign_-_Mechanical_Engineering_Laboratory%2C_East_of_Bardeen_Quad.jpg?width=1280`, caption: "Mechanical Engineering Lab" },
    { url: `${W}/Foellinger_Auditorium_University_of_Illinois_at_Urbana-Champaign_from_mid-quad.jpg?width=1280`, caption: "Foellinger Auditorium" },
  ],
  "penn-state": [{ url: `${W}/Old_Main_Penn_State.png?width=1280`, caption: "Old Main" }],
  wisconsin: [
    { url: `${W}/University_of_Wisconsin%E2%80%93Madison_August_2022_09_(Bascom_Hall).jpg?width=1280`, caption: "Bascom Hall" },
    { url: `${W}/University_of_Wisconsin%E2%80%93Madison_August_2022_04_(Memorial_Union).jpg?width=1280`, caption: "Memorial Union" },
  ],
  "uw-madison": [
    { url: `${W}/University_of_Wisconsin%E2%80%93Madison_August_2022_09_(Bascom_Hall).jpg?width=1280`, caption: "Bascom Hall" },
    { url: `${W}/University_of_Wisconsin%E2%80%93Madison_August_2022_04_(Memorial_Union).jpg?width=1280`, caption: "Memorial Union" },
  ],
  "georgia-tech": [
    { url: `${W}/Lettie_Pate_Whitehead_Evans_Administration_Building.jpg?width=1280`, caption: "Tech Tower" },
    { url: `${W}/Klaus_Advanced_Computing_Building.JPG?width=1280`, caption: "Klaus Computing Building" },
    { url: `${W}/Georgia_Tech_Campanile_Fountain.jpg?width=1280`, caption: "The Campanile" },
  ],
  gatech: [
    { url: `${W}/Lettie_Pate_Whitehead_Evans_Administration_Building.jpg?width=1280`, caption: "Tech Tower" },
    { url: `${W}/Klaus_Advanced_Computing_Building.JPG?width=1280`, caption: "Klaus Computing Building" },
    { url: `${W}/Georgia_Tech_Campanile_Fountain.jpg?width=1280`, caption: "The Campanile" },
  ],
  ucsd:         [{ url: `${W}/Geisel_Library%2C_UCSD.jpg?width=1280`, caption: "Geisel Library" }],
  "uc-san-diego": [{ url: `${W}/Geisel_Library%2C_UCSD.jpg?width=1280`, caption: "Geisel Library" }],
  ucsb:         [{ url: `${W}/Storke_Tower%2C_northwest_view%2C_UCSB%2C_June_2021.jpg?width=1280`, caption: "Storke Tower" }],
  "uc-santa-barbara": [{ url: `${W}/Storke_Tower%2C_northwest_view%2C_UCSB%2C_June_2021.jpg?width=1280`, caption: "Storke Tower" }],
  florida:      [{ url: `${W}/Dsg_UF_Century_Tower_20050507.jpg?width=1280`, caption: "Century Tower" }],
  ufl:          [{ url: `${W}/Dsg_UF_Century_Tower_20050507.jpg?width=1280`, caption: "Century Tower" }],
  "ohio-state": [{ url: `${W}/Ohio_State_University_Oval_-_DPLA_-_120d3649fc2a2a260fba2b3810c75d42.jpg?width=1280`, caption: "The Oval" }],
  purdue:       [{ url: `${W}/Purdue_Bell_Tower_Purdue_University_2016_02.jpg?width=1280`, caption: "Purdue Bell Tower" }],
  washington:   [{ url: `${W}/MK03217_University_of_Washington_Suzzallo_Library.jpg?width=1280`, caption: "Suzzallo Library" }],
  uw:           [{ url: `${W}/MK03217_University_of_Washington_Suzzallo_Library.jpg?width=1280`, caption: "Suzzallo Library" }],
  // Top LACs
  williams: [
    { url: `${W}/Williams_College_-_Thompson_Memorial_Chapel_exterior_view.JPG?width=1280`, caption: "Thompson Memorial Chapel" },
    { url: `${W}/Chapin_Hall%2C_Williams_College_-_Williamstown%2C_Massachusetts.jpg?width=1280`, caption: "Chapin Hall" },
  ],
  amherst: [
    { url: `${W}/Amherst_College_Main_Quad.jpg?width=1280`, caption: "Main Quad" },
    { url: `${W}/Amherst_College_campus_-_LOC_4a11989a.jpg?width=1280`, caption: "Campus view" },
    { url: `${W}/Jchap1.JPG?width=1280`, caption: "College Row" },
  ],
  swarthmore: [
    { url: `${W}/Swarthmore_Parrish_Hall.jpg?width=1280`, caption: "Parrish Hall" },
  ],
  pomona:       [{ url: `${W}/Frary_Dining_Hall_360-degree_view.jpg?width=1280`, caption: "Frary Dining Hall" }],
  wellesley:    [{ url: `${W}/Wellesley_College_Library.jpg?width=1280`, caption: "Margaret Clapp Library" }],
  bowdoin:      [{ url: `${W}/Bowdoin_College_Chapel.jpg?width=1280`, caption: "Bowdoin Chapel" }],
  middlebury:   [{ url: `${W}/Mead_Memorial_Chapel%2C_Middlebury_College%2C_Middlebury%2C_Vermont_(84583).jpg?width=1280`, caption: "Mead Memorial Chapel" }],
  "west-point": [{ url: `${W}/USMA_Aerial_View_Looking_North.jpg?width=1280`, caption: "USMA aerial view" }],
  // International
  oxford: [
    { url: `${W}/Radcliffe_Camera%2C_Oxford.jpg?width=1280`, caption: "Radcliffe Camera" },
    { url: `${W}/Tom_Quad%2C_Christ_Church_2004-01-21.jpg?width=1280`, caption: "Christ Church, Tom Quad" },
  ],
  cambridge: [
    { url: `${W}/King%27s_College_Cambridge.jpg?width=1280`, caption: "King's College Chapel" },
    { url: `${W}/Cmglee_Cambridge_Trinity_College_Great_Court.jpg?width=1280`, caption: "Trinity College Great Court" },
  ],
  imperial:     [{ url: `${W}/Royal_School_of_Mines_Imperial_College_London_2020_01.jpg?width=1280`, caption: "Royal School of Mines" }],
  ucl:          [{ url: `${W}/UCL_Portico_Building.jpg?width=1280`, caption: "Wilkins Building portico" }],
  lse:          [{ url: `${W}/LSE_-_Houghton_Street_(4771363094).jpg?width=1280`, caption: "Houghton Street campus" }],
  edinburgh:    [{ url: `${W}/Playfair_Library%2C_Old_College%2C_University_of_Edinburgh.jpg?width=1280`, caption: "Playfair Library, Old College" }],
  toronto:      [{ url: `${W}/Soldiers%27_Tower%2C_University_of_Toronto%2C_Toronto%2C_Ontario_(29920135681).jpg?width=1280`, caption: "Soldiers' Tower" }],
  "u-toronto":  [{ url: `${W}/Soldiers%27_Tower%2C_University_of_Toronto%2C_Toronto%2C_Ontario_(29920135681).jpg?width=1280`, caption: "Soldiers' Tower" }],
  mcgill: [
    { url: `${W}/McGill_University_downtown_campus_August_2017_02.jpg?width=1280`, caption: "Downtown campus" },
    { url: `${W}/McGill_University_downtown_campus_August_2017_01.jpg?width=1280`, caption: "Downtown campus" },
    { url: `${W}/Elizabeth_Wirth_Music_Building%2C_McGill_University%2C_Sep_06_2022.jpg?width=1280`, caption: "Wirth Music Building" },
  ],
  ubc: [
    { url: `${W}/University_of_British_Columbia%2C_north_end_of_campus%2C_aerial_from_northeast.jpg?width=1280`, caption: "Aerial from northeast" },
    { url: `${W}/Iona_Building%2C_University_of_British_Columbia.jpg?width=1280`, caption: "Iona Building" },
  ],
  melbourne:    [{ url: `${W}/Old_Quad_lawn_University_of_Melbourne_2018.jpg?width=1280`, caption: "Old Quad" }],
  sydney:       [{ url: `${W}/University_of_Sydney%27s_Main_Quadrangle.jpg?width=1280`, caption: "Main Quadrangle" }],
};

// Grad-school IDs → parent campus photo (avoids duplicating curated photos)
const GRAD_TO_PARENT: Record<string, string> = {
  "harvard-law": "harvard", "harvard-med": "harvard", "hbs-mba": "harvard",
  "yale-law": "yale", "yale-med": "yale", "yale-som": "yale",
  "stanford-law": "stanford", "stanford-med": "stanford", "stanford-gsb": "stanford",
  "penn-law": "upenn", "penn-med": "upenn", "wharton-mba": "upenn",
  "duke-law": "duke", "duke-med": "duke", "fuqua-mba": "duke",
  "uchicago-law": "uchicago", "pritzker-med": "uchicago", "chicago-booth": "uchicago",
  "nyu-law": "nyu", "nyu-grossman": "nyu", "stern-mba": "nyu",
  "columbia-law": "columbia", "columbia-vps": "columbia", "columbia-mba": "columbia",
  "uva-law": "uva", "uva-med": "uva", "darden-mba": "uva",
  "northwestern-law": "northwestern", "feinberg-med": "northwestern", "kellogg-mba": "northwestern",
  "michigan-law": "umich", "michigan-med": "umich", "ross-mba": "umich",
  "berkeley-law": "berkeley", "haas-mba": "berkeley",
  "cornell-law": "cornell", "weill-cornell": "cornell", "johnson-mba": "cornell",
  "georgetown-law": "georgetown", "mcdonough-mba": "georgetown",
  "ucla-law": "ucla", "ucla-geffen": "ucla", "anderson-mba": "ucla",
  "washu-law": "washu", "wustl-med": "washu", "olin-mba": "washu",
  "vanderbilt-law": "vanderbilt", "vanderbilt-med": "vanderbilt", "owen-mba": "vanderbilt",
  "notre-dame-law": "notre-dame", "mendoza-mba": "notre-dame",
  "texas-law": "ut-austin", "mccombs-mba": "ut-austin",
  "florida-law": "ufl", "ufl-med": "ufl",
  "emory-law": "emory", "emory-med": "emory", "goizueta-mba": "emory",
  "unc-law": "unc", "unc-med": "unc", "kenan-flagler-mba": "unc",
  "fordham-law": "nyu", "wisconsin-law": "wisconsin", "wisconsin-med": "wisconsin", "wisconsin-mba": "wisconsin",
  "mit-sloan-mba": "mit", "tepper-mba": "cmu", "tuck-mba": "dartmouth",
  "minnesota-law": "umich", "ohio-state-med": "ohio-state", "fisher-mba": "ohio-state",
  "jhu-med": "jhu", "iowa-law": "wisconsin", "case-western-med": "uchicago",
  "bu-law": "harvard", "bu-chobanian": "harvard", "bc-law": "harvard",
  "alpert-med": "brown", "keck-med": "ucla", "marshall-mba": "ucla",
  "indiana-med": "wisconsin", "indiana-maurer-law": "wisconsin", "kelley-mba": "wisconsin",
  "miller-med": "ufl", "uga-law": "unc", "wake-forest-law": "duke",
  "alabama-law": "unc", "asu-law": "ucla", "ucirvine-law": "ucla", "ucdavis-law": "berkeley",
  "moritz-law": "ohio-state", "maryland-law": "jhu", "maryland-med": "jhu",
  "houston-law": "rice", "illinois-law": "uiuc", "tulane-law": "emory", "smu-law": "ut-austin",
  "pepperdine-caruso-law": "ucla", "baylor-law": "rice", "baylor-med": "rice",
  "pitt-law": "cmu", "pittsburgh-med": "cmu", "wustl-extra-law": "washu", "cardozo-law": "nyu",
  "loyola-marymount-law": "ucla", "penn-state-dickinson-law": "penn-state",
  "scalia-law": "georgetown", "gw-law": "georgetown", "villanova-law": "upenn",
  "richmond-law": "uva", "denver-sturm-law": "uw", "temple-law": "upenn", "missouri-law": "wisconsin",
  "mayo-alix": "uchicago", "icahn-mt-sinai": "nyu", "utsw-med": "ut-austin",
  "jones-mba": "rice", "carlson-mba": "wisconsin", "foster-mba": "uw",
};

// Campus-only reserve pool kept for legacy verification. School profile heroes
// do not use it as a generic fallback because a real campus from another
// institution is still an irrelevant school image.
const CAMPUS_FALLBACK_POOL: string[] = [
  `${W}/University_of_Wisconsin%E2%80%93Madison_August_2022_09_(Bascom_Hall).jpg?width=1280`,
  `${W}/Old_Well_UNC.jpg?width=1280`,
  `${W}/Foellinger_Auditorium_University_of_Illinois_at_Urbana-Champaign_from_mid-quad.jpg?width=1280`,
  `${W}/Old_Main_Penn_State.png?width=1280`,
  `${W}/MK03217_University_of_Washington_Suzzallo_Library.jpg?width=1280`,
  `${W}/Geisel_Library%2C_UCSD.jpg?width=1280`,
  `${W}/Williams_College_-_Thompson_Memorial_Chapel_exterior_view.JPG?width=1280`,
  `${W}/Bowdoin_College_Chapel.jpg?width=1280`,
  `${W}/Frary_Dining_Hall_360-degree_view.jpg?width=1280`,
  `${W}/Mead_Memorial_Chapel%2C_Middlebury_College%2C_Middlebury%2C_Vermont_(84583).jpg?width=1280`,
  `${W}/Wellesley_College_Library.jpg?width=1280`,
  `${W}/Storke_Tower%2C_northwest_view%2C_UCSB%2C_June_2021.jpg?width=1280`,
  `${W}/Purdue_Bell_Tower_Purdue_University_2016_02.jpg?width=1280`,
  `${W}/Ohio_State_University_Oval_-_DPLA_-_120d3649fc2a2a260fba2b3810c75d42.jpg?width=1280`,
  `${W}/Dsg_UF_Century_Tower_20050507.jpg?width=1280`,
];

export function getDomain(id: string): string | undefined {
  return SCHOOL_DOMAINS[id];
}

// Returns the best available logo URL for a school:
//  1. Hand-curated Wikipedia PNG thumbnail (highest quality)
//  2. Clearbit logo CDN (good coverage for .edu/.ac.uk domains)
//  3. undefined → SchoolLogo will render a colored monogram fallback
export function getLogoUrl(id: string): string | undefined {
  if (LOGO_OVERRIDES[id]) return LOGO_OVERRIDES[id];
  const d = getDomain(id);
  return d ? `https://logo.clearbit.com/${d}` : undefined;
}

// Returns an ordered list of campus photos for a school. Famous schools have
// multiple shots so the carousel can rotate; uncurated schools render the
// branded fallback panel instead of another school's campus.
export function getHeroPhotos(id: string): HeroPhoto[] {
  if (HERO_PHOTOS[id]?.length) return HERO_PHOTOS[id];
  const parent = GRAD_TO_PARENT[id];
  if (parent && HERO_PHOTOS[parent]?.length) return HERO_PHOTOS[parent];
  return [];
}

// Convenience for callers that only need a single photo URL (cards, share images, etc).
export function getHeroPhoto(id: string): string {
  const first = getHeroPhotos(id)[0];
  return typeof first === "string" ? first : first?.url ?? "";
}

export function hasCuratedPhoto(id: string): boolean {
  return !!(HERO_PHOTOS[id]?.length || (GRAD_TO_PARENT[id] && HERO_PHOTOS[GRAD_TO_PARENT[id]]?.length));
}

/**
 * Dev-only utility: given a list of school IDs, returns the ones that will
 * render as a colored monogram (no override and no Clearbit domain available).
 * Call this in the browser console to track logo coverage:
 *   import { auditLogoFallbacks } from "@/lib/schoolPhotos";
 *   auditLogoFallbacks(universities.map(u => u.id));
 */
export function auditLogoFallbacks(ids: string[]): string[] {
  return ids.filter((id) => !LOGO_OVERRIDES[id] && !SCHOOL_DOMAINS[id]);
}
