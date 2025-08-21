import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";


export default function Home() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);
  

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('userToken');
      //const onboardingDone = await AsyncStorage.getItem('onboardingComplete');
      const onboardingDone = true

      setShowSplash(false);

      if (token) {
        router.replace('/(tabs)');
      //} else if (!onboardingDone) {
      //  router.replace('/onboarding/step1');
      } else {
        router.replace('/signin');
      }
    };

    const timeout = setTimeout(checkAuth, 1800);
    return () => clearTimeout(timeout);
  }, []);

  

  return null;
}

