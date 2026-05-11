import { Link } from "wouter";

export default function AcademicNetworkHero() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm">
      <div className="absolute inset-0">
        <img
          src="/academic-network-hero.svg"
          alt="Academic campus network overview"
          className="h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/92 to-background/62" />
      </div>

      <div className="relative grid gap-8 p-6 md:grid-cols-[1.05fr_0.95fr] md:p-10 lg:p-12">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-background/85 px-3 py-1.5 text-xs font-black text-muted-foreground backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Student discovery network
          </div>

          <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
            Explore schools.
            <span className="block bg-gradient-to-r from-primary to-[hsl(var(--accent))] bg-clip-text text-transparent">
              Build your academic network.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-muted-foreground md:text-lg">
            Discover universities, internships, scholarships, jobs, events, rankings, and real student communities in one place.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/search" className="rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground shadow-sm transition hover:opacity-90">
              Search Explorisity
            </Link>
            <Link href="/explore" className="rounded-xl border border-border bg-background/85 px-5 py-3 text-sm font-black backdrop-blur transition hover:bg-muted">
              Explore feed
            </Link>
            <Link href="/rankings" className="rounded-xl border border-border bg-background/85 px-5 py-3 text-sm font-black backdrop-blur transition hover:bg-muted">
              View rankings
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
          <Link href="/student-journey" className="overflow-hidden rounded-3xl border border-border bg-background shadow-lg transition hover:bg-muted">
            <img
              src="/student-journey-campus.svg"
              alt="Students walking on a modern academic campus"
              className="h-40 w-full object-cover"
            />
            <div className="p-4">
              <p className="text-xs font-black uppercase tracking-wide text-primary">Student Journey</p>
              <p className="mt-1 text-sm font-bold">Track accepted schools, scholarships, internships, and milestones.</p>
            </div>
          </Link>

          <div className="overflow-hidden rounded-3xl border border-border bg-background shadow-lg">
            <img
              src="/academic-network-hero.svg"
              alt="Aerial academic campus overview"
              className="h-40 w-full object-cover"
            />
            <div className="p-4">
              <p className="text-xs font-black uppercase tracking-wide text-primary">Opportunities</p>
              <p className="mt-1 text-sm font-bold">Find schools, jobs, scholarships, events, and networking paths.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
