"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";

/* ---------- Types ---------- */

interface BackendSeat {
  seat_number: number;
  status: "grey" | "yellow" | "green";
  order_number?: string | null;
  wait_time_minutes?: number | null;
}

interface BackendTable {
  table_number: number;
  seats: BackendSeat[];
}

interface WaiterRequest {
  id: string;
  table_number: number;
  seat_number: number;
  created_at: string;
  status: string;
}

/* Display types used in the component */

type DisplayStatus = "empty" | "waiting" | "served";

interface SeatInfo {
  seat_number: number;
  status: DisplayStatus;
  order_number?: string;
  wait_minutes?: number;
}

interface TableInfo {
  table_number: string;
  seats: SeatInfo[];
}

/* ---------- Sound helper ---------- */

function playNotificationSound() {
  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // Two-tone chime: C5 then E5
    [523.25, 659.25].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, now + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 0.3);
    });

    // Clean up after sounds finish
    setTimeout(() => ctx.close(), 1000);
  } catch {
    // AudioContext not available (e.g., SSR or blocked by browser)
  }
}

/* ========== Component ========== */

export default function StaffDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [waiterRequests, setWaiterRequests] = useState<WaiterRequest[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<{
    table: string;
    seat: SeatInfo;
  } | null>(null);
  const prevWaiterCountRef = useRef(0);

  const getToken = useCallback((): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("staff_token");
  }, []);

  const fetchData = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.push("/staff");
      return;
    }

    try {
      const [tablesResult, waiterResult] = await Promise.all([
        api.get<BackendTable[]>("/api/staff/tables"),
        api.get<WaiterRequest[]>("/api/staff/waiter-requests").catch(() => [] as WaiterRequest[]),
      ]);

      const statusMap: Record<string, DisplayStatus> = {
        grey: "empty",
        yellow: "waiting",
        green: "served",
      };
      const mapped: TableInfo[] = tablesResult.map((t) => ({
        table_number: String(t.table_number),
        seats: t.seats.map((s) => ({
          seat_number: s.seat_number,
          status: statusMap[s.status] || "empty",
          order_number: s.order_number || undefined,
          wait_minutes: s.wait_time_minutes || undefined,
        })),
      }));
      setTables(mapped);

      // Play sound when new waiter requests arrive
      if (waiterResult.length > prevWaiterCountRef.current && prevWaiterCountRef.current >= 0) {
        playNotificationSound();
      }
      prevWaiterCountRef.current = waiterResult.length;
      setWaiterRequests(waiterResult);

      setError("");
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        localStorage.removeItem("staff_token");
        router.push("/staff");
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to load tables");
    } finally {
      setLoading(false);
    }
  }, [getToken, router]);

  /* --- Initial load + polling --- */
  useEffect(() => {
    // Set to -1 so initial load doesn't trigger sound
    prevWaiterCountRef.current = -1;
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  /* --- Acknowledge waiter request --- */
  const acknowledgeRequest = useCallback(async (requestId: string) => {
    try {
      await api.post(`/api/staff/waiter-requests/${requestId}/acknowledge`);
      setWaiterRequests((prev) => prev.filter((r) => r.id !== requestId));
      prevWaiterCountRef.current = Math.max(0, prevWaiterCountRef.current - 1);
    } catch {
      // Will be removed on next poll if acknowledged
    }
  }, []);

  /* --- Time ago helper --- */
  function timeAgo(dateStr: string): string {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return "Just now";
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  }

  /* --- Seat color --- */
  function seatColor(status: string): string {
    switch (status) {
      case "waiting":
        return "bg-amber-400 border-amber-500 text-amber-900";
      case "served":
        return "bg-emerald-400 border-eco text-emerald-900";
      default:
        return "bg-gray-200 t-border t-text-muted";
    }
  }

  /* ========== Render ========== */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 t-border border-t-emerald-500" />
          <p className="text-lg font-medium t-text-secondary">Loading tables...</p>
        </div>
      </div>
    );
  }

  if (error && tables.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="text-center">
          <p className="mb-4 text-lg text-red-600">{error}</p>
          <button
            onClick={fetchData}
            className="min-h-[48px] rounded-xl bg-eco px-8 py-3 text-lg font-semibold text-white"
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
      <div className="sticky top-0 z-10 border-b t-border bg-white px-4 py-4">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-xl font-bold t-text">
            My Tables
          </h1>
          <p className="text-sm t-text-muted">
            {tables.length} table{tables.length !== 1 ? "s" : ""} assigned
          </p>
        </div>
      </div>

      {/* Waiter Requests Banner */}
      {waiterRequests.length > 0 && (
        <div className="mx-auto max-w-2xl px-4 pt-3">
          <div className="rounded-xl border-2 border-orange-300 bg-orange-50 p-3">
            <div className="mb-2 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-orange-500" />
              </span>
              <h3 className="text-sm font-bold text-orange-800">
                {waiterRequests.length} Waiter Request{waiterRequests.length !== 1 ? "s" : ""}
              </h3>
            </div>
            <div className="space-y-2">
              {waiterRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-sm"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Table {req.table_number}, Seat {req.seat_number}
                    </p>
                    <p className="text-xs text-gray-500">{timeAgo(req.created_at)}</p>
                  </div>
                  <button
                    onClick={() => acknowledgeRequest(req.id)}
                    className="rounded-lg bg-eco px-3 py-1.5 text-xs font-bold text-white active:bg-eco-dark"
                  >
                    On it
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mx-auto max-w-2xl px-4 py-3">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-gray-200 border t-border" />
            <span className="t-text-muted">No order</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-amber-400 border border-amber-500" />
            <span className="t-text-muted">Waiting</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-emerald-400 border border-eco" />
            <span className="t-text-muted">Served</span>
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="mx-auto max-w-2xl px-4 py-2 space-y-6">
        {tables.map((table) => (
          <div
            key={table.table_number}
            className="rounded-xl border-2 t-border bg-white p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold t-text">
                Table {table.table_number}
              </h2>
            </div>

            {/* Seats Grid */}
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
              {table.seats.map((seat) => (
                <button
                  key={seat.seat_number}
                  onClick={() =>
                    seat.status !== "empty"
                      ? setSelectedSeat({ table: table.table_number, seat })
                      : null
                  }
                  className={`relative flex h-12 w-12 items-center justify-center rounded-lg border-2 text-sm font-bold ${seatColor(
                    seat.status
                  )} ${seat.status !== "empty" ? "cursor-pointer" : "cursor-default"}`}
                >
                  {seat.seat_number}
                  {/* Wait time badge */}
                  {seat.status === "waiting" && seat.wait_minutes !== undefined && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                      {seat.wait_minutes}m
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Seat Detail Modal */}
      {selectedSeat && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
          <div className="w-full max-w-md rounded-t-2xl bg-white p-6 sm:rounded-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold t-text">
                Table {selectedSeat.table}, Seat {selectedSeat.seat.seat_number}
              </h2>
              <button
                onClick={() => setSelectedSeat(null)}
                className="flex h-11 w-11 items-center justify-center rounded-lg text-2xl t-text-muted"
              >
                &times;
              </button>
            </div>

            {selectedSeat.seat.order_number && (
              <p className="mb-2 text-base t-text-muted">
                Order: #{selectedSeat.seat.order_number}
              </p>
            )}

            <p className="mb-2 text-base font-medium">
              Status:{" "}
              <span
                className={`font-bold ${
                  selectedSeat.seat.status === "waiting"
                    ? "text-amber-600"
                    : selectedSeat.seat.status === "served"
                    ? "text-eco-dark"
                    : "t-text-muted"
                }`}
              >
                {selectedSeat.seat.status.toUpperCase()}
              </span>
            </p>

            {selectedSeat.seat.wait_minutes !== undefined && (
              <p className="mb-2 text-base t-text-muted">
                Waiting: {selectedSeat.seat.wait_minutes} min
              </p>
            )}

            <button
              onClick={() => setSelectedSeat(null)}
              className="mt-6 min-h-[48px] w-full rounded-xl t-bg-secondary px-6 py-3 text-base font-semibold t-text-secondary active:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-6 text-center">
        <p className="text-xs t-text-faint">Powered by No Ojoro</p>
      </div>
    </div>
  );
}
