"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/* ---------- Types ---------- */

interface DashboardData {
  event_name: string;
  event_status: string;
  event_date: string | null;
  venue_name: string;
  party_id: string | null;
  table_count: number;
  guests_per_table: number;
  total_guests: number;
  primary_color: string | null;
  secondary_color: string | null;
  staff_count: number;
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

interface StaffMember {
  staff_name: string;
  table_range: string;
  confirmations: number;
  out_of_range_flags: number;
}

interface InventoryItem {
  name: string;
  total: number;
  remaining: number;
  is_available: boolean;
  usage_percent: number;
}

interface InventoryCategory {
  category: string;
  is_vip_only: boolean;
  items: InventoryItem[];
}

/* ========== Component ========== */

export default function PublicLiveEventPage() {
  const params = useParams<{ event_id: string }>();
  const eventId = params.event_id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<DashboardData | null>(null);
  const [tables, setTables] = useState<TableStatus[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [inventory, setInventory] = useState<InventoryCategory[]>([]);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchAll = useCallback(async () => {
    try {
      const [dashRes, tablesRes, staffRes, invRes] = await Promise.all([
        fetch(`${API_URL}/api/events/${eventId}/dashboard/public`, { credentials: "include" }),
        fetch(`${API_URL}/api/events/${eventId}/tables/status`, { credentials: "include" }),
        fetch(`${API_URL}/api/events/${eventId}/staff/public`, { credentials: "include" }),
        fetch(`${API_URL}/api/events/${eventId}/inventory/public`, { credentials: "include" }),
      ]);

      if (!dashRes.ok) throw new Error("Event not found or not accessible");

      const dashData = await dashRes.json();
      setData(dashData);

      if (tablesRes.ok) {
        const t = await tablesRes.json();
        setTables(t.tables || []);
      }
      if (staffRes.ok) {
        const s = await staffRes.json();
        setStaff(s.staff_performance || []);
      }
      if (invRes.ok) {
        const inv = await invRes.json();
        setInventory(inv.inventory || []);
      }

      setLastRefresh(new Date());
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load event");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  /* --- Auto-refresh every 5s --- */
  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 5000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  /* --- Computed values --- */
  const used = data ? data.tokens.burned + data.tokens.served : 0;
  const remaining = data ? data.tokens.total - used : 0;
  const tokenPercent = data ? Math.round(data.tokens.usage_percent) : 0;

  const totalServedSeats = tables.reduce((s, t) => s + t.served_seats, 0);
  const totalWaitingSeats = tables.reduce((s, t) => s + t.waiting_seats, 0);
  const totalUnusedSeats = tables.reduce((s, t) => s + t.unused_seats, 0);
  const totalAllSeats = tables.reduce((s, t) => s + t.total_seats, 0);

  const totalConfirmations = staff.reduce((s, m) => s + m.confirmations, 0);
  const totalFlags = staff.reduce((s, m) => s + m.out_of_range_flags, 0);

  /* --- Progress ring --- */
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - tokenPercent / 100);

  /* ========== Loading ========== */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mx-auto h-12 w-12 rounded-full border-4 border-neutral-700 border-t-emerald-500 animate-spin" />
          <p className="text-lg text-neutral-400">Loading live dashboard...</p>
        </div>
      </div>
    );
  }

  /* ========== Error ========== */
  if (error && !data) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
            <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Event Not Found</h1>
          <p className="text-neutral-400">{error}</p>
          <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 font-semibold text-white hover:bg-emerald-600 transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const statusColor = data?.event_status === "active"
    ? "bg-emerald-500"
    : data?.event_status === "completed"
    ? "bg-neutral-500"
    : "bg-amber-500";

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-NG", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  /* ========== Render ========== */
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      {/* ═══════════ HEADER ═══════════ */}
      <header className="border-b border-neutral-800 bg-[#111111]">
        <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {/* Logo */}
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold sm:text-2xl">{data?.event_name || "Event"}</h1>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-400">
                  <span>{data?.venue_name}</span>
                  <span className="hidden sm:inline">·</span>
                  <span>{formatDate(data?.event_date ?? null)}</span>
                  {data?.party_id && (
                    <>
                      <span className="hidden sm:inline">·</span>
                      <span className="font-mono text-emerald-400">{data.party_id}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${statusColor} text-white`}>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                </span>
                {data?.event_status || "—"}
              </div>
              <div className="text-xs text-neutral-500">
                Updated {lastRefresh.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 space-y-6">

        {/* ═══════════ KEY METRICS BAR ═══════════ */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <MetricCard label="Total Guests" value={data?.total_guests ?? 0} icon="users" />
          <MetricCard label="Tokens Used" value={`${tokenPercent}%`} sub={`${used} / ${data?.tokens.total ?? 0}`} icon="token" color="emerald" />
          <MetricCard label="Orders Waiting" value={data?.orders.waiting ?? 0} icon="clock" color={data && data.orders.waiting > 0 ? "amber" : undefined} />
          <MetricCard label="Orders Served" value={data?.orders.served ?? 0} icon="check" color="emerald" />
          <MetricCard label="Waiter Requests" value={data?.pending_waiter_requests ?? 0} icon="bell" color={data && data.pending_waiter_requests > 0 ? "red" : undefined} />
          <MetricCard label="Staff On Duty" value={data?.staff_count ?? 0} icon="staff" />
        </div>

        {/* ═══════════ TOKEN USAGE + TABLE SUMMARY ═══════════ */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Token ring */}
          <div className="rounded-2xl border border-neutral-800 bg-[#111111] p-6 flex flex-col items-center justify-center">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-neutral-500">Token Usage</h2>
            <div className="relative h-32 w-32">
              <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={radius} fill="none" stroke="#262626" strokeWidth="8" />
                <circle cx="60" cy="60" r={radius} fill="none" stroke="#22C55E" strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-700" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{tokenPercent}%</span>
                <span className="text-xs text-neutral-500">used</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center w-full">
              <div>
                <p className="text-lg font-bold">{data?.tokens.total ?? 0}</p>
                <p className="text-xs text-neutral-500">Total</p>
              </div>
              <div>
                <p className="text-lg font-bold text-emerald-400">{used}</p>
                <p className="text-xs text-neutral-500">Used</p>
              </div>
              <div>
                <p className="text-lg font-bold text-amber-400">{remaining}</p>
                <p className="text-xs text-neutral-500">Remaining</p>
              </div>
            </div>
          </div>

          {/* Table overview summary */}
          <div className="rounded-2xl border border-neutral-800 bg-[#111111] p-6 lg:col-span-2">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-neutral-500">
              Tables Overview — {tables.length} Tables · {totalAllSeats} Seats
            </h2>

            {/* Summary bar */}
            <div className="mb-4">
              <div className="flex h-4 w-full overflow-hidden rounded-full bg-neutral-800">
                {totalAllSeats > 0 && (
                  <>
                    <div className="bg-emerald-500 transition-all duration-500" style={{ width: `${(totalServedSeats / totalAllSeats) * 100}%` }} />
                    <div className="bg-amber-500 transition-all duration-500" style={{ width: `${(totalWaitingSeats / totalAllSeats) * 100}%` }} />
                  </>
                )}
              </div>
              <div className="mt-2 flex gap-6 text-sm">
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-emerald-500" />
                  Served: {totalServedSeats}
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-amber-500" />
                  Waiting: {totalWaitingSeats}
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-neutral-700" />
                  Unused: {totalUnusedSeats}
                </span>
              </div>
            </div>

            {/* Mini table grid */}
            {tables.length === 0 ? (
              <p className="text-sm text-neutral-500 text-center py-4">No tables configured</p>
            ) : (
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
                {tables.map((table) => {
                  const pct = table.total_seats > 0 ? Math.round((table.served_seats / table.total_seats) * 100) : 0;
                  const hasWaiting = table.waiting_seats > 0;
                  const allServed = pct === 100;
                  const borderColor = allServed
                    ? "border-emerald-500/50"
                    : hasWaiting
                    ? "border-amber-500/50"
                    : "border-neutral-700";
                  const bgColor = allServed
                    ? "bg-emerald-500/10"
                    : hasWaiting
                    ? "bg-amber-500/10"
                    : "bg-neutral-800/50";

                  return (
                    <div key={table.table_number} className={`rounded-xl border ${borderColor} ${bgColor} p-2 text-center`}>
                      <p className="text-xs font-bold text-neutral-300">T{table.table_number}</p>
                      <p className="text-lg font-bold">{pct}%</p>
                      <div className="mt-1 flex justify-center gap-1 text-[10px]">
                        <span className="text-emerald-400">{table.served_seats}</span>
                        <span className="text-neutral-600">/</span>
                        <span className="text-neutral-400">{table.total_seats}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ═══════════ TABLE DETAIL GRID ═══════════ */}
        {tables.length > 0 && (
          <div className="rounded-2xl border border-neutral-800 bg-[#111111] overflow-hidden">
            <div className="border-b border-neutral-800 px-6 py-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
                Table-by-Table Status
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-800 text-left text-xs uppercase tracking-wider text-neutral-500">
                    <th className="px-6 py-3 font-medium">Table</th>
                    <th className="px-6 py-3 font-medium text-center">Total Seats</th>
                    <th className="px-6 py-3 font-medium text-center">Served</th>
                    <th className="px-6 py-3 font-medium text-center">Waiting</th>
                    <th className="px-6 py-3 font-medium text-center">Unused</th>
                    <th className="px-6 py-3 font-medium">Progress</th>
                    <th className="px-6 py-3 font-medium text-right">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {tables.map((table) => {
                    const pct = table.total_seats > 0 ? Math.round((table.served_seats / table.total_seats) * 100) : 0;
                    return (
                      <tr key={table.table_number} className="hover:bg-neutral-800/30 transition-colors">
                        <td className="px-6 py-3 font-semibold">Table {table.table_number}</td>
                        <td className="px-6 py-3 text-center text-neutral-300">{table.total_seats}</td>
                        <td className="px-6 py-3 text-center">
                          <span className="text-emerald-400 font-medium">{table.served_seats}</span>
                        </td>
                        <td className="px-6 py-3 text-center">
                          {table.waiting_seats > 0 ? (
                            <span className="text-amber-400 font-medium">{table.waiting_seats}</span>
                          ) : (
                            <span className="text-neutral-600">0</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-center text-neutral-500">{table.unused_seats}</td>
                        <td className="px-6 py-3">
                          <div className="h-2 w-full max-w-[120px] overflow-hidden rounded-full bg-neutral-800">
                            <div className="h-2 rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${pct}%` }} />
                          </div>
                        </td>
                        <td className="px-6 py-3 text-right font-mono font-medium">{pct}%</td>
                      </tr>
                    );
                  })}
                </tbody>
                {/* Totals row */}
                <tfoot>
                  <tr className="border-t-2 border-neutral-700 bg-neutral-800/30 font-semibold">
                    <td className="px-6 py-3">Total</td>
                    <td className="px-6 py-3 text-center">{totalAllSeats}</td>
                    <td className="px-6 py-3 text-center text-emerald-400">{totalServedSeats}</td>
                    <td className="px-6 py-3 text-center text-amber-400">{totalWaitingSeats}</td>
                    <td className="px-6 py-3 text-center text-neutral-500">{totalUnusedSeats}</td>
                    <td className="px-6 py-3">
                      <div className="h-2 w-full max-w-[120px] overflow-hidden rounded-full bg-neutral-800">
                        <div className="h-2 rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${totalAllSeats > 0 ? Math.round((totalServedSeats / totalAllSeats) * 100) : 0}%` }} />
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right font-mono">{totalAllSeats > 0 ? Math.round((totalServedSeats / totalAllSeats) * 100) : 0}%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* ═══════════ STAFF PERFORMANCE ═══════════ */}
        <div className="rounded-2xl border border-neutral-800 bg-[#111111] overflow-hidden">
          <div className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
              Staff Performance
            </h2>
            <span className="text-xs text-neutral-600">{staff.length} staff members</span>
          </div>

          {staff.length === 0 ? (
            <div className="px-6 py-10 text-center text-neutral-500">
              <svg className="mx-auto mb-3 h-8 w-8 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              <p className="text-sm">No staff assigned to this event</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-800 text-left text-xs uppercase tracking-wider text-neutral-500">
                    <th className="px-6 py-3 font-medium">#</th>
                    <th className="px-6 py-3 font-medium">Staff Name</th>
                    <th className="px-6 py-3 font-medium">Table Range</th>
                    <th className="px-6 py-3 font-medium text-center">Orders Confirmed</th>
                    <th className="px-6 py-3 font-medium text-center">Out-of-Range Flags</th>
                    <th className="px-6 py-3 font-medium text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {staff.map((member, idx) => (
                    <tr key={idx} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="px-6 py-3 text-neutral-500">{idx + 1}</td>
                      <td className="px-6 py-3 font-semibold">{member.staff_name}</td>
                      <td className="px-6 py-3">
                        <span className="rounded-full bg-neutral-800 px-3 py-1 text-xs font-mono text-neutral-300">
                          Tables {member.table_range}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className="text-emerald-400 font-semibold">{member.confirmations}</span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        {member.out_of_range_flags > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-400">
                            {member.out_of_range_flags}
                          </span>
                        ) : (
                          <span className="text-neutral-600">0</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-center">
                        {member.out_of_range_flags === 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Good
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-400">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                            Flagged
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-neutral-700 bg-neutral-800/30 font-semibold">
                    <td className="px-6 py-3" colSpan={3}>Total</td>
                    <td className="px-6 py-3 text-center text-emerald-400">{totalConfirmations}</td>
                    <td className="px-6 py-3 text-center text-red-400">{totalFlags}</td>
                    <td className="px-6 py-3" />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* ═══════════ MENU / INVENTORY ═══════════ */}
        {inventory.length > 0 && (
          <div className="rounded-2xl border border-neutral-800 bg-[#111111] overflow-hidden">
            <div className="border-b border-neutral-800 px-6 py-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
                Menu Inventory
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-800 text-left text-xs uppercase tracking-wider text-neutral-500">
                    <th className="px-6 py-3 font-medium">Category</th>
                    <th className="px-6 py-3 font-medium">Item</th>
                    <th className="px-6 py-3 font-medium text-center">Total Qty</th>
                    <th className="px-6 py-3 font-medium text-center">Remaining</th>
                    <th className="px-6 py-3 font-medium">Usage</th>
                    <th className="px-6 py-3 font-medium text-center">Available</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {inventory.map((cat) =>
                    cat.items.map((item, idx) => (
                      <tr key={`${cat.category}-${item.name}`} className="hover:bg-neutral-800/30 transition-colors">
                        {idx === 0 ? (
                          <td className="px-6 py-3 font-semibold align-top" rowSpan={cat.items.length}>
                            <div className="flex items-center gap-2">
                              {cat.category}
                              {cat.is_vip_only && (
                                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 uppercase">VIP</span>
                              )}
                            </div>
                          </td>
                        ) : null}
                        <td className="px-6 py-3 text-neutral-300">{item.name}</td>
                        <td className="px-6 py-3 text-center text-neutral-400">{item.total}</td>
                        <td className="px-6 py-3 text-center">
                          <span className={item.remaining <= 0 ? "text-red-400 font-semibold" : item.remaining <= item.total * 0.2 ? "text-amber-400 font-semibold" : "text-neutral-300"}>
                            {item.remaining}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-full max-w-[100px] overflow-hidden rounded-full bg-neutral-800">
                              <div
                                className={`h-2 rounded-full transition-all duration-500 ${item.usage_percent >= 90 ? "bg-red-500" : item.usage_percent >= 70 ? "bg-amber-500" : "bg-emerald-500"}`}
                                style={{ width: `${item.usage_percent}%` }}
                              />
                            </div>
                            <span className="text-xs font-mono text-neutral-500 w-10 text-right">{item.usage_percent}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-center">
                          {item.is_available ? (
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10">
                              <svg className="h-3 w-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            </span>
                          ) : (
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500/10">
                              <svg className="h-3 w-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-neutral-800 mt-6 px-4 py-6 text-center">
        <p className="text-sm text-neutral-600">
          Live Dashboard · Auto-refreshes every 5 seconds · Powered by{" "}
          <Link href="/" className="font-semibold text-emerald-500 hover:underline">No Ojoro</Link>
        </p>
      </footer>
    </div>
  );
}

/* ═══════════ METRIC CARD ═══════════ */

function MetricCard({
  label,
  value,
  sub,
  icon,
  color,
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon: string;
  color?: "emerald" | "amber" | "red";
}) {
  const iconMap: Record<string, React.JSX.Element> = {
    users: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    token: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
      </svg>
    ),
    clock: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    check: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    bell: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
    staff: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  };

  const borderColor = color === "emerald"
    ? "border-emerald-500/20"
    : color === "amber"
    ? "border-amber-500/20"
    : color === "red"
    ? "border-red-500/20"
    : "border-neutral-800";

  const iconColor = color === "emerald"
    ? "text-emerald-400"
    : color === "amber"
    ? "text-amber-400"
    : color === "red"
    ? "text-red-400"
    : "text-neutral-500";

  const valueColor = color === "emerald"
    ? "text-emerald-400"
    : color === "amber"
    ? "text-amber-400"
    : color === "red"
    ? "text-red-400"
    : "text-white";

  return (
    <div className={`rounded-2xl border ${borderColor} bg-[#111111] p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={iconColor}>{iconMap[icon]}</span>
        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
      {sub && <p className="text-xs text-neutral-500 mt-0.5">{sub}</p>}
    </div>
  );
}
