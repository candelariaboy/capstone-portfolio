"use client";

import { useSearchParams } from "next/navigation";
import { ReactNode, Suspense } from "react";

export function SearchParamsClient({
  children,
}: {
  children: (searchParams: ReturnType<typeof useSearchParams>) => ReactNode;
}) {
  const searchParams = useSearchParams();
  return <>{children(searchParams)}</>;
}

export function SearchParamsWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {children}
    </Suspense>
  );
}
