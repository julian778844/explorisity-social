
type LikeUser = {
  id: number;
  username: string;
  avatar?: string;
};

const mockLikes: LikeUser[] = [
  { id: 1, username: "orlando" },
  { id: 2, username: "jessiel" }
];

export default function LikesModal() {
  return (
    <div className="rounded-2xl border p-4 bg-white">
      <h2 className="font-bold text-lg mb-4">Likes</h2>

      <div className="space-y-3">
        {mockLikes.map((user) => (
          <a
            key={user.id}
            href={`/profile/${user.username}`}
            className="flex items-center gap-3 hover:opacity-80"
          >
            <div className="h-10 w-10 rounded-full bg-gray-300" />

            <div className="font-medium">
              @{user.username}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
