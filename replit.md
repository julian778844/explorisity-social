# Explorisity (formerly UniMatch)

A premium college, graduate, and trade-program discovery platform. Tagline: *Explore · Compare · Decide.* Includes 1000+ undergrad universities (PA-heavy), 60 top US law schools, 60 elite MBA programs, 60 US medical schools, and 32 trade & technical schools. Real Postgres-backed accounts (username + password) so follows sync across devices.

## Run & Operate

- `pnpm --filter @workspace/unimatch run dev` — frontend
- `pnpm --filter @workspace/api-server run dev` — Express API + sessions (serves `/api/*`)
- `pnpm --filter @workspace/db run db:push` — push Drizzle schema (users, follows, user_sessions)
- `pnpm --filter @workspace/unimatch run typecheck` — strict TS check
- Required env: `DATABASE_URL`, `SESSION_SECRET`

## Stack

- React 18 + Vite, TypeScript, Wouter routing, **@tanstack/react-query** for server state
- Tailwind v4, **light theme** (HSL tokens in `index.css` `:root`; never apply `.dark`)
- **Editorial premium brand**: Cream paper bg + Oxford ink primary + Heritage gold accent. Display: **Fraunces** (variable serif w/ optical sizing). Body: **Inter**.
- Framer Motion, Recharts, shadcn/ui, lucide-react
- API: Express + Zod (`@workspace/api-zod`), Drizzle ORM + Postgres, **bcryptjs** + **express-session** + **connect-pg-simple** (cookie `explorisity.sid`, sameSite lax, 30d, trust proxy 1)

## Where things live

- **Frontend**
  - `artifacts/unimatch/src/lib/api.ts` — typed fetch wrapper (`credentials: include`)
  - `artifacts/unimatch/src/lib/auth.tsx` — `AuthProvider`, `useAuth()`, **global SignInModal** (Sign In + Sign Up tabs, password 8+, redirects /profile on success)
  - `artifacts/unimatch/src/lib/follows.ts` — `useFollows()` with optimistic add/remove; opens sign-in modal if anon
  - `artifacts/unimatch/src/lib/schoolPhotos.ts` — `SCHOOL_DOMAINS` (~150 IDs → official domains), `HERO_PHOTOS: Record<string, string[]>` (~70 schools; **all top-25 schools carry 3 verified Wikimedia photos** + key private/public flagships also expanded to 3 each — vanderbilt, rice, notre-dame, emory, washu, nyu, cmu, northwestern, mcgill all have 3; ubc has 2). `GRAD_TO_PARENT` cross-link, `CAMPUS_FALLBACK_POOL` of 15 confirmed Wikimedia campus photos picked deterministically by id-hash (no random stock). Helpers: `getDomain`, `getLogoUrl`, `getHeroPhotos` (array), `getHeroPhoto` (single, thin wrapper). All URLs verified 200 OK via `pnpm --filter @workspace/scripts run verify-campus-photos` (concurrency 2, GET+Range, 429 retry).
  - `artifacts/unimatch/src/components/CampusCarousel.tsx` — reusable hero slideshow: auto-advance 5.5s, pause on hover/focus, prev/next chevrons, dot indicators, keyboard arrows, mobile swipe, fade transitions, skeleton until each image loads, silently drops failed images. Single-image input renders as a static hero (no controls).
  - `artifacts/unimatch/src/components/Logo.tsx` — brand identity: `<LogoMark>` (custom SVG crest with stylized "E"/podium mark in navy+gold), `<Wordmark>` (Fraunces serif with gold "i" accent), `<Logo>` composite link
  - `artifacts/unimatch/public/favicon.svg` — same crest mark
  - `artifacts/unimatch/src/components/SchoolLogo.tsx` — Clearbit logo with `onError` → colored monogram fallback
  - `artifacts/unimatch/src/components/SocialLinks.tsx` — Renders brand-colored circular icon links for Instagram/LinkedIn/Facebook/X/TikTok/YouTube. Accepts handle, @handle, or full URL; `buildSocialUrl` normalizes via `SOCIAL_PLATFORMS` base URLs. Hidden when user has none set.
  - `artifacts/unimatch/src/components/Nav.tsx` — drawer + auth-aware (Sign In button or avatar/profile link); Trade link included
  - `artifacts/unimatch/src/components/RankingsTable.tsx` — generic clickable rows + SchoolLogo + follow heart (requires `schoolType` prop)
  - `artifacts/unimatch/src/data/{universities,universitiesMore,lawSchools,mbaPrograms,medSchools,tradeSchools}.ts` — datasets
  - `artifacts/unimatch/src/pages/` — 14 pages incl. `TradeRankingsPage`, `SchoolProfilePage` (generic for law/med/mba/trade)
