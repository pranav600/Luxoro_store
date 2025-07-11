"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/auth-context";

interface SignupFormProps {}

export default function SignupForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let base64Image: string | null = null;

      if (image) {
        const reader = new FileReader();
        const result: string = await new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(image);
        });
        base64Image = result;
      }

      const res = await fetch(
        "http://localhost:8000/api/auth/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            phone,
            email,
            password,
            image: base64Image, // include image
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");
      login(data.token, data.user);
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      <div className="max-w-md w-full bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-lg mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-black font-mono">
          Sign Up to Luxoro
        </h2>
        <form onSubmit={handleSignup} className="space-y-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center">
            <label htmlFor="avatar">
              <img
                src={
                  imagePreview ||
                  "https://img.freepik.com/premium-vector/vector-flat-illustration-gray-colors-avatar-user-profile-person-icon-gender-neutral-silhouette-profile-picture-suitable-social-media-profiles-icons-screensavers-as-templatex9xa_719432-844.jpg"
                }
                alt="Avatar Preview"
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-300 shadow mb-2 cursor-pointer"
              />
            </label>
            <input
              type="file"
              id="avatar"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <span className="text-sm text-gray-500">
              Tap to upload profile photo
            </span>
          </div>

          {/* Name */}
          <div>
            <label
              className="block text-black font-semibold mb-1 text-sm sm:text-base"
              htmlFor="name"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black text-black"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Phone */}
          <div>
            <label
              className="block text-black font-semibold mb-1 text-sm sm:text-base"
              htmlFor="phone"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black text-black"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              pattern="^[0-9]{10,15}$"
              placeholder="e.g. 919876543210"
            />
          </div>

          {/* Email */}
          <div>
            <label
              className="block text-black font-semibold mb-1"
              htmlFor="email"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="e.g. abc@gmail.com"
            />
          </div>

          {/* Password */}
          <div>
            <label
              className="block text-black font-semibold mb-1"
              htmlFor="password"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black text-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="mb-4 text-red-600 text-center">{error}</div>
          )}

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors cursor-pointer"
            disabled={loading}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>

          <div className="mt-4 text-center text-gray-600">
            Already have an account? <a href="/login" className="text-black hover:underline font-semibold cursor-pointer">Login</a>
          </div>
        </form>
      </div>
    </div>
  );  
}
