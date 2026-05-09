import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Zap, TrendingUp, Award, Users, Search, Sparkles, ShieldCheck } from "lucide-react";
import { universities } from "@/data/universities";
import { trendingMatchups } from "@/data/matchups";
import MatchupCard from "@/components/MatchupCard";
import UniversitySelector from "@/components/UniversitySelector";
import GlobalSearch from "@/components/GlobalSearch";

export default function HomePage() {
  const stats = [
    { label: "Universities", value: `${universities.length.toLocaleString()}+`, icon: Award },
    { label: "Comparisons Made", value: "1.2M", icon: Zap },
    { label: "Student Votes", value: "850k", icon: Users },
    { label: "Data Points", value: "340+", icon: TrendingUp },
  ];
  const [, navigate] = useLocation();
  const [uniA, setUniA] = useState("");
  const [uniB, setUniB] = useState("");

  const canCompare = Boolean(uniA && uniB && uniA !== uniB);

  const handleCompare = () => {
    if (canCompare) {
      navigate(`/compare?a=${encodeURIComponent(uniA)}&b=${encodeURIComponent(uniB)}`);
    }
  };

  const topSchools = [...universities]
    .sort((a, b) => {
      const d = b.prestigeScore - a.prestigeScore;
      if (d !== 0) return d;
      const acc = a.acceptanceRate - b.acceptanceRate;
      if (acc !== 0) return acc;
      return b.careerOutcomes.medianSalary - a.careerOutcomes.medianSalary;
    })
    .slice(0, 6);

  return (
    <div className="min-h-screen">
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 text-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-accent/8 blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-5xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border text-xs text-muted-foreground mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            850,000+ votes cast this month
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/70">
              Compare.<br />Decide.
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary to-[hsl(var(--accent))] font-display">
              Win.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Data-driven university comparisons — tuition, career outcomes, research prestige, and student satisfaction. No fluff.
          </p>

          <GlobalSearch hero className="max-w-3xl mx-auto mb-6" />

          <div className="bg-card border border-border rounded-2xl p-6 max-w-2xl mx-auto mb-6">
            <p className="text-sm text-muted-foreground mb-4 uppercase tracking-widest font-medium">Quick Compare</p>
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="flex-1">
                <UniversitySelector value={uniA} onChange={setUniA} placeholder="First university..." />
              </div>
              <span className="text-muted-foreground text-sm font-medium self-center hidden sm:block">vs</span>
              <div className="flex-1">
                <UniversitySelector value={uniB} onChange={setUniB} placeholder="Second university..." />
              </div>
              <button
                onClick={handleCompare}
                disabled={!canCompare}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground font-semibold text-sm transition-all duration-200 whitespace-nowrap"
              >
                Compare <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex flex-col items-center p-4 rounded-xl bg-card border border-border/60">
                  <Icon className="w-4 h-4 text-muted-foreground mb-2" />
                  <span className="text-2xl font-black text-foreground">{stat.value}</span>
                  <span className="text-xs text-muted-foreground mt-0.5">{stat.label}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>

      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-black tracking-tight">Trending Matchups</h2>
            <p className="text-muted-foreground mt-1">What students are debating right now</p>
          </div>
          <Link href="/trending" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            See all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trendingMatchups.slice(0, 4).map((matchup, i) => (
            <motion.div
              key={matchup.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <MatchupCard matchup={matchup} />
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-20 px-4 max-w-7xl mx-auto border-t border-border/60">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-black tracking-tight">Top Schools</h2>
            <p className="text-muted-foreground mt-1">Ranked by global prestige and outcomes</p>
          </div>
          <Link href="/rankings" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            Full rankings <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topSchools.map((uni, i) => (
            <motion.div
              key={uni.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/university/${uni.id}`} className="group block p-5 rounded-2xl border border-border/60 bg-card hover:bg-muted/60 transition-all">
                <div className="flex items-start gap-4">
                  <div className="text-3xl font-black font-mono min-w-[2.5rem]" style={{ color: uni.color }}>
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-foreground group-hover:text-foreground/90 truncate">{uni.name}</div>
                    <div className="text-sm text-muted-foreground mt-0.5">{uni.location}</div>
                    <div className="flex items-center gap-3 mt-3 text-xs">
                      <span className="text-emerald-400 font-mono font-bold">${(uni.careerOutcomes.medianSalary / 1000).toFixed(0)}k median</span>
                      <span className="text-muted-foreground">{uni.acceptanceRate}% accept</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="relative rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-background to-accent/10 p-12 text-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 to-transparent" />
          <div className="relative z-10">
            <h2 className="text-4xl font-black mb-4">Not sure where to start?</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Let our AI analyze your profile and recommend the schools most likely to result in success — on your terms.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/ai-picks" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all shadow-lg shadow-primary/30">
                Get AI Picks <Sparkles className="w-4 h-4" />
              </Link>
              <Link href="/rankings" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl border border-border bg-background/70 hover:bg-muted font-semibold transition-all">
                Browse rankings <Search className="w-4 h-4" />
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              {[
                { icon: ShieldCheck, title: "Outcome-first", text: "Compare graduation, salary, employment, and value side by side." },
                { icon: Users, title: "Student signal", text: "Use votes and social activity to see what students actually debate." },
                { icon: Award, title: "Fit beyond rank", text: "Balance prestige with campus life, diversity, affordability, and goals." },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <Icon className="w-4 h-4 text-primary mb-2" />
                    <div className="font-bold text-sm">{item.title}</div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
