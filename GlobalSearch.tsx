
import { useState } from "react";

export default function GlobalSearch() {
  const [query, setQuery] = useState("");

  return (
    <div className="w-full">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search schools, users, communities..."
        className="w-full rounded-xl border px-4 py-2"
      />
    </div>
  );
}
