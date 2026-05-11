import { useMemo, useState } from "react";
import type { ElementType } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  DollarSign,
  MapPin,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { universities } from "@/data/universities";
import SchoolLogo from "@/components/SchoolLogo";
import { getHeroPhoto } from "@/lib/schoolPhotos";

type University = (typeof universities)[number];
type RankingKey = "overall" | "campus" | "academics" | "value" | "popular" | "trending" | "experience";

const rankingCategories: Array<{
  key: RankingKey;
  label: string;
  icon: ElementType;
  description: string;
  metricLabel: string;
  score: (school: University) => number;
  metric: (school: University) => string;
  reason: (school: University) => string;
}> = [
  {
    key: "overall",
    label: "Overall rankings",
    icon: Award,
    description: "A balanced view of prestige, selectivity, value, outcomes, research, and student satisfaction.",
    metricLabel: "Overall",
    score: (school) => school.prestigeScore,
    metric: (school) => `${school.prestigeScore}/100`,
    reason: (school) =>
      `${school.shortName} combines strong academic reputation, career outcomes, and broad student demand.`,
  },
  {
    key: "campus",
    label: "Best campus life",
    icon: Users,
    description: "Schools with strong social energy, campus culture, and day-to-day student experience.",
    metricLabel: "Campus",
    score: (school) => school.scores.social + school.studentSatisfaction * 0.35,
    metric: (school) => `${school.scores.social}/100`,
    reason: (school) =>
      `${school.shortName} stands out for student life signals, campus community, and culture fit.`,
  },
  {
    key: "academics",
    label: "Best academics",
    icon: BookOpen,
    description: "Academic rigor, faculty access, research strength, and graduation support.",
    metricLabel: "Academics",
    score: (school) => school.scores.academics + school.research.prestige * 0.2 + school.academicLife.sixYearGradRate * 0.15,
    metric: (school) => `${school.scores.academics}/100`,
    reason: (school) =>
      `${school.shortName} ranks well for academic strength, completion outcomes, and research opportunities.`,
  },
  {
    key: "value",
    label: "Best value",
    icon: DollarSign,
    description: "Return on tuition through affordability, employment, and salary outcomes.",
    metricLabel: "Value",
    score: (school) => school.valueScore,
    metric: (school) => `${school.valueScore}/100`,
    reason: (school) =>
      `${school.shortName} offers a strong balance of cost, employment rate, and graduate salary.`,
  },
  {
    key: "popular",
    label: "Most popular schools",
    icon: Star,
    description: "Schools with the strongest preference and demand signals across student comparisons.",
    metricLabel: "Preference",
    score: (school) => school.preferencePercent,
    metric: (school) => `${school.preferencePercent}%`,
    reason: (school) =>
      `${school.shortName} gets strong student preference signals when compared head-to-head.`,
  },
  {
    key: "trending",
    label: "Trending schools",
    icon: TrendingUp,
    description: "Momentum from preference, satisfaction, and broad platform relevance.",
    metricLabel: "Momentum",
    score: (school) => school.preferencePercent * 0.55 + school.studentSatisfaction * 0.3 + school.prestigeScore * 0.15,
    metric: (school) => `${Math.round(school.preferencePercent * 0.55 + school.studentSatisfaction * 0.3 + school.prestigeScore * 0.15)}/100`,
    reason: (school) =>
      `${school.shortName} has high student interest with strong satisfaction and reputation signals.`,
  },
  {
    key: "experience",
    label: "Best student experience",
    icon: Sparkles,
    description: "Student satisfaction, social environment, diversity, support, and campus fit.",
    metricLabel: "Experience",
    score: (school) => school.studentSatisfaction + school.scores.diversity * 0.2 + school.scores.social * 0.2,
    metric: (school) => `${school.studentSatisfaction}/100`,
    reason: (school) =>
      `${school.shortName} performs well on student satisfaction, community, and overall campus experience.`,
  },
];

const typeFilters = [
  { value: "US", label: "US only" },
  { value: "Private", label: "Private" },
  { value: "Public", label: "Public" },
  { value: "International", label: "International" },
  { value: "All", label: "All schools" },
];

function schoolTypeMatches(school: University, filter: string) {
  if (filter === "All") return true;
  if (filter === "US") return school.type !== "International";
  return school.type === filter;
}

