import axios from 'axios';

const API_KEY = '17bd73fb06dba7df6861dbe2d0bc6f29'; 

export const fetchWeather = async (lat: number, lon: number) => {
  const response = await axios.get(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
  );
  return response.data;
};

export const fetchWeatherByCity = async (city: string) => {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    if (!response.ok) throw new Error('City not found');
    return await response.json();
  };
  
  export const fetchWeatherForecast = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.list || !data.list.length) {
        throw new Error('No forecast data available');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching forecast:', error);
      throw error;
    }
  };