// app/(auth)/onboarding/step1.tsx
import { View, Text, TextInput, Pressable, StyleSheet, Alert, Image, useColorScheme } from 'react-native';
import { useRouter } from "expo-router";
import { getTypography } from '@/constants/ThemedTypography';
import { Colors } from '@/constants/Colors';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import PrimaryButton from '@/components/PrimaryButton';
import SecondaryButton from '@/components/SecondaryButton';

export default function OnboardingStep1() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = Colors['light'];
  const typography = getTypography(scheme ?? 'light');

  const handleNext = async () => {
      router.replace('./step2');
    
  };

  return (
   <View style={[styles.container, { backgroundColor: theme.background }]}>
     <View style={styles.formWrapper}>
        
         <Text style={[typography.headlineLarge, styles.title]}>Welcome to Kairos</Text>
         <Text style={[typography.titleMedium, styles.subtitle]}>
     Spark spark spark
        </Text>
        <View style={[styles.tipsContainer, { paddingRight: 30 }]}>
            <View style={styles.tipRow}>
            <Ionicons name="shield-checkmark-outline" size={24} color={theme.primary} style={styles.tipIcon} />
             <View style={styles.tipContent}>
                <Text style={[typography.titleMedium, { color: theme.text }]}>Do Something 1</Text>
                <Text style={typography.labelLarge}>
                Bullet 1 blah blah
                </Text>
             </View>
            </View>
            <View style={styles.tipRow}>
            <MaterialIcons name="groups" size={24} color={theme.primary} style={styles.tipIcon} />
             <View style={styles.tipContent}>
                <Text style={[typography.titleMedium, { color: theme.text }]}>Do Something 1</Text>
                <Text style={typography.labelLarge}>
                Bullet 1 blah blah
                </Text>
             </View>
            </View>
           
        </View>
        <PrimaryButton title="Continue" onPress={handleNext} style={styles.button} fullWidth='true' />
     </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  formWrapper: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  logo: {
    height:200,
    alignSelf: 'center',
    resizeMode: 'contain',
    marginBottom: 12,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
  },
  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  tipsContainer: {
    marginTop: 20,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  tipIcon: {
    marginRight: 12,
    marginTop: 4,
  },
  tipContent: {
    flex: 1,
  },
});