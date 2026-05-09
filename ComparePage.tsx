import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { universities } from "@/data/universities";
import UniversitySelector from "@/components/UniversitySelector";
import MetricBar from "@/components/MetricBar";
import RadarChart from "@/components/RadarChart";
import VoteWidget from "@/components/VoteWidget";
import SchoolLogo from "@/components/SchoolLogo";
import { getDomain } from "@/lib/schoolPhotos";
import { Badge } from "@/components/ui/badge";
import { MapPin, BookOpen, Briefcase, TrendingUp, Trophy, Check, ExternalLink, Users } from "lucide-react";

interface Verdict {
  winner: typeof universities[0];
  loser: typeof universities[0];
  margin: number;
  reasons: { category: string; detail: string; winnerEdge: string }[];
  summary: string;
}

function buildVerdict(a: typeof universities[0], b: typeof universities[0]): Verdict {
  // Weighted student-preference composite
  const score = (u: typeof universities[0]) =>
    u.prestigeScore * 0.30 +
    u.valueScore * 0.25 +
    u.studentSatisfaction * 0.20 +
    u.preferencePercent * 0.15 +
    u.careerOutcomes.employmentRate * 0.10;

  const sa = score(a);
  const sb = score(b);
  const winner = sa >= sb ? a : b;
  const loser = winner.id === a.id ? b : a;
  const margin = Math.round(Math.abs(sa - sb) * 10) / 10;

  // Category-by-category reasons (only include categories where the winner actually wins)
  const candidates: { category: string; w: number; l: number; format: (n: number) => string; reasonWin: string; reasonLose?: string }[] = [
    { category: "Selectivity", w: 100 - winner.acceptanceRate, l: 100 - loser.acceptanceRate,
      format: () => `${winner.acceptanceRate}% vs ${loser.acceptanceRate}% acceptance`,
      reasonWin: `harder to get into — a meaningful prestige signal employers and grad schools recognize` },
    { category: "Median Salary", w: winner.careerOutcomes.medianSalary, l: loser.careerOutcomes.medianSalary,
      format: () => `$${(winner.careerOutcomes.medianSalary/1000).toFixed(0)}k vs $${(loser.careerOutcomes.medianSalary/1000).toFixed(0)}k`,
      reasonWin: `graduates earn measurably more out of the gate, accelerating loan payoff and lifetime earnings` },
    { category: "Value", w: winner.valueScore, l: loser.valueScore,
      format: () => `${winner.valueScore} vs ${loser.valueScore} value score`,
      reasonWin: `stronger return on tuition dollars when you weigh salary against cost` },
    { category: "Student Satisfaction", w: winner.studentSatisfaction, l: loser.studentSatisfaction,
      format: () => `${winner.studentSatisfaction} vs ${loser.studentSatisfaction} satisfaction`,
      reasonWin: `current students report a better day-to-day experience and stronger sense of fit` },
    { category: "Research", w: winner.research.prestige, l: loser.research.prestige,
      format: () => `${winner.research.prestige} vs ${loser.research.prestige} research prestige`,
      reasonWin: `deeper labs and faculty research access — opens doors to grad school and top-tier R&D roles` },
    { category: "Career Outcomes", w: winner.careerOutcomes.employmentRate, l: loser.careerOutcomes.employmentRate,
      format: () => `${winner.careerOutcomes.employmentRate}% vs ${loser.careerOutcomes.employmentRate}% employed`,
      reasonWin: `more reliable job placement directly out of undergrad` },
    { category: "Faculty Access", w: parseInt(loser.academicLife.studentFacultyRatio) - parseInt(winner.academicLife.studentFacultyRatio), l: 0,
      format: () => `${winner.academicLife.studentFacultyRatio} vs ${loser.academicLife.studentFacultyRatio} student-faculty ratio`,
      reasonWin: `smaller classes and more faculty face-time, especially valuable for recommendations and research opportunities` },
    { category: "Graduation Rate", w: winner.academicLife.sixYearGradRate, l: loser.academicLife.sixYearGradRate,
      format: () => `${winner.academicLife.sixYearGradRate}% vs ${loser.academicLife.sixYearGradRate}% six-year graduation`,
      reasonWin: `students actually finish — a strong indicator of academic support and student fit` },
  ];

  const reasons = candidates
    .filter(c => c.w > c.l)
    .sort((x, y) => ((y.w - y.l) / Math.max(1, y.l)) - ((x.w - x.l) / Math.max(1, x.l)))
    .slice(0, 4)
    .map(c => ({
      category: c.category,
      detail: c.format(0),
      winnerEdge: c.reasonWin,
    }));

  // Build a verdict summary string
  const tooClose = margin < 0.8;
  const confidence = margin > 8 ? "decisively" : margin > 4 ? "clearly" : margin > 1.5 ? "narrowly" : "by a slim margin";
  const headline = reasons[0]?.category.toLowerCase() ?? "overall fit";
  const summary = tooClose
    ? `${winner.shortName} and ${loser.shortName} are essentially a coin flip on the composite — pick on program fit, location, and gut feeling. ${reasons.length ? `${winner.shortName} has a marginal edge in ${reasons.slice(0, 2).map(r => r.category.toLowerCase()).join(" and ")}, but the differences are small enough that personal priorities should decide.` : ""}`
    : `${winner.shortName} ${confidence} edges out ${loser.shortName}, leading on ${headline}${reasons.length > 1 ? `, ${reasons.slice(1, 3).map(r => r.category.toLowerCase()).join(", and ")}` : ""}. Students who weigh outcomes alongside experience tend to pick ${winner.shortName} when forced to choose.`;

  return { winner, loser, margin, reasons, summary };
}

