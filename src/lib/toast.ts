"use client";

import { useContext } from "react";
import { ToastContext, type ToastContextValue } from "@/components/ui/ToastProvider";

export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}
