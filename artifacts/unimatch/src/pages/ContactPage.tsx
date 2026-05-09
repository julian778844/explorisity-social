import { Mail, MessageSquare, Bug, Lightbulb } from "lucide-react";

const CONTACT_EMAIL = "findyournext4@gmail.com";

export default function ContactPage() {
  const channels = [
    { icon: MessageSquare, title: "General Questions", body: "Ideas, partnerships, press, or anything else." },
    { icon: Bug, title: "Bug Reports", body: "Found a wrong stat or a broken page? Tell us — we fix fast." },
    { icon: Lightbulb, title: "Feature Requests", body: "Want to see a new ranking, school, or comparison metric? Send it over." },
  ];

  return (
    <div className="min-h-screen px-4 py-10 max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black tracking-tight mb-3">Contact Us</h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Explorisity is built for students, by people who care about getting the data right. Reach out anytime — we read everything.
        </p>
      </div>

      <a
        href={`mailto:${CONTACT_EMAIL}`}
        className="block group rounded-3xl border border-border bg-gradient-to-br from-primary/5 via-card to-accent/5 p-10 text-center hover-elevate transition-all mb-8"
        data-testid="contact-email"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground mb-4 shadow-lg group-hover:scale-110 transition-transform">
          <Mail className="w-8 h-8" />
        </div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-2">Email Us</div>
        <div className="text-3xl font-black text-primary mb-2 break-all">{CONTACT_EMAIL}</div>
        <div className="text-sm text-muted-foreground">Click to open in your mail app · we typically reply within 48 hours</div>
      </a>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {channels.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.title} className="rounded-2xl border border-border bg-card p-6">
              <Icon className="w-5 h-5 text-primary mb-3" />
              <div className="font-bold mb-1">{c.title}</div>
              <div className="text-sm text-muted-foreground">{c.body}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 p-6 rounded-2xl border border-border/60 bg-muted/30 text-sm text-muted-foreground text-center">
        Explorisity is an independent project. We're not affiliated with US News, AAMC, LSAC, GMAC, or any university. All data is collected from public sources and cross-checked manually for the most-searched programs.
      </div>
    </div>
  );
}
