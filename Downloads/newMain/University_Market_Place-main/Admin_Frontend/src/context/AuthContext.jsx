import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { adminAuthAPI } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("adminToken");
      if (!token) { setLoading(false); return; }
      try {
        const res = await adminAuthAPI.get("/me");
        setAdmin(res.data.admin);
      } catch {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await adminAuthAPI.post("/login", { email, password });
    const { token, admin: adminData } = res.data;
    localStorage.setItem("adminToken", token);
    localStorage.setItem("adminUser", JSON.stringify(adminData));
    setAdmin(adminData);
    return adminData;
  }, []);

  const logout = useCallback(async () => {
    try { await adminAuthAPI.post("/logout"); } catch {}
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setAdmin(null);
  }, []);

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
