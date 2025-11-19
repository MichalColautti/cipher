import { AuthProvider } from "@/contexts/authContext";
import { ThemeProvider } from "@/contexts/themeContext";
import { Stack } from "expo-router";

const RootLayout = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </ThemeProvider>
    </AuthProvider>
  );
};

export default RootLayout;
