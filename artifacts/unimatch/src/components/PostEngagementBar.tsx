export default function PostEngagementBar() {
  return (
    <div className="pt-2">
      <div className="flex flex-wrap gap-2 text-sm">
        <button className="rounded-xl px-3 py-2 font-black hover:bg-muted">❤️ Like</button>
        <button className="rounded-xl px-3 py-2 font-black hover:bg-muted">💬 Comment</button>
        <button className="rounded-xl px-3 py-2 font-black hover:bg-muted">🔁 Share</button>
      </div>
    </div>
  );
}
