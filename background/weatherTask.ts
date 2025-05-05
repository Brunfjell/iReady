import * as BackgroundFetch from 'expo-background-fetch';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { fetchWeather } from '../services/weatherAPI';
import { sendWeatherNotifications } from '../utils/notifications';

const TASK_NAME = 'WEATHER_FETCH_TASK';

TaskManager.defineTask(TASK_NAME, async () => {
  try {
    const location = await Location.getCurrentPositionAsync({});
    const data = await fetchWeather(location.coords.latitude, location.coords.longitude);
    await sendWeatherNotifications(data);
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Background weather task error:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const registerWeatherTask = async () => {
  const status = await BackgroundFetch.getStatusAsync();
  if (status === BackgroundFetch.BackgroundFetchStatus.Available) {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(TASK_NAME, {
        minimumInterval: 15 * 60, // 15 minutes
        stopOnTerminate: false,
        startOnBoot: true,
      });
    }
  } else {
    console.warn('Background fetch not available');
  }
};
