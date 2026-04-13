"use client";

import { useState, useEffect } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useThemeStore } from "@/stores/theme-store";

const options = [
  { value: "light" as const, icon: Sun, label: "라이트 모드" },
  { value: "dark" as const, icon: Moon, label: "다크 모드" },
  { value: "system" as const, icon: Monitor, label: "시스템 설정" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return <div className="w-5 h-5" />;
  }

  const cycle = () => {
    const order = ["light", "dark", "system"] as const;
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
  };

  const current = options.find((o) => o.value === theme)!;
  const Icon = current.icon;

  return (
    <button
      onClick={cycle}
      className="p-2 text-warm-brown hover:text-charcoal transition-colors"
      aria-label={current.label}
      title={current.label}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}
