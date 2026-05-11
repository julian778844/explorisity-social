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
        <linearGradient id="logo-navy" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="hsl(215 55% 20%)" />
          <stop offset="100%" stopColor="hsl(215 65% 12%)" />
        </linearGradient>

        <linearGradient id="logo-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(41 78% 64%)" />
          <stop offset="100%" stopColor="hsl(36 60% 46%)" />
        </linearGradient>

        <filter id="logo-soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="hsl(215 65% 12% / 0.18)" />
        </filter>
      </defs>

      {/* White background version of the Explorisity mark. */}
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="16"
        fill="white"
        filter="url(#logo-soft-shadow)"
      />

      {/* Brand-color border keeps the original navy/gold identity. */}
      <rect
        x="3"
        y="3"
        width="58"
        height="58"
        rx="15"
        fill="none"
        stroke="url(#logo-navy)"
        strokeWidth="2"
      />

      <rect
        x="6"
        y="6"
        width="52"
        height="52"
        rx="12"
        fill="none"
        stroke="hsl(41 70% 55% / 0.55)"
        strokeWidth="1.25"
      />

      {/* Stylized E / ranking podium in the original navy brand color. */}
      <g fill="url(#logo-navy)">
        <rect x="17" y="14" width="6" height="36" rx="2" />
        <rect x="17" y="14" width="30" height="6" rx="2" />
        <rect x="17" y="29" width="23" height="6" rx="2" />
        <rect x="17" y="44" width="17" height="6" rx="2" />
      </g>

      {/* Gold accent keeps the original premium academic feel. */}
      <circle cx="50" cy="17" r="2.5" fill="url(#logo-gold)" />
      <circle cx="50" cy="17" r="5" stroke="hsl(41 70% 55% / 0.22)" strokeWidth="1" />
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
        <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
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
      className="group flex items-center gap-3"
      data-testid="link-logo-home"
    >
      <LogoMark
        size={markSize}
        className="shrink-0 transition-transform duration-300 group-hover:rotate-[-3deg]"
      />
      <Wordmark size={size} withTagline={withTagline} />
    </Link>
  );
}
