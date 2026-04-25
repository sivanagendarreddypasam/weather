import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Weather = () => {
  // initialize city, weather and error values
  const [city, setCity] = useState('Hyderabad');
  const [weather, setWeather] = useState({});
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inputError, setInputError] = useState('');

  // Get API key from environment variable
  const apiKey = import.meta.env.VITE_OPENWEATHERMAP_API_KEY;

  const fetchWeather = (cityName, showLoading = true) => {
    if (!apiKey) {
      setError('API key not configured. Please add VITE_OPENWEATHERMAP_API_KEY to .env file.');
      return;
    }

    if (showLoading) setIsLoading(true);
    setError('');
    setInputError('');

    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${apiKey}&units=metric`;
    
    axios.get(apiUrl)
      .then((response) => {
        setWeather(response.data);
        setError(null);
      })
      .catch((error) => {
        if (error.response) {
          // Server responded with error status
          if (error.response.status === 404) {
            setError('City not found. Please check the city name.');
          } else if (error.response.status === 401) {
            setError('Invalid API key. Please check your API key.');
          } else {
            setError(`Error: ${error.response.data.message || 'Something went wrong'}`);
          }
        } else if (error.request) {
          // Request made but no response
          setError('Network error. Please check your internet connection.');
        } else {
          setError(error.message);
        }
        setWeather({});
      })
      .finally(() => {
        if (showLoading) setIsLoading(false);
      });
  };

  // Fetch weather on component mount
  useEffect(() => {
    fetchWeather(city, true);
  }, []);

  const validateInput = (cityName) => {
    const trimmed = cityName.trim();
    if (!trimmed) {
      setInputError('Please enter a city name');
      return false;
    }
    // Check for special characters (only letters, spaces, and hyphens allowed)
    if (!/^[a-zA-Z\s\-]+$/.test(trimmed)) {
      setInputError('City name should only contain letters, spaces, and hyphens');
      return false;
    }
    setInputError('');
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedCity = city.trim();
    if (!validateInput(trimmedCity)) {
      return;
    }
    fetchWeather(trimmedCity);
  };

  const handleCityChange = (e) => {
    setCity(e.target.value);
    if (inputError) setInputError('');
  };

  const handleRefresh = () => {
    if (weather.name) {
      fetchWeather(weather.name);
    }
  };

  const handleQuickCity = (cityName) => {
    setCity(cityName);
    fetchWeather(cityName);
  };

  return (
    <div className="weather-app">
      <h1>Weather App</h1>
      
      <form onSubmit={handleSubmit} aria-label="Weather search form">
        <label htmlFor="city-input" className="visually-hidden">City name</label>
        <input
          id="city-input"
          type="text"
          value={city}
          onChange={handleCityChange}
          placeholder="Enter city name"
          disabled={isLoading}
          aria-describedby={inputError ? 'input-error' : undefined}
          aria-invalid={!!inputError}
        />
        
        {inputError && (
          <p id="input-error" className="input-error" role="alert">{inputError}</p>
        )}
        
        <button 
          type="submit" 
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? 'Loading...' : 'Get Weather'}
        </button>
      </form>
      
      {weather.name && (
        <button 
          className="refresh-button"
          onClick={handleRefresh}
          disabled={isLoading}
          aria-label={`Refresh weather for ${weather.name}`}
        >
          🔄 Refresh
        </button>
      )}
      
      <div className="city-buttons" role="group" aria-label="Quick city selection">
        <button 
          onClick={() => handleQuickCity('London')}
          disabled={isLoading}
          aria-label="Get weather for London"
        >
          London
        </button>
        <button 
          onClick={() => handleQuickCity('New York')}
          disabled={isLoading}
          aria-label="Get weather for New York"
        >
          New York
        </button>
      </div>
      
      {isLoading && (
        <div className="loading-spinner" role="status" aria-label="Loading weather data">
          <div className="spinner"></div>
          <span className="visually-hidden">Loading...</span>
        </div>
      )}
      
      {error ? (
        <p className="error-message" role="alert">{error}</p>
      ) : (
        weather.main && (
          <div className="weather-data">
            <h2>{weather.name}, {weather.sys?.country}</h2>
            <p className="temperature">🌡️ {weather.main?.temp}°C</p>
            <p>💧 Humidity: {weather.main?.humidity}%</p>
            <p>🌤️ Weather: {weather.weather?.[0]?.description}</p>
            <p>💨 Wind: {weather.wind?.speed} m/s</p>
            <p>📊 Feels like: {weather.main?.feels_like}°C</p>
          </div>
        )
      )}
    </div>
  );
};

export default Weather;

