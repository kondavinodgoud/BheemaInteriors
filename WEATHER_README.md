# Weather Dashboard

A beautiful, fully-featured weather dashboard built with vanilla HTML, CSS, and JavaScript. Get real-time weather information using the free Open-Meteo API.

## 🌤️ Features

### Real-Time Weather Data
- **Current Weather**: Temperature, description, feels like, and more
- **5-Day Forecast**: Daily predictions with high/low temperatures
- **Hourly Forecast**: Detailed hourly weather for the next 24 hours
- **Multiple Locations**: Search and compare weather across different cities

### Weather Information Displayed
- 🌡️ Current temperature (Celsius/Fahrenheit)
- 💨 Wind speed and direction
- 💧 Humidity levels
- 🌫️ Visibility
- ☁️ Cloud coverage
- 🔆 UV Index estimates
- ⏰ Sunrise and sunset times
- 📊 Atmospheric pressure

### Smart Features
- **Location-Based**: Use geolocation to get weather for your current location
- **Search History**: Recent searches saved in local storage
- **City Suggestions**: Autocomplete suggestions while typing
- **Temperature Units**: Toggle between Celsius and Fahrenheit
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Beautiful UI**: Modern gradient backgrounds and smooth animations
- **Dark Mode Support**: Eye-friendly interface for all times of day

### Interactive Elements
- Search bar with city suggestions
- Geolocation button for quick weather lookup
- Clickable forecast cards with hover effects
- Scrollable hourly forecast
- History of recent searches
- Temperature unit toggle button
- Smooth scroll animations

## 🔌 API Integration

**Using Open-Meteo API** (Free, No API Key Required)
- Weather Forecast API: Real-time and forecast data
- Geocoding API: City search and location lookup

Benefits:
- ✅ Free to use
- ✅ No API key required
- ✅ No rate limiting for reasonable use
- ✅ Open source and reliable
- ✅ Supports 195 countries

## 📁 File Structure

```
weather-dashboard/
├── weather-dashboard.html    # Main HTML structure
├── weather-style.css         # Styling and responsive design
├── weather-script.js         # API integration and functionality
└── README.md                 # This file
```

## 🚀 Getting Started

### Quick Start
1. Open `weather-dashboard.html` in your web browser
2. Allow location access (optional, for geolocation feature)
3. Search for a city or use the location button
4. View detailed weather information and forecasts

### Local Server (Recommended)
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (http-server)
npx http-server

# PHP
php -S localhost:8000
```

Then visit: `http://localhost:8000/weather-dashboard.html`

## 🎨 Customization

### Colors
Edit the CSS variables in `weather-style.css`:

```css
:root {
    --primary-color: #1e3c72;
    --secondary-color: #2a5298;
    --accent-color: #00d4ff;
    --warning-color: #ff6b6b;
    --success-color: #51cf66;
    --light-gray: #f0f2f5;
    --dark-gray: #2d3748;
    --white: #ffffff;
}
```

### Temperature Precision
Modify the rounding in `weather-script.js`:
```javascript
Math.round(temp)  // Change to Math.floor() or toFixed()
```

### Forecast Days
Adjust the number of forecast days:
```javascript
forecast_days: 5  // Change to 7, 10, etc.
```

## 📊 Weather Codes Reference

The dashboard uses WMO Weather interpretation codes:
- `0`: Clear sky
- `1-3`: Cloudy/Partly cloudy
- `45, 48`: Foggy
- `51-65`: Rain
- `71-77`: Snow
- `80-82`: Rain showers
- `85-86`: Snow showers
- `95-99`: Thunderstorms

## 🌍 Supported Features

### Geolocation
- Access to device location (requires user permission)
- Automatic weather fetch for current location
- Fallback to city search if location unavailable

### Search History
- Last 10 searches saved in localStorage
- Displays city name, temperature, and timestamp
- Click to quickly re-fetch weather for that city

### City Suggestions
- Real-time suggestions as you type
- Shows country name
- Click to instantly fetch weather

## 📱 Responsive Breakpoints

- **Desktop**: Full features with all columns visible
- **Tablet** (768px): Adjusted layouts for touch
- **Mobile** (480px): Single column layout, optimized touch targets

## ⚡ Performance

- **No Dependencies**: Pure vanilla JavaScript
- **Lightweight**: < 50KB total file size
- **Fast Load**: Optimized API calls
- **Efficient Caching**: Uses localStorage for history

## 🔒 Privacy & Security

- No personal data is stored on servers
- Search history saved only locally
- Location data used only for weather lookup
- All API calls are over HTTPS
- No tracking or analytics

## 🐛 Troubleshooting

### Location Not Working
- Check browser permissions for geolocation
- Allow access when prompted
- Try searching for a city instead

### No Data Displaying
- Check internet connection
- Verify API endpoints are accessible
- Check browser console for errors
- Try a different city name

### Wrong Temperature
- Check the temperature unit toggle (°C/°F)
- Ensure correct location is selected
- Try refreshing the page

## 🌐 Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📝 API Reference

### Open-Meteo Weather API
```
GET https://api.open-meteo.com/v1/forecast
Parameters:
- latitude: float
- longitude: float
- current: string (weather variables)
- hourly: string (hourly variables)
- daily: string (daily variables)
- timezone: string (timezone ID)
```

### Open-Meteo Geocoding API
```
GET https://geocoding-api.open-meteo.com/v1/search
Parameters:
- name: string (city name)
- count: int (number of results)
- language: string (language code)
- format: string (json/xml)
```

## 📖 Weather Data Explained

### Temperature
- Current temperature at the location
- "Feels like" - apparent temperature considering wind chill and humidity

### Wind Speed
- Horizontal wind speed at 10 meters height
- Measured in km/h

### Humidity
- Relative humidity as percentage
- 100% = saturated air (high chance of precipitation)

### Pressure
- Atmospheric pressure at mean sea level
- Measured in hPa (hectopascals)

### UV Index
- Estimated based on weather conditions
- Range: 0-11+ (0-2 Low, 3-5 Moderate, 6-7 High, 8+ Very High)

### Visibility
- Maximum distance at which objects can be seen
- Measured in kilometers

## 🚀 Future Enhancements

- [ ] Air quality data integration
- [ ] Pollen forecasts
- [ ] Weather alerts and warnings
- [ ] Multiple city comparison
- [ ] Custom weather notifications
- [ ] Weather graphs and charts
- [ ] Wind direction arrows
- [ ] Moon phase information
- [ ] Dark/Light theme toggle
- [ ] PWA support for offline access

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to fork this project and submit improvements!

## 📧 Support

For issues, questions, or suggestions, please create an issue in the repository.

---

**Built with ❤️ using Open-Meteo API**

Enjoy your weather dashboard! 🌤️⛅🌦️
