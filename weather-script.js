// ==================== WEATHER API CONFIGURATION ====================
// Using Open-Meteo API (Free, No API Key Required)
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';
const GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1/search';

// State
let currentWeatherData = null;
let currentLocation = null;
let isCelsius = true;
let searchHistory = JSON.parse(localStorage.getItem('weatherHistory')) || [];

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const welcomeLocationBtn = document.getElementById('welcomeLocationBtn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const mainWeather = document.getElementById('mainWeather');
const welcome = document.getElementById('welcome');
const historySection = document.getElementById('historySection');
const celsiusBtn = document.getElementById('celsiusBtn');
const fahrenheitBtn = document.getElementById('fahrenheitBtn');
const suggestions = document.getElementById('suggestions');

// ==================== EVENT LISTENERS ====================
searchBtn.addEventListener('click', handleSearch);
locationBtn.addEventListener('click', handleLocationClick);
welcomeLocationBtn.addEventListener('click', handleLocationClick);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});
searchInput.addEventListener('input', handleSuggestions);
celsiusBtn.addEventListener('click', () => toggleUnit(true));
fahrenheitBtn.addEventListener('click', () => toggleUnit(false));

// ==================== MAIN FUNCTIONS ====================

/**
 * Handle search functionality
 */
async function handleSearch() {
    const city = searchInput.value.trim();
    if (!city) {
        showError('Please enter a city name');
        return;
    }
    
    showLoading(true);
    hideError();
    suggestions.classList.remove('show');
    
    try {
        const coordinates = await searchCity(city);
        if (coordinates) {
            await fetchWeatherData(coordinates.lat, coordinates.lon, coordinates.name);
            searchInput.value = '';
            addToHistory(coordinates.name, coordinates.country);
        }
    } catch (err) {
        showError('Failed to fetch weather data. Please try again.');
        console.error(err);
    } finally {
        showLoading(false);
    }
}

/**
 * Search for city coordinates
 */
async function searchCity(query) {
    const response = await fetch(
        `${GEOCODING_API}?name=${encodeURIComponent(query)}&count=1&language=en&format=json`
    );
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
        showError('City not found. Please try another search.');
        return null;
    }
    
    const result = data.results[0];
    return {
        lat: result.latitude,
        lon: result.longitude,
        name: result.name,
        country: result.country
    };
}

/**
 * Handle location-based search
 */
async function handleLocationClick() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }
    
    showLoading(true);
    hideError();
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                await fetchWeatherData(latitude, longitude);
            } catch (err) {
                showError('Failed to fetch weather data');
                console.error(err);
            } finally {
                showLoading(false);
            }
        },
        (err) => {
            showLoading(false);
            showError('Failed to get your location. Please enable location access.');
            console.error(err);
        }
    );
}

/**
 * Fetch weather data from API
 */
async function fetchWeatherData(lat, lon, cityName = null) {
    try {
        const params = new URLSearchParams({
            latitude: lat,
            longitude: lon,
            current: 'temperature_2m,weather_code,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,cloud_cover,pressure_msl,visibility',
            hourly: 'temperature_2m,weather_code,precipitation_probability,relative_humidity_2m,wind_speed_10m',
            daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,weather_code',
            timezone: 'auto',
            forecast_days: 5
        });

        const response = await fetch(`${WEATHER_API}?${params}`);
        const data = await response.json();
        
        // Get location name if not provided
        if (!cityName) {
            cityName = await getLocationName(lat, lon);
        }
        
        currentWeatherData = { ...data, cityName, lat, lon };
        displayWeather(data, cityName);
        displayForecast(data);
        displayHourly(data);
        showSection('mainWeather');
        
    } catch (err) {
        showError('Failed to fetch weather data');
        console.error(err);
    }
}

/**
 * Get location name from coordinates
 */
