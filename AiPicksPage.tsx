import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Zap, ChevronRight, Check, ArrowRight } from "lucide-react";
import { universities } from "@/data/universities";

type Goal = "tech" | "finance" | "medicine" | "law" | "arts" | "research";
type Priority = "roi" | "prestige" | "social" | "cost" | "research";
type Location = "usa" | "uk" | "anywhere";

interface Profile {
  goal: Goal | null;
  priority: Priority | null;
  location: Location | null;
}

const goalOptions: { key: Goal; label: string; emoji: string }[] = [
  { key: "tech", label: "Technology / Engineering", emoji: "💻" },
  { key: "finance", label: "Finance / Banking", emoji: "📈" },
  { key: "medicine", label: "Medicine / Healthcare", emoji: "🩺" },
  { key: "law", label: "Law / Policy", emoji: "⚖️" },
  { key: "arts", label: "Arts / Media / Humanities", emoji: "🎭" },
  { key: "research", label: "Academic Research", emoji: "🔬" },
];

const priorityOptions: { key: Priority; label: string; desc: string }[] = [
  { key: "roi", label: "Best Value", desc: "Salary relative to cost" },
  { key: "prestige", label: "Brand Prestige", desc: "Global name recognition" },
  { key: "social", label: "Best Social Life", desc: "Culture & community" },
  { key: "cost", label: "Lowest Cost", desc: "Tuition & affordability" },
  { key: "research", label: "Research Excellence", desc: "Labs & faculty access" },
];

const locationOptions: { key: Location; label: string }[] = [
  { key: "usa", label: "USA only" },
  { key: "uk", label: "UK / Europe" },
  { key: "anywhere", label: "Anywhere in the world" },
];

function scoreForProfile(uni: typeof universities[0], profile: Profile): number {
  let score = 0;

  if (profile.goal === "tech") score += (uni.scores.career + uni.internships.score + uni.scores.academics) / 3;
  if (profile.goal === "finance") score += (uni.scores.career * 1.2 + uni.careerOutcomes.medianSalary / 1000) / 2;
  if (profile.goal === "medicine") score += (uni.research.prestige + uni.scores.academics * 1.2) / 2;
  if (profile.goal === "law") score += (uni.scores.career + uni.scores.academics) / 2;
  if (profile.goal === "arts") score += (uni.scores.social + uni.scores.diversity + uni.scores.academics) / 3;
  if (profile.goal === "research") score += (uni.research.prestige + uni.scores.research) / 2;

  if (profile.priority === "roi") score += uni.valueScore;
  if (profile.priority === "prestige") score += uni.prestigeScore;
  if (profile.priority === "social") score += uni.scores.social;
  if (profile.priority === "cost") score += 100 - (uni.tuition / 70000 * 100);
  if (profile.priority === "research") score += uni.research.prestige;

  if (profile.location === "usa" && uni.country !== "USA") score -= 200;
  if (profile.location === "uk" && uni.country === "USA") score -= 200;

  return score;
}

