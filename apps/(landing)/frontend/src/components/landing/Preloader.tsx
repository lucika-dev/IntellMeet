"use client";

import { useEffect, useRef, useState } from "react";

export function RocketPreloader() {
  const [mounted, setMounted] = useState(false);

  const valRef  = useRef<HTMLSpanElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const val    = valRef.current;
    const wrap   = wrapRef.current;
    const loader = loaderRef.current;
    if (!val || !wrap || !loader) return;

    let visualCount  = 0;
    let actualProgress = 0;
    let velocity  = 0;
    let rafId: number;
    let done = false;

    const observer = new PerformanceObserver(() => {
      const all      = performance.getEntriesByType("resource");
      const finished = all.filter(r => (r as PerformanceResourceTiming).duration > 0).length;
      actualProgress = all.length > 0 ? (finished / all.length) * 100 : 0;
    });

    try { observer.observe({ entryTypes: ["resource"] }); } catch (_) {}

    function dismiss() {
      if (done) return;
      done = true;
      cancelAnimationFrame(rafId);
      observer.disconnect();

      val!.innerText = "100";
      wrap!.classList.add("vibrate-rocket");

      setTimeout(() => {
        loader!.style.transform = "translateY(-100%)";
        loader!.style.opacity   = "0";
        setTimeout(() => {
          if (loader) loader.style.display = "none";
        }, 900);
      }, 320);
    }

    function sync() {
      if (done) return;

      const diff = actualProgress - visualCount;
      if (diff > 0) {
        velocity    += 0.04;
        visualCount += diff * 0.09 + velocity;
      } else {
        velocity = Math.max(0, velocity - 0.01);
      }

      visualCount = Math.min(visualCount, 99.9);
      val!.innerText = String(Math.floor(visualCount));

      if (visualCount > 5) {
        wrap!.classList.add("vibrate-rocket");
        wrap!.style.filter = `blur(${Math.min(velocity / 14, 3)}px)`;
      }

      if (document.readyState === "complete" && visualCount >= 99) {
        dismiss();
        return;
      }

      rafId = requestAnimationFrame(sync);
    }

    rafId = requestAnimationFrame(sync);

    const onLoad = () => {
      actualProgress = 100;
      setTimeout(dismiss, 400);
    };

    if (document.readyState === "complete") {
      actualProgress = 100;
      setTimeout(dismiss, 400);
    } else {
      window.addEventListener("load", onLoad, { once: true });
    }

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("load", onLoad);
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div
      ref={loaderRef}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "var(--background)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "transform 0.85s cubic-bezier(0.85, 0, 0.15, 1), opacity 0.5s ease",
      }}
    >
      <div
        ref={wrapRef}
        style={{
          display: "flex",
          alignItems: "baseline",
          fontWeight: 900,
          fontStyle: "italic",
          letterSpacing: "-0.05em",
          userSelect: "none",
          fontVariantNumeric: "tabular-nums",
          fontFamily: "var(--font-sans)",
          color: "var(--foreground)",
        }}
      >
        <span
          ref={valRef}
          style={{ fontSize: "clamp(10rem, 25vw, 22rem)", lineHeight: 1 }}
        >
          0
        </span>
        <span
          style={{
            fontSize: "clamp(2rem, 5vw, 5rem)",
            color: "var(--primary)",
            marginLeft: "0.5rem",
          }}
        >
          %
        </span>
      </div>
    </div>
  );
}