async function getLocationName(lat, lon) {
    try {
        const response = await fetch(
            `${GEOCODING_API}?latitude=${lat}&longitude=${lon}&format=json`
        );
        const data = await response.json();
        if (data.results && data.results[0]) {
            return `${data.results[0].name}, ${data.results[0].country}`;
        }
    } catch (err) {
        console.error(err);
    }
    return `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
}

/**
 * Display current weather
 */
function displayWeather(data, cityName) {
    const current = data.current;
    
    // Update location and date
    document.getElementById('cityName').textContent = cityName;
    document.getElementById('currentDate').textContent = formatDate(new Date());
    
    // Update temperature
    const temp = isCelsius ? current.temperature_2m : toFahrenheit(current.temperature_2m);
    document.getElementById('temperature').textContent = Math.round(temp);
    
    // Update weather description
    const weatherDesc = getWeatherDescription(current.weather_code);
    document.getElementById('weatherDesc').textContent = weatherDesc;
    document.getElementById('weatherIcon').className = `fas ${getWeatherIcon(current.weather_code)}`;
    
    // Feels like temperature
    const feelsLike = isCelsius ? current.apparent_temperature : toFahrenheit(current.apparent_temperature);
    document.getElementById('feelsLike').textContent = `Feels like ${Math.round(feelsLike)}°${isCelsius ? 'C' : 'F'}`;
    
    // Update weather details
    document.getElementById('humidity').textContent = `${current.relative_humidity_2m}%`;
    document.getElementById('windSpeed').textContent = `${Math.round(current.wind_speed_10m)} km/h`;
    document.getElementById('pressure').textContent = `${Math.round(current.pressure_msl)} hPa`;
    document.getElementById('visibility').textContent = `${Math.round(current.visibility / 1000)} km`;
    document.getElementById('cloudiness').textContent = `${current.cloud_cover}%`;
    
    // Sun times
    const daily = data.daily;
    document.getElementById('sunrise').textContent = formatTime(daily.sunrise[0]);
    document.getElementById('sunset').textContent = formatTime(daily.sunset[0]);
    
    // UV Index (simulated based on weather code and time)
    const uvIndex = estimateUVIndex(current.weather_code);
    document.getElementById('uvIndex').textContent = uvIndex;
}

/**
 * Display 5-day forecast
 */
function displayForecast(data) {
    const daily = data.daily;
    const container = document.getElementById('forecastContainer');
    container.innerHTML = '';
    
    for (let i = 0; i < 5; i++) {
        const date = new Date(daily.time[i]);
        const maxTemp = isCelsius ? daily.temperature_2m_max[i] : toFahrenheit(daily.temperature_2m_max[i]);
        const minTemp = isCelsius ? daily.temperature_2m_min[i] : toFahrenheit(daily.temperature_2m_min[i]);
        const weatherCode = daily.weather_code[i];
        const description = getWeatherDescription(weatherCode);
        const humidity = data.current.relative_humidity_2m; // Using current as daily not available
        
        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <div class="forecast-date">${formatDateShort(date)}</div>
            <div class="forecast-icon"><i class="fas ${getWeatherIcon(weatherCode)}"></i></div>
            <div class="forecast-temp-high">${Math.round(maxTemp)}°</div>
            <div class="forecast-temp-low">${Math.round(minTemp)}°</div>
            <div class="forecast-desc">${description}</div>
            <div class="forecast-humidity"><i class="fas fa-droplet"></i> ${humidity}%</div>
        `;
        container.appendChild(card);
    }
}

/**
 * Display hourly forecast
 */
