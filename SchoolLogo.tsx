import { useState } from "react";
import { getDomain, getLogoUrl } from "@/lib/schoolPhotos";

type Props = {
  id: string;
  name: string;
  color?: string;
  size?: number;
  rounded?: "md" | "lg" | "xl" | "full";
  className?: string;
};

const ROUND: Record<NonNullable<Props["rounded"]>, string> = {
  md: "rounded-md", lg: "rounded-lg", xl: "rounded-xl", full: "rounded-full",
};

export default function SchoolLogo({ id, name, color = "#7C3AED", size = 32, rounded = "lg", className = "" }: Props) {
  // Build a deterministic fallback chain. Try each URL in order; on error advance.
  const overrideUrl = getLogoUrl(id);
  const isOverride = overrideUrl && !overrideUrl.startsWith("https://logo.clearbit.com/");
  const domain = getDomain(id);
  const sources: string[] = [];
  if (isOverride && overrideUrl) sources.push(overrideUrl);
  if (domain) {
    sources.push(`https://logo.clearbit.com/${domain}`);
    // Google's favicon CDN is the most reliable third fallback (rarely blocked, always returns
    // *something* — even for tiny .edu sites — and the high-res 128px size renders cleanly).
    sources.push(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
  }

  const [idx, setIdx] = useState(0);
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  const dim = { width: size, height: size };

  if (idx < sources.length) {
    return (
      <div
        className={`${ROUND[rounded]} flex-shrink-0 bg-white border border-border/60 overflow-hidden flex items-center justify-center ${className}`}
        style={dim}
      >
        <img
          src={sources[idx]}
          alt={`${name} logo`}
          width={size}
          height={size}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain p-1"
          onError={() => setIdx((i) => i + 1)}
        />
      </div>
    );
  }

  return (
    <div
      className={`${ROUND[rounded]} flex-shrink-0 flex items-center justify-center text-white font-black ${className}`}
      style={{ ...dim, backgroundColor: color, fontSize: Math.max(10, Math.round(size * 0.45)) }}
      aria-label={`${name} logo`}
    >
      {initial}
    </div>
  );
}
