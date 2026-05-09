import { Link } from "wouter";

type LogoMarkProps = {
  size?: number;
  className?: string;
};

export function LogoMark({ size = 36, className = "" }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="logo-crest" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="hsl(215 55% 20%)" />
          <stop offset="100%" stopColor="hsl(215 65% 12%)" />
        </linearGradient>
        <linearGradient id="logo-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(41 78% 64%)" />
          <stop offset="100%" stopColor="hsl(36 60% 46%)" />
        </linearGradient>
      </defs>

      <rect x="2" y="2" width="60" height="60" rx="14" fill="url(#logo-crest)" />
      <rect
        x="2.75"
        y="2.75"
        width="58.5"
        height="58.5"
        rx="13.25"
        fill="none"
        stroke="hsl(41 60% 58% / 0.45)"
        strokeWidth="0.75"
      />

      {/* Stylized "E" formed by a vertical stroke + 3 horizontal bars descending in length —
          reads as both the letter E and a podium/ranking visual. */}
      <g fill="url(#logo-gold)">
        <rect x="17" y="14" width="6" height="36" rx="2" />
        <rect x="17" y="14" width="30" height="6" rx="2" />
        <rect x="17" y="29" width="23" height="6" rx="2" />
        <rect x="17" y="44" width="17" height="6" rx="2" />
      </g>

      {/* Small accent dot — north-star "decide" */}
      <circle cx="50" cy="17" r="2" fill="hsl(41 78% 64%)" />
    </svg>
  );
}

type WordmarkProps = {
  size?: "sm" | "md" | "lg";
  withTagline?: boolean;
};

export function Wordmark({ size = "md", withTagline = false }: WordmarkProps) {
  const wordSize = size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-2xl";
  return (
    <div className="leading-none">
      <div
        className={`font-display font-bold tracking-tight text-foreground ${wordSize}`}
        style={{ letterSpacing: "-0.025em" }}
      >
        Explor<span className="text-[hsl(var(--accent))]">i</span>sity
      </div>
      {withTagline && (
        <div className="text-[10px] text-muted-foreground font-medium tracking-[0.18em] uppercase mt-1">
          Explore · Compare · Decide
        </div>
      )}
    </div>
  );
}

type LogoProps = {
  to?: string;
  size?: "sm" | "md" | "lg";
  withTagline?: boolean;
};

export default function Logo({ to = "/", size = "md", withTagline = true }: LogoProps) {
  const markSize = size === "lg" ? 44 : size === "sm" ? 28 : 36;
  return (
    <Link
      href={to}
      className="flex items-center gap-3 group"
      data-testid="link-logo-home"
    >
      <LogoMark size={markSize} className="shrink-0 transition-transform duration-300 group-hover:rotate-[-3deg]" />
      <Wordmark size={size} withTagline={withTagline} />
    </Link>
  );
}
