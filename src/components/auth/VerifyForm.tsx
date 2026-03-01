"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface VerifyFormProps {
  onClose: () => void;
}

export default function VerifyForm({ onClose }: VerifyFormProps) {
  const router = useRouter();
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendMsg, setResendMsg] = useState("");
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;

    const next = [...code];
    next[index] = value.slice(-1);
    setCode(next);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const next = [...code];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setCode(next);

    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Please enter the full 6-digit code");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const verifyEmail = localStorage.getItem("verify_email");
      const verifyPhone = localStorage.getItem("verify_phone");
      const body: Record<string, string> = { code: fullCode };
      if (verifyEmail) body.email = verifyEmail;
      if (verifyPhone) body.phone = verifyPhone;

      if (!verifyEmail && !verifyPhone) {
        setError("Missing email or phone. Please register again.");
        setLoading(false);
        return;
      }

      await api.post("/api/auth/verify", body);

      // Auto-login after successful verification
      const loginBody: Record<string, string> = {
        password: localStorage.getItem("verify_password") || "",
      };
      if (verifyEmail) loginBody.email = verifyEmail;
      if (verifyPhone) loginBody.phone = verifyPhone;

      if (loginBody.password) {
        await api.post("/api/auth/login", loginBody);
      }

      localStorage.removeItem("verify_email");
      localStorage.removeItem("verify_phone");
      localStorage.removeItem("verify_password");
      onClose();
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mb-6 flex justify-center">
        <div className="t-icon-container flex h-16 w-16 items-center justify-center rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-[#8BC34A]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
      </div>

      <h1 className="mb-2 text-center text-3xl font-bold">Verify Your Account</h1>
      <p className="mb-8 text-center text-sm t-text-muted">
        Enter the 6-digit code sent to your email or phone
      </p>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {resendMsg && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
          {resendMsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-8 flex justify-center gap-3" onPaste={handlePaste}>
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="h-14 w-12 t-input text-center text-2xl font-bold outline-none sm:h-16 sm:w-14"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || code.join("").length !== 6}
          className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Verifying..." : "Verify Account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm t-text-faint">
        Didn&apos;t receive a code?{" "}
        <button
          type="button"
          disabled={resending}
          className="font-medium text-[#8BC34A] hover:text-[#7CB342] disabled:opacity-50"
          onClick={async () => {
            const verifyEmail = localStorage.getItem("verify_email");
            const verifyPhone = localStorage.getItem("verify_phone");
            if (!verifyEmail && !verifyPhone) {
              setError("Missing email or phone. Please register again.");
              return;
            }
            setResending(true);
            setError("");
            setResendMsg("");
            try {
              const body: Record<string, string> = {};
              if (verifyEmail) body.email = verifyEmail;
              if (verifyPhone) body.phone = verifyPhone;
              await api.post("/api/auth/resend-otp", body);
              setResendMsg("A new code has been sent!");
            } catch (err) {
              setError(err instanceof Error ? err.message : "Failed to resend");
            } finally {
              setResending(false);
            }
          }}
        >
          {resending ? "Sending..." : "Resend Code"}
        </button>
      </p>
    </>
  );
}
