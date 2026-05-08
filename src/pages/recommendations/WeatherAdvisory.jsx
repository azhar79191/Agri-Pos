import React, { useState } from "react";
import { Cloud, MapPin, Thermometer, Droplets, Wind, Sun, CloudRain, AlertTriangle, Loader2, RefreshCw, Calendar, TrendingUp, Sprout, CheckCircle, XCircle } from "lucide-react";
import { getWeatherAdvisory } from "../../api/cropAdvisoryApi";
import { CROPS } from "../../data/cropAdvisory";
import FeedbackForm from "../../components/FeedbackForm";

const WeatherAdvisory = () => {
  const [location, setLocation] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("");
  const [weatherData, setWeatherData] = useState({
    temp: "",
    humidity: "",
    rainfall: "",
    windSpeed: "",
    forecast: "",
  });
  const [loading, setLoading] = useState(false);
  const [advisory, setAdvisory] = useState(null);
  const [advisoryId, setAdvisoryId] = useState(null);
  const [error, setError] = useState(null);

  const handleGetAdvisory = async () => {
    if (!location.trim()) {
      setError("Please enter a location");
      return;
    }

    setLoading(true);
    setError(null);
    setAdvisory(null);

    try {
      const requestData = {
        location: location.trim(),
        crop: selectedCrop || undefined,
      };

      // Add weather data if provided
      if (weatherData.temp || weatherData.humidity || weatherData.rainfall || weatherData.windSpeed || weatherData.forecast) {
        requestData.weatherData = {
          temp: weatherData.temp ? Number(weatherData.temp) : undefined,
          humidity: weatherData.humidity ? Number(weatherData.humidity) : undefined,
          rainfall: weatherData.rainfall ? Number(weatherData.rainfall) : undefined,
          windSpeed: weatherData.windSpeed ? Number(weatherData.windSpeed) : undefined,
          forecast: weatherData.forecast || undefined,
        };
      }

      const response = await getWeatherAdvisory(requestData);
      
      console.log('Weather Advisory Response:', response);
      
      if (response.success === false) {
        throw new Error(response.message || 'Failed to get weather advisory');
      }

      const data = response.data || response;
      setAdvisory(data);
      
      // Extract advisory ID for feedback form
      const id = response.data?.id || response.id || data.id || data._id;
      setAdvisoryId(id);
    } catch (err) {
      console.error('Weather Advisory Error:', err);
      
      // Check if it's a 404 error (endpoint not implemented)
      if (err.response?.status === 404 || err.response?.data?.error?.statusCode === 404) {
        setError('Weather Advisory API is not yet implemented on the backend. Please contact your system administrator to enable this feature.');
      } else {
        setError(err.message || err.response?.data?.message || 'Failed to get weather advisory');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-sm flex-shrink-0">
          <Cloud className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Weather-Based Advisory</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Get farming recommendations based on weather conditions</p>
        </div>
      </div>

      {/* Backend Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
        <div className="flex items-start gap-3">
          <Cloud className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-900 dark:text-blue-300 text-sm">Weather-Based Farming Advisory</p>
            <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
              Get AI-powered farming recommendations based on current weather conditions. You can either provide weather data manually or let the system fetch it automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Location Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              Location *
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Lahore, Punjab"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Crop Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <Sprout className="w-4 h-4 text-green-500" />
              Crop (Optional)
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="">All Crops</option>
              {CROPS.map(crop => (
                <option key={crop.id} value={crop.name}>{crop.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Weather Data (Optional) */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Weather Data (Optional - Leave empty for auto-fetch)</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Temperature (°C)</label>
              <input
                type="number"
                value={weatherData.temp}
                onChange={(e) => setWeatherData({...weatherData, temp: e.target.value})}
                placeholder="32"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Humidity (%)</label>
              <input
                type="number"
                value={weatherData.humidity}
                onChange={(e) => setWeatherData({...weatherData, humidity: e.target.value})}
                placeholder="75"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Rainfall (mm)</label>
              <input
                type="number"
                value={weatherData.rainfall}
                onChange={(e) => setWeatherData({...weatherData, rainfall: e.target.value})}
                placeholder="0"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Wind Speed (km/h)</label>
              <input
                type="number"
                value={weatherData.windSpeed}
                onChange={(e) => setWeatherData({...weatherData, windSpeed: e.target.value})}
                placeholder="12"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Forecast</label>
              <input
                type="text"
                value={weatherData.forecast}
                onChange={(e) => setWeatherData({...weatherData, forecast: e.target.value})}
                placeholder="Partly cloudy"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Get Advisory Button */}
        <button
          onClick={handleGetAdvisory}
          disabled={loading || !location.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Getting Weather Advisory...
            </>
          ) : (
            <>
              <Cloud className="w-4 h-4" />
              Get Weather Advisory
            </>
          )}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-900 dark:text-red-300">Error</p>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
            </div>
            <button
              onClick={handleGetAdvisory}
              className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Advisory Display */}
      {advisory && (
        <div className="space-y-4">
          {/* Main Advisory */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
            <h3 className="font-bold text-blue-900 dark:text-blue-300 text-lg mb-3 flex items-center gap-2">
              <Cloud className="w-5 h-5" />
              Weather Advisory
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{advisory.advisory}</p>
          </div>

          {/* Spraying Conditions & Irrigation */}
          {(advisory.sprayingConditions || advisory.irrigationAdvice) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {advisory.sprayingConditions && (
                <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 p-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-2 flex items-center gap-2">
                    <CloudRain className="w-4 h-4 text-blue-500" />
                    Spraying Conditions
                  </h4>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${
                    advisory.sprayingConditions === 'Good' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    advisory.sprayingConditions === 'Fair' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {advisory.sprayingConditions === 'Good' && <CheckCircle className="w-4 h-4" />}
                    {advisory.sprayingConditions !== 'Good' && <XCircle className="w-4 h-4" />}
                    {advisory.sprayingConditions}
                  </span>
                </div>
              )}
              {advisory.irrigationAdvice && (
                <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 p-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-2 flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-cyan-500" />
                    Irrigation Advice
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{advisory.irrigationAdvice}</p>
                </div>
              )}
            </div>
          )}

          {/* Recommendations */}
          {advisory.recommendations && advisory.recommendations.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 p-6">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Farming Recommendations
              </h3>
              <ul className="space-y-3">
                {advisory.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                    <span className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{rec}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Best Activities */}
          {advisory.bestActivities && advisory.bestActivities.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 p-6">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                Best Activities for Today
              </h3>
              <ul className="space-y-2">
                {advisory.bestActivities.map((activity, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    {activity}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Avoid Activities */}
          {advisory.avoidActivities && advisory.avoidActivities.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-6">
              <h3 className="font-bold text-red-900 dark:text-red-300 text-lg mb-4 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                Activities to Avoid
              </h3>
              <ul className="space-y-2">
                {advisory.avoidActivities.map((activity, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-red-800 dark:text-red-300">
                    <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {activity}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {advisory.warnings && advisory.warnings.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 p-6">
              <h3 className="font-bold text-amber-900 dark:text-amber-300 text-lg mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Weather Warnings
              </h3>
              <ul className="space-y-2">
                {advisory.warnings.map((warning, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-300">
                    <span className="w-1 h-1 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Feedback Form */}
          {advisoryId && (
            <FeedbackForm 
              advisoryId={advisoryId}
              onSubmitSuccess={() => {
                console.log('Weather advisory feedback submitted successfully');
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default WeatherAdvisory;
