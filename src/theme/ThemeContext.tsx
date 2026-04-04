// src/components/providers/AppThemeContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

const THEMES = [
  {
    key: "default",
    label: "Đại Dương",
    bg: "#f8fafc",
    accent: "#0ea5e9",
    dark: "#020617",
  },
  {
    key: "forest",
    label: "Rừng Xanh",
    bg: "#f0fdf4",
    accent: "#16a34a",
    dark: "#052e16",
  },
  {
    key: "sunset",
    label: "Hoàng Hôn",
    bg: "#fff7ed",
    accent: "#ea580c",
    dark: "#1c0a00",
  },
  {
    key: "rose",
    label: "Hoa Hồng",
    bg: "#fff1f2",
    accent: "#e11d48",
    dark: "#1a000a",
  },
  {
    key: "violet",
    label: "Tím Ngọc",
    bg: "#faf5ff",
    accent: "#7c3aed",
    dark: "#0d0020",
  },
  {
    key: "slate",
    label: "Đá Xám",
    bg: "#f8fafc",
    accent: "#475569",
    dark: "#0f172a",
  },
] as const;

export type ThemeKey = (typeof THEMES)[number]["key"];
export type AppTheme = (typeof THEMES)[number];
export { THEMES };

interface AppThemeContextValue {
  themeKey: ThemeKey;
  theme: AppTheme;
  setThemeKey: (key: ThemeKey) => void;
}

const AppThemeContext = createContext<AppThemeContextValue>({
  themeKey: "default",
  theme: THEMES[0],
  setThemeKey: () => {},
});

const STORAGE_KEY = "app-theme-key";

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [themeKey, setThemeKeyState] = useState<ThemeKey>("default");

  // Đọc từ localStorage khi mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeKey | null;
    if (saved && THEMES.some((t) => t.key === saved)) {
      setThemeKeyState(saved);
    }
  }, []);

  const setThemeKey = (key: ThemeKey) => {
    setThemeKeyState(key);
    localStorage.setItem(STORAGE_KEY, key);
  };

  const theme = THEMES.find((t) => t.key === themeKey) ?? THEMES[0];

  // Apply CSS variables lên :root để dùng ở mọi nơi
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--app-accent", theme.accent);
    root.style.setProperty("--app-bg", theme.bg);
    root.style.setProperty("--app-dark", theme.dark);
  }, [theme]);

  return (
    <AppThemeContext.Provider value={{ themeKey, theme, setThemeKey }}>
      {children}
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(AppThemeContext);
}
