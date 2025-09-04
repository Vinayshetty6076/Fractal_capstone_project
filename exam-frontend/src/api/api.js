// src/api/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api/", // adjust if needed
});

// Attach access token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors and refresh token automatically
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If unauthorized (401) and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh = localStorage.getItem("refresh");
        if (!refresh) {
          // No refresh token → force logout
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          window.location.href = "/login";
          return Promise.reject(error);
        }

        // Request new access token
        const res = await axios.post("http://localhost:8000/api/token/refresh/", {
          refresh,
        });

        const newAccessToken = res.data.access;
        localStorage.setItem("access", newAccessToken);

        // Update header & retry original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return API(originalRequest);
      } catch (err) {
        // Refresh failed → force logout
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
