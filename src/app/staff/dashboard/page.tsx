"use client";

import { useState, useEffect, useCallback } from "react";
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

/* ========== Component ========== */

export default function StaffDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<{
    table: string;
    seat: SeatInfo;
  } | null>(null);

  const getToken = useCallback((): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("staff_token");
  }, []);

  const fetchTables = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.push("/staff");
      return;
    }

    try {
      const result = await api.get<BackendTable[]>("/api/staff/tables");
      const statusMap: Record<string, DisplayStatus> = {
        grey: "empty",
        yellow: "waiting",
        green: "served",
      };
      const mapped: TableInfo[] = result.map((t) => ({
        table_number: String(t.table_number),
        seats: t.seats.map((s) => ({
          seat_number: s.seat_number,
          status: statusMap[s.status] || "empty",
          order_number: s.order_number || undefined,
          wait_minutes: s.wait_time_minutes || undefined,
        })),
      }));
      setTables(mapped);
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
    fetchTables();
    const interval = setInterval(fetchTables, 5000);
    return () => clearInterval(interval);
  }, [fetchTables]);

  /* --- Seat color --- */
  function seatColor(status: string): string {
    switch (status) {
      case "waiting":
        return "bg-amber-400 border-amber-500 text-amber-900";
      case "served":
        return "bg-emerald-400 border-eco text-emerald-900";
      default:
        return "bg-gray-200 border-[#E3E8E1] text-[#6B7366]";
    }
  }

  /* ========== Render ========== */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#E3E8E1] border-t-emerald-500" />
          <p className="text-lg font-medium text-[#3A3D37]">Loading tables...</p>
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
            onClick={fetchTables}
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
      <div className="sticky top-0 z-10 border-b border-[#E3E8E1] bg-white px-4 py-4">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-xl font-bold text-[#1C1F1A]">
            My Tables
          </h1>
          <p className="text-sm text-[#6B7366]">
            {tables.length} table{tables.length !== 1 ? "s" : ""} assigned
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="mx-auto max-w-2xl px-4 py-3">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-gray-200 border border-[#E3E8E1]" />
            <span className="text-[#6B7366]">No order</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-amber-400 border border-amber-500" />
            <span className="text-[#6B7366]">Waiting</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-emerald-400 border border-eco" />
            <span className="text-[#6B7366]">Served</span>
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="mx-auto max-w-2xl px-4 py-2 space-y-6">
        {tables.map((table) => (
          <div
            key={table.table_number}
            className="rounded-xl border-2 border-[#E3E8E1] bg-white p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#1C1F1A]">
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
              <h2 className="text-xl font-bold text-[#1C1F1A]">
                Table {selectedSeat.table}, Seat {selectedSeat.seat.seat_number}
              </h2>
              <button
                onClick={() => setSelectedSeat(null)}
                className="flex h-11 w-11 items-center justify-center rounded-lg text-2xl text-[#6B7366]"
              >
                &times;
              </button>
            </div>

            {selectedSeat.seat.order_number && (
              <p className="mb-2 text-base text-[#6B7366]">
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
                    : "text-[#6B7366]"
                }`}
              >
                {selectedSeat.seat.status.toUpperCase()}
              </span>
            </p>

            {selectedSeat.seat.wait_minutes !== undefined && (
              <p className="mb-2 text-base text-[#6B7366]">
                Waiting: {selectedSeat.seat.wait_minutes} min
              </p>
            )}

            <button
              onClick={() => setSelectedSeat(null)}
              className="mt-6 min-h-[48px] w-full rounded-xl bg-[#F0F3EF] px-6 py-3 text-base font-semibold text-[#3A3D37] active:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-6 text-center">
        <p className="text-xs text-[#9CA396]">Powered by No Ojoro</p>
      </div>
    </div>
  );
}
