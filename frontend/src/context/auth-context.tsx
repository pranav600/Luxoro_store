"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface UserType {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
}

interface AuthContextType {
  user: UserType | null;
  token: string | null;
  isLoading: boolean;  // Add loading state
  login: (token: string, user: UserType) => void;
  logout: () => void;
  signup: (user: UserType, password: string) => void;
  updateProfile: (updates: Partial<UserType>) => Promise<void>;
  updateProfileImage: (file: File) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Setup fetch interceptor
  useEffect(() => {
    if (!token) return;

    // Add token to all fetch requests
    const originalFetch = window.fetch;
    
    const fetchWithAuth = async (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      const response = await originalFetch(input, {
        ...init,
        headers,
      });

      // If we get a 401, log the user out
      if (response.status === 401) {
        logout();
        window.location.href = '/login';
        throw new Error('Session expired. Please log in again.');
      }

      return response;
    };

    // Override the global fetch
    window.fetch = fetchWithAuth as typeof window.fetch;

    // Cleanup function to restore original fetch
    return () => {
      window.fetch = originalFetch;
    };
  }, [token]);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        console.log('Initializing auth from localStorage...');
        const t = localStorage.getItem("token");
        const u = localStorage.getItem("user");
        
        console.log('Retrieved from localStorage - token:', t ? '[exists]' : 'null', 'user:', u ? '[exists]' : 'null');
        
        if (t && u) {
          try {
            const userData = JSON.parse(u);
            console.log('Parsed user data:', userData);
            setToken(t);
            setUser(userData);
            console.log('Auth initialized with user:', userData.email);
          } catch (parseError) {
            console.error('Error parsing user data:', parseError);
            throw new Error('Invalid user data in localStorage');
          }
        } else {
          console.log('No valid auth data found in localStorage');
          // Clear any partial/invalid data
          if (t) localStorage.removeItem('token');
          if (u) localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear invalid data but don't throw to prevent app crash
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        // Always set loading to false when initialization is complete
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for storage events to sync across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'user') {
        initializeAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (token: string, userData: UserType) => {
    if (!token || !userData || !userData.email) {
      console.error('Invalid login data:', { token, user: userData });
      throw new Error('Invalid login data');
    }

    console.log('Logging in user:', userData.email);
    
    // Create a clean user object with only the properties we need
    const user = {
      _id: userData._id,
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '',
      image: userData.image || '',
    };
    
    // Save to localStorage first
    try {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      console.log('User data saved to localStorage');
      
      // Then update state
      setToken(token);
      setUser(user);
      console.log('Auth state updated with user:', user.email);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      // Clear potentially corrupted data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      throw new Error('Failed to save login data');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  // Mock signup
  const signup = (user: UserType, password: string) => {
    // Implement your signup logic here
    login("mock-token", user);
  };

  // Mock image upload
  const updateProfile = async (updates: Partial<UserType>) => {
    if (!user) return;
    
    try {
      // Update local state
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      
      // Update localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // If you want to persist the changes to the backend, you can add an API call here
      // Example:
      // await fetch('/api/users/me', {
      //   method: 'PATCH',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify(updates)
      // });
      
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

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
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,  
        login,
        logout,
        signup,
        updateProfile,
        updateProfileImage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
