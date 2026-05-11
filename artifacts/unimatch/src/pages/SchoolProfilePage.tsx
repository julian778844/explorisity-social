import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Heart, ExternalLink, Award, DollarSign, Users, GraduationCap, Briefcase, Stethoscope, Scale, Wrench } from "lucide-react";
import { lawSchools } from "@/data/lawSchools";
import { mbaPrograms } from "@/data/mbaPrograms";
import { medSchools } from "@/data/medSchools";
import { tradeSchools } from "@/data/tradeSchools";
import { useFollows, type SchoolType } from "@/lib/follows";
import SchoolLogo from "@/components/SchoolLogo";
import { getDomain, getHeroPhotos } from "@/lib/schoolPhotos";
import CampusCarousel from "@/components/CampusCarousel";
import { Ref, LinkifiedText } from "@/components/Ref";

const fmt$ = (n: number) => n === 0 ? "Free" : `$${(n / 1000).toFixed(0)}k`;

function Stat({ label, value, sub, accent = false }: { label: string; value: React.ReactNode; sub?: string; accent?: boolean }) {
  return (
    <div className={`p-4 rounded-2xl border ${accent ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">{label}</div>
      <div className="font-mono font-black text-xl leading-tight">{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h2 className="text-lg font-black mb-4 tracking-tight">{title}</h2>
      {children}
    </div>
  );
}

function FollowBtn({ type, id }: { type: SchoolType; id: string }) {
  const { isFollowing, toggle } = useFollows();
  const followed = isFollowing(type, id);
  return (
    <button
      onClick={() => toggle(type, id)}
      className={`inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${followed ? "bg-primary/10 text-primary border border-primary/30" : "bg-primary text-primary-foreground hover-elevate shadow-md"}`}
      data-testid={`button-follow-${id}`}
    >
      <Heart className={`w-4 h-4 ${followed ? "fill-current" : ""}`} />
      {followed ? "Following" : "Follow School"}
    </button>
  );
}

function Hero({ id, name, kind, color, loc, icon: Icon, backHref, backLabel, type }: {
  id: string; name: string; kind: string; color: string; loc: string;
  icon: React.ElementType; backHref: string; backLabel: string; type: SchoolType;
}) {
  const photos = getHeroPhotos(id);
  const domain = getDomain(id);
  return (
    <div className="relative rounded-3xl overflow-hidden border border-border mb-6">
      <CampusCarousel
        images={photos}
        alt={`${name} campus`}
        overlay="bottom"
        fallbackTitle={name}
        fallbackColor={color}
        className="absolute inset-0"
      />
      <div className="relative p-8 md:p-10 text-white min-h-[320px] flex flex-col justify-end pointer-events-none [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
        <Link href={backHref} className="inline-flex items-center gap-1 text-xs text-white/70 hover:text-white mb-4 self-start">
          <ArrowLeft className="w-3 h-3" /> {backLabel}
        </Link>
        <div className="flex items-end gap-5 flex-wrap">
          <SchoolLogo id={id} name={name} color={color} size={84} rounded="xl" className="shadow-2xl" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur text-[10px] uppercase tracking-widest font-bold">
                <Icon className="w-3 h-3" /> {kind}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">{name}</h1>
            <div className="flex items-center gap-2 text-white/85 text-sm">
              <MapPin className="w-3.5 h-3.5" /> {loc}
              {domain && (
                <a href={`https://${domain}`} target="_blank" rel="noreferrer" className="ml-3 inline-flex items-center gap-1 hover:underline">
                  <ExternalLink className="w-3 h-3" /> {domain}
                </a>
              )}
            </div>
            <FollowBtn type={type} id={id} />
          </div>
        </div>
      </div>
    </div>
  );
}

function NotFoundCard({ kind, listHref, listLabel }: { kind: string; listHref: string; listLabel: string }) {
  return (
    <div className="min-h-screen px-4 py-20 max-w-md mx-auto text-center">
      <h1 className="text-2xl font-black mb-2">{kind} program not found</h1>
      <Link href={listHref} className="text-primary hover:underline">{listLabel}</Link>
    </div>
  );
}

