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
    retry: 1,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<SignInMode>("signin");

  const openSignIn = useCallback((m: SignInMode = "signin") => {
    setMode(m);
    setModalOpen(true);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      qc.setQueryData(["auth", "me"], null);
      qc.setQueryData(["follows"], []);
      qc.invalidateQueries();
      qc.removeQueries({ queryKey: ["social-users"] });
      qc.removeQueries({ queryKey: ["user-follows"] });
      qc.removeQueries({ queryKey: ["social-communities"] });
      qc.removeQueries({ queryKey: ["social-posts"] });
      qc.removeQueries({ queryKey: ["conversations"] });
    }
  }, [qc]);

  useEffect(() => {
    if (!modalOpen) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
    };

    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [modalOpen]);

  return (
    <Ctx.Provider
      value={{
        user: meQuery.data ?? null,
        isPending: meQuery.isPending,
        openSignIn,
        signOut,
      }}
    >
      {children}

      {modalOpen && (
        <SignInModal
          mode={mode}
          setMode={setMode}
          onClose={() => setModalOpen(false)}
        />
      )}
    </Ctx.Provider>
  );
}

function SignInModal({
  mode,
  setMode,
  onClose,
}: {
  mode: SignInMode;
  setMode: (m: SignInMode) => void;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [, navigate] = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [emailOptIn, setEmailOptIn] = useState(true);
  const [smsOptIn, setSmsOptIn] = useState(false);

  const [err, setErr] = useState<string | null>(null);

  const onSuccess = (user: ApiUser) => {
    qc.setQueryData(["auth", "me"], user);
    qc.setQueryData(["follows"], []);

    qc.invalidateQueries();
    qc.invalidateQueries({ queryKey: ["follows"] });
    qc.invalidateQueries({ queryKey: ["social-users"] });
    qc.invalidateQueries({ queryKey: ["user-follows"] });

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

    const cleanUsername = username.trim();

    if (!/^[a-zA-Z0-9_.-]{3,32}$/.test(cleanUsername)) {
      setErr(
        "Username must be 3–32 characters and use only letters, numbers, dot, dash, or underscore."
      );
      return;
    }

    if (mode === "signup" && password.length < 8) {
      setErr("Password must be at least 8 characters.");
      return;
    }

    if (mode === "signin" && !password) {
      setErr("Enter your password.");
      return;
    }

    if (mode === "signin" && !cleanUsername) {
      setErr("Enter your username or email.");
      return;
    }

    if (mode === "signup") {
      signup.mutate({
        username: cleanUsername,
        password,
        displayName: displayName.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        emailOptIn,
        smsOptIn,
        scholarshipAlerts: true,
        jobAlerts: true,
        schoolNewsAlerts: true,
      });
    } else {
      login.mutate({
        username: cleanUsername,
        password,
      });
    }
  };

  const busy = signup.isPending || login.isPending;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="signin-title"
        className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 transition hover:bg-muted"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
          {mode === "signup" ? (
            <UserPlus className="h-6 w-6" />
          ) : (
            <LogIn className="h-6 w-6" />
          )}
        </div>

        <h2
          id="signin-title"
          className="text-2xl font-black tracking-tight"
        >
          {mode === "signup"
            ? "Create your student profile"
            : "Sign in to Explorisity"}
        </h2>

        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {mode === "signup"
            ? "Save schools, follow students, join communities, and receive opportunities that match your goals."
            : "Use your username or email to get back into your profile."}
        </p>

        <div className="my-5 flex gap-1 rounded-xl bg-muted p-1 text-sm font-bold">
          <button
            onClick={() => {
              setMode("signin");
              setErr(null);
            }}
            className={`flex-1 rounded-lg py-2 transition ${
              mode === "signin"
                ? "bg-card text-foreground shadow"
                : "text-muted-foreground"
            }`}
          >
            Sign In
          </button>

          <button
            onClick={() => {
              setMode("signup");
              setErr(null);
            }}
            className={`flex-1 rounded-lg py-2 transition ${
              mode === "signup"
                ? "bg-card text-foreground shadow"
                : "text-muted-foreground"
            }`}
          >
            Sign Up
          </button>
        </div>

        <div className="space-y-3">
          {mode === "signup" && (
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Full name or display name"
              className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm focus:border-primary focus:outline-none"
            />
          )}

          <input
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={
              mode === "signup"
                ? "Username"
                : "Username or email"
            }
            autoComplete="username"
            className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm focus:border-primary focus:outline-none"
          />

          {mode === "signup" && (
            <>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email for opportunities and updates"
                type="email"
                autoComplete="email"
                className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm focus:border-primary focus:outline-none"
              />

              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone for SMS updates (optional)"
                type="tel"
                autoComplete="tel"
                className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm focus:border-primary focus:outline-none"
              />
            </>
          )}

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (8+ characters)"
            type="password"
            autoComplete={
              mode === "signup"
                ? "new-password"
                : "current-password"
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm focus:border-primary focus:outline-none"
          />

          {mode === "signup" && (
            <div className="space-y-2 rounded-2xl border border-border bg-background p-3 text-xs text-muted-foreground">
              <label className="flex items-start gap-2 font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={emailOptIn}
                  onChange={(e) => setEmailOptIn(e.target.checked)}
                  className="mt-0.5"
                />
                Email me scholarships, jobs, school news, and student opportunities.
              </label>

              <label className="flex items-start gap-2 font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={smsOptIn}
                  onChange={(e) => setSmsOptIn(e.target.checked)}
                  className="mt-0.5"
                />
                Send SMS alerts to my phone when I add one.
              </label>
            </div>
          )}
        </div>

        {err && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
            {err}
          </div>
        )}

        <button
          onClick={submit}
          disabled={busy}
          className="mt-4 w-full rounded-xl bg-primary py-3 font-bold text-primary-foreground transition hover-elevate disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy
            ? "Working..."
            : mode === "signup"
            ? "Create profile"
            : "Sign in"}
        </button>
      </div>
    </div>
  );
}