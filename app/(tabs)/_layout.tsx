// app/(tabs)/_layout.tsx
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useColorScheme, useWindowDimensions } from 'react-native';

export default function TabsLayout() {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];
  const { width } = useWindowDimensions();
  const isMobile = width < 600;
  return (
    <Tabs screenOptions={{
        tabBarPosition: isMobile ? "bottom" : "left", // or conditionally render a drawer
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.navBackground
        },
        tabBarActiveTintColor: theme.tintLight,
        tabBarInactiveTintColor: theme.tintDark,
        tabBarLabelStyle: {
          fontSize: 10,
        },
      }}>
      <Tabs.Screen
        name="course"
        options={{
          title: "Today",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="logs"
        options={{
          title: "Path",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "walk" : "walk-outline"} size={size} color={color} // 👈 Tint = purple, icon = gray
           />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: "Insights",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "bulb" : "bulb-outline"} size={size} color={color} // 👈 Tint = purple, icon = gray
           />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "settings" : "settings-outline"} size={size} color={color} // 👈 Tint = purple, icon = gray
           />
          ),
        }}
      />
      
    </Tabs>
  );
}