
type Props = {
  username: string;
  comment: string;
};

export default function CommentItem({ username, comment }: Props) {
  return (
    <div className="flex gap-3 py-2">
      <a href={`/profile/${username}`}>
        <div className="h-9 w-9 rounded-full bg-gray-300" />
      </a>

      <div>
        <a
          href={`/profile/${username}`}
          className="font-semibold hover:underline"
        >
          @{username}
        </a>

        <p className="text-sm">
          {comment}
        </p>
      </div>
    </div>
  );
}
