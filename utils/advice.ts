export const getSuggestionsBasedOnWeather = (data: { main: { temp: any; feels_like?: any; humidity?: any; }; weather: { main: string; description?: string; }[]; wind: { speed: any; }; }) => {
    const suggestions = [];
    
    const temp = data.main?.temp;
    const feelsLike = data.main?.feels_like;
    const weather = data.weather?.[0]?.main?.toLowerCase();
    const description = data.weather?.[0]?.description?.toLowerCase();
    const wind = data.wind?.speed;
    const humidity = data.main?.humidity;
  
    // Temperature-based suggestions
    if (temp <= 10) suggestions.push("🧥 Wear a warm jacket.");
    else if (temp <= 20) suggestions.push("🧥 Bring a light sweater.");
    else suggestions.push("👕 T-shirt weather!");
  
    // Additional suggestions based on feels-like temperature
    if (feelsLike && feelsLike > 25) suggestions.push("🌞 It's quite hot outside. Stay hydrated!");
    if (feelsLike && feelsLike <= 0) suggestions.push("🥶 It's freezing! Bundle up!");
  
    // Weather conditions
    if (weather.includes("rain")) suggestions.push("☔ Don't forget an umbrella.");
    if (weather.includes("clear")) suggestions.push("😎 Sunglasses recommended.");
    if (weather.includes("snow")) suggestions.push("🧤 Dress warmly, it's snowing.");
    if (weather.includes("cloud")) suggestions.push("🌥 Overcast weather, perfect for a cozy day.");
    
    // Wind-based suggestions
    if (wind > 10) suggestions.push("💨 It's windy. Wear something secure.");
    if (wind > 20) suggestions.push("🌪 Strong winds! Be careful outside.");
  
    // Humidity-based suggestions
    if (humidity && humidity > 80) suggestions.push("🌫 High humidity, consider lighter clothes.");
    if (humidity && humidity < 30) suggestions.push("💧 Low humidity, stay hydrated!");
    
    // General suggestions for all conditions
    if (temp > 30) suggestions.push("🥵 It's scorching hot! Stay cool and find some shade.");
    if (temp < 0) suggestions.push("❄️ Extremely cold! Take extra care when going outside.");
  
    return suggestions.length > 0 ? suggestions : ["👍 Weather looks fine!"];
  };
  