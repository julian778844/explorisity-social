import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function WelcomeToExplorisityModal({ open, onClose }: Props) {
  if (!open) return null;

  const features = [
    { icon: "🎓", title: "Explore universities", description: "Compare schools, rankings, campus life, outcomes, and student communities." },
    { icon: "💼", title: "Find opportunities", description: "Discover internships, jobs, scholarships, events, and school updates." },
    { icon: "🤝", title: "Build your network", description: "Follow students, join communities, message peers, and grow your profile." },
  ];

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div role="dialog" aria-modal="true" className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-5 shadow-2xl md:p-6" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 rounded-xl p-2 transition hover:bg-muted" aria-label="Close welcome">
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-2xl text-primary-foreground shadow-lg">🚀</div>
        <h2 className="pr-10 text-2xl font-black tracking-tight">Welcome to Explorisity</h2>
        <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
          Your student discovery network for schools, internships, scholarships, jobs, events, and academic connections.
        </p>

        <div className="mt-5 grid gap-3">
          {features.map((feature) => (
            <div key={feature.title} className="flex gap-3 rounded-2xl border border-border bg-background p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-xl">{feature.icon}</div>
              <div>
                <p className="text-sm font-black text-foreground">{feature.title}</p>
                <p className="mt-0.5 text-xs font-medium leading-5 text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <button onClick={onClose} className="mt-5 w-full rounded-xl bg-primary py-3 text-sm font-black text-primary-foreground transition hover:opacity-90">
          Start exploring
        </button>
      </div>
    </div>
  );
}
