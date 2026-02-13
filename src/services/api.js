import axios from "axios";

const isProd = import.meta.env.PROD;
const envBaseURL = isProd
  ? import.meta.env.VITE_API_URL
  : import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
const fallbackBaseURL = isProd
  ? "https://thebigwinclub-backend.onrender.com"
  : "http://localhost:3000";
const blockedEnvHostPattern = /your-render-backend\.onrender\.com/i;

const normalizeBaseURL = (rawUrl) => {
  const value = String(rawUrl || "").trim();
  if (!value) return "http://localhost:3000";

  // Keep origin only. If someone sets /api or /api/auth in env,
  // requests like /api/auth/login will otherwise duplicate segments.
  try {
    const parsed = new URL(value);
    return parsed.origin.replace(/\/+$/, "");
  } catch {
    return value.replace(/\/+$/, "");
  }
};

const sanitizedEnvBaseURL = (() => {
  const normalized = normalizeBaseURL(envBaseURL);
  return blockedEnvHostPattern.test(normalized) ? "" : normalized;
})();

const baseURL = sanitizedEnvBaseURL || fallbackBaseURL;

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
