"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";

/* ---------- Types ---------- */

interface BackendOrderItem {
  menu_item_name: string;
  quantity: number;
  price: number | null;
}

interface BackendBarOrder {
  id: string;
  order_number: string;
  table_number: number;
  items: BackendOrderItem[];
  bar_status: string | null;
  created_at: string;
}

interface OrderItem {
  name: string;
  quantity: number;
}

interface BarOrder {
  id: string;
  order_number: string;
  table_number: string;
  items: OrderItem[];
  status: "placed" | "preparing" | "fulfilled";
  created_at: string;
}

/* ---------- Helpers ---------- */

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 60000);
  if (diff < 1) return "just now";
  if (diff < 60) return `${diff}m ago`;
  return `${Math.floor(diff / 60)}h ${diff % 60}m ago`;
}

/* ========== Component ========== */

export default function BarStaffOrdersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<BarOrder[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("bar_staff_token") : null;
    if (!token) {
      router.push("/bar-staff");
      return;
    }

    try {
      const result = await api.get<BackendBarOrder[]>("/api/bar-staff/orders");
      const mapped: BarOrder[] = result.map((o) => ({
        id: o.id,
        order_number: o.order_number,
        table_number: String(o.table_number),
        items: o.items.map((i) => ({
          name: i.menu_item_name,
          quantity: i.quantity,
        })),
        status: (o.bar_status as BarOrder["status"]) || "placed",
        created_at: o.created_at,
      }));
      setOrders(mapped);
      setError("");
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        localStorage.removeItem("bar_staff_token");
        router.push("/bar-staff");
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [router]);

  /* --- Polling --- */
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  /* --- Update order status --- */
  const updateStatus = useCallback(
    async (orderId: string, newStatus: "preparing" | "fulfilled") => {
      setUpdating(orderId);
      try {
        const endpoint = newStatus === "preparing"
          ? `/api/bar-staff/orders/${orderId}/preparing`
          : `/api/bar-staff/orders/${orderId}/fulfill`;
        await api.put(endpoint);
        // Update locally
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, status: newStatus } : o
          )
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Update failed");
      } finally {
        setUpdating(null);
      }
    },
    []
  );

  /* --- Categorize orders --- */
  const placed = orders.filter((o) => o.status === "placed");
  const preparing = orders.filter((o) => o.status === "preparing");
  const fulfilled = orders.filter((o) => o.status === "fulfilled");

  /* ========== Render ========== */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-500" />
          <p className="text-lg font-medium text-gray-700">Loading orders...</p>
        </div>
      </div>
    );
  }

  /* --- Order Card --- */
  function OrderCard({ order }: { order: BarOrder }) {
    const isUpdating = updating === order.id;

    return (
      <div className="rounded-xl border-2 border-gray-200 bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-base font-bold text-gray-900">
            #{order.order_number}
          </span>
          <span className="text-sm text-gray-500">{timeAgo(order.created_at)}</span>
        </div>

        <p className="mb-2 text-sm font-medium text-gray-600">
          Table {order.table_number}
        </p>

        <ul className="mb-3 space-y-1">
          {order.items.map((item, i) => (
            <li key={i} className="text-base text-gray-800">
              {item.quantity}x {item.name}
            </li>
          ))}
        </ul>

        {/* Action buttons */}
        {order.status === "placed" && (
          <button
            onClick={() => updateStatus(order.id, "preparing")}
            disabled={isUpdating}
            className="min-h-[44px] w-full rounded-lg bg-amber-500 px-4 py-2 text-base font-bold text-white active:bg-amber-600 disabled:opacity-50"
          >
            {isUpdating ? "Updating..." : "Start Preparing"}
          </button>
        )}

        {order.status === "preparing" && (
          <button
            onClick={() => updateStatus(order.id, "fulfilled")}
            disabled={isUpdating}
            className="min-h-[44px] w-full rounded-lg bg-emerald-500 px-4 py-2 text-base font-bold text-white active:bg-emerald-600 disabled:opacity-50"
          >
            {isUpdating ? "Updating..." : "Done"}
          </button>
        )}

        {order.status === "fulfilled" && (
          <div className="flex items-center justify-center gap-2 py-2">
            <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-base font-medium text-emerald-600">Fulfilled</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Bar Orders
            </h1>
            <p className="text-sm text-gray-500">
              {placed.length} placed, {preparing.length} preparing, {fulfilled.length} done
            </p>
          </div>
          <button
            onClick={fetchOrders}
            className="min-h-[44px] min-w-[44px] rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 active:bg-gray-100"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-auto max-w-6xl px-4 pt-3">
          <div className="rounded-xl bg-red-50 px-4 py-3 text-base font-medium text-red-700">
            {error}
          </div>
        </div>
      )}

      {/* Three Column Layout */}
      <div className="mx-auto max-w-6xl px-4 py-4">
        {/* Mobile: stacked, Desktop: 3 columns */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Placed */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <h2 className="text-lg font-bold text-gray-900">
                Placed ({placed.length})
              </h2>
            </div>
            <div className="space-y-3">
              {placed.length === 0 ? (
                <p className="rounded-xl border-2 border-dashed border-gray-200 py-8 text-center text-sm text-gray-400">
                  No new orders
                </p>
              ) : (
                placed.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))
              )}
            </div>
          </div>

          {/* Preparing */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-amber-500" />
              <h2 className="text-lg font-bold text-gray-900">
                Preparing ({preparing.length})
              </h2>
            </div>
            <div className="space-y-3">
              {preparing.length === 0 ? (
                <p className="rounded-xl border-2 border-dashed border-gray-200 py-8 text-center text-sm text-gray-400">
                  Nothing preparing
                </p>
              ) : (
                preparing.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))
              )}
            </div>
          </div>

          {/* Fulfilled */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-emerald-500" />
              <h2 className="text-lg font-bold text-gray-900">
                Fulfilled ({fulfilled.length})
              </h2>
            </div>
            <div className="space-y-3">
              {fulfilled.length === 0 ? (
                <p className="rounded-xl border-2 border-dashed border-gray-200 py-8 text-center text-sm text-gray-400">
                  No fulfilled orders
                </p>
              ) : (
                fulfilled.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 text-center">
        <p className="text-xs text-gray-400">Powered by No Ojoro</p>
      </div>
    </div>
  );
}
