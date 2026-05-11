import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Award, Briefcase, CalendarCheck, GraduationCap, NotebookPen, Sparkles } from "lucide-react";

const journeySteps = [
  {
    icon: GraduationCap,
    title: "Schools you are exploring",
    body: "Track the campuses, programs, and rankings that matter most to your path.",
  },
  {
    icon: CalendarCheck,
    title: "Application milestones",
    body: "Keep essays, deadlines, submissions, interviews, and decisions in one clean timeline.",
  },
  {
    icon: Award,
    title: "Scholarships and wins",
    body: "Save awards, grants, acceptances, and personal achievements as your story grows.",
  },
  {
    icon: Briefcase,
    title: "Opportunities",
    body: "Connect internships, jobs, events, and community posts to the goals behind them.",
  },
];

export default function StudentJourneyPage() {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-8 md:py-10">
      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="p-6 md:p-10">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-black text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Student Journey
            </div>
            <h1 className="text-4xl font-black tracking-tight md:text-6xl">Student Journey</h1>
            <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-muted-foreground">
              Build a living timeline of schools, applications, scholarships, opportunities, decisions, and milestones as you move through the academic process.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/profile" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground">
                Open your profile
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/explore" className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-black hover:bg-muted">
                Browse student activity
              </Link>
            </div>
          </div>

          <div className="relative min-h-72 bg-muted">
            {!imageFailed ? (
              <img
                src="/student-journey-campus.svg"
                alt="Students walking on an academic campus"
                className="absolute inset-0 h-full w-full object-cover"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/15 to-accent/10 p-8 text-center">
                <div>
                  <NotebookPen className="mx-auto mb-4 h-10 w-10 text-primary" />
                  <p className="text-xl font-black">Your path, organized clearly.</p>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        {journeySteps.map((step) => {
          const Icon = step.icon;
          return (
            <article key={step.title} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-black">{step.title}</h2>
              <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">{step.body}</p>
            </article>
          );
        })}
      </section>

      <section className="mt-6 rounded-3xl border border-dashed border-border bg-card p-6 text-center shadow-sm md:p-8">
        <h2 className="text-2xl font-black">Journey timeline is ready for content.</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm font-medium leading-6 text-muted-foreground">
          This page now loads reliably while the full timeline tools are being connected. It will not render blank, hang on loading, or depend on unfinished data calls.
        </p>
      </section>
    </div>
  );
}