function RankedSchoolCard({
  school,
  rank,
  category,
}: {
  school: University;
  rank: number;
  category: (typeof rankingCategories)[number];
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const campusPhoto = getHeroPhoto(school.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(rank, 20) * 0.025 }}
    >
      <Link
        href={`/university/${school.id}`}
        className="group grid overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition hover:border-primary/30 hover:bg-muted/40 lg:grid-cols-[220px_1fr]"
      >
        <div className="relative h-44 bg-muted lg:h-full">
          {campusPhoto && !imageFailed ? (
            <img
              src={campusPhoto}
              alt={`${school.name} campus`}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center px-5 text-center" style={{ backgroundColor: `${school.color}22` }}>
              <div>
                <SchoolLogo id={school.id} name={school.name} color={school.color} size={58} rounded="xl" className="mx-auto bg-background" />
                <p className="mt-3 text-sm font-black">{school.shortName}</p>
              </div>
            </div>
          )}
          <div className="absolute left-4 top-4 rounded-2xl bg-background/95 px-4 py-2 text-2xl font-black shadow">
            #{rank}
          </div>
        </div>

        <div className="min-w-0 p-5 md:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 gap-4">
              <SchoolLogo id={school.id} name={school.name} color={school.color} size={58} rounded="xl" className="bg-background" />
              <div className="min-w-0">
                <h2 className="truncate text-xl font-black tracking-tight md:text-2xl">{school.name}</h2>
                <p className="mt-1 flex items-center gap-1 truncate text-sm font-semibold text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {school.location}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-black text-muted-foreground">{school.type}</span>
                  <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-black text-muted-foreground">
                    {school.acceptanceRate}% acceptance
                  </span>
                  <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-black text-muted-foreground">
                    ${(school.careerOutcomes.medianSalary / 1000).toFixed(0)}k median salary
                  </span>
                </div>
              </div>
            </div>

            <div className="shrink-0 rounded-2xl border border-border bg-background px-4 py-3 text-right">
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{category.metricLabel}</div>
              <div className="mt-1 text-2xl font-black" style={{ color: school.color }}>
                {category.metric(school)}
              </div>
            </div>
          </div>

          <p className="mt-5 line-clamp-2 text-sm font-semibold leading-6 text-muted-foreground">
            {category.reason(school)}
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {school.campusCulture.slice(0, 3).map((tag) => (
                <span key={tag} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">
                  {tag}
                </span>
              ))}
            </div>
            <span className="inline-flex items-center gap-2 text-sm font-black text-primary">
              View school profile
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function RankingsPage() {
  const [activeCategoryKey, setActiveCategoryKey] = useState<RankingKey>("overall");
  const [filterType, setFilterType] = useState("US");
  const activeCategory = rankingCategories.find((category) => category.key === activeCategoryKey) ?? rankingCategories[0];

  const rankedSchools = useMemo(() => {
    return [...universities]
      .filter((school) => schoolTypeMatches(school, filterType))
      .sort((a, b) => {
        const scoreDiff = activeCategory.score(b) - activeCategory.score(a);
        if (scoreDiff !== 0) return scoreDiff;
        const prestigeDiff = b.prestigeScore - a.prestigeScore;
        if (prestigeDiff !== 0) return prestigeDiff;
        return a.acceptanceRate - b.acceptanceRate;
      });
  }, [activeCategory, filterType]);

  const topThree = rankedSchools.slice(0, 3);

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <section className="mb-7 grid gap-6 rounded-3xl border border-border bg-card p-6 shadow-sm lg:grid-cols-[0.9fr_1.1fr] lg:p-8">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-black text-primary">
              <BarChart3 className="h-4 w-4" />
              Explorisity rankings
            </div>
            <h1 className="text-4xl font-black tracking-tight md:text-6xl">View Rankings</h1>
            <p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-muted-foreground md:text-base">
              Compare colleges by overall strength, academics, campus life, value, popularity, momentum, and student experience.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {topThree.map((school, index) => (
              <Link key={school.id} href={`/university/${school.id}`} className="rounded-2xl border border-border bg-background p-4 transition hover:bg-muted">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <SchoolLogo id={school.id} name={school.name} color={school.color} size={44} rounded="xl" />
                  <span className="text-2xl font-black" style={{ color: school.color }}>#{index + 1}</span>
                </div>
                <h2 className="line-clamp-2 text-sm font-black leading-5">{school.name}</h2>
                <p className="mt-1 truncate text-xs font-semibold text-muted-foreground">{school.location}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-6 rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-black">Ranking categories</h2>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">{activeCategory.description}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {rankingCategories.map((category) => {
              const Icon = category.icon;
              const active = activeCategory.key === category.key;
              return (
                <button
                  key={category.key}
                  onClick={() => setActiveCategoryKey(category.key)}
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-black transition ${
                    active
                      ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {category.label}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {typeFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterType(filter.value)}
                className={`rounded-xl border px-4 py-2 text-sm font-black transition ${
                  filterType === filter.value
                    ? "border-accent/50 bg-accent/20 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </section>

        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">{activeCategory.label}</h2>
            <p className="text-sm font-semibold text-muted-foreground">
              {rankedSchools.length.toLocaleString()} schools ranked
            </p>
          </div>
          <div className="hidden rounded-2xl border border-border bg-card px-4 py-3 text-right sm:block">
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active metric</div>
            <div className="text-sm font-black">{activeCategory.metricLabel}</div>
          </div>
        </div>

        <div className="space-y-4">
          {rankedSchools.map((school, index) => (
            <RankedSchoolCard key={school.id} school={school} rank={index + 1} category={activeCategory} />
          ))}
        </div>

        {rankedSchools.length === 0 && (
          <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
            <h2 className="text-2xl font-black">No schools match this filter.</h2>
            <p className="mt-2 text-sm font-semibold text-muted-foreground">Try another ranking category or school type.</p>
          </div>
        )}
      </div>
    </div>
  );
}
