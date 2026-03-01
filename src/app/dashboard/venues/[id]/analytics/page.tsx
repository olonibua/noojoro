"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

interface TopItem {
  name: string;
  total_sold: number;
}

interface AnalyticsData {
  total_revenue: number;
  total_orders: number;
  average_order_value: number;
  top_selling_items: TopItem[];
}

export default function AnalyticsPage() {
  const params = useParams();
  const venueId = params.id as string;

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const data = await api.get<AnalyticsData>(
          `/api/venues/${venueId}/analytics`
        );
        setAnalytics(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load analytics"
        );
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [venueId]);

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-NG").format(amount);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center t-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center t-bg px-4">
        <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
          {error}
        </div>
        <Link
          href={`/dashboard/venues/${venueId}`}
          className="mt-4 text-sm font-medium text-neutral-700 hover:text-neutral-700"
        >
          Back to Venue
        </Link>
      </div>
    );
  }

  if (!analytics) return null;

  const maxQuantity = Math.max(
    ...analytics.top_selling_items.map((i) => i.total_sold),
    1
  );

  return (
    <div className="min-h-screen t-bg">
      {/* Header */}
      <header className="border-b t-border t-bg-card">
        <div className="mx-auto flex max-w-6xl items-center px-4 py-4 sm:px-6">
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
            <span className="text-sm font-semibold t-text">
              Analytics
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="mb-1 text-2xl font-bold t-text">Analytics</h1>
        <p className="mb-8 text-sm t-text-muted">
          Revenue, orders, and performance insights.
        </p>

        {/* Summary Cards */}
        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          {/* Total Revenue */}
          <div className="rounded-xl border t-border t-bg-card p-6">
            <p className="text-sm font-medium t-text-muted">Total Revenue</p>
            <p className="mt-2 text-3xl font-bold t-text">
              {"\u20A6"}{formatCurrency(analytics.total_revenue)}
            </p>
          </div>

          {/* Total Orders */}
          <div className="rounded-xl border t-border t-bg-card p-6">
            <p className="text-sm font-medium t-text-muted">Total Orders</p>
            <p className="mt-2 text-3xl font-bold t-text">
              {analytics.total_orders.toLocaleString()}
            </p>
          </div>

          {/* Average Order Value */}
          <div className="rounded-xl border t-border t-bg-card p-6">
            <p className="text-sm font-medium t-text-muted">Avg Order Value</p>
            <p className="mt-2 text-3xl font-bold t-text">
              {"\u20A6"}{formatCurrency(analytics.average_order_value)}
            </p>
          </div>
        </div>

        {/* Top Selling Items */}
        <h2 className="mb-4 text-lg font-semibold t-text">
          Top Selling Items
        </h2>

        {analytics.top_selling_items.length === 0 ? (
          <div className="rounded-xl border border-dashed t-border t-bg-card px-6 py-12 text-center">
            <p className="text-sm t-text-muted">
              No sales data available yet.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border t-border t-bg-card p-6">
            <h3 className="mb-6 text-sm font-semibold t-text-secondary">
              By Quantity Sold
            </h3>
            <div className="space-y-4">
              {analytics.top_selling_items.map((item, index) => (
                <div key={item.name}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-medium t-text">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100 text-[10px] font-bold text-neutral-700">
                        {index + 1}
                      </span>
                      {item.name}
                    </span>
                    <span className="text-sm font-semibold t-text-muted">
                      {item.total_sold}
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full t-bg-secondary">
                    <div
                      className="h-3 rounded-full bg-eco transition-all duration-500"
                      style={{
                        width: `${(item.total_sold / maxQuantity) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ranked List */}
        {analytics.top_selling_items.length > 0 && (
          <div className="mt-8 rounded-xl border t-border t-bg-card">
            <div className="border-b t-border/50 px-6 py-4">
              <h3 className="text-sm font-semibold t-text-secondary">
                Full Ranking
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b t-border/50 t-bg">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider t-text-muted">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider t-text-muted">
                      Item
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider t-text-muted">
                      Qty Sold
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {analytics.top_selling_items.map((item, index) => (
                    <tr key={item.name} className="hover:t-bg">
                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                            index === 0
                              ? "bg-neutral-100 text-neutral-700"
                              : index === 1
                              ? "bg-neutral-100 text-neutral-700"
                              : index === 2
                              ? "t-bg-secondary t-text-muted"
                              : "t-text-faint"
                          }`}
                        >
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-sm font-medium t-text">
                        {item.name}
                      </td>
                      <td className="px-6 py-3.5 text-right text-sm font-semibold t-text-secondary">
                        {item.total_sold.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
