"use client";

import { useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

export function getTheme(): Theme {
  if (typeof window === "undefined") return "system";
  try {
    return (localStorage.getItem("theme") as Theme) || "system";
  } catch {
    return "system";
  }
}

export function setTheme(theme: Theme) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("system-theme");
    } else if (theme === "system") {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("system-theme");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.remove("system-theme");
    }
    
    window.dispatchEvent(new Event("theme-change"));
  } catch {}
}

export function useTheme() {
  const [theme, setLocalTheme] = useState<Theme>("system");

  useEffect(() => {
    requestAnimationFrame(() => {
      setLocalTheme(getTheme());
    });
    const handleSync = () => setLocalTheme(getTheme());
    window.addEventListener("theme-change", handleSync);
    
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMedia = () => {
      if (getTheme() === "system") {
        setTheme("system");
      }
    };
    media.addEventListener("change", handleMedia);

    return () => {
      window.removeEventListener("theme-change", handleSync);
      media.removeEventListener("change", handleMedia);
    };
  }, []);

  return { theme, setTheme };
}
