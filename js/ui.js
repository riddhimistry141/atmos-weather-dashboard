
const weatherDescriptions = {
    0: { label: "Clear sky", icon: "sun", nightIcon: "moon" },
    1: { label: "Mainly clear", icon: "sun", nightIcon: "moon" },
    2: { label: "Partly cloudy", icon: "cloud-sun", nightIcon: "cloud-moon" },
    3: { label: "Overcast", icon: "cloud" },
    45: { label: "Fog", icon: "cloud-fog" },
    48: { label: "Depositing rime fog", icon: "cloud-fog" },
    51: { label: "Light drizzle", icon: "cloud-drizzle" },
    53: { label: "Moderate drizzle", icon: "cloud-drizzle" },
    55: { label: "Dense drizzle", icon: "cloud-drizzle" },
    56: { label: "Freezing drizzle", icon: "cloud-drizzle" },
    57: { label: "Heavy freezing drizzle", icon: "cloud-drizzle" },
    61: { label: "Slight rain", icon: "cloud-rain" },
    63: { label: "Moderate rain", icon: "cloud-rain" },
    65: { label: "Heavy rain", icon: "cloud-rain" },
    66: { label: "Freezing rain", icon: "cloud-rain" },
    67: { label: "Heavy freezing rain", icon: "cloud-rain" },
    71: { label: "Slight snowfall", icon: "cloud-snow" },
    73: { label: "Moderate snowfall", icon: "cloud-snow" },
    75: { label: "Heavy snowfall", icon: "cloud-snow" },
    77: { label: "Snow grains", icon: "snowflake" },
    80: { label: "Slight rain showers", icon: "cloud-rain" },
    81: { label: "Moderate rain showers", icon: "cloud-rain" },
    82: { label: "Violent rain showers", icon: "cloud-rain" },
    85: { label: "Slight snow showers", icon: "cloud-snow" },
    86: { label: "Heavy snow showers", icon: "cloud-snow" },
    95: { label: "Thunderstorm", icon: "cloud-lightning" },
    96: { label: "Thunderstorm with hail", icon: "cloud-lightning" },
    99: { label: "Heavy thunderstorm with hail", icon: "cloud-lightning" }
};

function getWeatherDescription(code) {
    return weatherDescriptions[code] || {
        label: "Unknown conditions",
        icon: "cloud"
    };
}

function getElement(id) {
    return document.getElementById(id);
}

function formatTemperature(value) {
    return `${Math.round(value)}°C`;
}

function formatDay(dateString, includeDate = false) {
    const date = new Date(`${dateString}T12:00:00`);

    if (Number.isNaN(date.getTime())) {
        return dateString;
    }

    const options = includeDate
        ? { weekday: "short", day: "numeric", month: "short" }
        : { weekday: "long", day: "numeric", month: "short" };

    return new Intl.DateTimeFormat("en", options).format(date);
}

function setText(id, value) {
    getElement(id).textContent = value;
}

function createWeatherIcon(iconName) {
    const icon = document.createElement("i");

    icon.setAttribute("data-lucide", iconName);
    icon.setAttribute("aria-hidden", "true");

    return icon;
}

export function showLoading(city) {
    const status = getElement("status-message");

    status.dataset.state = "loading";
    status.textContent = `Finding the latest weather for ${city}…`;
    status.hidden = false;

    getElement("weather-content").hidden = true;
}

export function showError(message) {
    const status = getElement("status-message");

    status.dataset.state = "error";
    status.textContent = message;
    status.hidden = false;

    getElement("weather-content").hidden = true;
}

export function renderWeather(city, weather) {
    const current = weather.current;
    const description = getWeatherDescription(current.weather_code);

    const iconName = Number(current.is_day) === 1
        ? description.icon
        : (description.nightIcon || description.icon);

    setText("city-name", `${city.name}, ${city.country}`);
    setText(
        "current-date",
        `Local time: ${current.time.replace("T", " ")}`
    );

    // Update the temperature without removing the existing °C span.
    const temperatureElement = getElement("temperature");
    temperatureElement.firstChild.textContent =
        Math.round(current.temperature_2m);

    setText("condition", description.label);
    setText("feels-like", Math.round(current.apparent_temperature));
    setText("stat-feels-like", formatTemperature(current.apparent_temperature));
    setText("wind-speed", `${Math.round(current.wind_speed_10m)} km/h`);
    setText("humidity", `${current.relative_humidity_2m}%`);

    const currentIcon = getElement("current-icon");
    currentIcon.replaceChildren(createWeatherIcon(iconName));

    renderForecast(weather.daily);

    // Convert all newly added Lucide placeholders into SVG icons.
    if (window.lucide) {
        window.lucide.createIcons();
    }

    getElement("status-message").hidden = true;
    getElement("weather-content").hidden = false;
}

function renderForecast(daily) {
    const forecastGrid = getElement("forecast-grid");

    // Remove the previous forecast before rendering the new one.
    forecastGrid.replaceChildren();

    for (let i = 0; i < daily.time.length; i++) {
        const description = getWeatherDescription(daily.weather_code[i]);

        const card = document.createElement("article");
        card.className = "forecast-card";
        card.style.animationDelay = `${i * 70}ms`;

        const day = document.createElement("h3");
        day.className = "forecast-day";
        day.textContent = formatDay(daily.time[i], true);

        const iconContainer = document.createElement("div");
        iconContainer.className = "forecast-icon";
        iconContainer.setAttribute("aria-label", description.label);
        iconContainer.appendChild(createWeatherIcon(description.icon));

        const condition = document.createElement("p");
        condition.className = "forecast-condition";
        condition.textContent = description.label;

        const temperatures = document.createElement("div");
        temperatures.className = "forecast-temperatures";

        const high = document.createElement("span");
        high.className = "forecast-high";
        high.textContent = formatTemperature(
            daily.temperature_2m_max[i]
        );

        const low = document.createElement("span");
        low.className = "forecast-low";
        low.textContent = formatTemperature(
            daily.temperature_2m_min[i]
        );

        temperatures.append(high, low);
        card.append(day, iconContainer, condition, temperatures);
        forecastGrid.appendChild(card);
    }
}
