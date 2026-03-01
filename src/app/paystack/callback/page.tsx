"use client";

import { Suspense, useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

interface VerifyResponse {
  status: string;
  event_id?: string;
  message?: string;
}

function PaystackCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref") || "";

  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [message, setMessage] = useState("");
  const [eventId, setEventId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);
  const attemptsRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const verifyPayment = useCallback(async () => {
    try {
      const data = await api.get<VerifyResponse>(
        `/api/payments/verify?reference=${encodeURIComponent(reference)}`
      );

      if (data.status === "success") {
        setStatus("success");
        setMessage(data.message || "Payment verified successfully! Your tokens have been activated.");
        setEventId(data.event_id || null);
        return;
      }

      if (data.status === "failed") {
        setStatus("failed");
        setMessage(data.message || "Payment failed.");
        setEventId(data.event_id || null);
        return;
      }

      // Status is "pending" — webhook hasn't arrived yet. Retry up to 10 times (30s total).
      attemptsRef.current += 1;
      if (attemptsRef.current < 10) {
        timerRef.current = setTimeout(verifyPayment, 3000);
      } else {
        // After 30s of polling, show success-pending state — webhook will process eventually
        setStatus("success");
        setMessage("Payment received! Your tokens will be activated shortly.");
        setEventId(data.event_id || null);
      }
    } catch {
      // Network error or 404 — retry a few times in case of transient issues
      attemptsRef.current += 1;
      if (attemptsRef.current < 5) {
        timerRef.current = setTimeout(verifyPayment, 3000);
      } else {
        setStatus("failed");
        setMessage("Could not verify payment. Please check your tokens page — if payment was successful, tokens will be activated automatically.");
      }
    }
  }, [reference]);

  useEffect(() => {
    if (!reference) {
      setStatus("failed");
      setMessage("No payment reference found in URL.");
      return;
    }

    verifyPayment();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [reference, verifyPayment]);

  // Auto-redirect after success
  useEffect(() => {
    if (status !== "success") return;

    const redirectTarget = eventId
      ? `/dashboard/events/${eventId}/tokens`
      : "/dashboard/events";

    let remaining = 3;
    const interval = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    const redirectTimer = setTimeout(() => {
      router.push(redirectTarget);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(redirectTimer);
    };
  }, [status, eventId, router]);

  return (
    <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
      {status === "loading" && (
        <>
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-eco" />
          <h1 className="mt-6 text-xl font-bold text-gray-900">Verifying Payment</h1>
          <p className="mt-2 text-sm text-gray-500">
            Please wait while we confirm your payment...
          </p>
          {reference && (
            <p className="mt-3 text-xs text-gray-400">
              Reference: <span className="font-mono">{reference}</span>
            </p>
          )}
        </>
      )}

      {status === "success" && (
        <>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-eco"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="mt-6 text-xl font-bold text-gray-900">Payment Successful!</h1>
          <p className="mt-2 text-sm text-gray-500">{message}</p>
          <p className="mt-2 text-xs text-gray-400">
            Redirecting in {countdown}s...
          </p>
          {reference && (
            <p className="mt-1 text-xs text-gray-400">
              Reference: <span className="font-mono">{reference}</span>
            </p>
          )}
          <div className="mt-6 flex flex-col gap-3">
            {eventId && (
              <button
                onClick={() => router.push(`/dashboard/events/${eventId}/tokens`)}
                className="w-full rounded-lg bg-eco px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-eco-dark transition-colors"
              >
                Back to Tokens
              </button>
            )}
            <button
              onClick={() => router.push("/dashboard/events")}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </>
      )}

      {status === "failed" && (
        <>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-8 w-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="mt-6 text-xl font-bold text-gray-900">Payment Failed</h1>
          <p className="mt-2 text-sm text-gray-500">{message}</p>
          {reference && (
            <p className="mt-3 text-xs text-gray-400">
              Reference: <span className="font-mono">{reference}</span>
            </p>
          )}
          <div className="mt-6 flex flex-col gap-3">
            {eventId && (
              <button
                onClick={() => router.push(`/dashboard/events/${eventId}/tokens`)}
                className="w-full rounded-lg bg-eco px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-eco-dark transition-colors"
              >
                Try Again
              </button>
            )}
            <button
              onClick={() => router.push("/dashboard/events")}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function PaystackCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Suspense
        fallback={
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-eco" />
            <h1 className="mt-6 text-xl font-bold text-gray-900">Verifying Payment</h1>
            <p className="mt-2 text-sm text-gray-500">Please wait...</p>
          </div>
        }
      >
        <PaystackCallbackInner />
      </Suspense>
    </div>
  );
}
