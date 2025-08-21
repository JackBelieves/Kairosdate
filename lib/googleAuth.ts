import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
    const platformClientId = Platform.select({
        android: '128730317510-lmtilfs3h3ch4dni8gg1e7jruak4104k.apps.googleusercontent.com',
        ios: '<YOUR_IOS_CLIENT_ID>',
        web: '128730317510-800r2cn8t2fgs5a96u6qfdlea1p17c1d.apps.googleusercontent.com',
    });
    const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: platformClientId,
    });
  

  return { request, response, promptAsync };
};
