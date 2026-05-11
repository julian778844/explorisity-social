import { useEffect, useState } from "react";
import { Moon, Sun, Sparkles } from "lucide-react";

type ThemeMode = "light" | "dark" | "midnight";

const modes: Array<{ value: ThemeMode; label: string; icon: typeof Sun }> = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "midnight", label: "Midnight", icon: Sparkles },
];

export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(() => {
    try {
      return (localStorage.getItem("explorisity.theme") as ThemeMode) || "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "midnight");

    if (mode === "dark") root.classList.add("dark");
    if (mode === "midnight") root.classList.add("dark", "midnight");

    try {
      localStorage.setItem("explorisity.theme", mode);
    } catch {}
  }, [mode]);

  const current = modes.find((m) => m.value === mode) ?? modes[0];
  const Icon = current.icon;

  function cycle() {
    const index = modes.findIndex((m) => m.value === mode);
    setMode(modes[(index + 1) % modes.length].value);
  }

  return (
    <button
      type="button"
      onClick={cycle}
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card/80 backdrop-blur transition hover:bg-muted"
      title={`Theme: ${current.label}`}
      aria-label={`Theme: ${current.label}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
