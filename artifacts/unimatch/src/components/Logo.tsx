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
        <linearGradient id="explorisity-white-mark-bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0B1F3A" />
          <stop offset="100%" stopColor="#172B4D" />
        </linearGradient>

        <filter id="explorisity-white-shadow" x="-12" y="-12" width="88" height="88" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#000000" floodOpacity="0.25" />
        </filter>
      </defs>

      <rect
        x="3"
        y="3"
        width="58"
        height="58"
        rx="16"
        fill="url(#explorisity-white-mark-bg)"
        filter="url(#explorisity-white-shadow)"
      />

      <rect
        x="4.5"
        y="4.5"
        width="55"
        height="55"
        rx="14.5"
        fill="none"
        stroke="white"
        strokeOpacity="0.75"
        strokeWidth="1.25"
      />

      <path
        d="M18 15.5C18 14.12 19.12 13 20.5 13H45C46.66 13 48 14.34 48 16C48 17.66 46.66 19 45 19H24V29H40C41.66 29 43 30.34 43 32C43 33.66 41.66 35 40 35H24V45H45C46.66 45 48 46.34 48 48C48 49.66 46.66 51 45 51H20.5C19.12 51 18 49.88 18 48.5V15.5Z"
        fill="white"
      />

      <circle cx="51" cy="15" r="3" fill="white" opacity="0.9" />
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
        className={`font-display font-black tracking-tight ${wordSize} text-white drop-shadow-sm`}
        style={{ letterSpacing: "-0.035em" }}
      >
        Explorisity
      </div>

      {withTagline && (
        <div className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/80">
          Explore · Compare · Connect
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
      <LogoMark
        size={markSize}
        className="shrink-0 transition-transform duration-300 group-hover:rotate-[-3deg] group-hover:scale-105"
      />
      <Wordmark size={size} withTagline={withTagline} />
    </Link>
  );
}
