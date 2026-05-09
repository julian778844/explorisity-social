import { motion } from "framer-motion";
import { Flame, TrendingUp, Users, Zap } from "lucide-react";
import { trendingMatchups } from "@/data/matchups";
import { universities } from "@/data/universities";
import MatchupCard from "@/components/MatchupCard";
import VoteWidget from "@/components/VoteWidget";
import { useState } from "react";

const extraMatchups = [
  {
    id: "m5",
    schoolA: "princeton",
    schoolB: "yale",
    votesA: 29400,
    votesB: 31200,
    title: "The Quiet Ivies",
    debateContext: "Princeton's math and policy focus vs Yale's arts and residential college experience. Both elite, totally different vibes.",
    tags: ["Ivy", "Humanities", "Prestige"]
  },
  {
    id: "m6",
    schoolA: "cmu",
    schoolB: "mit",
    votesA: 38200,
    votesB: 44100,
    title: "CS Supremacy",
    debateContext: "CMU's #1 CS placement rate vs MIT's broader STEM dominance. Which breeds better engineers?",
    tags: ["Computer Science", "Engineering", "Tech"]
  },
  {
    id: "m7",
    schoolA: "columbia",
    schoolB: "nyu",
    votesA: 22800,
    votesB: 18400,
    title: "NYC Showdown",
    debateContext: "Two New York City universities, one Ivy and one not. Is the Columbia premium worth it over NYU's location and network?",
    tags: ["NYC", "Finance", "Urban"]
  },
  {
    id: "m8",
    schoolA: "oxford",
    schoolB: "cambridge",
    votesA: 41200,
    votesB: 38900,
    title: "The Oldest Rivalry",
    debateContext: "Oxford's humanities and tutorial system vs Cambridge's STEM supremacy. Eight centuries of debate — which wins in 2025?",
    tags: ["UK", "Global", "STEM vs Humanities"]
  },
  {
    id: "m9",
    schoolA: "upenn",
    schoolB: "columbia",
    votesA: 26500,
    votesB: 24100,
    title: "Wall Street Feeder Fight",
    debateContext: "Wharton's finance pipeline vs Columbia's NYC proximity. Both produce bankers — but which is the better path?",
    tags: ["Finance", "Business", "Ivy"]
  },
  {
    id: "m10",
    schoolA: "eth-zurich",
    schoolB: "mit",
    votesA: 15300,
    votesB: 52100,
    title: "Best Value in STEM",
    debateContext: "ETH at near-zero tuition vs MIT at $57k/year. Same caliber of output, vastly different price tags.",
    tags: ["Value", "STEM", "International"]
  },
];

const allMatchups = [...trendingMatchups, ...extraMatchups];

const hotTopic = trendingMatchups[0];
const hotA = universities.find(u => u.id === hotTopic.schoolA)!;
const hotB = universities.find(u => u.id === hotTopic.schoolB)!;

export default function TrendingPage() {
  const [activeVote, setActiveVote] = useState<string | null>(null);

  return (
    <div className="min-h-screen px-4 py-10 max-w-7xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Flame className="w-6 h-6 text-orange-400" />
          <h1 className="text-4xl font-black tracking-tight">Trending</h1>
        </div>
        <p className="text-muted-foreground">Live matchups students are debating right now.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: "Active Debates", value: "10", icon: Zap, color: "text-[hsl(var(--accent))]" },
          { label: "Votes This Week", value: "128k", icon: Users, color: "text-[hsl(165_38%_36%)]" },
          { label: "Hottest Topic", value: "MIT vs Stanford", icon: TrendingUp, color: "text-orange-400" },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="p-5 rounded-2xl border border-border bg-card flex flex-col gap-2">
              <Icon className={`w-4 h-4 ${s.color}`} />
              <div className={`text-xl font-black font-mono ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</div>
            </div>
          );
        })}
      </div>

      <div className="relative mb-12 rounded-3xl border border-border bg-card p-8 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full blur-[100px] opacity-20" style={{ backgroundColor: hotA.color }} />
        <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full blur-[100px] opacity-20" style={{ backgroundColor: hotB.color }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">Hot Right Now</span>
          </div>
          <h2 className="text-3xl font-black mb-2">{hotTopic.title}</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl">{hotTopic.debateContext}</p>
          <VoteWidget
            schoolAId={hotA.id}
            schoolAName={hotA.shortName}
            schoolAColor={hotA.color}
            schoolBId={hotB.id}
            schoolBName={hotB.shortName}
            schoolBColor={hotB.color}
            initialVotesA={hotTopic.votesA}
            initialVotesB={hotTopic.votesB}
          />
        </div>
      </div>

      <h2 className="text-2xl font-black mb-6">All Matchups</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allMatchups.map((matchup, i) => (
          <motion.div
            key={matchup.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <MatchupCard matchup={matchup as any} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
