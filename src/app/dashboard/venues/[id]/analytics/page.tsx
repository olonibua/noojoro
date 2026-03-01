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
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
          {error}
        </div>
        <Link
          href={`/dashboard/venues/${venueId}`}
          className="mt-4 text-sm font-medium text-emerald-600 hover:text-emerald-700"
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Dashboard
            </Link>
            <span className="text-gray-300">/</span>
            <Link
              href={`/dashboard/venues/${venueId}`}
              className="text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Venue
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-semibold text-gray-900">
              Analytics
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="mb-1 text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mb-8 text-sm text-gray-500">
          Revenue, orders, and performance insights.
        </p>

        {/* Summary Cards */}
        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          {/* Total Revenue */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {"\u20A6"}{formatCurrency(analytics.total_revenue)}
            </p>
          </div>

          {/* Total Orders */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-sm font-medium text-gray-500">Total Orders</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {analytics.total_orders.toLocaleString()}
            </p>
          </div>

          {/* Average Order Value */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-sm font-medium text-gray-500">Avg Order Value</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {"\u20A6"}{formatCurrency(analytics.average_order_value)}
            </p>
          </div>
        </div>

        {/* Top Selling Items */}
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Top Selling Items
        </h2>

        {analytics.top_selling_items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
            <p className="text-sm text-gray-500">
              No sales data available yet.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-6 text-sm font-semibold text-gray-700">
              By Quantity Sold
            </h3>
            <div className="space-y-4">
              {analytics.top_selling_items.map((item, index) => (
                <div key={item.name}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-medium text-gray-900">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
                        {index + 1}
                      </span>
                      {item.name}
                    </span>
                    <span className="text-sm font-semibold text-gray-600">
                      {item.total_sold}
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-3 rounded-full bg-emerald-500 transition-all duration-500"
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
          <div className="mt-8 rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-6 py-4">
              <h3 className="text-sm font-semibold text-gray-700">
                Full Ranking
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Item
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Qty Sold
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {analytics.top_selling_items.map((item, index) => (
                    <tr key={item.name} className="hover:bg-gray-50">
                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                            index === 0
                              ? "bg-emerald-100 text-emerald-700"
                              : index === 1
                              ? "bg-emerald-50 text-emerald-600"
                              : index === 2
                              ? "bg-gray-100 text-gray-600"
                              : "text-gray-400"
                          }`}
                        >
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-sm font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-3.5 text-right text-sm font-semibold text-gray-700">
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
