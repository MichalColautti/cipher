import { Stack } from "expo-router";

const ProfileSettingsLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="editUsername"
        options={{
          headerShown: false, 
        }}
      />
    </Stack>
  );
};

export default ProfileSettingsLayout;
