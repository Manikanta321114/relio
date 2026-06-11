import axios from "axios";
import toast from "react-hot-toast";

let API_URL = import.meta.env.VITE_API_URL || "https://backend-bien.onrender.com/api";
if (API_URL && !API_URL.endsWith('/api') && !API_URL.endsWith('/api/')) {
  API_URL = `${API_URL.replace(/\/+$/, '')}/api`;
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add the JWT token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle Network Errors
    if (!error.response) {
      toast.error("Network Error: Please check your connection.");
      return Promise.reject(new Error("Network Error"));
    }

    // Handle Authentication Errors
    if (error.response.status === 401) {
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("unauthorized"));
      // Don't toast on initial load check, only on active requests
      if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login";
      }
    }

    // Handle Server Errors
    if (error.response.status >= 500) {
      toast.error("Server Error: Please try again later.");
    }

    return Promise.reject(error.response?.data || error);
  }
);

export default api;
