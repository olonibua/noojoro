"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

/* ---------- Types ---------- */

interface DashboardData {
  event_name: string;
  event_status: string;
  tokens: {
    total: number;
    active: number;
    burned: number;
    served: number;
    inactive: number;
    usage_percent: number;
  };
  orders: {
    waiting: number;
    served: number;
  };
  pending_waiter_requests: number;
}

/* ========== Component ========== */

export default function CatererLiveDashboardPage() {
  const params = useParams<{ id: string }>();
  const eventId = params.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<DashboardData | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const result = await api.get<DashboardData>(
        `/api/events/${eventId}/dashboard`
      );
      setData(result);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  /* --- Auto-refresh every 3s --- */
  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 3000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  /* --- Token progress --- */
  const used = data ? data.tokens.burned + data.tokens.served : 0;
  const remaining = data ? data.tokens.total - used : 0;
  const tokenPercent = data
    ? Math.round(data.tokens.usage_percent)
    : 0;

  /* --- Progress ring SVG params --- */
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - tokenPercent / 100);

  /* ========== Render ========== */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-500" />
          <p className="text-lg font-medium text-gray-700">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="text-center">
          <p className="mb-4 text-lg text-red-600">{error}</p>
          <button
            onClick={fetchDashboard}
            className="rounded-xl bg-emerald-500 px-8 py-3 text-lg font-semibold text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-4">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-xl font-bold text-gray-900">
            {data?.event_name || "Event"} - Live
          </h1>
          <p className="text-sm text-gray-500">Auto-refreshing every 3 seconds</p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6">
        {/* Token Progress Ring */}
        <div className="mb-8 flex flex-col items-center">
          <h2 className="mb-4 text-lg font-bold text-gray-900">Token Usage</h2>
          <div className="relative h-36 w-36">
            <svg className="h-36 w-36 -rotate-90" viewBox="0 0 140 140">
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="10"
              />
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke="#22C55E"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-gray-900">{tokenPercent}%</span>
              <span className="text-xs text-gray-500">used</span>
            </div>
          </div>

          {/* Token numbers */}
          <div className="mt-4 flex gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{data?.tokens.total ?? 0}</p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{used}</p>
              <p className="text-sm text-gray-500">Used</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{remaining}</p>
              <p className="text-sm text-gray-500">Remaining</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-2 gap-4">
          <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4 text-center">
            <p className="text-3xl font-bold text-amber-700">
              {data?.orders.waiting ?? 0}
            </p>
            <p className="text-sm font-medium text-amber-600">Waiting</p>
          </div>
          <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4 text-center">
            <p className="text-3xl font-bold text-emerald-700">
              {data?.orders.served ?? 0}
            </p>
            <p className="text-sm font-medium text-emerald-600">Served</p>
          </div>
        </div>

        {/* Waiter Requests */}
        {data && data.pending_waiter_requests > 0 && (
          <div className="mb-8 rounded-xl border-2 border-red-300 bg-red-50 p-4 text-center">
            <p className="text-3xl font-bold text-red-600">
              {data.pending_waiter_requests}
            </p>
            <p className="text-sm font-medium text-red-500">
              Pending Waiter Requests
            </p>
          </div>
        )}

        {data && data.pending_waiter_requests === 0 && (
          <div className="mb-8 rounded-xl border-2 border-gray-200 p-4 text-center">
            <p className="text-3xl font-bold text-gray-400">0</p>
            <p className="text-sm font-medium text-gray-400">
              Pending Waiter Requests
            </p>
          </div>
        )}

        {/* Drill-down Links */}
        <div className="space-y-3">
          <Link
            href={`/dashboard/events/${eventId}/live/inventory`}
            className="flex min-h-[52px] items-center justify-between rounded-xl border-2 border-gray-200 px-5 py-4 text-base font-semibold text-gray-900 active:bg-gray-50"
          >
            <span>Inventory Monitor</span>
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link
            href={`/dashboard/events/${eventId}/live/staff`}
            className="flex min-h-[52px] items-center justify-between rounded-xl border-2 border-gray-200 px-5 py-4 text-base font-semibold text-gray-900 active:bg-gray-50"
          >
            <span>Staff Performance</span>
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="px-4 py-6 text-center">
        <p className="text-xs text-gray-400">Powered by No Ojoro</p>
      </div>
    </div>
  );
}
