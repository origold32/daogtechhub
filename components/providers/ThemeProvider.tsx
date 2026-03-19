"use client";
import { useEffect } from "react";
import { useThemeStore } from "@/store/themeStore";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.body.setAttribute("data-theme", theme);
    if (theme === "light") {
      document.body.style.backgroundColor = "#f5f0ff";
      document.body.style.color = "#1a0b2e";
    } else {
      document.body.style.backgroundColor = "#1a0b2e";
      document.body.style.color = "#f3e9ff";
    }
  }, [theme]);
  return <>{children}</>;
}
