import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { universities } from "@/data/universities";
import {
  MapPin, Users, TrendingUp, Briefcase, BookOpen, Star, Globe, DollarSign, Microscope, ArrowLeft,
  GraduationCap, Trophy, Heart, Home, Shield, Award, FileText, PieChart, Landmark,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import RadarChart from "@/components/RadarChart";
import { useFollows } from "@/lib/follows";
import SchoolLogo from "@/components/SchoolLogo";
import { getHeroPhotos } from "@/lib/schoolPhotos";
import CampusCarousel from "@/components/CampusCarousel";
import { Ref, LinkifiedText } from "@/components/Ref";

function FollowButton({ id }: { id: string }) {
  const { isFollowing, toggle } = useFollows();
  const following = isFollowing("undergrad", id);
  return (
    <button
      onClick={() => toggle("undergrad", id)}
      className={`inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${following ? "bg-primary/10 text-primary border border-primary/30" : "bg-primary text-primary-foreground hover-elevate shadow-md"}`}
      data-testid={`button-follow-${id}`}
    >
      <Heart className={`w-4 h-4 ${following ? "fill-current" : ""}`} />
      {following ? "Following" : "Follow School"}
    </button>
  );
}

function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{label}</div>
      <div className="font-mono font-bold text-base leading-tight">{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

function Section({ icon: Icon, title, eyebrow, children }: { icon: React.ElementType; title: string; eyebrow?: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="font-bold text-base flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" /> {title}
        </h2>
        {eyebrow && <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{eyebrow}</span>}
      </div>
      {children}
    </div>
  );
}

function Bar({ label, value, max = 100, color, format }: { label: string; value: number; max?: number; color: string; format?: (v: number) => string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-bold">{format ? format(value) : value}</span>
      </div>
      <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>
    </div>
  );
}

export default function UniversityPage() {
  const { id } = useParams<{ id: string }>();
  const uni = universities.find(u => u.id === id);

  if (!uni) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <div className="text-5xl mb-4">🎓</div>
          <h1 className="text-2xl font-bold mb-2">University not found</h1>
          <p className="text-muted-foreground mb-6">No data for "{id}"</p>
          <Link href="/rankings" className="text-primary hover:underline">Browse all universities →</Link>
        </div>
      </div>
    );
  }

  const radarData = [
    { subject: "Academics", [uni.shortName]: uni.scores.academics },
    { subject: "Career", [uni.shortName]: uni.scores.career },
    { subject: "Research", [uni.shortName]: uni.scores.research },
    { subject: "Social", [uni.shortName]: uni.scores.social },
    { subject: "Diversity", [uni.shortName]: uni.scores.diversity },
    { subject: "Value", [uni.shortName]: uni.scores.value },
    { subject: "Athletics", [uni.shortName]: uni.scores.athletics },
  ];

  const otherUnis = universities.filter(u => u.id !== uni.id).slice(0, 4);
  const a = uni.admissions, f = uni.financial, ac = uni.academicLife,
        dem = uni.demographics, c = uni.campus, sl = uni.studentLife,
        at = uni.athletics, oc = uni.outcomes;

  const heroPhotos = getHeroPhotos(uni.id);

  return (
    <div className="min-h-screen px-4 py-10 max-w-7xl mx-auto">
      <Link href="/rankings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Rankings
      </Link>

      {/* CAMPUS PHOTO BANNER */}
      <CampusCarousel
        images={heroPhotos}
        alt={`${uni.name} campus`}
        overlay="full"
        className="rounded-3xl mb-4 h-52 md:h-64 border border-border"
      />

      {/* HERO */}
      <div className="relative rounded-3xl border border-border bg-card overflow-hidden mb-6 p-8">
        <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(circle at top left, ${uni.color}, transparent 60%)` }} />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <SchoolLogo id={uni.id} name={uni.name} color={uni.color} size={36} rounded="md" />
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-border text-xs">{uni.type}</Badge>
                  <Badge variant="outline" className="border-border text-xs">{uni.country}</Badge>
                  <Badge variant="outline" className="border-border text-xs">Founded {c.founded}</Badge>
                  <Badge variant="outline" className="border-border text-xs">{c.setting}</Badge>
                  {c.religiousAffiliation && <Badge variant="outline" className="border-border text-xs">{c.religiousAffiliation}</Badge>}
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">{uni.name}</h1>
              <p className="text-muted-foreground flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4" /> {uni.location} · {at.mascot} · "{c.motto}"
              </p>
              <p className="text-muted-foreground/80 max-w-2xl leading-relaxed">{uni.description}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {uni.campusCulture.map(cc => (
                  <Badge key={cc} variant="secondary" className="bg-muted/50 text-xs">{cc}</Badge>
                ))}
              </div>
              <FollowButton id={uni.id} />
            </div>

            <div className="flex flex-col gap-3 min-w-[200px]">
              {[
                { label: "Prestige Score", value: `${uni.prestigeScore}/100`, icon: Award },
                { label: "Acceptance Rate", value: `${uni.acceptanceRate}%`, icon: Users },
                { label: "Enrollment", value: uni.enrollment.toLocaleString(), icon: Users },
                { label: "Annual Tuition", value: `$${(uni.tuition / 1000).toFixed(0)}k`, icon: DollarSign },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                  <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground">{label}</div>
                    <div className="font-mono font-bold text-sm">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* QUICK FACTS STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-8">
        <Stat label="Founded" value={c.founded} />
        <Stat label="Campus" value={`${c.acres.toLocaleString()} ac`} sub={c.setting} />
        <Stat label="Mascot" value={at.mascot} />
        <Stat label="Division" value={at.division} sub={at.conference} />
        <Stat label="Stu/Fac" value={ac.studentFacultyRatio} sub="ratio" />
        <Stat label="Avg Class" value={ac.avgClassSize} sub="students" />
        <Stat label="6yr Grad" value={`${ac.sixYearGradRate}%`} />
        <Stat label="Retention" value={`${ac.retentionRate}%`} />
      </div>

      {/* ADMISSIONS PROFILE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Section icon={FileText} title="Admissions Profile" eyebrow="Class Stats">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
            <Stat label="SAT Range" value={`${a.satRange[0]}–${a.satRange[1]}`} sub="middle 50%" />
            <Stat label="ACT Range" value={`${a.actRange[0]}–${a.actRange[1]}`} sub="middle 50%" />
            <Stat label="Avg GPA" value={a.avgGPA.toFixed(2)} sub="weighted" />
            <Stat label="Yield" value={`${a.yieldRate}%`} sub="admits enrolling" />
            <Stat label="App Fee" value={`$${a.applicationFee}`} />
            <Stat label="Deadline" value={a.applicationDeadline} sub="regular" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={a.testOptional ? "default" : "outline"} className={a.testOptional ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30" : ""}>
              {a.testOptional ? "✓" : "✕"} Test-optional
            </Badge>
            <Badge variant={a.earlyAction ? "default" : "outline"} className={a.earlyAction ? "bg-[hsl(var(--accent)/0.15)] text-primary border-[hsl(var(--accent)/0.3)]" : ""}>
              {a.earlyAction ? "✓" : "✕"} Early Action
            </Badge>
            <Badge variant={a.earlyDecision ? "default" : "outline"} className={a.earlyDecision ? "bg-primary/10 text-primary border-primary/20" : ""}>
              {a.earlyDecision ? "✓" : "✕"} Early Decision
            </Badge>
          </div>
        </Section>

        <Section icon={DollarSign} title="Financial Aid" eyebrow="Cost & Support">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
            <Stat label="Net Price" value={`$${(f.netPriceAvg/1000).toFixed(1)}k`} sub="avg after aid" />
            <Stat label="Sticker" value={`$${(uni.tuition/1000).toFixed(0)}k`} sub="tuition only" />
            <Stat label="Avg Grant" value={`$${(f.avgGrantAid/1000).toFixed(1)}k`} sub="institutional" />
            <Stat label="Get Aid" value={`${f.aidPercent}%`} sub="of students" />
            <Stat label="Pell" value={`${f.pellGrantPct}%`} sub="receive Pell" />
            <Stat label="Avg Debt" value={`$${(f.avgDebtAtGrad/1000).toFixed(1)}k`} sub="at graduation" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={f.meetsFullNeed ? "default" : "outline"} className={f.meetsFullNeed ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30" : ""}>
              {f.meetsFullNeed ? "✓" : "✕"} Meets full demonstrated need
            </Badge>
            <Badge variant={f.workStudyAvailable ? "default" : "outline"} className={f.workStudyAvailable ? "bg-blue-500/15 text-blue-700 border-blue-500/30" : ""}>
              {f.workStudyAvailable ? "✓" : "✕"} Federal work-study
            </Badge>
          </div>
        </Section>
      </div>

      {/* PROGRAMS */}
      <div className="mb-6">
        <Section icon={GraduationCap} title="Notable Programs" eyebrow={`${uni.programs.length} highlighted`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {uni.programs.map(p => (
              <div key={p.name} className="p-4 rounded-xl bg-muted/30 border border-border/60 hover:border-border transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-sm">{p.name}</div>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: uni.color }} />
                </div>
                <div className="text-[10px] uppercase tracking-wider text-primary/70 font-bold mb-2">{p.level}</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{p.highlight}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* ACADEMIC LIFE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Section icon={BookOpen} title="Academic Life" eyebrow="Inside the Classroom">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <Stat label="Stu/Fac Ratio" value={ac.studentFacultyRatio} />
              <Stat label="Avg Class" value={ac.avgClassSize} sub="students" />
              <Stat label="< 20 Students" value={`${ac.classesUnder20Pct}%`} sub="of classes" />
              <Stat label="Study Abroad" value={`${ac.studyAbroadPct}%`} sub="participate" />
            </div>
            <Bar label="Freshman Retention" value={ac.retentionRate} color={uni.color} format={v => `${v}%`} />
            <Bar label="4-Year Graduation Rate" value={ac.fourYearGradRate} color={uni.color} format={v => `${v}%`} />
            <Bar label="6-Year Graduation Rate" value={ac.sixYearGradRate} color={uni.color} format={v => `${v}%`} />
          </Section>
        </div>

        <Section icon={Microscope} title="Research" eyebrow="R&D">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Research Prestige</span>
                <span className="font-mono font-bold">{uni.research.prestige}/100</span>
              </div>
              <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full" style={{ backgroundColor: uni.color }}
                  initial={{ width: 0 }} animate={{ width: `${uni.research.prestige}%` }} transition={{ duration: 1 }} />
              </div>
            </div>
            <Stat label="Annual Research Spend" value={`$${uni.research.annualSpend}B`} />
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Internship Score</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted/50 rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full bg-primary" initial={{ width: 0 }} animate={{ width: `${uni.internships.score}%` }} transition={{ duration: 1, delay: 0.3 }} />
                </div>
                <span className="font-mono text-sm font-bold">{uni.internships.score}</span>
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* CAREER OUTCOMES */}
      <div className="mb-6">
        <Section icon={TrendingUp} title="Career Outcomes" eyebrow="Where Grads Land">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <Stat label="Median Salary" value={`$${(uni.careerOutcomes.medianSalary/1000).toFixed(0)}k`} sub="early career" />
            <Stat label="At 10 Years" value={`$${(oc.salaryAt10Year/1000).toFixed(0)}k`} sub="mid-career" />
            <Stat label="Employed" value={`${uni.careerOutcomes.employmentRate}%`} sub="within 6 months" />
            <Stat label="Grad School" value={`${oc.gradSchoolPct}%`} sub="continue" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Top Employers</div>
              <div className="flex flex-wrap gap-1.5">
                {uni.careerOutcomes.topCompanies.map(co => (
                  <Badge key={co} variant="outline" className="border-border text-xs"><Ref name={co} /></Badge>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Top Job Markets</div>
              <div className="flex flex-wrap gap-1.5">
                {oc.topJobLocations.map(l => (
                  <Badge key={l} variant="outline" className="border-border text-xs">{l}</Badge>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Top Grad Destinations</div>
              <div className="flex flex-wrap gap-1.5">
                {oc.topGradSchools.map(g => (
                  <Badge key={g} variant="outline" className="border-border text-xs">{g}</Badge>
                ))}
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4 italic"><LinkifiedText text={oc.notableEmployersByMajor} /></p>
        </Section>
      </div>

      {/* DEMOGRAPHICS + STUDENT LIFE + ATHLETICS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Section icon={PieChart} title="Demographics" eyebrow="Class Mix">
          <Bar label="International" value={dem.internationalPct} color={uni.color} format={v => `${v}%`} />
          <Bar label="Out of State" value={dem.outOfStatePct} color={uni.color} format={v => `${v}%`} />
          <Bar label="First Generation" value={dem.firstGenPct} color={uni.color} format={v => `${v}%`} />
          <Bar label="Female" value={dem.femalePct} color={uni.color} format={v => `${v}%`} />
          <Bar label="Ethnic Diversity Index" value={dem.ethnicDiversityPct} color={uni.color} />
        </Section>

        <Section icon={Heart} title="Student Life" eyebrow="On Campus">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Stat label="Greek Life" value={`${sl.greekLifePct}%`} sub="participate" />
            <Stat label="Varsity Teams" value={sl.varsityTeams} />
            <Stat label="Student Clubs" value={sl.clubsCount.toLocaleString()} />
            <Stat label="Frosh on Campus" value={`${sl.freshmenOnCampusPct}%`} />
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant={sl.housingGuaranteed ? "default" : "outline"} className={sl.housingGuaranteed ? "bg-[hsl(var(--accent)/0.15)] text-primary border-[hsl(var(--accent)/0.3)]" : ""}>
              <Home className="w-3 h-3 mr-1" /> {sl.housingGuaranteed ? "Housing guaranteed" : "Housing not guaranteed"}
            </Badge>
          </div>
          <Bar label="Campus Safety" value={sl.safetyScore} color={uni.color} />
        </Section>

        <Section icon={Trophy} title="Athletics" eyebrow={at.division}>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Stat
              label="Conference"
              value={
                <span>
                  {at.conference.split(/\s*\/\s*/).map((c, i, arr) => (
                    <span key={`${c}-${i}`}>
                      <Ref name={c} />
                      {i < arr.length - 1 && <span className="text-muted-foreground"> / </span>}
                    </span>
                  ))}
                </span>
              }
            />
            <Stat label="Mascot" value={at.mascot} />
            <Stat label="Varsity Teams" value={sl.varsityTeams} />
            <Stat label="Nat'l Titles" value={at.nationalTitles} />
          </div>
          <p className="text-xs text-muted-foreground italic">{at.rivalNote}</p>
        </Section>
      </div>

      {/* CAMPUS & LIFESTYLE */}
      <div className="mb-6">
        <Section icon={Globe} title="Campus & Lifestyle" eyebrow={`${c.acres.toLocaleString()} acres · ${c.setting}`}>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <Stat label="Setting" value={c.setting} />
            <Stat label="Founded" value={c.founded} />
            <Stat label="Campus Size" value={`${c.acres.toLocaleString()} ac`} />
            <Stat label="Weather" value={uni.lifestyle.weather} />
            <Stat label="City Type" value={uni.lifestyle.city} />
            <Stat label="Housing Cost" value={uni.lifestyle.housingCost} />
          </div>
          <div className="mt-4 p-4 rounded-xl bg-muted/30 border border-border/60 flex items-center gap-3">
            <Landmark className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <div>
              <div className="text-xs text-muted-foreground">Motto</div>
              <div className="font-medium text-sm italic">"{c.motto}"</div>
            </div>
          </div>
        </Section>
      </div>

      {/* SCORES + STRENGTHS + ALUMNI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Section icon={TrendingUp} title="Strengths">
              <ul className="space-y-2">
                {uni.strengths.map(s => (
                  <li key={s} className="text-sm flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5 font-bold">+</span>
                    <span className="text-muted-foreground">{s}</span>
                  </li>
                ))}
              </ul>
            </Section>
            <Section icon={Shield} title="Watch Out">
              <ul className="space-y-2">
                {uni.weaknesses.map(w => (
                  <li key={w} className="text-sm flex items-start gap-2">
                    <span className="text-red-500 mt-0.5 font-bold">−</span>
                    <span className="text-muted-foreground">{w}</span>
                  </li>
                ))}
              </ul>
            </Section>
          </div>

          {uni.famousAlumni.length > 0 && (
            <Section icon={Star} title="Famous Alumni">
              <div className="flex flex-wrap gap-2">
                {uni.famousAlumni.map(al => (
                  <Badge key={al} variant="secondary" className="bg-muted/50 text-sm">{al}</Badge>
                ))}
              </div>
            </Section>
          )}
        </div>

        <div className="space-y-6">
          <Section icon={PieChart} title="Score Breakdown">
            <div className="h-[260px]">
              <RadarChart data={radarData} keys={[uni.shortName]} colors={[uni.color]} />
            </div>
            <div className="mt-4 space-y-2">
              {Object.entries(uni.scores).map(([key, val]) => (
                <div key={key} className="flex items-center gap-3">
                  <div className="text-xs text-muted-foreground capitalize w-20 flex-shrink-0">{key}</div>
                  <div className="flex-1 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full" style={{ backgroundColor: uni.color }}
                      initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ duration: 0.8 }} />
                  </div>
                  <div className="text-xs font-mono w-8 text-right">{val}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={Briefcase} title="Internship Industries">
            <div className="text-3xl font-black mb-3" style={{ color: uni.color }}>{uni.internships.score}/100</div>
            <div className="flex flex-wrap gap-2">
              {uni.internships.topIndustries.map(ind => (
                <Badge key={ind} variant="outline" className="border-border text-xs">{ind}</Badge>
              ))}
            </div>
          </Section>

          <Link
            href={`/compare?a=${uni.id}`}
            className="block w-full text-center px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 font-semibold text-sm transition-all"
          >
            Compare {uni.shortName} →
          </Link>
        </div>
      </div>

      {/* OVERVIEW */}
      <div className="bg-gradient-to-br from-primary/10 via-transparent to-accent/10 border border-border rounded-2xl p-6 mb-8">
        <h2 className="font-bold mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[hsl(var(--accent))]" /> Overview
        </h2>
        <p className="text-muted-foreground leading-relaxed">{uni.aiSummary}</p>
      </div>

      {/* COMPARE WITH OTHERS */}
      <div>
        <h2 className="text-xl font-bold mb-4">Compare with Others</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {otherUnis.map(other => (
            <Link
              key={other.id}
              href={`/compare?a=${uni.id}&b=${other.id}`}
              className="group p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/60 transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: other.color }} />
                <span className="font-bold text-sm">{other.shortName}</span>
              </div>
              <div className="text-xs text-muted-foreground">{other.location}</div>
              <div className="text-xs text-primary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Compare →</div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
