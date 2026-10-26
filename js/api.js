  

const GEOCODING_URL = import.meta.env.GEOCODING_URL;
const WEATHER_URL = import.meta.env.WEATHER_URL

// Find a city and return its coordinates.
export async function getCityCoordinates(cityName) {
    const url = new URL(GEOCODING_URL);

    url.search = new URLSearchParams({
        name: cityName.trim(),
        count: "1",
        language: "en",
        format: "json"
    });

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Unable to search for this city. Please try again.");
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        throw new Error("City not found. Check the spelling and try again.");
    }

    return data.results[0];
}

// Get current conditions and a five-day forecast.
export async function getWeather(latitude, longitude) {
    const url = new URL(WEATHER_URL);

    url.search = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        current: [
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "is_day",
            "weather_code",
            "wind_speed_10m"
        ].join(","),
        daily: [
            "weather_code",
            "temperature_2m_max",
            "temperature_2m_min"
        ].join(","),
        forecast_days: "5",
        timezone: "auto"
    });

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Unable to load weather data. Please try again.");
    }

    const data = await response.json();

    if (!data.current || !data.daily) {
        throw new Error("Weather data is incomplete. Please try again.");
    }

    return data;
}
