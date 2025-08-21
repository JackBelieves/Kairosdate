import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, Platform, ScrollView, Image, TouchableOpacity, Alert,
  useColorScheme
} from 'react-native';
import PrimaryButton from '@/components/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { getTypography } from '@/constants/ThemedTypography';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { post, put } from '@/lib/apiClient';

const OnboardingStep2 = () => {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = Colors['light'];
  const typography = getTypography(scheme ?? 'light');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordValid, setPasswordValid] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
 


  useEffect(() => {
    setPasswordValid(password.length >= 8);
    }, [password]);

  const openExternalLink = (url: string) => {
    if (Platform.OS === 'web') {
        window.open(url, '_blank');
    } else {
        Linking.openURL(url);
    }
  };
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const handleSubmit = async () => {
    if (!emailRegex.test(email)) {
        setErrorMessage('Please enter a valid email address.');
        return;
    }
    if (password == '' || password.length < 8){
        setErrorMessage('Please enter a valid password.');
        return;
    }
    if (!acceptedTerms) {
      setErrorMessage('Please accept the Terms and Privacy Policy.');
      return;
    }

    try {
      const result = await post('/auth/signup', 
        { email, 
          password });
      await AsyncStorage.setItem('userToken', result.token);
      await AsyncStorage.setItem('userEmail', result.email);
      await AsyncStorage.setItem('first_time', 'true');

      router.push('./step3');
    } catch (error) {
        console.log(error)
      Alert.alert('Account Creation Failed', 'Please check back shortly');
    }
    
  };


  const toggleComplete =() => {
    setAcceptedTerms(!acceptedTerms)
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.formWrapper}>
       <Text style={[typography.headlineSmall, styles.title, { color: theme.text }]}>Create Your Karios Account, It's Free!</Text>
        <Text style={[typography.bodyMedium, styles.subtitle, { color: theme.text }]}>
          Let’s start with creating an account.
        </Text>
        {errorMessage !== '' && (
                <Text style={[typography.errorMessage, { textAlign: 'center', marginBottom: 12, color: theme.error }]}>
                    {errorMessage}
                </Text>
                )}

        <InputField icon="mail-outline" placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <InputField icon="lock-closed-outline" placeholder="Enter a strong password" value={password} onChangeText={setPassword} secureTextEntry />
            <Text
            style={{
                color: passwordValid ? theme.primary : theme.caption,
                fontSize: 12,
                marginBottom: 8,
            }}
            >
            {passwordValid
                ? 'Password length is good'
                : 'Password must be at least 8 characters'}
            </Text>
        
        <View style={styles.checkboxWrapper}>
          <TouchableOpacity onPress={() => toggleComplete()}>
                    <Ionicons
                      name={acceptedTerms ? "checkbox" : "square-outline"}
                      size={20}
                      color={theme.tabIconSelected}
                      style={{ marginRight: 12 }}
                    />
          </TouchableOpacity>
          <Text style={[typography.bodySmall, { color: theme.text, marginLeft: 8 }]}>
            I agree to Kairos'{' '}
            <Text style={{ color: theme.primary }} onPress={() => openExternalLink('https://www.sovra.care/terms-of-use/')}>
            Service Terms
            </Text>{' '}
            and{' '}
            <Text style={{ color: theme.primary }} onPress={() => openExternalLink('https://www.sovra.care/privacy-policy/')}>
            Privacy Policy
            </Text>
        </Text>
        </View>
        <PrimaryButton title="Continue" onPress={handleSubmit} style={{ marginTop: 20 }} fullWidth='true' />

        <Text style={[typography.bodySmall, styles.freeText, { color: theme.caption }]}>
          This account is free. No credit card needed.
        </Text>
        
      </View>
    </ScrollView>
  );
};

export default OnboardingStep2;

const InputField = ({ icon, ...props }) => {
  const theme = Colors['light'];
  return (
    <View style={styles.inputWrapper}>
      <Ionicons name={icon} size={20} color={theme.tabIconSelected} style={{ marginRight: 10 }} />
      <TextInput
        style={[styles.input, { color: theme.text }]}
        placeholderTextColor={theme.caption}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  formWrapper: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  logo: {
    height: 50,
    width: 50,
    alignSelf: 'center',
    marginBottom: 12,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderBottomWidth: 1,
    paddingVertical: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  freeText: {
    textAlign: 'center',
    marginTop: 5
  },
  privacyText: {
    textAlign: 'center',
    marginTop: 12,
  },
  checkboxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
});
