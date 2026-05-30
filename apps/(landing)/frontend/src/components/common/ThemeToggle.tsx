"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);

  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";
  const showSun = hovered ? !isDark : isDark;

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="Toggle theme"
      className="
        relative flex items-center justify-center
        bg-primary text-primary-foreground
        p-3 rounded-full

        shadow-md hover:shadow-lg
        active:scale-95 active:shadow-sm

        transition-all duration-200 ease-out
      "
    >
      <span className="relative h-5 w-5">
        <Sun
          className={`
            absolute inset-0 h-5 w-5 transition-all duration-200
            ${showSun ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"}
          `}
        />
        <Moon
          className={`
            absolute inset-0 h-5 w-5 transition-all duration-200
            ${!showSun ? "opacity-100 rotate-0" : "opacity-0 rotate-90"}
          `}
        />
      </span>
    </button>
  );
}