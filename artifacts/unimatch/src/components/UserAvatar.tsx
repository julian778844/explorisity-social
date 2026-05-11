import type { PostAuthor } from "@/lib/api";

type AvatarUser = Pick<PostAuthor, "displayName" | "avatarColor" | "avatarUrl">;

type Props = {
  user?: AvatarUser | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const SIZE: Record<NonNullable<Props["size"]>, string> = {
  sm: "h-9 w-9 rounded-xl text-sm",
  md: "h-11 w-11 rounded-2xl text-base",
  lg: "h-16 w-16 rounded-2xl text-2xl",
  xl: "h-28 w-28 rounded-3xl text-4xl",
};

export default function UserAvatar({ user, size = "md", className = "" }: Props) {
  const dims = SIZE[size];

  if (!user) {
    return <div className={`${dims} flex shrink-0 items-center justify-center bg-muted ${className}`} />;
  }

  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.displayName}
        className={`${dims} shrink-0 object-cover ${className}`}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`${dims} flex shrink-0 items-center justify-center font-black text-white ${className}`}
      style={{ backgroundColor: user.avatarColor }}
      aria-label={`${user.displayName} profile picture`}
    >
      {user.displayName.slice(0, 1).toUpperCase() || "?"}
    </div>
  );
}
