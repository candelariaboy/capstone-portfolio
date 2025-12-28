"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background: "#1f2937",
          color: "#fff",
          borderRadius: "0.5rem",
          padding: "1rem",
          fontSize: "0.875rem",
        },
      }}
    />
  );
}
