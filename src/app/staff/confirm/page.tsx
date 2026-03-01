"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "@/lib/api";

/* ---------- Types ---------- */

interface ConfirmResult {
  message: string;
  order_number: string;
  table_number?: number;
  seat_number?: number;
}

type Tab = "scan" | "code";
type Phase = "idle" | "confirming" | "success" | "error";

/* ========== Component ========== */

export default function StaffConfirmPage() {
  const [tab, setTab] = useState<Tab>("scan");
  const [phase, setPhase] = useState<Phase>("idle");
  const [pin, setPin] = useState(["", "", "", ""]);
  const [result, setResult] = useState<ConfirmResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [cameraAvailable, setCameraAvailable] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

  /* --- Check camera availability --- */
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.mediaDevices) {
      setCameraAvailable(true);
    } else {
      setCameraAvailable(false);
    }
  }, []);

  /* --- Start camera for scanning --- */
  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices) {
      setCameraAvailable(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setScanning(true);
    } catch {
      setCameraAvailable(false);
    }
  }, []);

  /* --- Stop camera --- */
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  }, []);

  /* --- Cleanup on unmount --- */
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  /* --- Handle manual barcode submit from scan tab --- */
  const submitBarcode = useCallback(
    async (code: string) => {
      if (!code.trim()) return;
      setPhase("confirming");
      try {
        const res = await api.post<ConfirmResult>("/api/staff/confirm/scan", {
          barcode_data: code.trim(),
        });
        setResult(res);
        setPhase("success");
        stopCamera();
      } catch (err) {
        setErrorMsg(
          err instanceof Error ? err.message : "Confirmation failed"
        );
        setPhase("error");
      }
    },
    [stopCamera]
  );

  /* --- Handle PIN submit --- */
  const submitPin = useCallback(async () => {
    const code = pin.join("");
    if (code.length < 4) return;
    setPhase("confirming");
    try {
      const res = await api.post<ConfirmResult>("/api/staff/confirm/pin", {
        confirmation_pin: code,
      });
      setResult(res);
      setPhase("success");
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Confirmation failed"
      );
      setPhase("error");
    }
  }, [pin]);

  /* --- PIN input handler --- */
  const handlePinChange = useCallback(
    (index: number, value: string) => {
      if (!/^\d*$/.test(value)) return;
      const newPin = [...pin];
      newPin[index] = value.slice(-1);
      setPin(newPin);

      if (value && index < 3) {
        pinRefs.current[index + 1]?.focus();
      }

      // Auto-submit when all 4 digits entered
      if (newPin.every((d) => d !== "") && newPin.join("").length === 4) {
        setTimeout(() => {
          submitPin();
        }, 200);
      }
    },
    [pin, submitPin]
  );

  /* --- Handle PIN backspace --- */
  const handlePinKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === "Backspace" && !pin[index] && index > 0) {
        pinRefs.current[index - 1]?.focus();
      }
    },
    [pin]
  );

  /* --- Reset --- */
  const reset = useCallback(() => {
    setPhase("idle");
    setResult(null);
    setErrorMsg("");
    setPin(["", "", "", ""]);
    setManualCode("");
  }, []);

  /* ========== Render ========== */

  /* --- Success --- */
  if (phase === "success" && result) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
        <div className="text-center">
          {/* Animated checkmark */}
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-eco/10">
            <svg
              className="h-14 w-14 text-emerald-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
                className="animate-[draw_0.5s_ease-in-out_forwards]"
              />
            </svg>
          </div>

          <h1 className="mb-2 text-3xl font-bold text-eco-dark">
            Confirmed!
          </h1>
          <p className="mb-1 text-lg text-gray-800">
            Order #{result.order_number}
          </p>
          {result.table_number !== undefined && (
            <p className="text-base t-text-muted">
              Table {result.table_number}
              {result.seat_number !== undefined ? `, Seat ${result.seat_number}` : ""}
            </p>
          )}
        </div>

        <button
          onClick={reset}
          className="mt-8 min-h-[52px] w-full max-w-sm rounded-xl bg-eco px-6 py-3 text-lg font-bold text-white active:bg-emerald-600"
        >
          Confirm Another
        </button>
      </div>
    );
  }

  /* --- Error --- */
  if (phase === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold t-text">Failed</h1>
          <p className="text-lg t-text-muted">{errorMsg}</p>
        </div>
        <button
          onClick={reset}
          className="mt-8 min-h-[52px] w-full max-w-sm rounded-xl bg-eco px-6 py-3 text-lg font-bold text-white active:bg-emerald-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  /* --- Confirming --- */
  if (phase === "confirming") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 t-border border-t-emerald-500" />
          <p className="text-lg font-medium t-text-secondary">Confirming...</p>
        </div>
      </div>
    );
  }

  /* --- Idle: Tab UI --- */
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b t-border px-4 py-4">
        <h1 className="text-center text-xl font-bold t-text">
          Confirm Order
        </h1>
      </div>

      {/* Tabs */}
      <div className="mx-auto max-w-sm px-4 pt-4">
        <div className="flex overflow-hidden rounded-xl border-2 t-border">
          <button
            onClick={() => {
              setTab("scan");
              stopCamera();
            }}
            className={`min-h-[48px] flex-1 py-3 text-base font-semibold transition-colors ${
              tab === "scan"
                ? "bg-eco text-white"
                : "bg-white t-text-muted"
            }`}
          >
            Scan Barcode
          </button>
          <button
            onClick={() => {
              setTab("code");
              stopCamera();
            }}
            className={`min-h-[48px] flex-1 py-3 text-base font-semibold transition-colors ${
              tab === "code"
                ? "bg-eco text-white"
                : "bg-white t-text-muted"
            }`}
          >
            Enter Code
          </button>
        </div>
      </div>

      {/* Scan Tab */}
      {tab === "scan" && (
        <div className="mx-auto max-w-sm px-4 py-6">
          {cameraAvailable && !scanning && (
            <button
              onClick={startCamera}
              className="min-h-[52px] w-full rounded-xl bg-eco px-6 py-3 text-lg font-bold text-white active:bg-emerald-600"
            >
              Start Camera
            </button>
          )}

          {scanning && (
            <div className="mb-4 overflow-hidden rounded-xl">
              <video
                ref={videoRef}
                className="w-full rounded-xl"
                playsInline
                muted
              />
            </div>
          )}

          <div className="mt-6">
            <p className="mb-2 text-base font-medium t-text-secondary">
              {cameraAvailable === false
                ? "Camera not available. Enter barcode manually:"
                : "Or enter barcode manually:"}
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Enter barcode"
                className="min-h-[52px] flex-1 rounded-xl border-2 t-border px-4 py-3 text-lg t-text outline-none focus:border-eco"
              />
              <button
                onClick={() => submitBarcode(manualCode)}
                disabled={!manualCode.trim()}
                className="min-h-[52px] rounded-xl bg-eco px-6 py-3 text-lg font-bold text-white disabled:opacity-40"
              >
                Go
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Code Tab */}
      {tab === "code" && (
        <div className="mx-auto max-w-sm px-4 py-6">
          <p className="mb-6 text-center text-base t-text-muted">
            Enter the 4-digit order PIN
          </p>

          <div className="mb-6 flex justify-center gap-4">
            {pin.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  pinRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handlePinChange(i, e.target.value)}
                onKeyDown={(e) => handlePinKeyDown(i, e)}
                className="h-16 w-16 rounded-xl border-2 t-border text-center text-3xl font-bold t-text outline-none focus:border-eco"
              />
            ))}
          </div>

          <button
            onClick={submitPin}
            disabled={pin.some((d) => d === "")}
            className="min-h-[52px] w-full rounded-xl bg-eco px-6 py-3 text-lg font-bold text-white disabled:opacity-40 active:bg-emerald-600"
          >
            Confirm
          </button>
        </div>
      )}

      <p className="mt-8 text-center text-xs t-text-faint">
        Powered by No Ojoro
      </p>
    </div>
  );
}
