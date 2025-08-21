import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, Alert, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { getTypography } from '@/constants/ThemedTypography';
import { post } from '@/lib/apiClient';
import { Ionicons } from '@expo/vector-icons';
import AlertModal from '@/components/AlertModal';
import PrimaryButton from '@/components/PrimaryButton';
import SecondaryButton from '@/components/SecondaryButton';

const ResetPasswordScreen = () => {
  const { token } = useLocalSearchParams();
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [newPasswordValid, setNewPasswordValid] = useState(false);
  const [confirmPasswordValid, setConfirmPasswordValid] = useState(false);

  const handleResetPassword = async () => {
    if (!token || typeof token !== 'string') {
      setErrorMessage('Invalid or missing token.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords don't match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await post('/auth/reset-password', { token, new_password: newPassword });
      setShowSuccess(true)
      setShowSignIn(true)
     
    } catch (error: any) {
      const msg = error?.response?.data?.detail || 'Failed to reset password';
      Alert.alert('Error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
      setNewPasswordValid(newPassword.length >= 8);
  }, [newPassword]);
  useEffect(() => {
      setConfirmPasswordValid(newPassword == confirmPassword);
  }, [newPassword, confirmPassword]);
  
  

  const scheme = 'light'; // Or use useColorScheme()
  const theme = Colors[scheme];
  const typography = getTypography(scheme);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.formWrapper}>
                   
      <Text style={[typography.headlineLarge, styles.title]}>Create new password</Text>
        <Text style={[typography.bodyMedium, { textAlign: 'center', marginBottom: 24, color: theme.tintDark }]}>
          Your new password must be different from your previous passwords.
        </Text>
      {errorMessage !== '' && (
        <Text style={[typography.errorMessage, { textAlign: 'center', marginBottom: 12 }]}>
                  {errorMessage}
        </Text>
        )}
      <View style={styles.inputWrapper}>
        <Ionicons name="lock-closed-outline" size={20} color={theme.tintDark} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { borderColor: theme.border, color: theme.text }]}
          placeholder="New Password"
          placeholderTextColor={theme.tintDark}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />
        
      </View>
      <Text
            style={{
            color: newPasswordValid ? theme.primary : theme.tabIconSelected,
            fontSize: 12,
            marginBottom: 16,
            }}>
                    {newPasswordValid
                        ? 'Password length is good'
                        : 'Password must be at least 8 characters'}
        </Text>

      <View style={styles.inputWrapper}>
        <Ionicons name="lock-closed-outline" size={20} color={theme.tintDark} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { borderColor: theme.border, color: theme.text }]}
          placeholder="Confirm Password"
          placeholderTextColor={theme.tintDark}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        
      </View>
      <Text
            style={{
            color: confirmPasswordValid ? theme.primary : theme.tabIconSelected,
            fontSize: 12,
            marginBottom: 20,
            }}>
                    {confirmPasswordValid
                        ? 'Both passwords match'
                        : 'Both passwords must match'}
        </Text>
      
      <AlertModal visible={showSuccess} onClose={() => setShowSuccess(false)} msg="Your password change is complete. Please sign in to access your account." msgType="Success"/>

      {showSignIn && (
        <SecondaryButton title={'Back to Sign In'} onPress={() => router.replace('/signin')} style={styles.button} />
      )}
      {!showSignIn && (
      <PrimaryButton title={isSubmitting ? 'Resetting...' : 'Change Password'} onPress={handleResetPassword} style={styles.button} />
      )}

    </View>
   </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
    justifyContent: 'center',
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
    marginBottom: 6,
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

export default ResetPasswordScreen;