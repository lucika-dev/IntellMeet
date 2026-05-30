"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [needsOnboarding, setNeedsOnboarding] = useState(true);

  return (
    <div>
      <h1>Dashboard</h1>

      {needsOnboarding && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          <div style={{ background: "#111", padding: "20px" }}>
            Complete Profile to Continue
          </div>
        </div>
      )}
    </div>
  );
}