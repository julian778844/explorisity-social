import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, Compass, Scale, Stethoscope, Briefcase, GraduationCap, Mail, LogIn, LogOut, User, X, Wrench, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import Logo, { LogoMark, Wordmark } from "@/components/Logo";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: Compass, group: "Browse" },
  { href: "/compare", label: "University Comparisons", icon: GraduationCap, group: "Browse" },
  { href: "/rankings", label: "Undergrad Rankings", icon: GraduationCap, group: "Rankings" },
  { href: "/law", label: "Law School Rankings", icon: Scale, group: "Rankings" },
  { href: "/med", label: "Med School Rankings", icon: Stethoscope, group: "Rankings" },
  { href: "/mba", label: "MBA Program Rankings", icon: Briefcase, group: "Rankings" },
  { href: "/trade", label: "Trade & Technical", icon: Wrench, group: "Rankings" },
  { href: "/trending", label: "Trending Matchups", icon: Compass, group: "Discover" },
  { href: "/social", label: "Social Communities", icon: Users, group: "Discover" },
  { href: "/ai-picks", label: "AI Picks", icon: Compass, group: "Discover" },
  { href: "/contact", label: "Contact Us", icon: Mail, group: "About" },
];

export default function Nav() {
  const [location, navigate] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, openSignIn, signOut } = useAuth();

  useEffect(() => { setMenuOpen(false); }, [location]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [menuOpen]);

  const groups = Array.from(new Set(NAV_LINKS.map((l) => l.group)));

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(true)}
              className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="explorisity-drawer"
              data-testid="button-menu-open"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Logo size="md" withTagline />

          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card hover-elevate transition-all"
                data-testid="link-profile"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black"
                  style={{ backgroundColor: user.avatarColor }}
                >
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-sm font-bold">{user.displayName}</span>
              </Link>
            ) : (
              <button
                onClick={() => openSignIn("signin")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover-elevate transition-all"
                data-testid="button-signin"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>
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
            className="fixed top-0 left-0 z-[70] h-full w-[320px] max-w-[85vw] bg-background border-r border-border shadow-2xl overflow-y-auto animate-in slide-in-from-left duration-200"
          >
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <LogoMark size={36} />
                <Wordmark size="md" />
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Close menu"
                data-testid="button-menu-close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {user && (
              <Link
                href="/profile"
                className="flex items-center gap-3 p-4 mx-3 mt-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/5 border border-border/60 hover-elevate"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black"
                  style={{ backgroundColor: user.avatarColor }}
                >
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">{user.displayName}</div>
                  <div className="text-xs text-muted-foreground truncate">@{user.username}</div>
                </div>
                <User className="w-4 h-4 text-muted-foreground" />
              </Link>
            )}

            <div className="p-3">
              {groups.map((group) => (
                <div key={group} className="mb-4">
                  <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{group}</div>
                  {NAV_LINKS.filter((l) => l.group === group).map((link) => {
                    const Icon = link.icon;
                    const isActive = location === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                          isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                        )}
                        data-testid={`menu-link-${link.href}`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              ))}

              <div className="border-t border-border my-3" />

              {user ? (
                <button
                  onClick={async () => {
                    await signOut();
                    setMenuOpen(false);
                    navigate("/");
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-all w-full"
                  data-testid="menu-signout"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              ) : (
                <button
                  onClick={() => { setMenuOpen(false); openSignIn("signin"); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-primary-foreground bg-primary w-full hover-elevate"
                  data-testid="menu-signin"
                >
                  <LogIn className="w-4 h-4" /> Sign In
                </button>
              )}

              <div className="mt-6 px-3 py-3 rounded-xl bg-muted/40 text-xs text-muted-foreground">
                Got feedback? Email us at <a href="mailto:findyournext4@gmail.com" className="text-primary hover:underline">findyournext4@gmail.com</a>
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
