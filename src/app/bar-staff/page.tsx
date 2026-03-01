"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface LoginResponse {
  token: string;
}

export default function BarStaffLoginPage() {
  const router = useRouter();
  const [venueId, setVenueId] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await api.post<LoginResponse>("/api/bar-staff/login", {
        venue_id: venueId,
        pin,
      });
      localStorage.setItem("bar_staff_token", result.token);
      router.push("/bar-staff/orders");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-sm">
        {/* Logo / Title */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
            <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.1-1.3 2-3 2s-3-.9-3-2 1.3-2 3-2 3 .9 3 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Bar Staff Login</h1>
          <p className="mt-1 text-base text-gray-500">Enter your venue ID and PIN</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-base font-medium text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="venueId" className="mb-1.5 block text-base font-medium text-gray-700">
              Venue ID
            </label>
            <input
              id="venueId"
              type="text"
              required
              value={venueId}
              onChange={(e) => setVenueId(e.target.value)}
              placeholder="e.g. BAR-001"
              className="min-h-[52px] w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-lg text-gray-900 placeholder-gray-400 outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="pin" className="mb-1.5 block text-base font-medium text-gray-700">
              PIN
            </label>
            <input
              id="pin"
              type="password"
              inputMode="numeric"
              required
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter your PIN"
              className="min-h-[52px] w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-lg text-gray-900 placeholder-gray-400 outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="min-h-[52px] w-full rounded-xl bg-emerald-500 px-6 py-3 text-lg font-bold text-white transition-colors active:bg-emerald-600 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-gray-400">Powered by No Ojoro</p>
      </div>
    </div>
  );
}
