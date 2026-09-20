"use client";

import { useCallback } from "react";

/**
 * Flips data-theme on <html> and persists the choice. The initial theme is
 * applied before paint by the inline script in layout.tsx, so this only ever
 * toggles — no flash, no hydration mismatch.
 */
export function ThemeToggle() {
  const toggle = useCallback(() => {
    const root = document.documentElement;
    const current =
      root.getAttribute("data-theme") ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");
    const next = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("verdict-theme", next);
    } catch {
      /* storage unavailable — the toggle still works for this session */
    }
  }, []);

  return (
    <button
      type="button"
      className="icon-btn"
      aria-label="Toggle color theme"
      title="Toggle theme"
      onClick={toggle}
    >
      ◐
    </button>
  );
}