export default function AiPicksPage() {
  const [profile, setProfile] = useState<Profile>({ goal: null, priority: null, location: null });
  const [step, setStep] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const handleGoal = (g: Goal) => { setProfile(p => ({ ...p, goal: g })); setStep(1); };
  const handlePriority = (p: Priority) => { setProfile(prev => ({ ...prev, priority: p })); setStep(2); };
  const handleLocation = (l: Location) => { setProfile(prev => ({ ...prev, location: l })); setShowResults(true); };

  const picks = showResults
    ? [...universities]
        .sort((a, b) => scoreForProfile(b, profile) - scoreForProfile(a, profile))
        .filter(u => {
          if (profile.location === "usa") return u.country === "USA";
          if (profile.location === "uk") return u.country !== "USA";
          return true;
        })
        .slice(0, 6)
    : [];

  const goalLabel = goalOptions.find(g => g.key === profile.goal);
  const priorityLabel = priorityOptions.find(p => p.key === profile.priority);

  return (
    <div className="min-h-screen px-4 py-10 max-w-5xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Zap className="w-6 h-6 text-[hsl(var(--accent))]" />
          <h1 className="text-4xl font-black tracking-tight">AI Picks</h1>
        </div>
        <p className="text-muted-foreground">Answer three questions. Get your personalized top school list.</p>
      </div>

      {!showResults ? (
        <div className="max-w-2xl">
          <div className="flex gap-2 mb-10">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= step ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-black mb-2">What's your goal?</h2>
                <p className="text-muted-foreground mb-6">What do you want to do after graduation?</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {goalOptions.map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => handleGoal(opt.key)}
                      className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/70 hover:border-primary/50 transition-all text-left"
                    >
                      <span className="text-2xl">{opt.emoji}</span>
                      <span className="font-medium">{opt.label}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-sm text-muted-foreground">Goal: </span>
                  <span className="text-sm font-medium text-primary">{goalLabel?.emoji} {goalLabel?.label}</span>
                  <button onClick={() => { setStep(0); setProfile(p => ({ ...p, goal: null })); }} className="text-xs text-muted-foreground hover:text-foreground ml-auto">Change</button>
                </div>
                <h2 className="text-2xl font-black mb-2">What matters most?</h2>
                <p className="text-muted-foreground mb-6">Your top priority when choosing a school.</p>
                <div className="space-y-3">
                  {priorityOptions.map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => handlePriority(opt.key)}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-muted/70 hover:border-primary/50 transition-all text-left"
                    >
                      <div>
                        <div className="font-medium">{opt.label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{opt.desc}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-sm text-muted-foreground">Goal: <span className="text-primary">{goalLabel?.label}</span></span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-sm text-muted-foreground">Priority: <span className="text-primary">{priorityLabel?.label}</span></span>
                </div>
                <h2 className="text-2xl font-black mb-2">Where do you want to study?</h2>
                <p className="text-muted-foreground mb-6">This affects which institutions are surfaced.</p>
                <div className="space-y-3">
                  {locationOptions.map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => handleLocation(opt.key)}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-muted/70 hover:border-primary/50 transition-all text-left"
                    >
                      <span className="font-medium">{opt.label}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <div className="flex gap-2 flex-wrap">
              {[goalLabel?.label, priorityLabel?.label, locationOptions.find(l => l.key === profile.location)?.label].map(tag => (
                <span key={tag} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                  <Check className="w-3 h-3" /> {tag}
                </span>
              ))}
            </div>
            <button
              onClick={() => { setShowResults(false); setStep(0); setProfile({ goal: null, priority: null, location: null }); }}
              className="ml-auto text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Start over →
            </button>
          </div>

          <h2 className="text-2xl font-black mb-6">Your Top Picks</h2>

          <div className="space-y-4">
            {picks.map((uni, i) => (
              <motion.div
                key={uni.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="relative flex items-start gap-6 p-6 rounded-2xl border border-border bg-card overflow-hidden"
              >
                <div
                  className="absolute inset-0 opacity-5"
                  style={{ background: `radial-gradient(circle at left, ${uni.color}, transparent 50%)` }}
                />
                <div className="relative z-10 flex items-start gap-6 w-full">
                  <div className="text-4xl font-black font-mono" style={{ color: uni.color }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <h3 className="text-xl font-black">{uni.name}</h3>
                      <span className="text-xs text-muted-foreground">{uni.type} · {uni.country}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{uni.aiSummary}</p>
                    <div className="flex flex-wrap gap-3 text-xs">
                      <span className="text-emerald-400 font-mono">${(uni.careerOutcomes.medianSalary / 1000).toFixed(0)}k median</span>
                      <span className="text-muted-foreground">{uni.acceptanceRate}% accept</span>
                      <span className="text-[hsl(var(--accent))]">Value {uni.valueScore}/100</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Link
                      href={`/university/${uni.id}`}
                      className="text-sm px-4 py-2 rounded-lg bg-muted/50 border border-border hover:border-foreground/30 text-foreground font-medium transition-all flex items-center gap-1"
                    >
                      Profile <ArrowRight className="w-3 h-3" />
                    </Link>
                    {i < picks.length - 1 && (
                      <Link
                        href={`/compare?a=${uni.id}&b=${picks[i + 1].id}`}
                        className="text-xs px-4 py-2 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 transition-all text-center"
                      >
                        vs #{i + 2}
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
