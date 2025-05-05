import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'weather_logs';

export const storeWeatherLog = async (entry: any) => {
  try {
    const existing = await AsyncStorage.getItem(STORAGE_KEY);
    const logs = existing ? JSON.parse(existing) : [];
    logs.unshift({ ...entry, timestamp: new Date().toISOString(), city:entry.city });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(logs.slice(0, 20))); 
  } catch (e) {
    console.error('Failed to store weather log:', e);
  }
};

export const getWeatherLogs = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to fetch weather logs:', e);
    return [];
  }
};

export const clearWeatherLogs = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear weather logs:', e);
  }
};

export const deleteWeatherLogByIndex = async (index: number) => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      const logs = data ? JSON.parse(data) : [];
      logs.splice(index, 1);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to delete weather log:', e);
    }
  };
  