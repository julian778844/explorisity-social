
export default function AcademicNetworkHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-white via-slate-50 to-blue-50 p-6 shadow-sm md:p-8">
      <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-blue-100 opacity-70 blur-2xl" />
      <div className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-indigo-100 opacity-70 blur-2xl" />

      <div className="relative grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-blue-700">
            Student discovery network
          </p>

          <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
            Explore schools. Build your profile. Connect with your future.
          </h1>

          <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-slate-600">
            Explorisity helps students compare schools, follow communities, discover rankings, share milestones, and find opportunities in one academic network.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="/auth"
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-slate-800"
            >
              Sign in to make your profile
            </a>

            <a
              href="/rankings"
              className="rounded-full border bg-white px-5 py-3 text-sm font-bold text-slate-900 hover:bg-slate-50"
            >
              Explore rankings
            </a>

            <a
              href="/social"
              className="rounded-full border bg-white px-5 py-3 text-sm font-bold text-slate-900 hover:bg-slate-50"
            >
              Join student communities
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="rounded-3xl border bg-white/85 p-5 shadow-xl backdrop-blur">
            <div className="flex items-center gap-3 border-b pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-2xl">
                🎓
              </div>
              <div>
                <p className="text-sm font-bold text-slate-950">Academic profile</p>
                <p className="text-xs font-medium text-slate-500">Scores • goals • schools • journey</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Trending community</p>
                <p className="mt-1 font-black text-slate-950">Premed students networking</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-blue-50 p-4">
                  <p className="text-xs font-bold text-blue-700">Rankings</p>
                  <p className="mt-1 text-2xl font-black text-slate-950">Live</p>
                </div>
                <div className="rounded-2xl bg-indigo-50 p-4">
                  <p className="text-xs font-bold text-indigo-700">Chance Me</p>
                  <p className="mt-1 text-2xl font-black text-slate-950">Fit</p>
                </div>
              </div>

              <div className="rounded-2xl border p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Student journey</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  Accepted • scholarships • internships • events
                </p>
              </div>
            </div>
          </div>

          <div className="absolute -right-4 -top-4 rounded-2xl border bg-white px-4 py-3 text-sm font-black shadow-lg">
            🏫 Compare schools
          </div>
        </div>
      </div>
    </section>
  );
}
