import { Instagram, Linkedin, Facebook, Twitter, Youtube, Music2 } from "lucide-react";
import type { ApiUser, SocialPlatform } from "@/lib/api";

type Meta = {
  key: SocialPlatform;
  label: string;
  Icon: typeof Instagram;
  base: string;
  brand: string;
  placeholder: string;
};

export const SOCIAL_PLATFORMS: Meta[] = [
  { key: "instagram", label: "Instagram", Icon: Instagram, base: "https://instagram.com/",   brand: "#E1306C", placeholder: "username or full URL" },
  { key: "linkedin",  label: "LinkedIn",  Icon: Linkedin,  base: "https://linkedin.com/in/", brand: "#0A66C2", placeholder: "in/your-handle or full URL" },
  { key: "facebook",  label: "Facebook",  Icon: Facebook,  base: "https://facebook.com/",    brand: "#1877F2", placeholder: "username or full URL" },
  { key: "twitter",   label: "X (Twitter)", Icon: Twitter, base: "https://x.com/",           brand: "#0F1419", placeholder: "username or full URL" },
  { key: "tiktok",    label: "TikTok",    Icon: Music2,    base: "https://tiktok.com/@",     brand: "#010101", placeholder: "username or full URL" },
  { key: "youtube",   label: "YouTube",   Icon: Youtube,   base: "https://youtube.com/@",    brand: "#FF0000", placeholder: "@channel or full URL" },
];

export function buildSocialUrl(platform: SocialPlatform, raw: string): string {
  const v = raw.trim();
  if (/^https?:\/\//i.test(v)) return v;
  const meta = SOCIAL_PLATFORMS.find((p) => p.key === platform)!;
  const handle = v.replace(/^@/, "").replace(/^\/+/, "");
  return meta.base + handle;
}

export function displayHandle(platform: SocialPlatform, raw: string): string {
  const v = raw.trim();
  if (/^https?:\/\//i.test(v)) {
    try {
      const u = new URL(v);
      const path = u.pathname.replace(/\/+$/, "").replace(/^\/+/, "");
      return path ? `@${path.split("/").pop()}` : u.hostname;
    } catch {
      return v;
    }
  }
  return v.startsWith("@") ? v : `@${v.replace(/^\/+/, "")}`;
  void platform;
}

type Props = {
  user: Pick<ApiUser, SocialPlatform>;
  size?: "sm" | "md";
  className?: string;
};

export default function SocialLinks({ user, size = "md", className = "" }: Props) {
  const links = SOCIAL_PLATFORMS.filter((p) => user[p.key] && user[p.key]!.trim() !== "");
  if (links.length === 0) return null;
  const dim = size === "sm" ? "w-8 h-8" : "w-10 h-10";
  const ic = size === "sm" ? "w-4 h-4" : "w-[18px] h-[18px]";
  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`} data-testid="social-links">
      {links.map(({ key, label, Icon, brand }) => {
        const raw = user[key]!;
        return (
          <a
            key={key}
            href={buildSocialUrl(key, raw)}
            target="_blank"
            rel="noopener noreferrer"
            title={`${label}: ${displayHandle(key, raw)}`}
            aria-label={`${label} profile`}
            data-testid={`social-link-${key}`}
            className={`${dim} inline-flex items-center justify-center rounded-full text-white shadow-sm hover:scale-110 hover:shadow-md transition-transform`}
            style={{ backgroundColor: brand }}
          >
            <Icon className={ic} />
          </a>
        );
      })}
    </div>
  );
}
