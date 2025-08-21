// app/(auth)/_layout.tsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function AuthLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false, // Hides header for custom onboarding look
        }}
      />
      <StatusBar style="auto" />
    </>
  );
}