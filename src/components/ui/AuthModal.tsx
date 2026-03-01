"use client";

import { useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import VerifyForm from "@/components/auth/VerifyForm";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

type AuthView = "login" | "register" | "verify" | "reset";

function AuthModalInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const authView = searchParams.get("auth") as AuthView | null;
  const isOpen = authView === "login" || authView === "register" || authView === "verify" || authView === "reset";

  const close = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("auth");
    const remaining = params.toString();
    router.push(remaining ? `${pathname}?${remaining}` : pathname, { scroll: false });
  }, [searchParams, router, pathname]);

  const navigate = useCallback(
    (view: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("auth", view);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={close}
      />

      {/* Modal card */}
      <div className="relative w-full max-w-md mx-4 animate-modal-in">
        <div className="card-elevated rounded-2xl p-8 t-text max-h-[90vh] overflow-y-auto">
          {/* Close button */}
          <button
            type="button"
            onClick={close}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg t-text-faint transition-colors hover:t-text"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Form content */}
          {authView === "login" && <LoginForm onNavigate={navigate} onClose={close} />}
          {authView === "register" && <RegisterForm onNavigate={navigate} referralCode={searchParams.get("ref") || undefined} />}
          {authView === "verify" && <VerifyForm onClose={close} />}
          {authView === "reset" && <ResetPasswordForm onNavigate={navigate} />}
        </div>
      </div>
    </div>
  );
}

export default function AuthModal() {
  return (
    <Suspense fallback={null}>
      <AuthModalInner />
    </Suspense>
  );
}
