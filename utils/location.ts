import * as SecureStore from 'expo-secure-store';

export const saveLocation = async (location: string) => {
  const storedLocations = await getLocations();
  const newLocations = storedLocations ? [...storedLocations, location] : [location];
  await SecureStore.setItemAsync('locations', JSON.stringify(newLocations));
};

export const getLocations = async (): Promise<string[]> => {
  const locations = await SecureStore.getItemAsync('locations');
  return locations ? JSON.parse(locations) : [];
};

export const removeLocation = async (location: string) => {
  const storedLocations = await getLocations();
  const filteredLocations = storedLocations.filter((loc: string) => loc !== location);
  await SecureStore.setItemAsync('locations', JSON.stringify(filteredLocations));
};

export const clearLocations = async () => {
  await SecureStore.deleteItemAsync('locations');
};
