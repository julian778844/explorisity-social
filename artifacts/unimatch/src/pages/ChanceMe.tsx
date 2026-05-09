import { useState } from "react";

type ChanceResult = {
  category: "Reach" | "Target" | "Likely";
  score: number;
  summary: string;
  nextSteps: string[];
};

export default function ChanceMe() {
  const [form, setForm] = useState({
    gpa: "",
    testType: "SAT",
    testScore: "",
    intendedMajor: "",
    country: "",
    demographicBackground: "",
    school: ""
  });

  const [result, setResult] = useState<ChanceResult | null>(null);

  function estimateChance() {
    const gpa = Number(form.gpa || 0);
    const testScore = Number(form.testScore || 0);
    let score = 45;

    if (gpa >= 3.8) score += 20;
    else if (gpa >= 3.4) score += 10;

    if (form.testType === "SAT" && testScore >= 1450) score += 20;
    if (form.testType === "ACT" && testScore >= 32) score += 20;
    if (form.testType === "MCAT" && testScore >= 515) score += 20;
    if (form.testType === "LSAT" && testScore >= 165) score += 20;
    if (form.testType === "GMAT" && testScore >= 700) score += 20;

    score = Math.max(5, Math.min(score, 95));
    const category = score >= 70 ? "Likely" : score >= 45 ? "Target" : "Reach";

    setResult({
      category,
      score,
      summary: `${form.school || "This school"} looks like a ${category.toLowerCase()} option based on the information provided.`,
      nextSteps: [
        "Compare this school with two similar programs.",
        "Review student communities for real applicant experiences.",
        "Save this school to your profile.",
        "Explore rankings connected to your intended major."
      ]
    });
  }

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-8">
      <section>
        <p className="text-sm font-medium text-gray-500">Admissions discovery</p>
        <h1 className="text-3xl font-bold">Chance Me</h1>
        <p className="mt-2 text-gray-600">
          Get a quick admissions-style estimate and discover schools, rankings, and student communities that match your profile.
        </p>
      </section>

      <section className="grid gap-4 rounded-2xl border bg-white p-5 shadow-sm md:grid-cols-2">
        <input className="rounded-xl border p-3" placeholder="School of interest" value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })} />
        <input className="rounded-xl border p-3" placeholder="GPA" value={form.gpa} onChange={(e) => setForm({ ...form, gpa: e.target.value })} />
        <select className="rounded-xl border p-3" value={form.testType} onChange={(e) => setForm({ ...form, testType: e.target.value })}>
          <option>SAT</option>
          <option>ACT</option>
          <option>MCAT</option>
          <option>LSAT</option>
          <option>GMAT</option>
        </select>
        <input className="rounded-xl border p-3" placeholder="Test score" value={form.testScore} onChange={(e) => setForm({ ...form, testScore: e.target.value })} />
        <input className="rounded-xl border p-3" placeholder="Intended major or program" value={form.intendedMajor} onChange={(e) => setForm({ ...form, intendedMajor: e.target.value })} />
        <input className="rounded-xl border p-3" placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
        <input className="rounded-xl border p-3 md:col-span-2" placeholder="Optional demographic background" value={form.demographicBackground} onChange={(e) => setForm({ ...form, demographicBackground: e.target.value })} />
        <button onClick={estimateChance} className="rounded-xl bg-black px-5 py-3 font-semibold text-white md:col-span-2">Estimate my chance</button>
      </section>

      {result && (
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Estimated fit</p>
              <h2 className="text-2xl font-bold">{result.category}</h2>
            </div>
            <div className="text-3xl font-bold">{result.score}%</div>
          </div>
          <p className="mt-4 text-gray-700">{result.summary}</p>
          <div className="mt-5">
            <h3 className="font-semibold">Recommended next steps</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-700">
              {result.nextSteps.map((step) => <li key={step}>{step}</li>)}
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}
