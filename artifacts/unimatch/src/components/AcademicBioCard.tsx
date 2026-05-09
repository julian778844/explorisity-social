type AcademicBio = {
  gpa?: string;
  sat?: string;
  act?: string;
  mcat?: string;
  lsat?: string;
  gmat?: string;
  intendedMajor?: string;
  careerGoal?: string;
  country?: string;
  demographicBackground?: string;
};

export default function AcademicBioCard({ bio }: { bio?: AcademicBio }) {
  const fields = [
    ["GPA", bio?.gpa],
    ["SAT", bio?.sat],
    ["ACT", bio?.act],
    ["MCAT", bio?.mcat],
    ["LSAT", bio?.lsat],
    ["GMAT", bio?.gmat],
    ["Intended major", bio?.intendedMajor],
    ["Career goal", bio?.careerGoal],
    ["Country", bio?.country],
    ["Background", bio?.demographicBackground],
  ].filter(([, value]) => Boolean(value));

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold">Academic Bio</h2>
      {!fields.length ? (
        <p className="mt-2 text-sm text-gray-500">No academic details shared yet.</p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {fields.map(([label, value]) => (
            <div key={label} className="rounded-xl bg-gray-50 p-3">
              <p className="text-xs font-medium text-gray-500">{label}</p>
              <p className="font-semibold">{value}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
