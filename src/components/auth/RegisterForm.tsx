"use client";

import { useState } from "react";
import { api } from "@/lib/api";

type InputMode = "email" | "phone";

interface RegisterFormProps {
  onNavigate: (view: string) => void;
}

export default function RegisterForm({ onNavigate }: RegisterFormProps) {
  const [mode, setMode] = useState<InputMode>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("caterer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const body: Record<string, string> = { password, role };

      if (mode === "email") {
        body.email = email;
      } else {
        body.phone = phone;
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
      <p className="mb-8 text-center text-sm t-text-muted">
        Join No Ojoro and streamline your operations
      </p>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Mode Tabs */}
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
          Email
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
          Phone
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {mode === "email" ? (
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
        ) : (
          <div>
            <label htmlFor="reg-phone" className="mb-1.5 block text-sm font-medium t-text-secondary">
              Phone Number
            </label>
            <input
              id="reg-phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+234 801 234 5678"
              className="w-full t-input px-4 py-3 outline-none"
            />
          </div>
        )}

        <div>
          <label htmlFor="reg-password" className="mb-1.5 block text-sm font-medium t-text-secondary">
            Password
          </label>
          <input
            id="reg-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a strong password"
            className="w-full t-input px-4 py-3 outline-none"
          />
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
            <option value="caterer" className="t-select-option">Caterer</option>
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
