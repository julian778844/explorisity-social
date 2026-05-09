export default function AcademicNetworkHero() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1800&q=80"
          alt="University campus overview"
          className="h-full w-full object-cover opacity-28"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/55" />
      </div>

      <div className="relative grid gap-8 p-6 md:grid-cols-[1.1fr_0.9fr] md:p-10 lg:p-12">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs font-black text-muted-foreground backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Student discovery network
          </div>

          <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
            Explore schools.
            <span className="block bg-gradient-to-r from-primary to-[hsl(var(--accent))] bg-clip-text text-transparent">
              Build your academic network.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-muted-foreground md:text-lg">
            Discover universities, internships, scholarships, jobs, events, rankings, and student communities in one place.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a href="/rankings" className="rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground shadow-sm transition hover:opacity-90">
              Explore rankings
            </a>
            <a href="/social" className="rounded-xl border border-border bg-background/85 px-5 py-3 text-sm font-black backdrop-blur transition hover:bg-muted">
              Join communities
            </a>
            <a href="/compare" className="rounded-xl border border-border bg-background/85 px-5 py-3 text-sm font-black backdrop-blur transition hover:bg-muted">
              Compare schools
            </a>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl border border-border bg-background shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=80"
              alt="Students on a university campus"
              className="h-40 w-full object-cover"
            />
            <div className="p-4">
              <p className="text-xs font-black uppercase tracking-wide text-primary">Student journey</p>
              <p className="mt-1 text-sm font-bold">Accepted, scholarships, internships, and milestones.</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-border bg-background shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=900&q=80"
              alt="Academic library and campus study space"
              className="h-40 w-full object-cover"
            />
            <div className="p-4">
              <p className="text-xs font-black uppercase tracking-wide text-primary">Opportunities</p>
              <p className="mt-1 text-sm font-bold">Schools, jobs, scholarships, events, and networking.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