function displayHourly(data) {
    const hourly = data.hourly;
    const container = document.getElementById('hourlyContainer');
    container.innerHTML = '';
    
    const now = new Date();
    const currentHour = now.getHours();
    
    for (let i = 0; i < 24; i++) {
        const time = new Date(hourly.time[i]);
        const temp = isCelsius ? hourly.temperature_2m[i] : toFahrenheit(hourly.temperature_2m[i]);
        const weatherCode = hourly.weather_code[i];
        const precipitation = hourly.precipitation_probability[i] || 0;
        
        const card = document.createElement('div');
        card.className = 'hourly-card';
        card.innerHTML = `
            <div class="hourly-time">${formatHourTime(time)}</div>
            <div class="hourly-icon"><i class="fas ${getWeatherIcon(weatherCode)}"></i></div>
            <div class="hourly-temp">${Math.round(temp)}°</div>
            <div class="hourly-rain"><i class="fas fa-droplet"></i> ${precipitation}%</div>
        `;
        container.appendChild(card);
    }
}

/**
 * Handle search suggestions
 */
async function handleSuggestions(e) {
    const query = e.target.value.trim();
    
    if (query.length < 2) {
        suggestions.classList.remove('show');
        return;
    }
    
    try {
        const response = await fetch(
            `${GEOCODING_API}?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
        );
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            suggestions.innerHTML = '';
            data.results.forEach(result => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                item.innerHTML = `
                    <i class="fas fa-map-pin"></i>
                    <span>${result.name}, ${result.country}</span>
                `;
                item.addEventListener('click', async () => {
                    showLoading(true);
                    hideError();
                    await fetchWeatherData(result.latitude, result.longitude, `${result.name}, ${result.country}`);
                    searchInput.value = '';
                    suggestions.classList.remove('show');
                    showLoading(false);
                });
                suggestions.appendChild(item);
            });
            suggestions.classList.add('show');
        } else {
            suggestions.classList.remove('show');
        }
    } catch (err) {
        console.error(err);
        suggestions.classList.remove('show');
    }
}

/**
 * Add city to search history
 */
function addToHistory(city, country) {
    const historyItem = {
        city: `${city}, ${country}`,
        temp: currentWeatherData ? Math.round(currentWeatherData.current.temperature_2m) : '-',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    // Remove if already exists
    searchHistory = searchHistory.filter(item => item.city !== historyItem.city);
    
    // Add to beginning
    searchHistory.unshift(historyItem);
    
    // Keep only last 10
    searchHistory = searchHistory.slice(0, 10);
    
    localStorage.setItem('weatherHistory', JSON.stringify(searchHistory));
    displayHistory();
}

/**
 * Display search history
 */
function displayHistory() {
    const container = document.getElementById('historyContainer');
    
    if (searchHistory.length === 0) {
        historySection.classList.add('hidden');
        return;
    }
    
    historySection.classList.remove('hidden');
    container.innerHTML = '';
    
    searchHistory.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <div class="history-item-name">${item.city}</div>
            <div class="history-item-temp">${item.temp}°</div>
            <div class="history-item-time">${item.timestamp}</div>
        `;
        div.addEventListener('click', () => handleSearch(item.city));
        container.appendChild(div);
    });
}

/**
 * Toggle temperature unit
 */
function toggleUnit(isCels) {
    isCelsius = isCels;
    
    // Update button states
    if (isCels) {
        celsiusBtn.classList.add('active');
        fahrenheitBtn.classList.remove('active');
    } else {
        celsiusBtn.classList.remove('active');
        fahrenheitBtn.classList.add('active');
    }
    
    // Refresh display if data exists
    if (currentWeatherData) {
        displayWeather(currentWeatherData, currentWeatherData.cityName);
        displayForecast(currentWeatherData);
        displayHourly(currentWeatherData);
    }
}

/**
 * Helper: Convert Celsius to Fahrenheit
 */
function toFahrenheit(celsius) {
    return (celsius * 9/5) + 32;
}

/**
 * Helper: Get weather icon class
 */
