export interface WeatherData {
  temperature: number;
  precipitation: number;
  humidity: number;
  isRaining: boolean;
  locationName?: string;
}

export async function fetchLocalWeather(lat: number, lon: number): Promise<WeatherData> {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation&timezone=auto`;
  const geoUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=fr`;
  
  try {
    const [weatherRes, geoRes] = await Promise.all([
      fetch(weatherUrl),
      fetch(geoUrl)
    ]);

    if (!weatherRes.ok) throw new Error("Weather fetch failed");
    
    const weatherData = await weatherRes.json();
    const geoData = await geoRes.json();
    
    const current = weatherData.current;
    
    // Format location name: "City, Country"
    const locationName = geoData.city 
      ? `${geoData.city}, ${geoData.countryName}` 
      : geoData.locality || geoData.countryName;
    
    return {
      temperature: current.temperature_2m,
      precipitation: current.precipitation,
      humidity: current.relative_humidity_2m,
      isRaining: current.precipitation > 0,
      locationName
    };
  } catch (error) {
    console.error("Error fetching weather or location:", error);
    throw error;
  }
}
