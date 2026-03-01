"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

/* ---------- Types (matching backend response) ---------- */

interface BackendStaffMember {
  staff_name: string;
  table_range: string;
  confirmations: number;
  out_of_range_flags: number;
}

interface StaffPerformanceResponse {
  staff_performance: BackendStaffMember[];
}

/* ========== Component ========== */

export default function StaffPerformancePage() {
  const params = useParams<{ id: string }>();
  const eventId = params.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [staffList, setStaffList] = useState<BackendStaffMember[]>([]);

  const fetchStaff = useCallback(async () => {
    try {
      const result = await api.get<StaffPerformanceResponse>(
        `/api/events/${eventId}/dashboard/staff`
      );
      setStaffList(result.staff_performance);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load staff data");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchStaff();
    const interval = setInterval(fetchStaff, 5000);
    return () => clearInterval(interval);
  }, [fetchStaff]);

  /* --- Rank staff by confirmations --- */
  const rankedStaff = [...staffList].sort(
    (a, b) => b.confirmations - a.confirmations
  );

  /* ========== Render ========== */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#E3E8E1] border-t-emerald-500" />
          <p className="text-lg font-medium text-[#3A3D37]">Loading staff data...</p>
        </div>
      </div>
    );
  }

  if (error && staffList.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="text-center">
          <p className="mb-4 text-lg text-red-600">{error}</p>
          <button
            onClick={fetchStaff}
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
            Staff Performance
          </h1>
        </div>
      </div>

      {/* Summary */}
      <div className="mx-auto max-w-2xl px-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border-2 border-[#E3E8E1] p-4 text-center">
            <p className="text-3xl font-bold text-[#1C1F1A]">
              {rankedStaff.length}
            </p>
            <p className="text-sm text-[#6B7366]">Staff Active</p>
          </div>
          <div className="rounded-xl border-2 border-[#E3E8E1] p-4 text-center">
            <p className="text-3xl font-bold text-[#7CB342]">
              {rankedStaff.reduce((s, m) => s + m.confirmations, 0)}
            </p>
            <p className="text-sm text-[#6B7366]">Total Confirmations</p>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="mx-auto max-w-2xl px-4 py-2">
        {/* Mobile cards */}
        <div className="space-y-3 sm:hidden">
          {rankedStaff.map((member, index) => (
            <div
              key={member.staff_name}
              className={`rounded-xl border-2 p-4 ${
                member.out_of_range_flags > 0
                  ? "border-red-200 bg-red-50"
                  : "border-[#E3E8E1] bg-white"
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                      index === 0
                        ? "bg-amber-400 text-amber-900"
                        : index === 1
                        ? "bg-gray-300 text-[#3A3D37]"
                        : index === 2
                        ? "bg-orange-300 text-orange-800"
                        : "bg-[#F0F3EF] text-[#6B7366]"
                    }`}
                  >
                    #{index + 1}
                  </span>
                  <div>
                    <p className="text-base font-bold text-[#1C1F1A]">{member.staff_name}</p>
                    <p className="text-sm text-[#6B7366]">Tables {member.table_range}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-[#6B7366]">Confirmations: </span>
                  <span className="font-bold text-[#7CB342]">
                    {member.confirmations}
                  </span>
                </div>
                <div>
                  <span className="text-[#6B7366]">Flags: </span>
                  <span
                    className={`font-bold ${
                      member.out_of_range_flags > 0
                        ? "text-red-600"
                        : "text-[#9CA396]"
                    }`}
                  >
                    {member.out_of_range_flags}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-hidden rounded-xl border-2 border-[#E3E8E1] sm:block">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-[#E3E8E1] bg-[#F4F6F3]">
                <th className="px-4 py-3 text-sm font-semibold text-[#3A3D37]">Rank</th>
                <th className="px-4 py-3 text-sm font-semibold text-[#3A3D37]">Name</th>
                <th className="px-4 py-3 text-sm font-semibold text-[#3A3D37]">Tables</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-[#3A3D37]">
                  Confirmations
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-[#3A3D37]">
                  Out-of-Range
                </th>
              </tr>
            </thead>
            <tbody>
              {rankedStaff.map((member, index) => (
                <tr
                  key={member.staff_name}
                  className={`border-b border-[#E3E8E1]/50 ${
                    member.out_of_range_flags > 0 ? "bg-red-50" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                        index === 0
                          ? "bg-amber-400 text-amber-900"
                          : index === 1
                          ? "bg-gray-300 text-[#3A3D37]"
                          : index === 2
                          ? "bg-orange-300 text-orange-800"
                          : "bg-[#F0F3EF] text-[#6B7366]"
                      }`}
                    >
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-base font-semibold text-[#1C1F1A]">
                    {member.staff_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#6B7366]">
                    {member.table_range}
                  </td>
                  <td className="px-4 py-3 text-right text-base font-bold text-[#7CB342]">
                    {member.confirmations}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`inline-flex min-w-[28px] items-center justify-center rounded-full px-2 py-0.5 text-sm font-bold ${
                        member.out_of_range_flags > 0
                          ? "bg-red-100 text-red-700"
                          : "text-[#9CA396]"
                      }`}
                    >
                      {member.out_of_range_flags}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rankedStaff.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-[#E3E8E1] py-12 text-center">
            <p className="text-lg text-[#9CA396]">No staff data available</p>
          </div>
        )}
      </div>

      <div className="px-4 py-6 text-center">
        <p className="text-xs text-[#9CA396]">Powered by No Ojoro</p>
      </div>
    </div>
  );
}
