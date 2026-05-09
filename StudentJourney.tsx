type JourneyItem = {
  id: number;
  type: string;
  title: string;
  description?: string;
  date: string;
};

const sampleJourney: JourneyItem[] = [
  { id: 1, type: "Application", title: "Submitted application", description: "Added this school to my application list.", date: "Today" },
  { id: 2, type: "Scholarship", title: "Found a scholarship opportunity", description: "Saved a scholarship connected to my intended major.", date: "This week" }
];

export default function StudentJourney() {
  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-bold">Student Journey</h2>
        <p className="text-sm text-gray-500">Milestones, applications, opportunities, and achievements.</p>
      </div>
      <div className="space-y-4">
        {sampleJourney.map((item) => (
          <article key={item.id} className="rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold">{item.type}</span>
              <span className="text-xs text-gray-500">{item.date}</span>
            </div>
            <h3 className="mt-3 font-semibold">{item.title}</h3>
            {item.description && <p className="mt-1 text-sm text-gray-600">{item.description}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}