- **Backend**
  - `lib/db/src/schema/{users,follows}.ts` — Drizzle tables; users(id,username unique,passwordHash,displayName,bio,email,avatarColor,instagram,linkedin,facebook,twitter,tiktok,youtube,createdAt), follows(id,userId,schoolType,schoolId,createdAt; UNIQUE(userId,schoolType,schoolId))
  - `artifacts/api-server/src/routes/{auth,follows}.ts` — REST endpoints
  - `lib/api-zod/src/auth.ts` — Zod schemas

## Architecture decisions

- **Real DB-backed accounts** (Postgres + bcrypt + sessions). No localStorage profiles. Session cookie persists 30d so follows survive across devices/browsers.
- **`user_sessions` table** is created manually (`createTableIfMissing: false` in connect-pg-simple) to keep Drizzle schema as the source of truth.
- **Optimistic follows**: `useFollows` adds/removes locally before server confirms; rolls back on error.
- **SchoolLogo strategy**: `LOGO_OVERRIDES` (55 hand-curated Wikipedia PNG thumbnails for top schools) → Clearbit CDN (`logo.clearbit.com/{domain}`) → colored monogram. Two-step fallback in `SchoolLogo.tsx`. Both rendered the same size (32–84px) so layouts never shift.
- **Campus photos**: `HERO_PHOTOS: Record<string, string[]>` (~70 hand-curated Wikimedia URLs; top-25 schools — Ivies, MIT/Stanford/Caltech/Chicago/Duke/JHU + top public flagships — carry 2–3 shots each so the carousel rotates) + `GRAD_TO_PARENT` (law/med/mba schools inherit the full parent photo array) + `CAMPUS_FALLBACK_POOL` of 15 verified Wikimedia campus photos chosen deterministically by FNV-1a id-hash. **No random stock photos** — every fallback is a real university campus shot. The old picsum.photos fallback was removed because it returned flowers/animals/landscapes. Profiles render via `<CampusCarousel images={getHeroPhotos(id)} />`.
- **One generic SchoolProfilePage** at `/school/:type/:id` handles law/med/mba/trade with type-specific stat grids; undergrad keeps its existing rich `/university/:id` page.
- Light theme is the only theme. Primary is **Oxford ink navy** (`hsl(215 62% 16%)`), accent is **Heritage gold** (`hsl(41 65% 48%)`), background is **Cream paper** (`hsl(36 38% 97%)`). Buttons sitting on `bg-primary` use `text-primary-foreground` (cream) for contrast.
- **Brand mark**: Custom SVG crest (rounded-square, ink gradient, gold-bordered) with a stylized "E" formed by a vertical stroke + 3 descending horizontal bars (reads as both letter E and a ranking podium). North-star dot top-right represents "decide". Single-color version works at 32px favicon size.
- Wouter `base` lets the app live under `/unimatch` without code knowing.
- **Rankings use computed `prestigeScore` and `valueScore`** for undergrad. Prestige = **US News rank anchor 35%** (rank 1→100, 25→75, 50→49, 95+→0) + selectivity 20% + salary 15% + research 15% + tier 10% + employment 5%. The rank anchor pins top-25 schools (Princeton/MIT/Harvard/Stanford/Yale) at the top so the list reads like US News rather than letting raw selectivity (e.g. service academies, micro-acceptance schools) overshadow them. Value = salary-to-cost 50% + employment 20% + affordability 20% + tier floor 10%.
- **Minerva University is classified as International** (`cty:"Global"`) — though headquartered in San Francisco, it operates as a global rotational program (students live in 7 cities worldwide) and is not a traditional US school.
- **US-only by default**: undergrad rankings default to `filterType: "US"` (everything except `type === "International"`); MBA rankings pass `defaultFilters={{ region: "US" }}` to RankingsTable. International schools surface only when the user explicitly opts in. International MBA programs are renumbered to ranks 46–62 so the global rank list has no duplicates (US 1–45 follows US News, international 46+ follows Financial Times order).
- **Logo fallback chain (SchoolLogo)** tries each source until one loads, then falls back to a colored monogram: `LOGO_OVERRIDES` (Wikipedia thumbnail) → `logo.clearbit.com/{domain}` → `google.com/s2/favicons?domain={domain}&sz=128` → monogram. The Google Favicon CDN catches schools where Clearbit/Wikipedia is blocked or 404s.

