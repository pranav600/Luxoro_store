"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/auth-context";

interface LoginFormProps {
  isAdmin?: boolean;
}

export default function LoginForm({ isAdmin }: LoginFormProps) {
  const router = useRouter();
  const searchParams = new URLSearchParams(
    typeof window !== 'undefined' ? window.location.search : ''
  );
  const redirectTo = searchParams.get('redirect') || '/';
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const apiUrl = isAdmin
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/auth/login`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`;
      
      console.log('Making login request to:', apiUrl);
      
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      console.log('Raw login response:', {
        status: res.status,
        statusText: res.statusText,
        data
      });
      
      if (!res.ok) {
        console.error('Login failed with status:', res.status);
        throw new Error(data.message || `Login failed with status ${res.status}`);
      }
      
      if (!data.token || !data.user) {
        console.error('Missing token or user data in login response');
        console.error('Response data:', data);
        throw new Error('Invalid response from server: missing token or user data');
      }
      
      console.log('Login successful, user data:', data.user);
      console.log('Calling login function with token and user data');
      
      try {
        await login(data.token, data.user);
        console.log('Login function completed, checking localStorage...');
        console.log('localStorage token:', localStorage.getItem('token') ? 'exists' : 'missing');
        console.log('localStorage user:', localStorage.getItem('user') ? 'exists' : 'missing');
        
        // Small delay to ensure state updates complete
        setTimeout(() => {
          console.log('Redirecting to:', isAdmin ? "/admin/add-product" : redirectTo);
          router.push(isAdmin ? "/admin/add-product" : redirectTo);
        }, 100);
      } catch (loginError) {
        console.error('Error in login function:', loginError);
        throw new Error('Failed to complete login process');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      <form
        onSubmit={handleLogin}
        className="bg-white p-10 rounded-xl shadow-lg w-full max-w-md mt-24"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-black font-mono tracking-tight">
          {isAdmin ? "Admin Login" : "Login to Luxoro"}
        </h2>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">
            Email
          </label>
          <input
            type="email"
            className="w-full px-4 py-2 border text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-gray-50"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">
            Password
          </label>
          <input
            type="password"
            className="w-full px-4 py-2 border text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-gray-50"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="mb-4 text-red-600 text-center">{error}</div>}
        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-900 transition-colors cursor-pointer"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <div className="mt-4 text-center text-gray-600">
          {isAdmin ? (
            <>
              Don't have an admin account?{" "}
              <a
                href="/admin/signup"
                className="text-black underline hover:text-gray-800 cursor-pointer"
              >
                Sign up
              </a>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <a
                href="/signup"
                className="text-black underline hover:text-gray-800 cursor-pointer"
              >
                Sign up
              </a>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
