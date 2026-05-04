import API from './axios';

// AI-powered crop advisory
export const getCropAdvisory = async (data) => {
  const response = await API.post('/crop-advisory/crop-advisory', data);
  return response.data;
};

// Image-based pest detection
export const detectPestFromImage = async (formData) => {
  const response = await API.post('/crop-advisory/pest-detection', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// Get dosage recommendations
export const getDosageRecommendations = async (params) => {
  const response = await API.get('/crop-advisory/dosage', { params });
  return response.data;
};

// Get crop calendar
export const getCropCalendar = async (crop) => {
  const response = await API.get(`/crop-advisory/calendar/${crop}`);
  return response.data;
};

// Get weather-based advisory
export const getWeatherAdvisory = async (location) => {
  const response = await API.get('/crop-advisory/weather/advisory', { params: { location } });
  return response.data;
};

// Save advisory for customer
export const saveAdvisory = async (data) => {
  const response = await API.post('/crop-advisory/save', data);
  return response.data;
};

// Get advisory history
export const getAdvisoryHistory = async (customerId) => {
  const response = await API.get(`/crop-advisory/history/${customerId}`);
  return response.data;
};

// Get all advisories
export const getAllAdvisories = async (params) => {
  const response = await API.get('/crop-advisory/all', { params });
  return response.data;
};

// Get advisory by ID
export const getAdvisoryById = async (id) => {
  const response = await API.get(`/crop-advisory/${id}`);
  return response.data;
};

// Update advisory status
export const updateAdvisoryStatus = async (id, data) => {
  const response = await API.patch(`/crop-advisory/${id}/status`, data);
  return response.data;
};

// Delete advisory
export const deleteAdvisory = async (id) => {
  const response = await API.delete(`/crop-advisory/${id}`);
  return response.data;
};

// Get advisory statistics
export const getAdvisoryStatistics = async (params) => {
  const response = await API.get('/crop-advisory/statistics', { params });
  return response.data;
};
