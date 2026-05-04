const axios = require('axios');

/**
 * Get weather-based advisory for location
 */
exports.getWeatherAdvisory = async (location) => {
  try {
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        q: location,
        appid: process.env.OPENWEATHER_API_KEY,
        units: 'metric'
      }
    });

    const weather = response.data;
    const advisories = [];

    // Temperature advisory
    if (weather.main.temp > 35) {
      advisories.push({
        type: 'temperature',
        severity: 'High',
        message: 'High temperature stress detected. Increase irrigation frequency.',
        actions: [
          'Increase irrigation frequency',
          'Apply mulching to conserve moisture',
          'Spray only in early morning or evening'
        ]
      });
    } else if (weather.main.temp < 10) {
      advisories.push({
        type: 'temperature',
        severity: 'Medium',
        message: 'Low temperature may slow crop growth.',
        actions: [
          'Reduce irrigation',
          'Postpone spraying',
          'Monitor for frost damage'
        ]
      });
    }

    // Humidity advisory
    if (weather.main.humidity > 80) {
      advisories.push({
        type: 'humidity',
        severity: 'Medium',
        message: 'High humidity increases disease risk.',
        actions: [
          'Apply preventive fungicides',
          'Improve field ventilation',
          'Monitor for fungal diseases'
        ]
      });
    }

    // Rain forecast
    if (weather.weather[0].main === 'Rain') {
      advisories.push({
        type: 'rain',
        severity: 'Medium',
        message: 'Rain expected. Postpone spraying activities.',
        actions: [
          'Postpone pesticide application',
          'Check field drainage',
          'Monitor for waterlogging'
        ]
      });
    }

    // Wind advisory
    if (weather.wind.speed > 20) {
      advisories.push({
        type: 'wind',
        severity: 'Low',
        message: 'High wind speed detected.',
        actions: [
          'Avoid spraying to prevent drift',
          'Secure farm structures',
          'Check for physical crop damage'
        ]
      });
    }

    return {
      current: {
        temp: weather.main.temp,
        humidity: weather.main.humidity,
        windSpeed: weather.wind.speed,
        description: weather.weather[0].description,
        icon: weather.weather[0].icon
      },
      advisories,
      location: weather.name
    };
  } catch (error) {
    console.error('Weather API Error:', error);
    
    return {
      current: {
        temp: null,
        humidity: null,
        windSpeed: null,
        description: 'Weather data unavailable'
      },
      advisories: [],
      error: 'Unable to fetch weather data. Please check location name.'
    };
  }
};

/**
 * Get 5-day weather forecast
 */
exports.getWeatherForecast = async (location) => {
  try {
    const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
      params: {
        q: location,
        appid: process.env.OPENWEATHER_API_KEY,
        units: 'metric',
        cnt: 40 // 5 days * 8 (3-hour intervals)
      }
    });

    const forecast = response.data.list.filter((item, index) => index % 8 === 0); // Daily forecast

    return {
      location: response.data.city.name,
      forecast: forecast.map(day => ({
        date: new Date(day.dt * 1000).toLocaleDateString(),
        temp: day.main.temp,
        humidity: day.main.humidity,
        description: day.weather[0].description,
        rain: day.rain ? day.rain['3h'] : 0
      }))
    };
  } catch (error) {
    console.error('Forecast API Error:', error);
    return { error: 'Unable to fetch forecast data' };
  }
};
