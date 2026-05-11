import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { HeroPhoto } from "@/lib/schoolPhotos";

interface CampusCarouselProps {
  images: HeroPhoto[];
  alt: string;
  className?: string;
  /** Auto-advance interval in ms. Defaults to 5500. Set to 0 to disable. */
  intervalMs?: number;
  /** Optional dark gradient overlay so foreground text stays readable. */
  overlay?: "bottom" | "full" | "none";
  fallbackTitle?: string;
  fallbackColor?: string;
}

export default function CampusCarousel({
  images,
  alt,
  className = "",
  intervalMs = 5500,
  overlay = "bottom",
  fallbackTitle,
  fallbackColor = "#7c3aed",
}: CampusCarouselProps) {
  type Slide = { url: string; caption?: string };
  const slides = useMemo<Slide[]>(
    () =>
      images.map((image) =>
        typeof image === "string" ? { url: image } : { url: image.url, caption: image.caption },
      ),
    [images],
  );
  // Drop any image that fails to load so we never display a broken slide.
  const [healthy, setHealthy] = useState<Slide[]>(slides);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});

  // When the parent passes a new image set (e.g. user navigates between school
  // profiles), reset healthy + clamp index back to 0 so we never render an
  // out-of-range slot (which would leave the hero blank under the skeleton).
  useEffect(() => {
    setHealthy(slides);
    setIndex(0);
    setLoaded({});
  }, [slides]);
  const containerRef = useRef<HTMLDivElement>(null);

  const count = healthy.length;
  const isSlideshow = count > 1;
  const activeSlide = healthy[index];
  const activeSrc = activeSlide?.url ?? "";

  const go = useCallback(
    (delta: number) => {
      if (count === 0) return;
      setIndex((i) => (i + delta + count) % count);
    },
    [count],
  );

  // Auto-advance
  useEffect(() => {
    if (!isSlideshow || paused || intervalMs <= 0) return;
    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, intervalMs);
    return () => window.clearInterval(t);
  }, [isSlideshow, paused, intervalMs, count]);

  // Keyboard arrows when carousel container has focus or pointer is over it
  useEffect(() => {
    if (!isSlideshow) return;
    const onKey = (e: KeyboardEvent) => {
      if (!paused) return; // only when hovered/focused
      if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isSlideshow, paused, go]);

  // Touch swipe
  const touchStart = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    touchStart.current = null;
  };

  const handleError = (src: string) => {
    setHealthy((cur) => {
      const next = cur.filter((u) => u.url !== src);
      // Also clamp index inside the new bounds
      setIndex((i) => (next.length > 0 ? i % next.length : 0));
      return next;
    });
  };

  if (count === 0) {
    return (
      <div
        className={`relative flex items-center justify-center overflow-hidden bg-muted ${className}`}
        style={{
          background:
            `linear-gradient(135deg, ${fallbackColor}26, rgba(255,255,255,0.08)), radial-gradient(circle at top left, ${fallbackColor}44, transparent 58%)`,
        }}
        aria-label="No campus photo available"
      >
        {fallbackTitle && (
          <div className="px-6 text-center">
            <div className="mx-auto mb-3 h-1.5 w-20 rounded-full" style={{ backgroundColor: fallbackColor }} />
            <p className="text-lg font-black text-foreground">{fallbackTitle}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      role={isSlideshow ? "region" : undefined}
      aria-roledescription={isSlideshow ? "carousel" : undefined}
      aria-label={isSlideshow ? `${alt} — ${count} photos` : undefined}
      data-testid="campus-carousel"
    >
      {/* Stacked images, fade transition */}
      {healthy.map((slide, i) => {
        const src = slide.url;
        const active = i === index;
        return (
          <img
            key={src}
            src={src}
            alt={count > 1 ? `${alt} (${i + 1} of ${count})` : alt}
            loading={i === 0 ? "eager" : "lazy"}
            onLoad={() => setLoaded((m) => ({ ...m, [src]: true }))}
            onError={() => handleError(src)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              active ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden={!active}
          />
        );
      })}

      {/* Captions: one per slide, cross-fading with the slide. */}
      {healthy.map((slide, i) => {
        if (!slide.caption) return null;
        const active = i === index;
        return (
          <div
            key={`cap-${slide.url}`}
            className={`absolute bottom-3 left-3 z-10 max-w-[calc(100%-3rem)] rounded-full bg-black/55 px-3 py-1 text-[11px] font-semibold tracking-wide text-white backdrop-blur-sm transition-opacity duration-700 ${
              active ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            aria-hidden={!active}
          >
            {slide.caption}
          </div>
        );
      })}

      {/* Skeleton until at least the active slide loads */}
      {!loaded[activeSrc] && (
        <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/70 to-muted animate-pulse" />
      )}

      {/* Dark overlay for foreground readability */}
      {overlay === "bottom" && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/30 pointer-events-none" />
      )}
      {overlay === "full" && (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/60 pointer-events-none" />
      )}

      {isSlideshow && (
        <>
          {/* Prev / Next */}
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous photo"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/45 hover:bg-black/65 text-white flex items-center justify-center backdrop-blur-sm transition-colors z-10"
            data-testid="carousel-prev"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next photo"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/45 hover:bg-black/65 text-white flex items-center justify-center backdrop-blur-sm transition-colors z-10"
            data-testid="carousel-next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dot indicators */}
          <div
            className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10"
            role="tablist"
            aria-label="Photo selector"
          >
            {healthy.map((slide, i) => {
              const src = slide.url;
              return (
                <button
                  key={src}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Go to photo ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-6 bg-white" : "w-1.5 bg-white/55 hover:bg-white/80"
                  }`}
                  data-testid={`carousel-dot-${i}`}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
