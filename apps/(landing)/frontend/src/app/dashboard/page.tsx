"use client";

import { useEffect } from "react";

export default function DashboardBridge() {
  useEffect(() => {
    // Force a hard redirect to ensure cookies are sent to the correct port
    window.location.replace("http://localhost:5173/dashboard");
  }, []);

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-lg font-medium">Redirecting to Dashboard...</p>
      </div>
    </div>
  );
}