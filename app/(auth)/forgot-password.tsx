import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import { getTypography } from '@/constants/ThemedTypography';
import PrimaryButton from '@/components/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';
import { post } from '@/lib/apiClient';
import SecondaryButton from '@/components/SecondaryButton';
import AlertModal from '@/components/AlertModal';

export default function ForgotPassword() {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? 'light'];
  const typography = getTypography(scheme ?? 'light');
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [resMessage, setResMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    try {
        if (email == ''){
            setErrorMessage("Please enter your email to get the reset link.");
            return;
        }
        const result = await post('/auth/request-password-reset', { email });
        if (result.message){
          setResMessage(result.message)
        }
        setShowSuccess(true)
    } catch (error: any) {
       
    }
    
    
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.formWrapper}>
        <Text style={[typography.headlineLarge, styles.title]}>Forgot Password</Text>

        <Text style={[typography.bodyMedium, { textAlign: 'center', marginBottom: 24, color: theme.tintDark }]}>
          We’ll send a reset link to your email if your account exists.
        </Text>

        {errorMessage !== '' && (
        <Text style={[typography.errorMessage, { textAlign: 'center', marginBottom: 12 }]}>
            {errorMessage}
        </Text>
        )}
        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={20} color={theme.tintDark} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { borderColor: theme.border, color: theme.text }]}
            placeholder="Email"
            placeholderTextColor={theme.tintDark}
            value={email}
            onChangeText={(text) => {
            setEmail(text);
            setErrorMessage('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <AlertModal visible={showSuccess} onClose={() => setShowSuccess(false)} msg={resMessage} msgType="Success"/>
        <PrimaryButton title="Reset Password" onPress={handleSubmit} style={styles.button} />

        <SecondaryButton title="Back to Sign In" onPress={() => router.replace('/(auth)/signin')} style={styles.button} />
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
    width: 100,
    height: 100,
    alignSelf: 'center',
    resizeMode: 'contain',
    marginBottom: 12,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    outlineWidth: 0, // 👈 removes default web focus outline
  },
  button: {
    marginTop: 4,
    marginBottom: 15,
  },
});