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
  chatBackground: "#212427",
};

export const lightThemeColors = {
  background: "#fff",
  text: "#000",
  title: "#000",
  settingsBackground: "#fff",
  divider: "rgba(0, 0, 0, 0.1)",
  iconStroke: "#000",
  iconFill: "#000",
  button: "#007bff",
  buttonText: "#fff",
  inputBackground: "#f4f4f4ff",
  placeholder: "#666",
  outgoingBubble: "#648BCE",
  incomingBubble: "#212427",
  outgoingBubbleText: "#fff",
  incomingBubbleText: "#fff",
  chatBackground: "#fff",
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("dark");
  const [customOutgoingBubbleColor, setCustomOutgoingBubbleColor] =
    useState(null);
  const [customIncomingBubbleColor, setCustomIncomingBubbleColor] =
    useState(null);
  const [customChatBackgroundColor, setCustomChatBackgroundColor] = useState(null);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("appTheme");
        if (savedTheme) {
          setTheme(savedTheme);
        }

        const savedOutgoingColor = await AsyncStorage.getItem(
          "appOutgoingColor"
        );
        if (savedOutgoingColor) {
          setCustomOutgoingBubbleColor(savedOutgoingColor);
        }

        const savedIncomingColor = await AsyncStorage.getItem(
          "appIncomingColor"
        );
        if (savedIncomingColor) {
          setCustomIncomingBubbleColor(savedIncomingColor);
        }

        const savedBackgroundColor = await AsyncStorage.getItem(
          "appBackgroundColor"
        );
        if (savedBackgroundColor) {
          setCustomChatBackgroundColor(savedBackgroundColor);
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

  const changeOutgoingBubbleColor = async (color) => {
    try {
      if (color === null) await AsyncStorage.removeItem("appOutgoingColor");
      else await AsyncStorage.setItem("appOutgoingColor", color);
      setCustomOutgoingBubbleColor(color);
    } catch (error) {
      console.error(error);
    }
  };

  const changeIncomingBubbleColor = async (color) => {
    try {
      if (color === null) await AsyncStorage.removeItem("appIncomingColor");
      else await AsyncStorage.setItem("appIncomingColor", color);
      setCustomIncomingBubbleColor(color);
    } catch (error) {
      console.error(error);
    }
  };

  const changeChatBackgroundColor = async (color) => {
    try {
      if (color === null) await AsyncStorage.removeItem("appBackgroundColor");
      else await AsyncStorage.setItem("appBackgroundColor", color);
      setCustomChatBackgroundColor(color);
    } catch (error) {
      console.error(error);
    }
  };

  const baseColors = theme === "light" ? lightThemeColors : darkThemeColors;

  const colors = {
    ...baseColors,
    outgoingBubble: customOutgoingBubbleColor || baseColors.outgoingBubble,
    incomingBubble: customIncomingBubbleColor || baseColors.incomingBubble,
    chatBackground: customChatBackgroundColor || baseColors.chatBackground,
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        colors,
        changeOutgoingBubbleColor,
        customOutgoingBubbleColor,
        changeIncomingBubbleColor,
        customIncomingBubbleColor,
        changeChatBackgroundColor,
        customChatBackgroundColor,
      }}
    >
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
