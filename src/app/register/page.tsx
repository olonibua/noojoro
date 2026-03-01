"use client";

import { useSearchParams } from "next/navigation";
import { redirect } from "next/navigation";
import { Suspense } from "react";

function RegisterRedirect() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
  const target = ref ? `/?auth=register&ref=${ref}` : "/?auth=register";
  redirect(target);
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterRedirect />
    </Suspense>
  );
}
