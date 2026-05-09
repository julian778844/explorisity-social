import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { LogIn, UserPlus, X } from "lucide-react";
import { api, type ApiUser } from "./api";

type SignInMode = "signin" | "signup";

type AuthCtx = {
  user: ApiUser | null;
  isPending: boolean;
  openSignIn: (mode?: SignInMode) => void;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used inside AuthProvider");
  return c;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const meQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => (await api.me()).user,
    staleTime: 30_000,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<SignInMode>("signin");

  const openSignIn = useCallback((m: SignInMode = "signin") => {
    setMode(m);
    setModalOpen(true);
  }, []);

  const signOut = useCallback(async () => {
    await api.logout();
    qc.setQueryData(["auth", "me"], null);
    qc.invalidateQueries({ queryKey: ["follows"] });
  }, [qc]);

  // Lock scroll + escape to close
  useEffect(() => {
    if (!modalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setModalOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [modalOpen]);

  return (
    <Ctx.Provider value={{ user: meQuery.data ?? null, isPending: meQuery.isPending, openSignIn, signOut }}>
      {children}
      {modalOpen && <SignInModal mode={mode} setMode={setMode} onClose={() => setModalOpen(false)} />}
    </Ctx.Provider>
  );
}

function SignInModal({ mode, setMode, onClose }: { mode: SignInMode; setMode: (m: SignInMode) => void; onClose: () => void }) {
  const qc = useQueryClient();
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const onSuccess = (user: ApiUser) => {
    qc.setQueryData(["auth", "me"], user);
    qc.invalidateQueries({ queryKey: ["follows"] });
    onClose();
    navigate("/profile");
  };

  const signup = useMutation({
    mutationFn: api.signup,
    onSuccess: (d) => onSuccess(d.user),
    onError: (e: Error) => setErr(e.message),
  });
  const login = useMutation({
    mutationFn: api.login,
    onSuccess: (d) => onSuccess(d.user),
    onError: (e: Error) => setErr(e.message),
  });

  const submit = () => {
    setErr(null);
    if (!username.trim() || password.length < 8) {
      setErr("Username required, password must be 8+ characters.");
      return;
    }
    if (mode === "signup") {
      signup.mutate({ username: username.trim(), password, displayName: displayName.trim() || undefined });
    } else {
      login.mutate({ username: username.trim(), password });
    }
  };

  const busy = signup.isPending || login.isPending;

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="signin-title"
        className="bg-card border border-border rounded-3xl p-7 max-w-sm w-full shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground mb-4 shadow-lg">
          {mode === "signup" ? <UserPlus className="w-6 h-6" /> : <LogIn className="w-6 h-6" />}
        </div>
        <h2 id="signin-title" className="text-2xl font-black mb-1">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h2>
        <p className="text-sm text-muted-foreground mb-5">
          {mode === "signup"
            ? "Username + password — your follows sync across every device you sign in on."
            : "Sign in to access your followed schools from anywhere."}
        </p>

        <div className="flex gap-1 p-1 bg-muted rounded-xl mb-4 text-sm font-bold">
          <button
            onClick={() => { setMode("signin"); setErr(null); }}
            className={`flex-1 py-2 rounded-lg transition ${mode === "signin" ? "bg-card shadow text-foreground" : "text-muted-foreground"}`}
            data-testid="tab-signin"
          >Sign In</button>
          <button
            onClick={() => { setMode("signup"); setErr(null); }}
            className={`flex-1 py-2 rounded-lg transition ${mode === "signup" ? "bg-card shadow text-foreground" : "text-muted-foreground"}`}
            data-testid="tab-signup"
          >Sign Up</button>
        </div>

        <div className="space-y-2.5">
          <input
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            autoComplete="username"
            className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:border-primary focus:outline-none text-sm"
            data-testid="input-username"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (8+ characters)"
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:border-primary focus:outline-none text-sm"
            data-testid="input-password"
          />
          {mode === "signup" && (
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Display name (optional)"
              className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:border-primary focus:outline-none text-sm"
              data-testid="input-displayname"
            />
          )}
        </div>

        {err && <div className="mt-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{err}</div>}

        <button
          onClick={submit}
          disabled={busy}
          className="mt-4 w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold hover-elevate disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          data-testid="button-submit"
        >
          {busy ? "Working…" : mode === "signup" ? "Create Account" : "Sign In"}
        </button>
      </div>
    </div>
  );
}
