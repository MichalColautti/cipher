import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

export const darkThemeColors = {
  background: "#212427",
  text: "#fff",
  title: "#fff",
  settingsBackground: "#383D42",
  divider: "rgba(249, 246, 240, 0.15)",
  iconStroke: "#fff",
  iconFill: "#fff",
  button: "#007bff",
  buttonText: "#fff",
  inputBackground: "#383D42",
  placeholder: "#888",
  outgoingBubble: "#648BCE",
  incomingBubble: "#383D42",
  outgoingBubbleText: "#fff",
  incomingBubbleText: "#fff",
};

export const lightThemeColors = {
  background: "#F9F6F0",
  text: "#000",
  title: "#000",
  settingsBackground: "#fff",
  divider: "rgba(0, 0, 0, 0.1)",
  iconStroke: "#000",
  iconFill: "#000",
  button: "#007bff",
  buttonText: "#fff",
  inputBackground: "#fff",
  placeholder: "#666",
  outgoingBubble: "#648BCE",
  incomingBubble: "#212427",
  outgoingBubbleText: "#fff",
  incomingBubbleText: "#fff",
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("appTheme");
        if (savedTheme) {
          setTheme(savedTheme);
        }
      } catch (error) {
        console.error("Failed to load theme from storage", error);
      }
    };

    loadTheme();
  }, []);

  const toggleTheme = async (newTheme) => {
    try {
      await AsyncStorage.setItem("appTheme", newTheme);
      setTheme(newTheme);
    } catch (error) {
      console.error("Failed to save theme to storage", error);
    }
  };

  const colors = theme === "light" ? lightThemeColors : darkThemeColors;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
