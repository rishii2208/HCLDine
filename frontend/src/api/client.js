// API Client with x-api-key authentication
// All API requests to the backend must include the x-api-key header

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_KEY = import.meta.env.VITE_API_KEY;

/**
 * Makes an authenticated API request with x-api-key header
 * @param {string} endpoint - API endpoint (e.g., "/menu", "/orders")
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>}
 */
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  
  const headers = {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  return response;
};

/**
 * GET request with API key
 * @param {string} endpoint - API endpoint
 * @param {string} authToken - Optional Firebase auth token
 * @returns {Promise<Object>}
 */
export const apiGet = async (endpoint, authToken = null) => {
  const headers = {};
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const response = await apiRequest(endpoint, {
    method: "GET",
    headers
  });

  return response.json();
};

/**
 * POST request with API key
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request body
 * @param {string} authToken - Optional Firebase auth token
 * @returns {Promise<Object>}
 */
export const apiPost = async (endpoint, data, authToken = null) => {
  const headers = {};
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const response = await apiRequest(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(data)
  });

  return response.json();
};

/**
 * PUT request with API key
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request body
 * @param {string} authToken - Optional Firebase auth token
 * @returns {Promise<Object>}
 */
export const apiPut = async (endpoint, data, authToken = null) => {
  const headers = {};
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const response = await apiRequest(endpoint, {
    method: "PUT",
    headers,
    body: JSON.stringify(data)
  });

  return response.json();
};

/**
 * PATCH request with API key
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request body
 * @param {string} authToken - Optional Firebase auth token
 * @returns {Promise<Object>}
 */
export const apiPatch = async (endpoint, data, authToken = null) => {
  const headers = {};
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const response = await apiRequest(endpoint, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data)
  });

  return response.json();
};

/**
 * DELETE request with API key
 * @param {string} endpoint - API endpoint
 * @param {string} authToken - Optional Firebase auth token
 * @returns {Promise<Object>}
 */
export const apiDelete = async (endpoint, authToken = null) => {
  const headers = {};
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const response = await apiRequest(endpoint, {
    method: "DELETE",
    headers
  });

  return response.json();
};

export default {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  patch: apiPatch,
  delete: apiDelete,
  request: apiRequest
};
