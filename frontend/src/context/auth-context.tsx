"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface UserType {
  name: string;
  email: string;
  image?: string;
}

interface AuthContextType {
  user: UserType | null;
  token: string | null;
  login: (token: string, user: UserType) => void;
  logout: () => void;
  signup: (user: UserType, password: string) => void;
  updateProfileImage: (file: File) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    if (t && u) {
      setToken(t);
      setUser(JSON.parse(u));
    }
  }, []);

  const login = (token: string, user: UserType) => {
    setToken(token);
    setUser(user);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // No redirect — let the UI handle what happens next
  };

  // Mock signup
  const signup = (user: UserType, password: string) => {
    // Implement your signup logic here
    login("mock-token", user);
  };

  // Mock image upload
  const updateProfileImage = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setUser((prev) => prev ? { ...prev, image: reader.result as string } : prev);
      // Persist image in localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        userObj.image = reader.result;
        localStorage.setItem("user", JSON.stringify(userObj));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, signup, updateProfileImage }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
