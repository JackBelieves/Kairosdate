// app/(tabs)/settings.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { getTypography } from '@/constants/ThemedTypography';


const settingsOptions = [
  {
    icon: 'shield-checkmark-outline',
    label: 'Security Controls',
    route: '/settings/security',
  },
  
  {
    icon: 'log-out-outline',
    label: 'Logout',
    route: '/settings/logout',
    color: 'black'
  },
];

export default function SettingsScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? 'light'];
  const typography = getTypography(scheme ?? 'light');
  const router = useRouter();

  return (

    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[typography.headlineMedium, styles.title]}>Settings</Text>

      {settingsOptions.map((item, idx) => (
        
       <Pressable key={idx} style={styles.row} onPress={() => router.push(item.route as any)}>
          <Ionicons name={item.icon as any} size={20} color={item.color  || theme.text} style={styles.icon} />
          <Text style={[typography.bodyLarge, { color: item.color || theme.text }]}>{item.label}</Text>
        </Pressable>
      ))}
    </View>

  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  icon: {
    marginRight: 14,
  },
});