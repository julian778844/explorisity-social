import { useState } from "react";
import { Mail, X } from "lucide-react";
import { api } from "./api";

type ForgotPasswordModalProps = {
  open: boolean;
  onClose: () => void;
  onBackToSignIn: () => void;
};

export default function ForgotPasswordModal({
  open,
  onClose,
  onBackToSignIn,
}: ForgotPasswordModalProps) {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  if (!open) return null;

  async function submit() {
    const value = emailOrUsername.trim();

    if (!value) {
      setStatus("error");
      setMessage("Enter your email or username.");
      return;
    }

    try {
      setStatus("sending");
      setMessage(null);

      await api.requestPasswordReset(value);

      setStatus("sent");
      setMessage(
        "If an account exists, we sent password reset instructions. Check your email or SMS if your phone is connected."
      );
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : "Password reset failed. Try again.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-2 transition hover:bg-muted"
          aria-label="Close password reset"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
          <Mail className="h-6 w-6" />
        </div>

        <h2 className="text-2xl font-black tracking-tight">Reset your password</h2>

        <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
          Enter your email or username. We’ll send a secure reset link so you can
          get back into Explorisity.
        </p>

        <input
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
          placeholder="Email or username"
          autoComplete="email"
          className="mt-5 w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm font-medium focus:border-primary focus:outline-none"
        />

        {message && (
          <div
            className={`mt-3 rounded-xl border p-3 text-xs font-semibold ${
              status === "sent"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <button
          onClick={submit}
          disabled={status === "sending"}
          className="mt-4 w-full rounded-xl bg-primary py-3 text-sm font-black text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "sending" ? "Sending..." : "Send reset link"}
        </button>

        <button
          onClick={onBackToSignIn}
          className="mt-3 w-full rounded-xl border border-border bg-background py-3 text-sm font-bold text-foreground transition hover:bg-muted"
        >
          Back to sign in
        </button>
      </div>
    </div>
  );
}