function getWeatherIcon(code) {
    // WMO Weather interpretation codes
    if (code === 0) return 'fa-sun'; // Clear sky
    if (code === 1 || code === 2) return 'fa-cloud-sun'; // Mainly clear
    if (code === 3) return 'fa-cloud'; // Overcast
    if (code === 45 || code === 48) return 'fa-cloud-fog'; // Foggy
    if (code === 51 || code === 53 || code === 55) return 'fa-cloud-rain'; // Light to moderate rain
    if (code === 61 || code === 63 || code === 65) return 'fa-cloud-rain'; // Rain
    if (code === 71 || code === 73 || code === 75) return 'fa-cloud-snow'; // Snow
    if (code === 77) return 'fa-cloud-snow'; // Snow
    if (code === 80 || code === 81 || code === 82) return 'fa-cloud-showers-heavy'; // Rain showers
    if (code === 85 || code === 86) return 'fa-cloud-snow'; // Snow showers
    if (code === 95 || code === 96 || code === 99) return 'fa-bolt'; // Thunderstorms
    return 'fa-cloud';
}

/**
 * Helper: Get weather description
 */
function getWeatherDescription(code) {
    const descriptions = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Foggy',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        71: 'Slight snow',
        73: 'Moderate snow',
        75: 'Heavy snow',
        77: 'Snow grains',
        80: 'Slight rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        85: 'Slight snow showers',
        86: 'Heavy snow showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with hail',
        99: 'Thunderstorm with heavy hail'
    };
    return descriptions[code] || 'Unknown';
}

/**
 * Helper: Estimate UV Index (simplified)
 */
function estimateUVIndex(weatherCode) {
    if (weatherCode === 0) return '7 (High)';
    if (weatherCode <= 3) return '5-6 (Moderate)';
    if (weatherCode <= 48) return '2-3 (Low)';
    return '0-1 (Minimal)';
}

/**
 * Helper: Format date
 */
function formatDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Helper: Format date short
 */
function formatDateShort(date) {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Helper: Format time
 */
function formatTime(timeString) {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

/**
 * Helper: Format hour time
 */
function formatHourTime(date) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', hour12: false }) + 'h';
}

/**
 * Show loading spinner
 */
function showLoading(show) {
    loading.classList.toggle('hidden', !show);
}

/**
 * Show error message
 */
function showError(message) {
    error.textContent = message;
    error.classList.remove('hidden');
}

/**
 * Hide error message
 */
function hideError() {
    error.classList.add('hidden');
}

/**
 * Show specific section
 */
function showSection(sectionId) {
    welcome.classList.add('hidden');
    mainWeather.classList.add('hidden');
    
    document.getElementById(sectionId).classList.remove('hidden');
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    displayHistory();
    
    // Check if geolocation is available and prompt user
    if (navigator.geolocation) {
        const lastLocation = localStorage.getItem('lastLocation');
        if (lastLocation) {
            const loc = JSON.parse(lastLocation);
            showLoading(true);
            fetchWeatherData(loc.lat, loc.lon, loc.cityName).finally(() => showLoading(false));
        }
    }
});

// Store location when fetched
async function fetchWeatherData(lat, lon, cityName = null) {
    try {
        const params = new URLSearchParams({
            latitude: lat,
            longitude: lon,
            current: 'temperature_2m,weather_code,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,cloud_cover,pressure_msl,visibility',
            hourly: 'temperature_2m,weather_code,precipitation_probability,relative_humidity_2m,wind_speed_10m',
            daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,weather_code',
            timezone: 'auto',
            forecast_days: 5
        });

        const response = await fetch(`${WEATHER_API}?${params}`);
        const data = await response.json();
        
        if (!cityName) {
            cityName = await getLocationName(lat, lon);
        }
        
        currentWeatherData = { ...data, cityName, lat, lon };
        localStorage.setItem('lastLocation', JSON.stringify({ lat, lon, cityName }));
        
        displayWeather(data, cityName);
        displayForecast(data);
        displayHourly(data);
        showSection('mainWeather');
        
    } catch (err) {
        showError('Failed to fetch weather data');
        console.error(err);
    }
}
