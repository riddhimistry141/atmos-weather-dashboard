import { getCityCoordinates, getWeather } from "./api.js";
import { showLoading, showError, renderWeather } from "./ui.js";

const searchForm = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const searchButton = document.getElementById("search-button");
const searchHint = document.getElementById("search-hint");

let latestRequestId = 0;

function renderSearchButton(label) {
    searchButton.replaceChildren();

    const labelElement = document.createElement("span");
    labelElement.textContent = label;

    const iconElement = document.createElement("i");
    iconElement.setAttribute("data-lucide", "search");
    iconElement.setAttribute("aria-hidden", "true");

    searchButton.append(labelElement, iconElement);
    lucide.createIcons();
}

// Convert the static Lucide placeholders in index.html after the script loads.
lucide.createIcons();

searchForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const cityName = cityInput.value.trim();

    if (!cityName) {
        showError("Please enter a city name.");
        cityInput.focus();
        return;
    }

    // Give each search an ID so an older request cannot overwrite newer results.
    const requestId = ++latestRequestId;

    searchButton.disabled = true;
    renderSearchButton("Searching…");
    cityInput.disabled = true;

    showLoading(cityName);
    searchHint.textContent = "Fetching current conditions and forecast…";

    try {
        const city = await getCityCoordinates(cityName);

        if (requestId !== latestRequestId) {
            return;
        }

        const weather = await getWeather(city.latitude, city.longitude);

        if (requestId !== latestRequestId) {
            return;
        }

        renderWeather(city, weather);

        searchHint.textContent = `Showing weather for ${city.name}, ${city.country}.`;
    } catch (error) {
        if (requestId === latestRequestId) {
            showError(error.message || "Something went wrong. Please try again.");
            searchHint.textContent = "Check the city name or your internet connection.";
        }
    } finally {
        if (requestId === latestRequestId) {
            searchButton.disabled = false;
            renderSearchButton("Search");
            cityInput.disabled = false;
        }
    }
});