function LawProfile({ id }: { id: string }) {
  const s = lawSchools.find((x) => x.id === id);
  if (!s) return <NotFoundCard kind="Law" listHref="/law" listLabel="← Back to Law Rankings" />;
  return (
    <div className="min-h-screen px-4 py-8 max-w-6xl mx-auto">
      <Hero id={s.id} name={s.name} kind="Law School" color={s.color} loc={s.loc} icon={Scale} backHref="/law" backLabel="Back to Law Rankings" type="law" />
      {s.summary && <p className="text-base text-foreground/85 mb-6 leading-relaxed bg-card border border-border rounded-2xl p-5 italic"><LinkifiedText text={s.summary} /></p>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="National Rank" value={`#${s.rank}`} accent />
        <Stat label="Acceptance" value={`${s.acceptRate}%`} />
        <Stat label="Median LSAT" value={s.medianLSAT} />
        <Stat label="Median GPA" value={s.medianGPA.toFixed(2)} />
        <Stat label="Class Size" value={s.classSize} />
        <Stat label="Annual Tuition" value={fmt$(s.tuition)} />
        <Stat label="Bar Passage" value={`${s.barPassage}%`} />
        <Stat label="Median Salary" value={fmt$(s.medianSalary)} accent />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Career Outcomes">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Employed at 10 months</span><span className="font-mono font-bold">{s.employmentPct}%</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">BigLaw placement</span><span className="font-mono font-bold text-emerald-600">{s.bigLawPct}%</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Federal clerkships</span><span className="font-mono font-bold">{s.clerkshipPct}%</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Public interest</span><span className="font-mono font-bold">{s.publicInterestPct}%</span></div>
          </div>
        </Section>
        <Section title="Selectivity Snapshot">
          <p className="text-sm text-muted-foreground mb-2">Tier {s.tier} school. Median LSAT {s.medianLSAT} places it at the {s.medianLSAT >= 170 ? "top" : s.medianLSAT >= 165 ? "high" : "competitive"} end of US law schools.</p>
          <div className="text-xs text-muted-foreground italic">Tuition figure is sticker price — strong applicants typically receive merit aid that covers 30–80%.</div>
        </Section>
      </div>
    </div>
  );
}

function MedProfile({ id }: { id: string }) {
  const s = medSchools.find((x) => x.id === id);
  if (!s) return <NotFoundCard kind="Med" listHref="/med" listLabel="← Back to Med Rankings" />;
  return (
    <div className="min-h-screen px-4 py-8 max-w-6xl mx-auto">
      <Hero id={s.id} name={s.name} kind="Medical School" color={s.color} loc={s.loc} icon={Stethoscope} backHref="/med" backLabel="Back to Med Rankings" type="med" />
      {s.summary && <p className="text-base text-foreground/85 mb-6 leading-relaxed bg-card border border-border rounded-2xl p-5 italic"><LinkifiedText text={s.summary} /></p>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="National Rank" value={`#${s.rank}`} accent />
        <Stat label="Acceptance" value={`${s.acceptRate}%`} />
        <Stat label="Median MCAT" value={s.medianMCAT} />
        <Stat label="Median GPA" value={s.medianGPA.toFixed(2)} />
        <Stat label="Class Size" value={s.classSize} />
        <Stat label="Annual Tuition" value={fmt$(s.tuition)} />
        <Stat label="Match Rate" value={`${s.matchRate}%`} />
        <Stat label="NIH Funding" value={`$${s.researchFunding}M`} accent />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Specialty Outcomes">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Primary care output</span><span className="font-mono font-bold">{s.primaryCarePct}%</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Program focus</span><span className="font-mono font-bold">{s.focus}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">In-state preference</span><span className="font-mono font-bold">{s.inStateRequired ? "Yes" : "No"}</span></div>
          </div>
        </Section>
        <Section title="Top Residency Placements">
          <div className="flex flex-wrap gap-2">
            {s.topResidencies.map((r) => (
              <span key={r} className="px-3 py-1 rounded-full bg-muted text-sm font-medium">{r}</span>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

function MbaProfile({ id }: { id: string }) {
  const s = mbaPrograms.find((x) => x.id === id);
  if (!s) return <NotFoundCard kind="MBA" listHref="/mba" listLabel="← Back to MBA Rankings" />;
  return (
    <div className="min-h-screen px-4 py-8 max-w-6xl mx-auto">
      <Hero id={s.id} name={s.name} kind="MBA Program" color={s.color} loc={s.loc} icon={Briefcase} backHref="/mba" backLabel="Back to MBA Rankings" type="mba" />
      {s.summary && <p className="text-base text-foreground/85 mb-6 leading-relaxed bg-card border border-border rounded-2xl p-5 italic"><LinkifiedText text={s.summary} /></p>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label={`Rank (${s.region})`} value={`#${s.rank}`} accent />
        <Stat label="Acceptance" value={`${s.acceptRate}%`} />
        <Stat label="Median GMAT" value={s.medianGMAT} />
        <Stat label="Avg Work Exp" value={`${s.avgWorkExp}y`} />
        <Stat label="Class Size" value={s.classSize} />
        <Stat label="Annual Tuition" value={fmt$(s.tuition)} />
        <Stat label="Median Base" value={fmt$(s.medianSalary)} accent />
        <Stat label="Signing Bonus" value={`+${fmt$(s.signingBonus)}`} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Industry Placement">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Consulting</span><span className="font-mono font-bold">{s.consultingPct}%</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Finance</span><span className="font-mono font-bold">{s.financePct}%</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tech</span><span className="font-mono font-bold">{s.techPct}%</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Other</span><span className="font-mono font-bold">{Math.max(0, 100 - s.consultingPct - s.financePct - s.techPct)}%</span></div>
          </div>
        </Section>
        <Section title="Class Profile">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Employment at 3 months</span><span className="font-mono font-bold">{s.employmentPct}%</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">International students</span><span className="font-mono font-bold">{s.intlPct}%</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Region</span><span className="font-mono font-bold">{s.region}</span></div>
          </div>
        </Section>
      </div>
    </div>
  );
}

function TradeProfile({ id }: { id: string }) {
  const s = tradeSchools.find((x) => x.id === id);
  if (!s) return <NotFoundCard kind="Trade" listHref="/trade" listLabel="← Back to Trade Rankings" />;
  const paybackDisplay = s.tuition === 0 ? "Free" : s.paybackMonths ? `${s.paybackMonths} mo` : `${(s.tuition / s.medianSalary * 12).toFixed(0)} mo`;
  return (
    <div className="min-h-screen px-4 py-8 max-w-6xl mx-auto">
      <Hero id={s.id} name={s.name} kind="Trade & Technical" color={s.color} loc={s.loc} icon={Wrench} backHref="/trade" backLabel="Back to Trade Rankings" type="trade" />
      {s.summary && <p className="text-base text-foreground/85 mb-6 leading-relaxed bg-card border border-border rounded-2xl p-5 italic"><LinkifiedText text={s.summary} /></p>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="National Rank" value={`#${s.rank}`} accent />
        <Stat label="Flagship Program" value={<span className="text-base">{s.topProgram}</span>} />
        <Stat label="Length" value={`${s.lengthMonths} mo`} />
        <Stat label="Total Cost" value={fmt$(s.tuition)} />
        <Stat label="Completion" value={`${s.completionPct}%`} />
        <Stat label="Job Placement" value={`${s.jobPlacementPct}%`} accent />
        <Stat label="Median Salary" value={`$${(s.medianSalary / 1000).toFixed(0)}k`} accent />
        <Stat label="Payback Period" value={paybackDisplay} sub="months to earn back tuition" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Section title="About">
          <div className="space-y-3 text-sm">
            {s.founded && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Founded</span>
                <span className="font-mono font-bold">{s.founded}</span>
              </div>
            )}
            {s.campuses && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Campuses</span>
                <span className="font-mono font-bold">{s.campuses}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">School Type</span>
              <span className="font-mono font-bold">{s.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Accreditation</span>
              <span className="font-mono font-bold text-right max-w-[160px]"><Ref name={s.accreditation} /></span>
            </div>
            {s.website && (
              <div className="flex justify-between items-center pt-1">
                <span className="text-muted-foreground">Website</span>
                <a
                  href={`https://${s.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-primary hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" /> {s.website}
                </a>
              </div>
            )}
          </div>
        </Section>

        <Section title="Programs Offered">
          <div className="space-y-3">
            {s.programDetails.map((p) => (
              <div key={p.name} className="p-3 rounded-xl bg-muted/40 border border-border/60">
                <div className="font-bold text-sm mb-1">{p.name}</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{p.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-muted-foreground">Industries: {s.industries.join(" · ")}</div>
        </Section>

        <Section title="Credentials Earned">
          <div className="flex flex-wrap gap-2">
            {s.certifications.map((c) => (
              <span key={c} className="px-3 py-1 rounded-full border border-border text-sm font-mono"><Ref name={c} /></span>
            ))}
          </div>
        </Section>
      </div>

      {s.employerPartners && s.employerPartners.length > 0 && (
        <Section title="Employer Partners">
          <div className="flex flex-wrap gap-2">
            {s.employerPartners.map((e) => (
              <span key={e} className="px-3 py-1.5 rounded-full bg-primary/8 border border-primary/20 text-sm font-medium text-primary"><Ref name={e} /></span>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

export default function SchoolProfilePage() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const t = type as SchoolType;
  if (t === "law") return <LawProfile id={id} />;
  if (t === "med") return <MedProfile id={id} />;
  if (t === "mba") return <MbaProfile id={id} />;
  if (t === "trade") return <TradeProfile id={id} />;
  return (
    <div className="min-h-screen px-4 py-20 max-w-md mx-auto text-center">
      <h1 className="text-2xl font-black mb-2">Unknown school type</h1>
      <Link href="/" className="text-primary hover:underline">Back to home</Link>
    </div>
  );
}
