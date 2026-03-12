import axios from "axios";

// Admin auth API (port 5001)
export const adminAuthAPI = axios.create({
  baseURL: "http://localhost:5001/api/admin/auth",
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

// Main app API (port 5000) — for reading users etc.
export const mainAPI = axios.create({
  baseURL: "http://localhost:5000",
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