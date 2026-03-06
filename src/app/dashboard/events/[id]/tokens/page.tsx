"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { api, getBearerToken } from "@/lib/api";
import WizardSteps from "@/components/wizard/WizardSteps";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface TokenStats {
  total: number;
  active: number;
  burned: number;
  served: number;
  inactive: number;
}

interface PaymentResponse {
  authorization_url: string | null;
  reference: string | null;
  original_amount: number | null;
  final_amount: number | null;
  discount_pct: number | null;
  activated_directly: boolean;
}

interface EventData {
  id: string;
  name: string;
  total_tokens: number;
  admin_discount_pct: number | null;
}

interface PricingData {
  total_tokens: number;
  price_per_token: number;
  original_amount: number;
  discount_pct: number;
  discount_amount: number;
  final_amount: number;
  discount_source: string | null;
}

interface CodeValidation {
  valid: boolean;
  discount_type: string | null;
  value: number | null;
  message: string;
}

export default function TokenManagementPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [stats, setStats] = useState<TokenStats | null>(null);
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activating, setActivating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Discount state
  const [discountCode, setDiscountCode] = useState("");
  const [discountExpanded, setDiscountExpanded] = useState(false);
  const [validatingCode, setValidatingCode] = useState(false);
  const [codeValidation, setCodeValidation] = useState<CodeValidation | null>(null);
  const [pricing, setPricing] = useState<PricingData | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const data = await api.get<TokenStats>(`/api/events/${eventId}/tokens/stats`);
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load token stats");
    }
  }, [eventId]);

  const fetchEvent = useCallback(async () => {
    try {
      const data = await api.get<EventData>(`/api/events/${eventId}`);
      setEvent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load event data");
    }
  }, [eventId]);

  const fetchPricing = useCallback(async (code?: string) => {
    try {
      const body = code ? { discount_code: code } : {};
      const data = await api.post<PricingData>(
        `/api/events/${eventId}/tokens/pricing`,
        body
      );
      setPricing(data);
    } catch {
      // Non-critical — pricing preview is optional
    }
  }, [eventId]);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchStats(), fetchEvent(), fetchPricing()]);
      setLoading(false);
    };
    loadData();
  }, [fetchStats, fetchEvent, fetchPricing]);

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    setValidatingCode(true);
    setCodeValidation(null);
    try {
      const result = await api.post<CodeValidation>("/api/discounts/validate", {
        code: discountCode,
      });
      setCodeValidation(result);
      if (result.valid) {
        await fetchPricing(discountCode);
      } else {
        // Reset pricing to without code
        await fetchPricing();
      }
    } catch (err) {
      setCodeValidation({
        valid: false,
        discount_type: null,
        value: null,
        message: err instanceof Error ? err.message : "Failed to validate code",
      });
    } finally {
      setValidatingCode(false);
    }
  };

  const handleClearDiscount = async () => {
    setDiscountCode("");
    setCodeValidation(null);
    await fetchPricing();
  };

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
      const body = codeValidation?.valid && discountCode
        ? { discount_code: discountCode }
        : {};
      const data = await api.post<PaymentResponse>(
        `/api/events/${eventId}/tokens/activate`,
        body
      );
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else if (data.activated_directly) {
        setSuccess("Tokens activated successfully!");
        await fetchStats();
      } else {
        setError("Payment could not be initialized. Please try again.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to activate tokens");
    } finally {
      setActivating(false);
    }
  };

  const handleConfirmAndPay = async () => {
    setGenerating(true);
    setError("");
    setSuccess("");
    try {
      await api.post(`/api/events/${eventId}/tokens/generate`);
      await fetchStats();
      setGenerating(false);
      setActivating(true);
      const body = codeValidation?.valid && discountCode
        ? { discount_code: discountCode }
        : {};
      const data = await api.post<PaymentResponse>(
        `/api/events/${eventId}/tokens/activate`,
        body
      );
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else if (data.activated_directly) {
        setSuccess("Tokens activated successfully!");
        await fetchStats();
        await fetchEvent();
      } else {
        setError("Payment could not be initialized. Please try again.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process payment");
    } finally {
      setGenerating(false);
      setActivating(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    setError("");
    try {
      const headers: Record<string, string> = {};
      const token = getBearerToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const response = await fetch(`${API_URL}/api/events/${eventId}/tokens/pdf`, {
        credentials: "include",
        headers,
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

  const totalTokens = event?.total_tokens ?? 0;
  const amount = totalTokens * 250;
  const hasDiscount = pricing && pricing.discount_pct > 0;
  const displayAmount = hasDiscount ? pricing.final_amount : amount;
  const isNoTokens = !stats || stats.total === 0;
  const isGenerated = stats !== null && stats.inactive > 0;
  const isActivated = stats !== null && stats.active > 0 && stats.inactive === 0;

  const discountSection = (isNoTokens || isGenerated) && (
    <div className="mt-4 text-left">
      {/* Discount code toggle */}
      {!discountExpanded ? (
        <button
          onClick={() => setDiscountExpanded(true)}
          className="text-sm text-eco hover:text-eco-dark underline"
        >
          Have a discount code?
        </button>
      ) : (
        <div className="rounded-lg border t-border p-4 t-bg">
          <p className="text-sm font-medium t-text mb-2">Discount Code</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
              placeholder="Enter code"
              className="flex-1 rounded-lg border t-border px-3 py-2 text-sm t-text t-bg-card focus:outline-none focus:ring-2 focus:ring-eco"
            />
            {codeValidation?.valid ? (
              <button
                onClick={handleClearDiscount}
                className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Clear
              </button>
            ) : (
              <button
                onClick={handleApplyDiscount}
                disabled={validatingCode || !discountCode.trim()}
                className="rounded-lg bg-eco px-4 py-2 text-sm font-medium text-white hover:bg-eco-dark disabled:opacity-50"
              >
                {validatingCode ? "..." : "Apply"}
              </button>
            )}
          </div>
          {codeValidation && (
            <p className={`mt-2 text-xs ${codeValidation.valid ? "text-emerald-600" : "text-red-600"}`}>
              {codeValidation.message}
              {codeValidation.valid && codeValidation.discount_type === "percentage" && (
                <> ({codeValidation.value}% off)</>
              )}
              {codeValidation.valid && codeValidation.discount_type === "fixed" && (
                <> ({"\u20A6"}{Number(codeValidation.value).toLocaleString()} off)</>
              )}
            </p>
          )}
        </div>
      )}

      {/* Updated pricing display */}
      {hasDiscount && (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="t-text-muted">Original price:</span>
            <span className="line-through t-text-muted">
              {"\u20A6"}{pricing.original_amount.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="t-text-muted">
              Discount ({pricing.discount_pct}%{pricing.discount_source === "admin" ? " - Event discount" : ""}):
            </span>
            <span className="text-emerald-600 font-medium">
              -{"\u20A6"}{pricing.discount_amount.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1 pt-1 border-t border-emerald-200">
            <span className="font-semibold t-text">Final price:</span>
            <span className="font-bold text-emerald-700">
              {"\u20A6"}{pricing.final_amount.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl">
      <WizardSteps currentStep={6} />

      <h1 className="text-2xl font-bold t-text">Payment & Tokens</h1>
      <p className="mt-1 text-sm t-text-muted">
        Complete payment to generate and activate your event tokens.
      </p>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {/* State 1 — No tokens yet */}
      {isNoTokens && (
        <div className="mt-8 rounded-xl border t-border t-bg-card p-8 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-eco/10">
            <svg
              className="h-7 w-7 text-eco"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold t-text">Ready to create tokens</h2>
          <p className="mt-2 t-text-muted">
            Total tokens to create: <span className="font-semibold t-text">{totalTokens}</span>.
            Total amount:{" "}
            <span className={`font-semibold t-text ${hasDiscount ? "line-through text-gray-400" : ""}`}>
              {"\u20A6"}{amount.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="font-semibold text-emerald-600 ml-2">
                {"\u20A6"}{displayAmount.toLocaleString()}
              </span>
            )}
          </p>
          <p className="mt-1 text-xs t-text-muted">
            {"\u20A6"}250 per token
          </p>

          {discountSection}

          <button
            onClick={handleConfirmAndPay}
            disabled={generating || activating}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-eco px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-eco-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
              />
            </svg>
            {generating
              ? "Generating tokens..."
              : activating
              ? "Redirecting to payment..."
              : "Confirm & Pay"}
          </button>
        </div>
      )}

      {/* State 2 — Generated but unpaid */}
      {isGenerated && (
        <div className="mt-8 rounded-xl border t-border t-bg-card p-8 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
            <svg
              className="h-7 w-7 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold t-text">Tokens generated. Awaiting payment.</h2>
          <p className="mt-2 t-text-muted">
            {stats.inactive} token{stats.inactive !== 1 ? "s" : ""} pending activation.
            Total:{" "}
            <span className={hasDiscount ? "line-through text-gray-400" : ""}>
              {"\u20A6"}{(stats.inactive * 250).toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="font-semibold text-emerald-600 ml-2">
                {"\u20A6"}{pricing.final_amount.toLocaleString()}
              </span>
            )}
          </p>

          {discountSection}

          <button
            onClick={handleActivate}
            disabled={activating}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-eco px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-eco-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
              />
            </svg>
            {activating ? "Redirecting to payment..." : "Pay Now"}
          </button>
        </div>
      )}

      {/* State 3 — Activated */}
      {isActivated && (
        <div className="mt-8 rounded-xl border t-border t-bg-card p-8 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <svg
              className="h-7 w-7 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold t-text">
            Tokens activated! Your event is ready.
          </h2>
          <p className="mt-2 t-text-muted">
            {stats.active} token{stats.active !== 1 ? "s" : ""} are active and ready to use.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="inline-flex items-center gap-2 rounded-lg bg-eco px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-eco-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
              </svg>
              {downloading ? "Downloading..." : "Print Tokens"}
            </button>
            <button
              onClick={() => router.push(`/dashboard/events/${eventId}`)}
              className="inline-flex items-center gap-2 rounded-lg border t-border px-6 py-3 text-sm font-semibold t-text transition-colors hover:t-bg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Go to Event Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Token Stats (shown when tokens exist) */}
      {stats && stats.total > 0 && (
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
            <p className="mt-2 text-3xl font-bold text-eco">{stats.active}</p>
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

      {/* Bottom Navigation */}
      <div className="mt-10 flex items-center justify-between border-t t-border pt-6">
        <button
          onClick={() => router.push(`/dashboard/events/${eventId}/preview`)}
          className="inline-flex items-center gap-2 rounded-lg border t-border px-5 py-2.5 text-sm font-medium t-text transition-colors hover:t-bg"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          Back
        </button>

        {isNoTokens && (
          <button
            onClick={handleConfirmAndPay}
            disabled={generating || activating}
            className="inline-flex items-center gap-2 rounded-lg bg-eco px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-eco-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating
              ? "Generating..."
              : activating
              ? "Processing..."
              : "Confirm & Pay"}
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </button>
        )}

        {isGenerated && (
          <button
            onClick={handleActivate}
            disabled={activating}
            className="inline-flex items-center gap-2 rounded-lg bg-eco px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-eco-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {activating ? "Processing..." : "Pay Now"}
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </button>
        )}

        {isActivated && (
          <button
            onClick={() => router.push(`/dashboard/events/${eventId}`)}
            className="inline-flex items-center gap-2 rounded-lg bg-eco px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-eco-dark"
          >
            Go to Event Dashboard
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
