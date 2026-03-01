"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

interface Table {
  id: string;
  table_number: number;
  qr_code_data: string | null;
}

export default function TableConfigPage() {
  const params = useParams();
  const venueId = params.id as string;

  const [tables, setTables] = useState<Table[]>([]);
  const [currentCount, setCurrentCount] = useState(0);
  const [newCount, setNewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    async function fetchTables() {
      try {
        const data = await api.get<Table[]>(
          `/api/venues/${venueId}/tables`
        );
        setTables(data);
        setCurrentCount(data.length);
        setNewCount(data.length);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tables");
      } finally {
        setLoading(false);
      }
    }
    fetchTables();
  }, [venueId]);

  async function handleUpdateCount(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      const data = await api.put<Table[]>(
        `/api/venues/${venueId}/tables`,
        { table_count: newCount }
      );
      setTables(data);
      setCurrentCount(data.length);
      setNewCount(data.length);
      setSuccessMsg("Table count updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update tables");
    } finally {
      setSaving(false);
    }
  }

  async function handleDownloadQR() {
    setDownloading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/venues/${venueId}/tables/qr-pdf`,
        { credentials: "include" }
      );

      if (!response.ok) {
        throw new Error("Failed to download QR PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `venue-${venueId}-qr-codes.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to download QR PDF"
      );
    } finally {
      setDownloading(false);
    }
  }

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
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
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
            <span className="text-sm font-semibold t-text">Tables</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold t-text">
              Tables & QR Codes
            </h1>
            <p className="mt-1 text-sm t-text-muted">
              Configure table count and manage QR codes for each table.
            </p>
          </div>
          <button
            onClick={handleDownloadQR}
            disabled={downloading || tables.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-eco px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-eco-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            {downloading ? "Downloading..." : "Download QR PDF"}
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 rounded-lg border border-neutral-200 bg-neutral-100 px-4 py-3 text-sm text-neutral-700">
            {successMsg}
          </div>
        )}

        {/* Table Count Config */}
        <div className="mb-8 rounded-xl border t-border t-bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold t-text">
            Table Count
          </h2>
          <form
            onSubmit={handleUpdateCount}
            className="flex flex-col gap-4 sm:flex-row sm:items-end"
          >
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium t-text-secondary">
                Current: {currentCount} {currentCount === 1 ? "table" : "tables"}
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={newCount}
                onChange={(e) => setNewCount(Number(e.target.value))}
                className="w-full rounded-lg border t-border t-bg-card px-4 py-2.5 text-sm t-text outline-none focus:border-eco focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <button
              type="submit"
              disabled={saving || newCount === currentCount}
              className="rounded-lg bg-eco px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-eco-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Updating..." : "Update Count"}
            </button>
          </form>
        </div>

        {/* Tables Grid */}
        <h2 className="mb-4 text-lg font-semibold t-text">
          Tables ({tables.length})
        </h2>

        {tables.length === 0 ? (
          <div className="rounded-xl border border-dashed t-border t-bg-card px-6 py-12 text-center">
            <p className="text-sm t-text-muted">
              No tables configured yet. Set a table count above to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {tables.map((table) => (
              <div
                key={table.id}
                className="rounded-xl border t-border t-bg-card p-4 text-center"
              >
                <div className="mb-3 flex h-24 w-full items-center justify-center rounded-lg t-bg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 t-text-faint"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </div>
                <p className="text-sm font-semibold t-text">
                  Table {table.table_number}
                </p>
                <p className="mt-0.5 text-xs t-text-faint">
                  table-{table.table_number}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
