"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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

interface TableStatus {
  table_number: number;
  total_seats: number;
  served_seats: number;
  waiting_seats: number;
  unused_seats: number;
}

/* ========== Component ========== */

export default function PublicLiveEventPage() {
  const params = useParams<{ event_id: string }>();
  const eventId = params.event_id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<DashboardData | null>(null);
  const [tables, setTables] = useState<TableStatus[]>([]);
  const [view, setView] = useState<"summary" | "tables">("summary");

  const fetchDashboard = useCallback(async () => {
    try {
      // Fetch dashboard summary
      const response = await fetch(`${API_URL}/api/events/${eventId}/dashboard/public`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Event not found or not accessible");
      }

      const result = await response.json();
      setData(result);

      // Fetch table statuses
      const tablesResponse = await fetch(`${API_URL}/api/events/${eventId}/tables/status`, {
        credentials: "include",
      });

      if (tablesResponse.ok) {
        const tablesData = await tablesResponse.json();
        setTables(tablesData.tables || []);
      }

      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load event");
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
  const tokenPercent = data ? Math.round(data.tokens.usage_percent) : 0;

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
          <p className="text-lg font-medium text-gray-700">Loading event...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Event Not Found</h1>
          <p className="mb-6 text-lg text-gray-600">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-eco px-6 py-3 font-semibold text-white hover:bg-eco-dark"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-4xl">
          <Link href="/" className="mb-2 inline-block text-sm text-gray-500 hover:text-gray-700">
            ← Back to Home
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {data?.event_name || "Event"} - Live Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Auto-refreshing every 3 seconds · {view === "summary" ? "Summary View" : "Table View"}
          </p>
        </div>
      </div>

      {/* View Toggle */}
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
        <div className="mx-auto flex max-w-4xl gap-2">
          <button
            onClick={() => setView("summary")}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
              view === "summary"
                ? "bg-eco text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setView("tables")}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
              view === "tables"
                ? "bg-eco text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Tables
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {view === "summary" ? (
          <>
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
              <div className="mt-6 flex gap-8 text-center">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{data?.tokens.total ?? 0}</p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{used}</p>
                  <p className="text-sm text-gray-600">Used</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">{remaining}</p>
                  <p className="text-sm text-gray-600">Remaining</p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="mb-8 grid grid-cols-2 gap-4">
              <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-6 text-center">
                <p className="text-4xl font-bold text-amber-700">
                  {data?.orders.waiting ?? 0}
                </p>
                <p className="mt-1 text-sm font-medium text-amber-600">Orders Waiting</p>
              </div>
              <div className="rounded-xl border-2 border-gray-200 bg-gray-50 p-6 text-center">
                <p className="text-4xl font-bold text-gray-900">
                  {data?.orders.served ?? 0}
                </p>
                <p className="mt-1 text-sm font-medium text-gray-600">Orders Served</p>
              </div>
            </div>

            {/* Waiter Requests */}
            {data && data.pending_waiter_requests > 0 && (
              <div className="mb-8 rounded-xl border-2 border-red-300 bg-red-50 p-6 text-center">
                <p className="text-4xl font-bold text-red-600">
                  {data.pending_waiter_requests}
                </p>
                <p className="mt-1 text-sm font-medium text-red-500">
                  Pending Waiter Requests
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Table by Table View */}
            <h2 className="mb-6 text-xl font-bold text-gray-900">Table Status</h2>
            {tables.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
                <p className="text-sm text-gray-500">No table data available</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tables.map((table) => {
                  const servedPercent = table.total_seats > 0
                    ? Math.round((table.served_seats / table.total_seats) * 100)
                    : 0;

                  return (
                    <div
                      key={table.table_number}
                      className="rounded-xl border border-gray-200 bg-white p-5"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">
                          Table {table.table_number}
                        </h3>
                        <span className="text-sm font-medium text-gray-500">
                          {servedPercent}%
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-eco transition-all duration-500"
                          style={{ width: `${servedPercent}%` }}
                        />
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-lg font-bold text-gray-900">
                            {table.served_seats}
                          </p>
                          <p className="text-xs text-gray-500">Served</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-amber-600">
                            {table.waiting_seats}
                          </p>
                          <p className="text-xs text-gray-500">Waiting</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-gray-400">
                            {table.unused_seats}
                          </p>
                          <p className="text-xs text-gray-500">Unused</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-4 py-6 text-center">
        <p className="text-sm text-gray-500">
          Powered by{" "}
          <Link href="/" className="font-semibold text-eco hover:underline">
            No Ojoro
          </Link>
        </p>
      </div>
    </div>
  );
}
