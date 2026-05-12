import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Award, BarChart3, MessageCircle, Search, Sparkles, Users } from "lucide-react";
import { universities } from "@/data/universities";
import UniversitySelector from "@/components/UniversitySelector";
import { useAuth } from "@/lib/auth";

export default function HomePage() {
  const { user, openSignIn } = useAuth();
  const [, navigate] = useLocation();
  const [uniA, setUniA] = useState("");
  const [uniB, setUniB] = useState("");

  const handleCompare = () => {
    if (uniA && uniB) {
      navigate(`/compare?a=${uniA}&b=${uniB}`);
    }
  };

  const topSchools = [...universities]
    .sort((a, b) => b.prestigeScore - a.prestigeScore)
    .slice(0, 5);

  const socialPosts = [
    {
      tag: "Event",
      title: "Premed students are planning a virtual MCAT study night",
      meta: "Brown community",
    },
    {
      tag: "Job",
      title: "New internship opening for first generation college students",
      meta: "Student opportunity",
    },
    {
      tag: "Journey",
      title: "Maria added NYU and Penn State to her school list",
      meta: "Student update",
    },
  ];

  const liveRankings = [
    "Most followed schools this week",
    "Fastest growing student communities",
    "Most discussed programs",
    "Best networking schools",
  ];

  return (
    <div className="min-h-screen px-4 py-8">
      <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-10"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Student discovery, rankings, communities, and networking
          </div>

          <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
            Build your student profile.
            <span className="block bg-gradient-to-r from-primary to-[hsl(var(--accent))] bg-clip-text text-transparent">
              Find your people, schools, and next opportunity.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Explorisity helps students discover schools, join communities, follow each other, share journeys, compare options, and use rankings that feel alive.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            {!user ? (
              <button
                onClick={() => openSignIn("signup")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground shadow-sm transition hover:opacity-90"
              >
                Sign in to make your profile
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <Link
                href="/profile"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground shadow-sm transition hover:opacity-90"
              >
                View your profile
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}

            <Link
              href="/social"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-3 font-bold transition hover:bg-muted"
            >
              Explore communities
              <Users className="h-4 w-4" />
            </Link>

            <Link
              href="/rankings"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-3 font-bold transition hover:bg-muted"
            >
              View live rankings
              <BarChart3 className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>

        <div className="grid gap-6">
          <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-black">Student activity</h2>
            </div>

            <div className="space-y-3">
              {socialPosts.map((post) => (
                <div key={post.title} className="rounded-2xl border border-border/70 bg-background p-4">
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground">{post.tag}</span>
                  <p className="mt-3 font-bold leading-snug">{post.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{post.meta}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-black">Live rankings</h2>
            </div>

            <div className="space-y-2">
              {liveRankings.map((ranking, index) => (
                <Link
                  key={ranking}
                  href="/rankings"
                  className="flex items-center justify-between rounded-2xl border border-border/70 bg-background p-3 transition hover:bg-muted"
                >
                  <span className="font-semibold">{ranking}</span>
                  <span className="text-sm font-black text-primary">#{index + 1}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section className="mx-auto mt-6 grid max-w-7xl gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-black">Quick compare</h2>
          </div>

          <p className="mb-4 text-sm text-muted-foreground">
            Compare is still here, but it is now a supporting tool inside the larger student network.
          </p>

          <div className="space-y-3">
            <UniversitySelector value={uniA} onChange={setUniA} placeholder="First school..." />
            <UniversitySelector value={uniB} onChange={setUniB} placeholder="Second school..." />
            <button
              onClick={handleCompare}
              disabled={!uniA || !uniB}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              Compare schools
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-black">Trending schools</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {topSchools.map((school) => (
              <Link
                key={school.id}
                href={`/university/${school.id}`}
                className="rounded-2xl border border-border/70 bg-background p-4 transition hover:bg-muted"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-lg font-black">
                    {school.name.slice(0, 1)}
                  </div>
                  <div>
                    <h3 className="font-black">{school.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      Prestige score {school.prestigeScore}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
