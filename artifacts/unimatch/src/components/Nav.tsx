import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Menu,
  Compass,
  Scale,
  Stethoscope,
  Briefcase,
  GraduationCap,
  Mail,
  LogIn,
  LogOut,
  User,
  X,
  Wrench,
  Users,
  Search as SearchIcon,
  NotebookPen,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import Logo, { LogoMark, Wordmark } from "@/components/Logo";
import GlobalSearch from "@/components/GlobalSearch";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationsBell from "@/components/NotificationsBell";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: Compass, group: "Browse" },
  { href: "/search", label: "Search", icon: SearchIcon, group: "Browse" },
  { href: "/explore", label: "Explore feed", icon: Compass, group: "Browse" },
  { href: "/compare", label: "Compare schools", icon: GraduationCap, group: "Browse" },
  { href: "/rankings", label: "Undergrad Rankings", icon: GraduationCap, group: "Rankings" },
  { href: "/law", label: "Law School Rankings", icon: Scale, group: "Rankings" },
  { href: "/med", label: "Med School Rankings", icon: Stethoscope, group: "Rankings" },
  { href: "/mba", label: "MBA Program Rankings", icon: Briefcase, group: "Rankings" },
  { href: "/trade", label: "Trade & Technical", icon: Wrench, group: "Rankings" },
  { href: "/trending", label: "Trending Matchups", icon: Compass, group: "Discover" },
  { href: "/student-journey", label: "Student Journey", icon: NotebookPen, group: "Discover" },
  { href: "/notifications", label: "Notifications", icon: Bell, group: "Discover" },
  { href: "/social", label: "Social Communities", icon: Users, group: "Discover" },
  { href: "/chance-me", label: "Chance Me", icon: Compass, group: "Discover" },
  { href: "/ai-picks", label: "AI Picks", icon: Compass, group: "Discover" },
  { href: "/contact", label: "Contact Us", icon: Mail, group: "About" },
];

export default function Nav() {
  const [location, navigate] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, openSignIn, signOut } = useAuth();

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const groups = Array.from(new Set(NAV_LINKS.map((l) => l.group)));

  return (
    <>
      <nav className="glass-nav sticky top-0 z-50 w-full border-b border-border/60">
        <div className="container mx-auto flex min-h-16 items-center gap-3 px-4 py-2">
          <button
            onClick={() => setMenuOpen(true)}
            className="rounded-lg p-2 -ml-2 transition-colors hover:bg-muted"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="explorisity-drawer"
            data-testid="button-menu-open"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex min-w-0 shrink-0 items-center gap-3">
            <Logo size="md" withTagline />
          </div>

          <div className="mx-auto hidden w-full max-w-xl md:block">
            <GlobalSearch />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <NotificationsBell />
            <Link
              href="/search"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card md:hidden"
              aria-label="Search"
            >
              <SearchIcon className="h-4 w-4" />
            </Link>

            {user ? (
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 transition-all hover-elevate"
                data-testid="link-profile"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.displayName}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-black text-white"
                    style={{ backgroundColor: user.avatarColor }}
                  >
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden text-sm font-bold sm:inline">{user.displayName}</span>
              </Link>
            ) : (
              <button
                onClick={() => openSignIn("signin")}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-all hover-elevate"
                data-testid="button-signin"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Sign in to make your profile</span>
                <span className="sm:hidden">Sign in</span>
              </button>
            )}
          </div>
        </div>

        <div className="border-t border-border/50 px-4 py-2 md:hidden">
          <GlobalSearch compact />
        </div>
      </nav>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
            data-testid="overlay-menu"
          />

          <aside
            id="explorisity-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className="fixed left-0 top-0 z-[70] h-full w-[340px] max-w-[88vw] overflow-y-auto border-r border-border bg-background shadow-2xl animate-in slide-in-from-left duration-200"
          >
            <div className="flex items-center justify-between border-b border-border p-5">
              <div className="flex items-center gap-3">
                <LogoMark size={36} />
                <Wordmark size="md" />
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="rounded-lg p-2 transition-colors hover:bg-muted"
                aria-label="Close menu"
                data-testid="button-menu-close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="border-b border-border p-3">
              <div className="mb-2 px-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Search
              </div>
              <GlobalSearch compact onResultClick={() => setMenuOpen(false)} />
            </div>

            {user && (
              <Link
                href="/profile"
                className="mx-3 mt-3 flex items-center gap-3 rounded-xl border border-border/60 bg-gradient-to-br from-primary/10 to-accent/5 p-4 hover-elevate"
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.displayName} className="h-11 w-11 rounded-xl object-cover" />
                ) : (
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl font-black text-white"
                    style={{ backgroundColor: user.avatarColor }}
                  >
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold">{user.displayName}</div>
                  <div className="truncate text-xs text-muted-foreground">@{user.username}</div>
                </div>
                <User className="h-4 w-4 text-muted-foreground" />
              </Link>
            )}

            <div className="p-3">
              {groups.map((group) => (
                <div key={group} className="mb-4">
                  <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {group}
                  </div>
                  {NAV_LINKS.filter((l) => l.group === group).map((link) => {
                    const Icon = link.icon;
                    const isActive = location === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                          isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted",
                        )}
                        data-testid={`menu-link-${link.href}`}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              ))}

              <div className="my-3 border-t border-border" />

              {user ? (
                <button
                  onClick={async () => {
                    await signOut();
                    setMenuOpen(false);
                    navigate("/");
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-muted"
                  data-testid="menu-signout"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    openSignIn("signin");
                  }}
                  className="flex w-full items-center gap-3 rounded-lg bg-primary px-3 py-2.5 text-sm font-bold text-primary-foreground hover-elevate"
                  data-testid="menu-signin"
                >
                  <LogIn className="h-4 w-4" /> Sign In
                </button>
              )}

              <div className="mt-6 rounded-xl bg-muted/40 px-3 py-3 text-xs text-muted-foreground">
                Got feedback? Email us at{" "}
                <a href="mailto:findyournext4@gmail.com" className="text-primary hover:underline">
                  findyournext4@gmail.com
                </a>
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
