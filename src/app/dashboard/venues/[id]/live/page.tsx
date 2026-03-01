"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

interface BackendDashboardData {
  orders: {
    placed: number;
    preparing: number;
    fulfilled: number;
  };
  revenue: number;
}

interface DashboardData {
  orders_placed: number;
  orders_preparing: number;
  orders_fulfilled: number;
  total_revenue: number;
}

interface BackendInventoryItem {
  name: string;
  price: number | null;
  total: number;
  remaining: number;
  is_available: boolean;
}

interface BackendCategory {
  category: string;
  items: BackendInventoryItem[];
}

interface InventoryResponse {
  inventory: BackendCategory[];
}

interface InventoryItem {
  name: string;
  total: number;
  remaining: number;
  is_available: boolean;
}

export default function LiveDashboardPage() {
  const params = useParams();
  const venueId = params.id as string;

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [rawDash, invData] = await Promise.all([
        api.get<BackendDashboardData>(`/api/venues/${venueId}/dashboard`),
        api.get<InventoryResponse>(
          `/api/venues/${venueId}/dashboard/inventory`
        ),
      ]);
      setDashboard({
        orders_placed: rawDash.orders.placed,
        orders_preparing: rawDash.orders.preparing,
        orders_fulfilled: rawDash.orders.fulfilled,
        total_revenue: rawDash.revenue,
      });
      // Flatten nested categories into a single inventory list
      const flatItems: InventoryItem[] = invData.inventory.flatMap((cat) =>
        cat.items.map((item) => ({
          name: item.name,
          total: item.total,
          remaining: item.remaining,
          is_available: item.is_available,
        }))
      );
      setInventory(flatItems);
      setLastUpdated(new Date());
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [venueId]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [fetchData]);

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-NG").format(amount);
  }

  const lowStockItems = inventory.filter(
    (item) => item.remaining > 0 && item.remaining <= Math.ceil(item.total * 0.2) && item.is_available
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center t-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen t-bg">
      {/* Header */}
      <header className="border-b t-border t-bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm font-medium t-text-muted hover:t-text-secondary"
            >
              Dashboard
            </Link>
            <span className="t-text-faint">/</span>
            <Link
              href={`/dashboard/venues/${venueId}`}
              className="text-sm font-medium t-text-muted hover:t-text-secondary"
            >
              Venue
            </Link>
            <span className="t-text-faint">/</span>
            <span className="text-sm font-semibold t-text">Live</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-eco" />
            </span>
            <span className="text-xs t-text-muted">
              {lastUpdated
                ? `Updated ${lastUpdated.toLocaleTimeString()}`
                : "Connecting..."}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="mb-1 text-2xl font-bold t-text">
          Live Dashboard
        </h1>
        <p className="mb-8 text-sm t-text-muted">
          Real-time orders, revenue, and inventory. Auto-refreshes every 3
          seconds.
        </p>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <span className="text-sm font-semibold text-amber-800">
                Low Stock Alert
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {lowStockItems.map((item) => (
                <span
                  key={item.name}
                  className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800"
                >
                  {item.name} ({item.remaining} left)
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Order Stats */}
        {dashboard && (
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Placed */}
            <div className="rounded-xl border t-border t-bg-card p-5">
              <p className="text-sm font-medium t-text-muted">
                Orders Placed
              </p>
              <p className="mt-2 text-3xl font-bold t-text">
                {dashboard.orders_placed}
              </p>
              <div className="mt-2 h-1 w-full rounded-full t-bg-secondary">
                <div
                  className="h-1 rounded-full bg-blue-500"
                  style={{
                    width: `${
                      dashboard.orders_placed
                        ? Math.min(
                            (dashboard.orders_placed /
                              (dashboard.orders_placed +
                                dashboard.orders_preparing +
                                dashboard.orders_fulfilled || 1)) *
                              100,
                            100
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Preparing */}
            <div className="rounded-xl border t-border t-bg-card p-5">
              <p className="text-sm font-medium t-text-muted">Preparing</p>
              <p className="mt-2 text-3xl font-bold text-amber-600">
                {dashboard.orders_preparing}
              </p>
              <div className="mt-2 h-1 w-full rounded-full t-bg-secondary">
                <div
                  className="h-1 rounded-full bg-amber-500"
                  style={{
                    width: `${
                      dashboard.orders_preparing
                        ? Math.min(
                            (dashboard.orders_preparing /
                              (dashboard.orders_placed +
                                dashboard.orders_preparing +
                                dashboard.orders_fulfilled || 1)) *
                              100,
                            100
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Fulfilled */}
            <div className="rounded-xl border t-border t-bg-card p-5">
              <p className="text-sm font-medium t-text-muted">Fulfilled</p>
              <p className="mt-2 text-3xl font-bold text-neutral-700">
                {dashboard.orders_fulfilled}
              </p>
              <div className="mt-2 h-1 w-full rounded-full t-bg-secondary">
                <div
                  className="h-1 rounded-full bg-eco"
                  style={{
                    width: `${
                      dashboard.orders_fulfilled
                        ? Math.min(
                            (dashboard.orders_fulfilled /
                              (dashboard.orders_placed +
                                dashboard.orders_preparing +
                                dashboard.orders_fulfilled || 1)) *
                              100,
                            100
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Revenue */}
            <div className="rounded-xl border border-neutral-200 bg-neutral-100 p-5">
              <p className="text-sm font-medium text-neutral-700">
                Total Revenue
              </p>
              <p className="mt-2 text-3xl font-bold text-neutral-700">
                {"\u20A6"}{formatCurrency(dashboard.total_revenue)}
              </p>
              <p className="mt-2 text-xs text-neutral-700">Live total</p>
            </div>
          </div>
        )}

        {/* Inventory */}
        <h2 className="mb-4 text-lg font-semibold t-text">
          Inventory Levels
        </h2>

        {inventory.length === 0 ? (
          <div className="rounded-xl border border-dashed t-border t-bg-card px-6 py-12 text-center">
            <p className="text-sm t-text-muted">
              No inventory items found. Add items to your menu first.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border t-border t-bg-card">
            <table className="w-full">
              <thead>
                <tr className="border-b t-border/50 t-bg">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider t-text-muted">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider t-text-muted">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider t-text-muted">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {inventory.map((item) => {
                  const pct = item.total > 0 ? Math.round((item.remaining / item.total) * 100) : 0;
                  const isOut = item.remaining === 0;
                  const isLow = !isOut && pct < 20;

                  return (
                    <tr key={item.name} className="hover:t-bg">
                      <td className="px-6 py-3.5 text-sm font-medium t-text">
                        {item.name}
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-sm font-semibold ${
                              isOut
                                ? "text-red-600"
                                : isLow
                                ? "text-amber-600"
                                : "t-text"
                            }`}
                          >
                            {item.remaining}/{item.total}
                          </span>
                          <div className="h-2 w-24 rounded-full t-bg-secondary">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                isOut
                                  ? "bg-red-500"
                                  : isLow
                                  ? "bg-amber-500"
                                  : "bg-eco"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        {!item.is_available ? (
                          <span className="inline-flex rounded-full t-bg-secondary px-2.5 py-0.5 text-xs font-medium t-text-muted">
                            Unavailable
                          </span>
                        ) : isOut ? (
                          <span className="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700">
                            In Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
