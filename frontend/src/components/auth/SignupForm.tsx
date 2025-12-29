"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/auth-context";

export default function SignupForm() {
  const router = useRouter();
  const { login } = useAuth();

  // "details" or "otp"
  const [step, setStep] = useState<"details" | "otp">("details");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // OTP state
  const [otp, setOtp] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Step 1: Submit details to initiate signup and get OTP
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

      const baseURL =
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        "https://luxoro-store-backend.onrender.com";
      const res = await fetch(`${baseURL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          password,
          image: base64Image,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");

      // If successful, move to OTP step
      // Assuming backend sends OTP to email upon this request
      setStep("otp");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const baseURL =
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        "https://luxoro-store-backend.onrender.com";
      const res = await fetch(`${baseURL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "OTP verification failed");

      // Login user
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
          {step === "details" ? "Sign Up to Luxoro" : "Verify Email"}
        </h2>

        {step === "details" ? (
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
                htmlFor="name">
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
                htmlFor="phone">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black text-black"
                value={phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setPhone(value);
                }}
                required
                pattern="^[0-9]{10}$"
                placeholder="e.g. 9876543210"
                maxLength={10}
              />
            </div>

            {/* Email */}
            <div>
              <label
                className="block text-black font-semibold mb-1"
                htmlFor="email">
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
                htmlFor="password">
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
              <div className="mb-4 text-red-600 text-center text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors cursor-pointer"
              disabled={loading}>
              {loading ? "Sending OTP..." : "Sign Up"}
            </button>

            <div className="mt-4 text-center text-gray-600">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-black hover:underline font-semibold cursor-pointer">
                Login
              </a>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="text-center text-sm text-gray-600 mb-4">
              We have sent a One-Time Password to <strong>{email}</strong>.
              Please enter it below.
            </div>

            <div>
              <label
                className="block text-black font-semibold mb-1"
                htmlFor="otp">
                Enter OTP
              </label>
              <input
                type="text"
                id="otp"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black text-black text-center text-lg tracking-widest"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
                placeholder="123456"
              />
            </div>

            {error && (
              <div className="mb-4 text-red-600 text-center text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors cursor-pointer"
              disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              type="button"
              className="w-full text-gray-600 text-sm hover:underline mt-2"
              onClick={() => setStep("details")} // Allow going back to edit email
              disabled={loading}>
              Incorrect email? Go back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
