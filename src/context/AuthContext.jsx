import React, { createContext, useContext, useState } from "react";
import { loginUser, logoutUser, getProfile } from "../api/authApi";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAuthenticated = !!user && !!localStorage.getItem("token");

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginUser(credentials);
      const payload = res.data?.data ?? res.data;
      const token = payload.token;
      const userData = payload.user;
      if (!token || !userData) throw new Error("Invalid response from server");
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Login failed";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try { await logoutUser(); } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    // Force full page reload at login
    window.location.replace("/login");
  };

  // Refresh profile from backend and sync to localStorage
  const refreshProfile = async () => {
    try {
      const res = await getProfile();
      const updated = res.data.data?.user ?? res.data.data;
      localStorage.setItem("user", JSON.stringify(updated));
      setUser(updated);
      // Notify AppContext in same tab
      window.dispatchEvent(new CustomEvent("user-updated", { detail: updated }));
      return updated;
    } catch { return null; }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, error, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