export default function ComparePage() {
  const search = useSearch();
  const params = new URLSearchParams(search);

  const [uniAId, setUniAId] = useState(params.get("a") || "");
  const [uniBId, setUniBId] = useState(params.get("b") || "");

  useEffect(() => {
    const p = new URLSearchParams(search);
    setUniAId(p.get("a") || "");
    setUniBId(p.get("b") || "");
  }, [search]);

  const uniA = universities.find(u => u.id === uniAId);
  const uniB = universities.find(u => u.id === uniBId);

  const radarData = uniA && uniB ? [
    { subject: "Academics", [uniA.shortName]: uniA.scores.academics, [uniB.shortName]: uniB.scores.academics },
    { subject: "Career", [uniA.shortName]: uniA.scores.career, [uniB.shortName]: uniB.scores.career },
    { subject: "Research", [uniA.shortName]: uniA.scores.research, [uniB.shortName]: uniB.scores.research },
    { subject: "Social", [uniA.shortName]: uniA.scores.social, [uniB.shortName]: uniB.scores.social },
    { subject: "Diversity", [uniA.shortName]: uniA.scores.diversity, [uniB.shortName]: uniB.scores.diversity },
    { subject: "Value", [uniA.shortName]: uniA.scores.value, [uniB.shortName]: uniB.scores.value },
    { subject: "Athletics", [uniA.shortName]: uniA.scores.athletics, [uniB.shortName]: uniB.scores.athletics },
  ] : [];

  return (
    <div className="min-h-screen px-4 py-10 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-black tracking-tight mb-2">Head-to-Head</h1>
        <p className="text-muted-foreground">Select two universities to compare across every dimension.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 max-w-2xl">
        <UniversitySelector value={uniAId} onChange={setUniAId} placeholder="University A..." />
        <UniversitySelector value={uniBId} onChange={setUniBId} placeholder="University B..." />
      </div>

      <AnimatePresence>
        {uniA && uniB && (() => {
          const verdict = buildVerdict(uniA, uniB);
          return (
          <motion.div
            key={`${uniAId}-${uniBId}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
          >
            {/* ── VERDICT ─────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 120 }}
              className="relative rounded-3xl border border-border overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${verdict.winner.color}10 0%, transparent 60%, ${verdict.loser.color}08 100%)`,
              }}
            >
              <div className="bg-card/70 backdrop-blur p-7">
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  <div className="flex-shrink-0 flex flex-col items-center gap-2 lg:min-w-[180px]">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30">
                      <Trophy className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-bold uppercase tracking-widest text-primary">{verdict.margin < 0.8 ? "Coin Flip" : "Verdict"}</span>
                    </div>
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ backgroundColor: verdict.winner.color }}>
                      <Trophy className="w-10 h-10" style={{ color: "#fff" }} />
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">{verdict.margin < 0.8 ? "Slight Edge" : "Winner"}</div>
                      <div className="font-black text-xl leading-tight" style={{ color: verdict.winner.color }}>{verdict.winner.shortName}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">+{verdict.margin} pt margin</div>
                    </div>
                    <div className="mt-3 flex flex-col items-center gap-2">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">School Logo</div>
                      <SchoolLogo
                        id={verdict.winner.id}
                        name={verdict.winner.name}
                        color={verdict.winner.color}
                        size={86}
                        rounded="xl"
                        className="shadow-lg bg-background"
                      />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-black leading-tight mb-3">
                      {verdict.margin < 0.8
                        ? <>Too close to call — <span style={{ color: verdict.winner.color }}>{verdict.winner.shortName}</span> by a hair.</>
                        : <>Students prefer <span style={{ color: verdict.winner.color }}>{verdict.winner.shortName}</span> over {verdict.loser.shortName}.</>
                      }
                    </h3>
                    <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{verdict.summary}</p>

                    <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Why {verdict.winner.shortName} wins</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {verdict.reasons.map(r => (
                        <div key={r.category} className="flex items-start gap-3 p-3 rounded-xl bg-background/60 border border-border">
                          <div className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: verdict.winner.color }}>
                            <Check className="w-3 h-3" style={{ color: "#fff" }} />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-sm">{r.category}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{r.detail}</div>
                            <div className="text-xs mt-1.5 leading-snug">{r.winnerEdge}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {verdict.reasons.length === 0 && (
                      <div className="text-sm text-muted-foreground italic">These two are extremely close — pick on fit, location, and program-specific strengths.</div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              {[uniA, uniB].map((uni, i) => (
                <div
                  key={uni.id}
                  className="relative p-6 rounded-2xl border border-border bg-card overflow-hidden"
                >
                  <div
                    className="absolute inset-0 opacity-5"
                    style={{ background: `radial-gradient(circle at ${i === 0 ? "top left" : "top right"}, ${uni.color}, transparent 70%)` }}
                  />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: uni.color }} />
                      <span className="text-xs text-muted-foreground uppercase tracking-widest">{uni.type} · {uni.country}</span>
                    </div>
                    <h2 className="text-2xl font-black mb-1">{uni.shortName}</h2>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mb-4">
                      <MapPin className="w-3 h-3" /> {uni.location}
                    </p>
                    <p className="text-sm text-muted-foreground/80 line-clamp-3">{uni.description}</p>
                    <div className="mt-4 grid grid-cols-1 gap-2 text-xs">
                      {getDomain(uni.id) ? (
                        <a
                          href={`https://${getDomain(uni.id)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 text-primary hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          {getDomain(uni.id)}
                        </a>
                      ) : (
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <ExternalLink className="w-3.5 h-3.5" />
                          Official website coming soon
                        </span>
                      )}
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <Users className="w-3.5 h-3.5 mt-0.5" />
                        <span>
                          <span className="font-semibold text-foreground">Notable alumni:</span>{" "}
                          {uni.famousAlumni.length ? uni.famousAlumni.slice(0, 4).join(", ") : "Alumni data coming soon"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {uni.campusCulture.map(c => (
                        <Badge key={c} variant="secondary" className="text-xs bg-muted/50">{c}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-bold mb-6 text-sm uppercase tracking-widest text-muted-foreground">Performance Radar</h3>
                <div className="h-[320px]">
                  <RadarChart
                    data={radarData}
                    keys={[uniA.shortName, uniB.shortName]}
                    colors={[uniA.color, uniB.color]}
                  />
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  {[uniA, uniB].map(u => (
                    <div key={u.id} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: u.color }} />
                      <span>{u.shortName}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-bold mb-6 text-sm uppercase tracking-widest text-muted-foreground">Key Metrics</h3>
                <div className="space-y-1">
                  <MetricBar
                    label="Acceptance Rate"
                    valueA={uniA.acceptanceRate}
                    valueB={uniB.acceptanceRate}
                    max={100}
                    colorA={uniA.color}
                    colorB={uniB.color}
                    formatValue={v => `${v}%`}
                    reverseWinner
                  />
                  <MetricBar
                    label="Median Salary"
                    valueA={uniA.careerOutcomes.medianSalary}
                    valueB={uniB.careerOutcomes.medianSalary}
                    max={150000}
                    colorA={uniA.color}
                    colorB={uniB.color}
                    formatValue={v => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <MetricBar
                    label="Annual Tuition"
                    valueA={uniA.tuition}
                    valueB={uniB.tuition}
                    max={70000}
                    colorA={uniA.color}
                    colorB={uniB.color}
                    formatValue={v => `$${(v / 1000).toFixed(0)}k`}
                    reverseWinner
                  />
                  <MetricBar
                    label="Employment Rate"
                    valueA={uniA.careerOutcomes.employmentRate}
                    valueB={uniB.careerOutcomes.employmentRate}
                    max={100}
                    colorA={uniA.color}
                    colorB={uniB.color}
                    formatValue={v => `${v}%`}
                  />
                  <MetricBar
                    label="Research Prestige"
                    valueA={uniA.research.prestige}
                    valueB={uniB.research.prestige}
                    max={100}
                    colorA={uniA.color}
                    colorB={uniB.color}
                    formatValue={v => `${v}/100`}
                  />
                  <MetricBar
                    label="Value Score"
                    valueA={uniA.valueScore}
                    valueB={uniB.valueScore}
                    max={100}
                    colorA={uniA.color}
                    colorB={uniB.color}
                    formatValue={v => `${v}/100`}
                  />
                  <MetricBar
                    label="Student Satisfaction"
                    valueA={uniA.studentSatisfaction}
                    valueB={uniB.studentSatisfaction}
                    max={100}
                    colorA={uniA.color}
                    colorB={uniB.color}
                    formatValue={v => `${v}/100`}
                  />
                  <MetricBar
                    label="Enrollment"
                    valueA={uniA.enrollment}
                    valueB={uniB.enrollment}
                    max={60000}
                    colorA={uniA.color}
                    colorB={uniB.color}
                    formatValue={v => v.toLocaleString()}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: BookOpen, label: "Top Majors", keyA: uniA.topMajors, keyB: uniB.topMajors },
                { icon: TrendingUp, label: "Strengths", keyA: uniA.strengths, keyB: uniB.strengths },
                { icon: Briefcase, label: "Top Employers", keyA: uniA.careerOutcomes.topCompanies, keyB: uniB.careerOutcomes.topCompanies },
                { icon: Users, label: "Notable Alumni", keyA: uniA.famousAlumni.length ? uniA.famousAlumni : ["Alumni data coming soon"], keyB: uniB.famousAlumni.length ? uniB.famousAlumni : ["Alumni data coming soon"] },
                { icon: ExternalLink, label: "Official Website", keyA: [getDomain(uniA.id) || "Website coming soon"], keyB: [getDomain(uniB.id) || "Website coming soon"] },
              ].map(({ icon: Icon, label, keyA, keyB }) => (
                <div key={label} className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">{label}</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[{ uni: uniA, items: keyA }, { uni: uniB, items: keyB }].map(({ uni, items }) => (
                      <div key={uni.id}>
                        <div className="text-xs font-bold mb-2" style={{ color: uni.color }}>{uni.shortName}</div>
                        <ul className="space-y-1">
                          {items.slice(0, 4).map(item => (
                            <li key={item} className="text-xs text-muted-foreground">{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[uniA, uniB].map(uni => (
                <div key={uni.id} className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: uni.color }} />
                    <h3 className="font-bold">{uni.shortName}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{uni.aiSummary}</p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-emerald-400 uppercase tracking-wider mb-2">Strengths</div>
                      <ul className="space-y-1">
                        {uni.strengths.map(s => (
                          <li key={s} className="text-xs text-muted-foreground flex items-center gap-1">
                            <span className="text-emerald-400">+</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs text-red-400 uppercase tracking-wider mb-2">Watch Out</div>
                      <ul className="space-y-1">
                        {uni.weaknesses.map(w => (
                          <li key={w} className="text-xs text-muted-foreground flex items-center gap-1">
                            <span className="text-red-400">−</span> {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-card border border-border rounded-2xl p-8">
              <VoteWidget
                schoolAId={uniA.id}
                schoolAName={uniA.shortName}
                schoolAColor={uniA.color}
                schoolBId={uniB.id}
                schoolBName={uniB.shortName}
                schoolBColor={uniB.color}
                initialVotesA={uniA.preferencePercent * 500}
                initialVotesB={uniB.preferencePercent * 500}
              />
            </div>
          </motion.div>
          );
        })()}
      </AnimatePresence>

      {(!uniA || !uniB) && (
        <div className="text-center py-24 text-muted-foreground">
          <div className="text-5xl mb-4">⚡</div>
          <p className="text-lg font-medium">Pick two schools to start comparing</p>
          <p className="text-sm mt-2 opacity-60">Data on {universities.length.toLocaleString()}+ universities — academics, careers, cost, and more</p>
        </div>
      )}
    </div>
  );
}