## Product

- **Nav drawer** groups links by Browse / Rankings / Discover / About; shows user avatar + profile link when signed in.
- **Auth modal**: Sign In / Sign Up tabs, username + password (8+ chars), optional display name on signup. Modal lives in `AuthProvider` so any component can call `openSignIn()`.
- **Profile** (`/profile`): edit display name, bio, email, avatar color (8 swatches), and 6 social links (Instagram, LinkedIn, Facebook, X, TikTok, YouTube — username/@handle/URL all accepted). Brand-colored social icon row renders below bio when any links are set. Lists all followed schools across the 5 datasets with type badge, logo, and deep-link href. Sign-out via confirm dialog.
- **Follow system**: heart on every undergrad profile + every ranking row (law/med/mba/trade). Backed by Postgres. Anonymous click opens sign-in modal.
- **Rankings**: 5 sections. Every row clickable → school detail. Logos (Clearbit + monogram fallback) replace the old color dots.
- **Trade & Technical** (`/trade`): 32 programs (UTI, Lincoln Tech, Penn College, Ranken, IBEW Local 3 union JATC, etc.) — flagship program, length, cost, completion %, job placement %, median salary, accreditation, certifications.
- **School profiles**:
  - `/university/:id` — undergrad rich profile (admissions, financial, programs, demographics, athletics, etc.)
  - `/school/law/:id` — career outcomes, BigLaw/clerkships, selectivity
  - `/school/med/:id` — match rate, NIH funding, primary care %, top residencies
  - `/school/mba/:id` — industry placement, work exp, signing bonus, region
  - `/school/trade/:id` — programs, certifications, payback period
- All school profiles include hero photo (with gradient overlay), logo, location + domain link, and Follow School button.

## User preferences

- No AI-sounding phrasing in copy — keep it direct and data-forward
- No mock/bot users — only real signed-up accounts. **`SUGGESTED_USERS` was removed.**
- Light theme, premium/editorial aesthetic with violet→cyan→fuchsia accents
- University counts in copy must be dynamic — read `.length`, never hardcode

## Gotchas

- Tailwind v4 does NOT support `@apply dark` inside `@layer base` — colors are tokenized in `:root` instead
- Port 22972 is assigned via workflow config; do not hard-code in vite.config.ts
- The api-server workflow is required now (auth + follows). If it shows as failed, check `DATABASE_URL` + `SESSION_SECRET`.
- `pnpm --filter @workspace/db run push` will try to drop the manually-managed `user_sessions` table. For additive `users` column changes, run `psql "$DATABASE_URL" -c "ALTER TABLE users ADD COLUMN IF NOT EXISTS ..."` directly instead of `db:push`.
- The `bg-white/X` and `text-white` classes are reserved for elements sitting on the violet primary gradient
- External image hosts (Clearbit, Wikimedia, Unsplash) may be blocked in the screenshot sandbox but load fine in real browsers — `SchoolLogo` and `<img onError>` both degrade gracefully
- Custom event `explorisity:store` from the old localStorage system is **gone** — components subscribe via React Query cache instead

## Pointers

- `pnpm-workspace` skill — monorepo structure
- `react-vite` skill — Vite/React conventions
- `replit-auth`/`clerk-auth` skills — NOT used; we own the auth (bcrypt + session cookie) for username-only signup with no email verification
