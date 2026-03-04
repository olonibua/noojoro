"use client";

import { useState } from "react";
import { api } from "@/lib/api";

type InputMode = "email" | "phone";

interface RegisterFormProps {
  onNavigate: (view: string) => void;
  referralCode?: string;
}

export default function RegisterForm({ onNavigate, referralCode }: RegisterFormProps) {
  const [mode, setMode] = useState<InputMode>("email");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("caterer");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const body: Record<string, string> = { name, phone, password, role };

      if (mode === "email") {
        body.email = email;
      }

      if (referralCode) {
        body.referral_code = referralCode;
      }

      await api.post("/api/auth/register", body);

      if (mode === "email") {
        localStorage.setItem("verify_email", email);
        localStorage.removeItem("verify_phone");
      } else {
        localStorage.setItem("verify_phone", phone);
        localStorage.removeItem("verify_email");
      }
      localStorage.setItem("verify_password", password);
      onNavigate("verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="mb-2 text-center text-3xl font-bold">Create Account</h1>
      <p className="mb-4 text-center text-sm t-text-muted">
        Join No Ojoro and streamline your operations
      </p>

      {referralCode && (
        <div className="mb-6 flex items-center justify-center gap-2 rounded-xl border border-eco/20 bg-eco/5 px-4 py-2.5 text-sm text-eco">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Referred by a partner
        </div>
      )}

      {/* Mode Tabs - at the top */}
      <div className="mb-6 flex overflow-hidden rounded-xl t-tab-bg p-1">
        <button
          type="button"
          onClick={() => setMode("email")}
          className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
            mode === "email"
              ? "bg-eco text-white shadow-sm"
              : "t-text-muted hover:text-eco"
          }`}
        >
          Email + Phone
        </button>
        <button
          type="button"
          onClick={() => setMode("phone")}
          className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
            mode === "phone"
              ? "bg-eco text-white shadow-sm"
              : "t-text-muted hover:text-eco"
          }`}
        >
          Phone Only
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Full Name */}
      <div className="mb-5">
        <label htmlFor="reg-name" className="mb-1.5 block text-sm font-medium t-text-secondary">
          Full Name
        </label>
        <input
          id="reg-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          className="w-full t-input px-4 py-3 outline-none"
        />
      </div>

      {/* Phone Number (always required) */}
      <div className="mb-5">
        <label htmlFor="reg-phone-main" className="mb-1.5 block text-sm font-medium t-text-secondary">
          Phone Number
        </label>
        <input
          id="reg-phone-main"
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+234 801 234 5678"
          className="w-full t-input px-4 py-3 outline-none"
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {mode === "email" && (
          <div>
            <label htmlFor="reg-email" className="mb-1.5 block text-sm font-medium t-text-secondary">
              Email Address
            </label>
            <input
              id="reg-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full t-input px-4 py-3 outline-none"
            />
          </div>
        )}

        <div>
          <label htmlFor="reg-password" className="mb-1.5 block text-sm font-medium t-text-secondary">
            Password
          </label>
          <div className="relative">
            <input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              className="w-full t-input px-4 py-3 pr-12 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 t-text-faint hover:t-text-muted transition-colors"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
          <p className="mt-1.5 text-xs t-text-faint">
            Must include at least 1 capital letter and 1 number
          </p>
        </div>

        <div>
          <label htmlFor="reg-role" className="mb-1.5 block text-sm font-medium t-text-secondary">
            Role
          </label>
          <select
            id="reg-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full t-input px-4 py-3 outline-none"
          >
            <option value="caterer" className="t-select-option">Event Planner / Caterer</option>
            <option value="bar_owner" className="t-select-option">Bar Owner</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm t-text-faint">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => onNavigate("login")}
          className="font-medium text-eco hover:text-eco-dark"
        >
          Sign In
        </button>
      </p>
    </>
  );
}
