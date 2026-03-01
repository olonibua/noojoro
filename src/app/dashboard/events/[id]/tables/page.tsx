"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";

interface TableConfig {
  table_count: number;
  guests_per_table: number;
}

interface Table {
  table_number: number;
  seat_count: number;
  is_vip: boolean;
  vip_tier: string | null;
}

interface EventResponse {
  id: string;
  table_count: number;
  guests_per_table: number;
  tables: Table[];
}

export default function TableConfigPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tables, setTables] = useState<Table[]>([]);

  const [config, setConfig] = useState<TableConfig>({
    table_count: 10,
    guests_per_table: 10,
  });

  const [vipSelections, setVipSelections] = useState<
    Record<number, { checked: boolean; tier: string }>
  >({});

  const fetchTables = useCallback(async () => {
    try {
      const data = await api.get<EventResponse>(`/api/events/${eventId}`);
      setTables(data.tables || []);
      setConfig({
        table_count: data.table_count || data.tables?.length || 10,
        guests_per_table: data.guests_per_table || 10,
      });
      // Initialize VIP selections from existing data
      const vips: Record<number, { checked: boolean; tier: string }> = {};
      (data.tables || []).forEach((t) => {
        if (t.is_vip) {
          vips[t.table_number] = { checked: true, tier: t.vip_tier || "vip" };
        }
      });
      setVipSelections(vips);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tables");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const vip_tables = Object.entries(vipSelections)
        .filter(([, v]) => v.checked)
        .map(([num, v]) => ({
          table_number: parseInt(num),
          vip_tier: v.tier,
        }));

      await api.put(`/api/events/${eventId}/tables`, {
        table_count: config.table_count,
        guests_per_table: config.guests_per_table,
        vip_tables,
      });

      setSuccess("Tables updated successfully!");
      await fetchTables();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update tables");
    } finally {
      setSaving(false);
    }
  };

  const toggleVip = (tableNum: number) => {
    setVipSelections((prev) => {
      const current = prev[tableNum];
      if (current?.checked) {
        const next = { ...prev };
        delete next[tableNum];
        return next;
      }
      return { ...prev, [tableNum]: { checked: true, tier: "vip" } };
    });
  };

  const setVipTier = (tableNum: number, tier: string) => {
    setVipSelections((prev) => ({
      ...prev,
      [tableNum]: { checked: true, tier },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#22C55E]" />
      </div>
    );
  }

  const tableNumbers = Array.from({ length: config.table_count }, (_, i) => i + 1);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <button
          onClick={() => router.push(`/dashboard/events/${eventId}`)}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          &larr; Back to Event
        </button>
      </div>

      <h1 className="text-2xl font-bold text-gray-900">Table Configuration</h1>
      <p className="mt-1 text-sm text-gray-500">
        Set up the number of tables, seats per table, and designate VIP tables.
      </p>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Basic Config */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Basic Setup</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="table_count" className="block text-sm font-medium text-gray-700">
                Number of Tables
              </label>
              <input
                id="table_count"
                type="number"
                min={1}
                max={500}
                value={config.table_count}
                onChange={(e) =>
                  setConfig((p) => ({ ...p, table_count: parseInt(e.target.value) || 1 }))
                }
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-[#22C55E] focus:outline-none focus:ring-1 focus:ring-[#22C55E]"
              />
            </div>
            <div>
              <label htmlFor="guests_per_table" className="block text-sm font-medium text-gray-700">
                Guests per Table
              </label>
              <input
                id="guests_per_table"
                type="number"
                min={1}
                max={50}
                value={config.guests_per_table}
                onChange={(e) =>
                  setConfig((p) => ({ ...p, guests_per_table: parseInt(e.target.value) || 1 }))
                }
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-[#22C55E] focus:outline-none focus:ring-1 focus:ring-[#22C55E]"
              />
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-500">
            Total seats: {config.table_count * config.guests_per_table}
          </p>
        </div>

        {/* VIP Table Designation */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">VIP Table Designation</h2>
          <p className="mt-1 text-sm text-gray-500">
            Select which tables are VIP and choose the tier.
          </p>

          <div className="mt-4 grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {tableNumbers.map((num) => {
              const isVip = vipSelections[num]?.checked;
              const tier = vipSelections[num]?.tier || "vip";
              return (
                <div
                  key={num}
                  className={`rounded-lg border p-3 transition-colors ${
                    isVip
                      ? "border-[#22C55E] bg-[#22C55E]/5"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!isVip}
                      onChange={() => toggleVip(num)}
                      className="h-4 w-4 rounded border-gray-300 text-[#22C55E] focus:ring-[#22C55E]"
                    />
                    <span className="text-sm font-medium text-gray-900">Table {num}</span>
                  </label>
                  {isVip && (
                    <select
                      value={tier}
                      onChange={(e) => setVipTier(num, e.target.value)}
                      className="mt-2 block w-full rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 focus:border-[#22C55E] focus:outline-none"
                    >
                      <option value="vip">VIP</option>
                      <option value="vvip">VVIP</option>
                    </select>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[#22C55E] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#16A34A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? "Saving..." : "Save Table Configuration"}
          </button>
        </div>
      </form>

      {/* Current Tables Display */}
      {tables.length > 0 && (
        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Current Tables</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-3 py-2 text-left font-medium text-gray-500">Table #</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">Seats</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">VIP</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">Tier</th>
                </tr>
              </thead>
              <tbody>
                {tables.map((t) => (
                  <tr key={t.table_number} className="border-b border-gray-100">
                    <td className="px-3 py-2 text-gray-900">{t.table_number}</td>
                    <td className="px-3 py-2 text-gray-600">{t.seat_count}</td>
                    <td className="px-3 py-2">
                      {t.is_vip ? (
                        <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                          Yes
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-gray-600 uppercase text-xs">
                      {t.vip_tier || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
