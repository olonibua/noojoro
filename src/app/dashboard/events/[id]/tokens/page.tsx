"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface TokenStats {
  total: number;
  active: number;
  burned: number;
  served: number;
  inactive: number;
}

interface PaymentResponse {
  authorization_url: string;
  reference: string;
}

export default function TokenManagementPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [stats, setStats] = useState<TokenStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchStats = useCallback(async () => {
    try {
      const data = await api.get<TokenStats>(`/api/events/${eventId}/tokens/stats`);
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load token stats");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    setSuccess("");
    try {
      await api.post(`/api/events/${eventId}/tokens/generate`);
      setSuccess("Tokens generated successfully!");
      await fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate tokens");
    } finally {
      setGenerating(false);
    }
  };

  const handleActivate = async () => {
    setActivating(true);
    setError("");
    try {
      const data = await api.post<PaymentResponse>(
        `/api/events/${eventId}/tokens/activate`
      );
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        setSuccess("Tokens activated successfully!");
        await fetchStats();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to activate tokens");
    } finally {
      setActivating(false);
    }
  };

  const [downloading, setDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    setDownloading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/api/events/${eventId}/tokens/pdf`, {
        credentials: "include",
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: "Download failed" }));
        throw new Error(err.detail || "Download failed");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tokens-${eventId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download PDF");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 t-border border-t-eco" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <button
          onClick={() => router.push(`/dashboard/events/${eventId}`)}
          className="text-sm t-text-muted hover:t-text-secondary transition-colors"
        >
          &larr; Back to Event
        </button>
      </div>

      <h1 className="text-2xl font-bold t-text">Token Management</h1>
      <p className="mt-1 text-sm t-text-muted">
        Generate, activate, and manage tokens for this event.
      </p>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-neutral-700">
          {success}
        </div>
      )}

      {/* Token Stats */}
      {stats && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border t-border t-bg-card p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide t-text-muted">
              Total Tokens
            </p>
            <p className="mt-2 text-3xl font-bold t-text">{stats.total}</p>
          </div>
          <div className="rounded-xl border t-border t-bg-card p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide t-text-muted">
              Activated
            </p>
            <p className="mt-2 text-3xl font-bold text-neutral-600">{stats.active}</p>
          </div>
          <div className="rounded-xl border t-border t-bg-card p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide t-text-muted">
              Used
            </p>
            <p className="mt-2 text-3xl font-bold t-text">{stats.burned + stats.served}</p>
          </div>
          <div className="rounded-xl border t-border t-bg-card p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide t-text-muted">
              Pending
            </p>
            <p className="mt-2 text-3xl font-bold text-amber-600">{stats.inactive}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 rounded-xl border t-border t-bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold t-text">Actions</h2>
        <div className="mt-4 flex flex-wrap gap-4">
          {/* Generate Tokens — only show when no tokens exist yet */}
          {(!stats || stats.total === 0) && (
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-2 rounded-lg bg-eco px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-eco-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
              {generating ? "Generating..." : "Generate Tokens"}
            </button>
          )}

          {/* Activate (Pay) — only show when there are inactive tokens to activate */}
          {stats && stats.inactive > 0 && (
            <button
              onClick={handleActivate}
              disabled={activating}
              className="flex items-center gap-2 rounded-lg border-2 border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-600 transition-colors hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
              {activating ? "Processing..." : "Activate Tokens (Pay)"}
            </button>
          )}

          {/* Tokens activated badge */}
          {stats && stats.inactive === 0 && stats.active > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-5 py-3 text-sm font-semibold text-neutral-700">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Tokens Activated
            </div>
          )}

          {/* Download PDF */}
          {stats && stats.total > 0 && (
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="flex items-center gap-2 rounded-lg border t-border px-5 py-3 text-sm font-semibold t-text-secondary transition-colors hover:t-bg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              {downloading ? "Downloading..." : "Download PDF"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
