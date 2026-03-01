"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

/* ---------- Types (matching backend response) ---------- */

interface BackendInventoryItem {
  name: string;
  total: number;
  remaining: number;
  is_available: boolean;
  usage_percent: number;
}

interface BackendCategory {
  category: string;
  is_vip_only: boolean;
  items: BackendInventoryItem[];
}

interface InventoryResponse {
  inventory: BackendCategory[];
}

/* ---------- Display item used internally ---------- */

interface InventoryItem {
  name: string;
  category: string;
  total: number;
  remaining: number;
  served: number;
}

/* ========== Component ========== */

export default function InventoryMonitorPage() {
  const params = useParams<{ id: string }>();
  const eventId = params.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Record<string, InventoryItem[]>>({});

  const fetchInventory = useCallback(async () => {
    try {
      const result = await api.get<InventoryResponse>(
        `/api/events/${eventId}/dashboard/inventory`
      );

      // Flatten backend response into grouped categories
      const grouped: Record<string, InventoryItem[]> = {};
      for (const cat of result.inventory) {
        grouped[cat.category] = cat.items.map((item) => ({
          name: item.name,
          category: cat.category,
          total: item.total,
          remaining: item.remaining,
          served: item.total - item.remaining,
        }));
      }
      setCategories(grouped);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchInventory();
    const interval = setInterval(fetchInventory, 5000);
    return () => clearInterval(interval);
  }, [fetchInventory]);

  /* --- Status helpers --- */
  function getPercent(item: InventoryItem): number {
    return item.total > 0 ? Math.round((item.remaining / item.total) * 100) : 0;
  }

  function getBarColor(item: InventoryItem): string {
    const pct = getPercent(item);
    if (pct === 0) return "bg-red-500";
    if (pct < 20) return "bg-amber-500";
    return "bg-[#8BC34A]";
  }

  function getBorderColor(item: InventoryItem): string {
    const pct = getPercent(item);
    if (pct === 0) return "border-red-300 bg-red-50";
    if (pct < 20) return "border-amber-300 bg-amber-50";
    return "border-[#E3E8E1] bg-white";
  }

  /* ========== Render ========== */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#E3E8E1] border-t-emerald-500" />
          <p className="text-lg font-medium text-[#3A3D37]">Loading inventory...</p>
        </div>
      </div>
    );
  }

  if (error && Object.keys(categories).length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="text-center">
          <p className="mb-4 text-lg text-red-600">{error}</p>
          <button
            onClick={fetchInventory}
            className="rounded-xl bg-[#8BC34A] px-8 py-3 text-lg font-semibold text-white"
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
      <div className="border-b border-[#E3E8E1] px-4 py-4">
        <div className="mx-auto max-w-2xl">
          <Link
            href={`/dashboard/events/${eventId}/live`}
            className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-[#7CB342]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-xl font-bold text-[#1C1F1A]">
            Inventory Monitor
          </h1>
        </div>
      </div>

      {/* Legend */}
      <div className="mx-auto max-w-2xl px-4 py-3">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-6 rounded bg-[#8BC34A]" />
            <span className="text-[#6B7366]">Healthy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-6 rounded bg-amber-500" />
            <span className="text-[#6B7366]">&lt; 20% left</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-6 rounded bg-red-500" />
            <span className="text-[#6B7366]">Depleted</span>
          </div>
        </div>
      </div>

      {/* Inventory Items */}
      <div className="mx-auto max-w-2xl px-4 py-2">
        {Object.entries(categories).map(([category, items]) => (
          <div key={category} className="mb-6">
            <h2 className="mb-3 text-lg font-bold text-[#1C1F1A]">{category}</h2>
            <div className="space-y-3">
              {items.map((item) => {
                const pct = getPercent(item);
                return (
                  <div
                    key={item.name}
                    className={`rounded-xl border-2 p-4 ${getBorderColor(item)}`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-base font-semibold text-[#1C1F1A]">
                        {item.name}
                      </span>
                      <span className="text-sm font-medium text-[#6B7366]">
                        {item.remaining}/{item.total}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getBarColor(item)}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="mt-1 flex items-center justify-between text-sm">
                      <span className="text-[#6B7366]">
                        {item.served} served
                      </span>
                      <span
                        className={`font-medium ${
                          pct === 0
                            ? "text-red-600"
                            : pct < 20
                            ? "text-amber-600"
                            : "text-[#7CB342]"
                        }`}
                      >
                        {pct === 0
                          ? "DEPLETED"
                          : pct < 20
                          ? `LOW - ${pct}%`
                          : `${pct}% remaining`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-6 text-center">
        <p className="text-xs text-[#9CA396]">Powered by No Ojoro</p>
      </div>
    </div>
  );
}
