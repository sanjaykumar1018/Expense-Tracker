import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";
import apiPaths from "../utils/apiPaths";

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadStoredUser = () => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
        setIsAuthenticated(true);
      } catch (e) {
        console.error("Failed to parse stored user");
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadStoredUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await api.get(apiPaths.GET_USER_INFO);
      const userData = res.data;
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem("user", JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error("Fetch user error:", error);
      logout();
      return null;
    }
  };

  const login = async (email, password) => {
    const res = await api.post(apiPaths.LOGIN, { email, password });
    const { token, ...userData } = res.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    return userData;
  };

  const signup = async (formData) => {
    const res = await api.post(apiPaths.SIGNUP, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    const { token, ...userData } = res.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    return userData;
  };

  const updateProfileImage = async (formData) => {
    const res = await api.put(apiPaths.UPDATE_PROFILE_IMAGE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    const userData = res.data;
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        loading,
        isAuthenticated,
        login,
        signup,
        logout,
        fetchUser,
        updateProfileImage,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
