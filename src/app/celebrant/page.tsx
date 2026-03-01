"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

interface LoginResponse {
  token: string;
  event_name: string;
}

function CelebrantLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const passwordRef = useRef<HTMLInputElement>(null);
  const [eventId, setEventId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const eventParam = searchParams.get("event");
    if (eventParam) {
      setEventId(eventParam);
      setTimeout(() => passwordRef.current?.focus(), 0);
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await api.post<LoginResponse>(
        `/api/events/${eventId}/celebrant/login`,
        { password }
      );
      localStorage.setItem("celebrant_token", result.token);
      router.push(`/celebrant/${eventId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* Title */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
          <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Celebrant View</h1>
        <p className="mt-1 text-base text-gray-500">
          Enter the event ID and password shared by your event organizer
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-base font-medium text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="eventId" className="mb-1.5 block text-base font-medium text-gray-700">
            Event ID
          </label>
          <input
            id="eventId"
            type="text"
            required
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            placeholder="Enter your event ID"
            className="min-h-[52px] w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-lg text-gray-900 placeholder-gray-400 outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-base font-medium text-gray-700">
            Password
          </label>
          <input
            ref={passwordRef}
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="min-h-[52px] w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-lg text-gray-900 placeholder-gray-400 outline-none focus:border-emerald-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="min-h-[52px] w-full rounded-xl bg-emerald-500 px-6 py-3 text-lg font-bold text-white transition-colors active:bg-emerald-600 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "View My Event"}
        </button>
      </form>

      <p className="mt-8 text-center text-xs text-gray-400">Powered by No Ojoro</p>
    </div>
  );
}

export default function CelebrantLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <Suspense fallback={
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-500" />
        </div>
      }>
        <CelebrantLoginForm />
      </Suspense>
    </div>
  );
}
