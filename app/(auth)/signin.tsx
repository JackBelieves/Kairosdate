import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { get, post } from '@/lib/apiClient';
import { getTypography } from '@/constants/ThemedTypography';
import PrimaryButton from '@/components/PrimaryButton';
import SecondaryButton from '@/components/SecondaryButton';
import { useGoogleAuth } from '@/lib/googleAuth';
import { useEffect } from 'react';

export default function SignIn() {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? 'light'];
  const typography = getTypography(scheme ?? 'light');
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const params = useLocalSearchParams();
  const [errorMessage, setErrorMessage] = useState('');
  const { request, response, promptAsync } = useGoogleAuth();
  const [initialized, setInitialized] = useState(false);

  // Use useEffect to set errorMessage once params are available
  useEffect(() => {
    const msg = params?.errorMsg;
    if (!initialized && msg && typeof msg === 'string' && msg.trim() !== '') {
      setErrorMessage(msg);
      setInitialized(true);

    }
  }, [params]);

  useEffect(() => {
  if (response?.type === 'success') {
    const { authentication } = response;
    handleGoogleLogin(authentication?.accessToken);
  }
}, [response]);

const handleGoogleLogin = async (accessToken: string) => {
  try {
    const googleUser = await get('https://www.googleapis.com/userinfo/v2/me', {}, accessToken);
    console.log(googleUser.email)
    const result = await post('/auth/google-login', {
     email: googleUser.email,
     name: googleUser.name,
    });
    await AsyncStorage.setItem('userToken', result.token);
    await AsyncStorage.setItem('userEmail', result.email);
    await AsyncStorage.setItem('userFirstName', result.first_name);

    // Optional: Mark this as a returning user
    await AsyncStorage.setItem('first_login', result.first_login);
    if (result.email_verified == 'true'){
            await AsyncStorage.setItem('first_time', 'false');
    }else {
            await AsyncStorage.setItem('first_time', 'true');
    }
    if (result.onboard_status == 'started'){
      router.replace('/onboarding/step3');
    }else {
      router.replace('/(tabs)/course');
    }
  } catch (error: any) {
    Alert.alert("Google Login Failed", "Unable to authenticate with Google");
  }
};

  const handleSignIn = async () => {
    try {
        const result = await post('/auth/login', { email, password });
        await AsyncStorage.setItem('userToken', result.token);
        await AsyncStorage.setItem('userEmail', result.email);
        if (result.first_name){
          await AsyncStorage.setItem('userFirstName', result.first_name);
        }

        // Optional: Mark this as a returning user
        await AsyncStorage.setItem('first_login', result.first_login);
        if (result.email_verified == 'true'){
            await AsyncStorage.setItem('first_time', 'false');
        }else {
            await AsyncStorage.setItem('first_time', 'true');
        }
        
        if (result.onboard_status == 'started'){
          router.replace('/onboarding/step3');
        }else {
          router.replace('/(tabs)/course');
        }
    } catch (error: any) {
        setErrorMessage("Invalid email or password. Please try again.");
    }
    
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
     <View style={styles.formWrapper}>
      <Text style={[typography.headlineLarge, styles.title, {marginBottom: 8}]}>Sign In to Kairos</Text>
      <Text style={[typography.titleMedium, { textAlign: 'center', marginBottom: 30}]}>
            faith spark spark spark
        </Text>

        <PrimaryButton
          title="Sign in with Google"
          style={[styles.button, {marginBottom:26}]}
          onPress={() => promptAsync()}
        />

         <Text style={[typography.bodySmall, { color: theme.primary, textAlign: 'center', marginBottom: 16 }]}>
          Or Sign In with your Email:
        </Text>

        {errorMessage !== '' && (
        <Text style={[typography.errorMessage, { textAlign: 'center', marginBottom: 12,  }]}>
            {errorMessage}
        </Text>
        )}
      <View style={styles.inputWrapper}>
        <Ionicons name="mail-outline" size={20} color={theme.tintDark} style={styles.inputIcon} />
        <TextInput
          style={[styles.input]}
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

      <View style={styles.inputWrapper}>
        <Ionicons name="lock-closed-outline" size={20} color={theme.tintDark} style={styles.inputIcon} />
        <TextInput
          style={[styles.input]}
          placeholder="Password"
          placeholderTextColor={theme.tintDark}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setErrorMessage('');
           }}
          secureTextEntry
        />
      </View>

      <Pressable onPress={() => router.push('/(auth)/forgot-password')}>
        <Text style={[typography.bodySmall, { color: theme.primary, textAlign: 'right', marginBottom: 16 }]}>
          Forgot password?
        </Text>
      </Pressable>

      <PrimaryButton title="Sign In" onPress={handleSignIn} style={styles.button} fullWidth='true'/>

      <Text style={[typography.bodySmall, { color: theme.tintDark, marginTop: 32, textAlign: 'center' }]}>
        Don’t have an account?
      </Text>
      <SecondaryButton title="Get Started" style={styles.button}  onPress={() => router.push('/onboarding/step1')}/>
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
    outlineWidth: 0, // 👈 removes default web focus outline
  },
  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
});