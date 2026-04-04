import axios from "axios";

const ADMIN_BACKEND_BASE_URL =
  import.meta.env.VITE_ADMIN_API_BASE_URL || "http://localhost:5002";

// Admin auth API
export const adminAuthAPI = axios.create({
  baseURL: `${ADMIN_BACKEND_BASE_URL}/api/admin/auth`,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// Attach JWT token to every request automatically
adminAuthAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-redirect on 401
adminAuthAPI.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// Main marketplace API — for reading users etc.
export const mainAPI = axios.create({
  baseURL: "http://localhost:5001",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

mainAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
