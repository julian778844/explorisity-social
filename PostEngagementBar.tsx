
export default function PostEngagementBar() {
  return (
    <div className="pt-2">
      <div className="flex gap-4 text-sm">
        <button>❤️</button>
        <button>💬</button>
        <button>🔁</button>
        <button>🔖</button>
      </div>

      <button className="text-sm font-medium mt-2 hover:underline">
        Liked by orlando and others
      </button>
    </div>
  );
}
