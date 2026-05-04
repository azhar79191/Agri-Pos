import API from './axios';

// AI-powered crop advisory (uses /api/ai routes with real Gemini AI)
export const getCropAdvisory = async (data) => {
  const response = await API.post('/ai/crop-advisory', data);
  return response.data;
};

// Image-based pest detection (uses /api/ai routes with real Gemini Vision)
export const detectPestFromImage = async (formData) => {
  const response = await API.post('/ai/pest-detection', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// Get weather-based advisory
export const getWeatherAdvisory = async (location) => {
  const response = await API.get('/crop-advisory/weather/advisory', { params: { location } });
  return response.data;
};

// Save advisory for customer (requires auth)
export const saveAdvisory = async (data) => {
  const response = await API.post('/crop-advisory/save', data);
  return response.data;
};

// Get advisory history (requires auth)
export const getAdvisoryHistory = async (customerId) => {
  const response = await API.get(`/crop-advisory/history/${customerId}`);
  return response.data;
};

// Get all advisories (requires auth)
export const getAllAdvisories = async (params) => {
  const response = await API.get('/crop-advisory/all', { params });
  return response.data;
};

// Get advisory by ID (requires auth)
export const getAdvisoryById = async (id) => {
  const response = await API.get(`/crop-advisory/${id}`);
  return response.data;
};

// Update advisory status (requires auth)
export const updateAdvisoryStatus = async (id, data) => {
  const response = await API.patch(`/crop-advisory/${id}/status`, data);
  return response.data;
};

// Delete advisory (requires auth)
export const deleteAdvisory = async (id) => {
  const response = await API.delete(`/crop-advisory/${id}`);
  return response.data;
};

// Get advisory statistics (requires auth)
export const getAdvisoryStatistics = async (params) => {
  const response = await API.get('/crop-advisory/statistics', { params });
  return response.data;
};
