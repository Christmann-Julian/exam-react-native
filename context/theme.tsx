import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Mode = "light" | "dark";

const STORAGE_KEY = "app_theme_mode_v1";

export const light = {
  colors: {
    background: "#f6f7fb",
    card: "#fff",
    primary: "#007aff",
    accent: "#ff8b00",
    text: "#0f1724",
    muted: "#94a3b8",
    success: "#0ea5a6",
    danger: "#ef4444",
    border: "#eceff3",
    soft: "#e6eef8",
  },
};

export const dark = {
  colors: {
    background: "#0b1220",
    card: "#0f1724",
    primary: "#0ea5ff",
    accent: "#ffb86b",
    text: "#e6eef8",
    muted: "#94a3b8",
    success: "#2dd4bf",
    danger: "#fb7185",
    border: "#152032",
    soft: "#0f2940",
  },
};

type ThemeShape = typeof light;

const ThemeContext = createContext<{
  theme: ThemeShape;
  mode: Mode;
  setMode: (m: Mode) => Promise<void>;
  toggle: () => Promise<void>;
}>({
  theme: light,
  mode: "light",
  setMode: async () => {},
  toggle: async () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const sys = useColorScheme();
  const [mode, setModeState] = useState<Mode>(sys === "dark" ? "dark" : "light");

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw === "light" || raw === "dark") setModeState(raw);
        else setModeState(sys === "dark" ? "dark" : "light");
      } catch {
        setModeState(sys === "dark" ? "dark" : "light");
      }
    })();
  }, [sys]);

  const setMode = async (m: Mode) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, m);
    } catch {}
    setModeState(m);
  };

  const toggle = async () => setMode(mode === "dark" ? "light" : "dark");

  const theme = mode === "dark" ? dark : light;

  return <ThemeContext.Provider value={{ theme, mode, setMode, toggle }}>{children}</ThemeContext.Provider>;
};

export function useTheme() {
  return useContext(ThemeContext);
}