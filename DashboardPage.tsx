import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { universities } from "@/data/universities";
import { BookmarkPlus, Trash2, Zap, TrendingUp, BarChart2, ArrowRight, User } from "lucide-react";

const defaultSaved = ["mit", "stanford", "cmu", "harvard"];
const defaultComparisons = [
  { a: "mit", b: "stanford", date: "May 5, 2026" },
  { a: "harvard", b: "yale", date: "May 4, 2026" },
  { a: "columbia", b: "nyu", date: "May 3, 2026" },
];

export default function DashboardPage() {
  const [saved, setSaved] = useState<string[]>(defaultSaved);
  const [comparisons, setComparisons] = useState(defaultComparisons);

  const savedUnis = universities.filter(u => saved.includes(u.id));
  const allUnis = universities.filter(u => !saved.includes(u.id));

  const remove = (id: string) => setSaved(prev => prev.filter(x => x !== id));
  const add = (id: string) => setSaved(prev => [...prev, id]);

  return (
    <div className="min-h-screen px-4 py-10 max-w-7xl mx-auto">
      <div className="flex items-start justify-between mb-10 flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Your saved schools, comparisons, and activity.</p>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-card">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <User className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-bold text-sm">Guest User</div>
            <div className="text-xs text-muted-foreground">Sign in to sync across devices</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Saved Schools", value: saved.length, icon: BookmarkPlus, color: "text-[hsl(var(--accent))]" },
          { label: "Comparisons", value: comparisons.length, icon: BarChart2, color: "text-[hsl(165_38%_36%)]" },
          { label: "Votes Cast", value: 7, icon: Zap, color: "text-orange-400" },
          { label: "Schools Explored", value: 12, icon: TrendingUp, color: "text-emerald-400" },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="p-5 rounded-2xl border border-border bg-card flex flex-col gap-2">
              <Icon className={`w-4 h-4 ${s.color}`} />
              <div className={`text-3xl font-black font-mono ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black">Saved Schools</h2>
            <span className="text-xs text-muted-foreground">{saved.length} schools</span>
          </div>

          {savedUnis.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-border/60 bg-card text-muted-foreground">
              <BookmarkPlus className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p>No saved schools yet</p>
              <Link href="/rankings" className="text-xs text-primary mt-2 block hover:underline">Browse universities →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {savedUnis.map((uni, i) => (
                <motion.div
                  key={uni.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border/60 bg-card group"
                >
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: uni.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate">{uni.name}</div>
                    <div className="text-xs text-muted-foreground">{uni.location} · {uni.type}</div>
                  </div>
                  <div className="hidden sm:flex gap-4 text-xs text-muted-foreground flex-shrink-0">
                    <span className="text-emerald-400 font-mono">${(uni.careerOutcomes.medianSalary / 1000).toFixed(0)}k</span>
                    <span>{uni.acceptanceRate}%</span>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Link
                      href={`/university/${uni.id}`}
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => remove(uni.id)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {allUnis.length > 0 && (
            <div className="mt-6">
              <div className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Add More</div>
              <div className="flex flex-wrap gap-2">
                {allUnis.slice(0, 8).map(uni => (
                  <button
                    key={uni.id}
                    onClick={() => add(uni.id)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted/70 text-sm transition-all"
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: uni.color }} />
                    {uni.shortName}
                    <span className="text-muted-foreground text-xs">+</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black">Recent Comparisons</h2>
            <Link href="/compare" className="text-xs text-primary hover:underline">New comparison →</Link>
          </div>

          <div className="space-y-3">
            {comparisons.map((c, i) => {
              const a = universities.find(u => u.id === c.a);
              const b = universities.find(u => u.id === c.b);
              if (!a || !b) return null;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border/60 bg-card group"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: a.color }} />
                      <span className="font-medium text-sm">{a.shortName}</span>
                    </div>
                    <span className="text-muted-foreground text-xs">vs</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: b.color }} />
                      <span className="font-medium text-sm">{b.shortName}</span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">{c.date}</span>
                  <div className="flex gap-2 flex-shrink-0">
                    <Link
                      href={`/compare?a=${a.id}&b=${b.id}`}
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setComparisons(prev => prev.filter((_, j) => j !== i))}
                      className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}

            {comparisons.length === 0 && (
              <div className="text-center py-16 rounded-2xl border border-border/60 bg-card text-muted-foreground">
                <BarChart2 className="w-8 h-8 mx-auto mb-3 opacity-40" />
                <p>No comparisons yet</p>
                <Link href="/compare" className="text-xs text-primary mt-2 block hover:underline">Start comparing →</Link>
              </div>
            )}
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-black mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { href: "/compare", label: "New Comparison", icon: BarChart2, color: "text-[hsl(var(--accent))]" },
                { href: "/ai-picks", label: "Get AI Picks", icon: Zap, color: "text-[hsl(165_38%_36%)]" },
                { href: "/rankings", label: "Browse Rankings", icon: TrendingUp, color: "text-emerald-400" },
                { href: "/trending", label: "See Trending", icon: TrendingUp, color: "text-orange-400" },
              ].map(a => {
                const Icon = a.icon;
                return (
                  <Link
                    key={a.href}
                    href={a.href}
                    className="flex items-center gap-3 p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/60 hover:border-border transition-all"
                  >
                    <Icon className={`w-4 h-4 ${a.color} flex-shrink-0`} />
                    <span className="font-medium text-sm">{a.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
