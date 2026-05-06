import API from './axios';

// ============================================
// AI-POWERED ENDPOINTS (Google Gemini AI)
// ============================================

/**
 * Get AI-powered crop advisory
 * @param {Object} data - Advisory request data
 * @param {string} data.crop - Crop name (e.g., 'cotton', 'wheat', 'rice')
 * @param {string} data.issue - Issue/problem (e.g., 'White Fly', 'Rust Disease')
 * @param {string} data.symptoms - Detailed symptoms description
 * @param {number} data.fieldSize - Field size in acres
 * @param {string} data.location - Location (e.g., 'Multan, Punjab')
 * @param {string} data.language - Language code ('en' or 'ur')
 * @returns {Promise} Advisory response with diagnosis, products, dosage, etc.
 */
export const getCropAdvisory = async (data) => {
  const response = await API.post('/ai/crop-advisory', data);
  return response.data;
};

/**
 * Detect pest/disease from uploaded image using AI Vision
 * @param {FormData} formData - Form data containing image and metadata
 * @param {File} formData.image - Image file (max 5MB, jpg/png/webp)
 * @param {string} formData.crop - Crop name
 * @param {string} formData.symptoms - Optional symptoms description
 * @param {string} formData.location - Optional location
 * @returns {Promise} Detection result with pest name, confidence, recommendations
 */
