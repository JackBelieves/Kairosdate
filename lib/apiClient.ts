import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { router } from "expo-router";
import Constants from 'expo-constants';

// lib/apiClient.ts
const isLocalDev =
  Constants.expoConfig?.extra?.env === 'development' ||
  __DEV__; // __DEV__ is true in dev mode

const API_URL = isLocalDev
  ? Platform.OS === 'android'
    ? 'http://10.0.2.2:8010/api/v1'
    : 'http://localhost:8010/api/v1'
  : 'https://kairos-api-265535909839.us-central1.run.app/api/v1';

//export const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8010/api/v1' : 'http://localhost:8010/api/v1';
const API_KEY = 'SPARK_ALP25';
export { API_URL, API_KEY };

type HeadersOptions = {
  auth?: string | null; // token
  contentType?: string;
};

function buildHeaders({ auth = null, contentType = "application/json" }: HeadersOptions = {}) {
  const headers: Record<string, string> = {
    "x-api-key": API_KEY,
  };
  if (contentType) headers["Content-Type"] = contentType;
  if (auth) headers["Authorization"] = 'Bearer ' + auth;
  return headers;
}

export async function post(endpoint: string, data: any, token?: string) {
  const url = API_URL + endpoint;
  const headers = {
    'x-api-key':  API_KEY,
  };
  headers['Authorization'] = `Bearer ${token}`;
  const isFormData = data instanceof FormData;

  const options = {
    method: 'POST',
    headers: isFormData ? headers:buildHeaders({ auth: token }),
    body: isFormData ? data : JSON.stringify(data),
  };
  console.log(options)
  const response = await fetch(url, options);
  if (response.status === 401) {
    // Optional: Clear token
    await AsyncStorage.removeItem('userToken');
    // Redirect to sign-in with message
    router.push({
      pathname: '/(auth)/signin',
      params: {
        errorMsg: 'Session expired. Please sign in again.',
      },
    });

    // Optionally throw to stop execution
    throw new Error('Unauthorized');
  }
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'API request failed');
  }

  return response.json();
}

export async function put(endpoint: string, data: any, token?: string) {
  const url = API_URL + endpoint;

  const options = {
    method: 'PUT',
    headers: buildHeaders({ auth: token }),
    body: JSON.stringify(data),
  };
  console.log(options)
  const response = await fetch(url, options);
  if (response.status === 401) {
    // Optional: Clear token
    await AsyncStorage.removeItem('userToken');
    // Redirect to sign-in with message
    router.push({
      pathname: '/(auth)/signin',
      params: {
        errorMsg: 'Session expired. Please sign in again.',
      },
    });

    // Optionally throw to stop execution
    throw new Error('Unauthorized');
  }
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'API request failed');
  }

  return response.json();
}

export async function patch(endpoint: string, data: any, token?: string) {
  const url = API_URL + endpoint;

  const options = {
    method: 'PATCH',
    headers: buildHeaders({ auth: token }),
    body: JSON.stringify(data),
  };
  console.log(options)
  const response = await fetch(url, options);
  if (response.status === 401) {
    // Optional: Clear token
    await AsyncStorage.removeItem('userToken');
    // Redirect to sign-in with message
    router.push({
      pathname: '/(auth)/signin',
      params: {
        errorMsg: 'Session expired. Please sign in again.',
      },
    });

    // Optionally throw to stop execution
    throw new Error('Unauthorized');
  }
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'API request failed');
  }

  return response.json();
}

export async function remove(endpoint: string, token?: string) {
  const url = API_URL + endpoint;

  const options = {
    method: 'DELETE',
    headers: buildHeaders({ auth: token })
  };
  console.log(options)
  const response = await fetch(url, options);
  if (response.status === 401) {
    // Optional: Clear token
    await AsyncStorage.removeItem('userToken');
    // Redirect to sign-in with message
    router.push({
      pathname: '/(auth)/signin',
      params: {
        errorMsg: 'Session expired. Please sign in again.',
      },
    });

    // Optionally throw to stop execution
    throw new Error('Unauthorized');
  }
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'API request failed');
  }

  return response.json();
}

export async function get(endpoint: string, params?: Record<string, string>, token?: string) {
  const url = new URL(API_URL + endpoint);
  if (params) {
    Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
  }

  const options = {
    method: 'GET',
    headers: buildHeaders({ auth: token }),
  };
  console.log(options)
  const response = await fetch(url.toString(), options);
  if (response.status === 401) {
    // Optional: Clear token
    await AsyncStorage.removeItem('userToken');
    // Redirect to sign-in with message
    router.push({
      pathname: '/(auth)/signin',
      params: {
        errorMsg: 'Session expired. Please sign in again.',
      },
    });

    // Optionally throw to stop execution
    throw new Error('Unauthorized');
  }
  if (!response.ok) {
    throw new Error("API request failed");
  }

  return await response.json();
}