const rankings = [
  { label: "Most followed schools", value: "Based on saves and follows" },
  { label: "Most discussed schools", value: "Based on posts and comments" },
  { label: "Fastest-growing communities", value: "Based on new members this week" },
  { label: "Best networking communities", value: "Based on messages, events, and follows" },
];

export default function SocialRankingsPanel() {
  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold">Live Student Rankings</h2>
      <p className="mt-1 text-sm text-gray-500">Rankings can combine official school data with real student activity.</p>
      <div className="mt-4 space-y-3">
        {rankings.map((item) => (
          <div key={item.label} className="rounded-xl border p-4">
            <p className="font-semibold">{item.label}</p>
            <p className="text-sm text-gray-500">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
