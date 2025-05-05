import * as Google from 'expo-auth-session/providers/google';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '1039994345897-iibiqlsol0o45tkhstjv0o9dt0dc1b1c.apps.googleusercontent.com',
  });

  return { request, response, promptAsync };
};

export const saveUserToStorage = async (user: any) => {
  await SecureStore.setItemAsync('user', JSON.stringify(user));
};

export const getUserFromStorage = async () => {
  const stored = await SecureStore.getItemAsync('user');
  return stored ? JSON.parse(stored) : null;
};

export const clearUser = async () => {
  await SecureStore.deleteItemAsync('user');
};