export const detectPestFromImage = async (formData) => {
  const response = await API.post('/ai/pest-detection', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

/**
 * Get weather-based farming advisory
 * @param {string} location - Location for weather data
 * @param {string} crop - Crop name (optional)
 * @returns {Promise} Weather advisory with recommendations
 */
export const getWeatherAdvisory = async (location, crop = null) => {
  const params = { location };
  if (crop) params.crop = crop;
  const response = await API.get('/ai/weather-advisory', { params });
  return response.data;
};

/**
 * Calculate smart dosage for pesticides/fertilizers
 * @param {Object} data - Dosage calculation data
 * @param {string} data.crop - Crop name
 * @param {string} data.pest - Pest/disease name
 * @param {number} data.fieldSize - Field size in acres
 * @param {string} data.severity - Severity level (low/medium/high/critical)
 * @param {Array} data.previousApplications - Previous spray history (optional)
 * @returns {Promise} Dosage recommendations with products and schedule
 */
export const calculateDosage = async (data) => {
  const response = await API.post('/ai/dosage-calculator', data);
  return response.data;
};

/**
 * Translate advisory to different language
 * @param {string} advisoryId - Advisory ID to translate
 * @param {string} targetLanguage - Target language code ('en' or 'ur')
 * @returns {Promise} Translated advisory
 */
export const translateAdvisory = async (advisoryId, targetLanguage) => {
  const response = await API.post('/ai/translate-advisory', {
    advisoryId,
    targetLanguage
  });
  return response.data;
};

/**
 * Get AI usage statistics (admin only)
 * @param {Object} params - Query parameters
 * @param {string} params.startDate - Start date (ISO format)
 * @param {string} params.endDate - End date (ISO format)
 * @returns {Promise} AI usage stats (requests, costs, cache hit rate, etc.)
 */
export const getAIStats = async (params) => {
  const response = await API.get('/ai/stats', { params });
  return response.data;
};

/**
 * Submit feedback for AI advisory
 * @param {string} advisoryId - Advisory ID
 * @param {Object} feedback - Feedback data
 * @param {boolean} feedback.helpful - Was the advisory helpful?
 * @param {number} feedback.rating - Rating (1-5)
 * @param {string} feedback.comment - Optional comment
 * @returns {Promise} Feedback submission result
 */
export const submitAdvisoryFeedback = async (advisoryId, feedback) => {
  const response = await API.post(`/ai/advisory/${advisoryId}/feedback`, feedback);
  return response.data;
};

/**
 * Get similar past advisories (AI-powered search)
 * @param {Object} query - Search query
 * @param {string} query.crop - Crop name
 * @param {string} query.issue - Issue/symptoms
 * @param {number} query.limit - Max results (default: 5)
 * @returns {Promise} Similar advisories from history
 */
export const getSimilarAdvisories = async (query) => {
  const response = await API.post('/ai/similar-advisories', query);
  return response.data;
};

/**
 * Batch process multiple images for pest detection
 * @param {FormData} formData - Form data with multiple images
 * @param {Array<File>} formData.images - Array of image files
 * @param {string} formData.crop - Crop name
 * @returns {Promise} Batch detection results
 */
export const batchDetectPests = async (formData) => {
  const response = await API.post('/ai/batch-pest-detection', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

/**
 * Get seasonal crop recommendations using AI
 * @param {Object} data - Request data
 * @param {string} data.location - Location
 * @param {string} data.season - Season (kharif/rabi)
 * @param {number} data.landSize - Available land in acres
 * @param {string} data.soilType - Soil type (optional)
 * @returns {Promise} Crop recommendations with profitability analysis
 */
export const getSeasonalRecommendations = async (data) => {
  const response = await API.post('/ai/seasonal-recommendations', data);
  return response.data;
};

// ============================================
// ADVISORY MANAGEMENT ENDPOINTS
// ============================================

/**
 * Save advisory for customer
 * @param {Object} data - Advisory data to save
 * @param {string} data.customerId - Customer ID (optional)
 * @param {string} data.crop - Crop name
 * @param {string} data.issue - Issue/problem
 * @param {Object} data.advisory - Advisory content
 * @returns {Promise} Saved advisory with ID
 */
export const saveAdvisory = async (data) => {
  const response = await API.post('/crop-advisory/save', data);
  return response.data;
};

/**
 * Get advisory history for a customer
 * @param {string} customerId - Customer ID
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.crop - Filter by crop
 * @param {string} params.severity - Filter by severity
 * @returns {Promise} Paginated advisory history
 */
export const getAdvisoryHistory = async (customerId, params = {}) => {
  const response = await API.get(`/crop-advisory/history/${customerId}`, { params });
  return response.data;
};

/**
 * Get all advisories (admin/manager only)
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.crop - Filter by crop
 * @param {string} params.severity - Filter by severity
 * @param {string} params.startDate - Filter by date range
 * @param {string} params.endDate - Filter by date range
 * @returns {Promise} Paginated advisories list
 */
export const getAllAdvisories = async (params) => {
  const response = await API.get('/crop-advisory/all', { params });
  return response.data;
};

/**
 * Get single advisory by ID
 * @param {string} id - Advisory ID
 * @returns {Promise} Advisory details
 */
export const getAdvisoryById = async (id) => {
  const response = await API.get(`/crop-advisory/${id}`);
  return response.data;
};

/**
 * Update advisory status
 * @param {string} id - Advisory ID
 * @param {Object} data - Update data
 * @param {string} data.status - New status (pending/completed/cancelled)
 * @param {string} data.notes - Optional notes
 * @returns {Promise} Updated advisory
 */
export const updateAdvisoryStatus = async (id, data) => {
  const response = await API.patch(`/crop-advisory/${id}/status`, data);
  return response.data;
};

/**
 * Delete advisory
 * @param {string} id - Advisory ID
 * @returns {Promise} Deletion result
 */
export const deleteAdvisory = async (id) => {
  const response = await API.delete(`/crop-advisory/${id}`);
  return response.data;
};

/**
 * Get advisory statistics
 * @param {Object} params - Query parameters
 * @param {string} params.startDate - Start date
 * @param {string} params.endDate - End date
 * @param {string} params.groupBy - Group by (crop/severity/month)
 * @returns {Promise} Advisory statistics
 */
export const getAdvisoryStatistics = async (params) => {
  const response = await API.get('/crop-advisory/statistics', { params });
  return response.data;
};

/**
 * Export advisories to Excel/PDF
 * @param {Object} params - Export parameters
 * @param {string} params.format - Export format (excel/pdf)
 * @param {string} params.startDate - Start date
 * @param {string} params.endDate - End date
 * @returns {Promise} File download
 */
export const exportAdvisories = async (params) => {
  const response = await API.get('/crop-advisory/export', {
    params,
    responseType: 'blob'
  });
  return response.data;
};

/**
 * Share advisory via SMS/WhatsApp
 * @param {string} advisoryId - Advisory ID
 * @param {Object} data - Share data
 * @param {string} data.method - Share method (sms/whatsapp/email)
 * @param {string} data.recipient - Recipient phone/email
 * @param {string} data.language - Language preference
 * @returns {Promise} Share result
 */
export const shareAdvisory = async (advisoryId, data) => {
  const response = await API.post(`/crop-advisory/${advisoryId}/share`, data);
  return response.data;
};

/**
 * Print advisory in formatted layout
 * @param {string} advisoryId - Advisory ID
 * @param {Object} options - Print options
 * @param {boolean} options.includeImages - Include images
 * @param {string} options.language - Language preference
 * @returns {Promise} Print-ready HTML
 */
export const getPrintableAdvisory = async (advisoryId, options = {}) => {
  const response = await API.get(`/crop-advisory/${advisoryId}/print`, {
    params: options
  });
  return response.data;
};
