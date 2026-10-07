// References:
// Open-Meteo (n.d.) Free Weather API.
// Available at: https://open-meteo.com/en/docs
// MDN Web Docs (n.d.) async function.
// Available at: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
// =========================================
// StudyStream - planner.js
// Uses the Open-Meteo API (free, no API key required)
// Geocoding: https://geocoding-api.open-meteo.com/v1/search
// Forecast:  https://api.open-meteo.com/v1/forecast
// =========================================

document.addEventListener('DOMContentLoaded', () => {

    const plannerForm = document.getElementById('plannerForm');
    const cityInput = document.getElementById('planner-city');
    const dateInput = document.getElementById('planner-date');
    const durationInput = document.getElementById('planner-duration');
    const notesInput = document.getElementById('planner-notes');
    const plannerStatus = document.getElementById('plannerStatus');
    const plannerResults = document.getElementById('plannerResults');

    if (!plannerForm) return;

    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.min = today;

    plannerForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const city = cityInput.value.trim();
        const date = dateInput.value;
        const duration = parseInt(durationInput.value, 10) || 2;
        const notes = notesInput.value.trim();
        const setting = document.querySelector('input[name="setting"]:checked').value;

        // ---------- Validate ----------
        if (city.length < 2) {
            showStatus('Please enter a valid city name.', 'error');
            return;
        }

        if (!date) {
            showStatus('Please select a study date.', 'error');
            return;
        }

        // ---------- Show loading ----------
        showStatus('Looking up the weather forecast...', 'loading');
        plannerResults.innerHTML = '';

        try {
            // ---------- STEP 1: Geocode the city ----------
            const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
            const geoResponse = await fetch(geoUrl);
            const geoData = await geoResponse.json();

            if (!geoData.results || geoData.results.length === 0) {
                showStatus(`Could not find "${city}". Please check the spelling and try again.`, 'error');
                return;
            }

            const location = geoData.results[0];
            const { latitude, longitude, name, country } = location;

            // ---------- STEP 2: Fetch weather forecast ----------
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&timezone=auto&start_date=${date}&end_date=${date}`;

            const weatherResponse = await fetch(weatherUrl);
            const weatherData = await weatherResponse.json();

            if (!weatherData.daily || !weatherData.daily.time || weatherData.daily.time.length === 0) {
                showStatus('No weather data available for that date. Try a date within the next 16 days.', 'error');
                return;
            }

            // ---------- STEP 3: Build the plan ----------
            const maxTemp = weatherData.daily.temperature_2m_max[0];
            const minTemp = weatherData.daily.temperature_2m_min[0];
            const rainChance = weatherData.daily.precipitation_probability_max[0];
            const weatherCode = weatherData.daily.weather_code[0];
            const weatherDescription = getWeatherDescription(weatherCode);

            const recommendation = getRecommendation(rainChance, maxTemp, setting);

            showStatus(`Weather found for ${name}, ${country}.`, 'success');
            renderPlan({
                city: name,
                country,
                date,
                duration,
                notes,
                minTemp,
                maxTemp,
                rainChance,
                weatherDescription,
                recommendation
            });

        } catch (error) {
            console.error('Planner error:', error);
            showStatus('Something went wrong while fetching the weather. Please try again.', 'error');
        }
    });

    // ---------- Helpers ----------
    function showStatus(message, type) {
        plannerStatus.textContent = message;
        plannerStatus.className = `status-message ${type}`;
    }

    // Map WMO weather codes to readable descriptions
    // https://open-meteo.com/en/docs
    function getWeatherDescription(code) {
        const descriptions = {
            0: 'Clear sky ☀️',
            1: 'Mainly clear 🌤️',
            2: 'Partly cloudy ⛅',
            3: 'Overcast ☁️',
            45: 'Fog 🌫️',
            48: 'Depositing rime fog 🌫️',
            51: 'Light drizzle 🌦️',
            53: 'Moderate drizzle 🌦️',
            55: 'Dense drizzle 🌧️',
            61: 'Slight rain 🌧️',
            63: 'Moderate rain 🌧️',
            65: 'Heavy rain 🌧️',
            71: 'Slight snow ❄️',
            73: 'Moderate snow ❄️',
            75: 'Heavy snow ❄️',
            80: 'Rain showers 🌦️',
            81: 'Moderate showers 🌧️',
            82: 'Violent showers ⛈️',
            95: 'Thunderstorm ⛈️',
            96: 'Thunderstorm with hail ⛈️',
            99: 'Thunderstorm with heavy hail ⛈️'
        };
        return descriptions[code] || 'Unknown conditions';
    }

    function getRecommendation(rainChance, maxTemp, setting) {
        if (rainChance >= 60) {
            return 'High chance of rain — indoor study is recommended. ☔';
        }
        if (maxTemp >= 28) {
            return 'Very warm day — consider indoor study with air conditioning, or study early/late. 🥵';
        }
        if (maxTemp <= 5) {
            return 'Cold day — indoor study with a warm drink is recommended. 🥶';
        }
        if (setting === 'outdoor' && rainChance < 30) {
            return 'Great conditions for outdoor study. Enjoy the fresh air! 🌳';
        }
        if (setting === 'indoor') {
            return 'Indoor study is a solid choice today. 📚';
        }
        return 'Either indoor or outdoor study should work well today. 👍';
    }

    // ---------- Render the plan card ----------
    function renderPlan(plan) {
        plannerResults.innerHTML = `
            <article class="plan-card">
                <h3>Your Study Plan</h3>
                <ul class="plan-details">
                    <li><strong>Location:</strong> ${escapeHTML(plan.city)}, ${escapeHTML(plan.country)}</li>
                    <li><strong>Date:</strong> ${escapeHTML(plan.date)}</li>
                    <li><strong>Duration:</strong> ${escapeHTML(String(plan.duration))} hour(s)</li>
                    <li><strong>Weather:</strong> ${escapeHTML(plan.weatherDescription)}</li>
                    <li><strong>Temperature:</strong> ${escapeHTML(String(plan.minTemp))}°C – ${escapeHTML(String(plan.maxTemp))}°C</li>
                    <li><strong>Chance of rain:</strong> ${escapeHTML(String(plan.rainChance))}%</li>
                </ul>
                ${plan.notes ? `<p class="plan-notes"><strong>Your notes:</strong> ${escapeHTML(plan.notes)}</p>` : ''}
                <p class="plan-recommendation">${escapeHTML(plan.recommendation)}</p>
            </article>
        `;
    }

    // ---------- Simple HTML escape for safety ----------
    function escapeHTML(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

});