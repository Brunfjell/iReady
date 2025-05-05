export const fetchWeatherData = async (location: string) => {
  const API_KEY = '1039994345897-iibiqlsol0o45tkhstjv0o9dt0dc1b1c.apps.googleusercontent.com';

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&units=metric`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.cod === '404') {
      return { error: 'Location not found' };
    }

    return {
      temperature: data.main.temp,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
    };
  } catch (error) {
    return { error: 'Failed to fetch weather data' };
  }
};
