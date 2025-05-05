import * as Notifications from 'expo-notifications';

export const sendWeatherNotifications = async (data: any) => {
  const temp = data.main.temp;
  const condition = data.weather[0].main.toLowerCase();
  let title = '';
  let body = '';

  if (temp > 35) {
    title = '☀️ It’s really hot!';
    body = 'Temperature is above 35°C. Stay cool and hydrated.';
  } else if (temp < 10) {
    title = '❄️ It’s cold out!';
    body = 'Bundle up — temperature is below 10°C.';
  } else if (condition.includes('rain')) {
    title = '🌧️ Rain alert!';
    body = 'Rain expected. Don’t forget your umbrella.';
  } else if (condition.includes('cloud')) {
    title = '☁️ Cloudy skies';
    body = 'Might be a gloomy day, but perfect for indoor vibes.';
  } else if (condition.includes('thunderstorm')) {
    title = '⛈️ Thunderstorm warning';
    body = 'Stay indoors — stormy conditions detected.';
  } else if (condition.includes('clear')) {
    title = '🌞 Clear skies';
    body = 'Beautiful weather outside!';
  }

  if (title && body) {
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null,
    });
  }
};
