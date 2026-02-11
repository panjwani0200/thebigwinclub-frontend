import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const api = axios.create({
  baseURL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message =
      error?.response?.data?.message ||
      (status ? `Request failed with status ${status}` : "Network error. Please try again.");

    if (status === 401) {
      localStorage.removeItem("token");
    }

    return Promise.reject({
      ...error,
      friendlyMessage: message,
    });
  }
);

export default api;
