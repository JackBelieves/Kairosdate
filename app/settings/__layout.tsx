// app/settings/_layout.tsx
import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
    headerShown: false, // turn this on
    headerTitle: '',   // optional
  }}
    />
  );
}