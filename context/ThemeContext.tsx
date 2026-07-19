import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Appearance, ColorSchemeName } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "subscrio_color_scheme";

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  // Load persisted preference on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored === "dark" || stored === "light") {
          const dark = stored === "dark";
          setIsDark(dark);
          Appearance.setColorScheme(stored as ColorSchemeName);
        }
      })
      .catch((error) => {
        console.error("Failed to load theme preference", error);
      });
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);

    const nextScheme: ColorSchemeName = isDark ? "light" : "dark";
    Appearance.setColorScheme(nextScheme);
    AsyncStorage.setItem(STORAGE_KEY, nextScheme);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
