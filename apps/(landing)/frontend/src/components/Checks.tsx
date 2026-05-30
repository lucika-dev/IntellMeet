"use client";

import { useEffect, useRef, useState } from "react";

export default function Checks({
  showMask = false,
  gap = 40,
  radius = 140,
  baseOpacity = 0.05,
  activeOpacity = 0.2,
  lineWidth = 1,
  scrollable = false,
  interactive = false,
}: {
  showMask?: boolean;
  gap?: number;
  radius?: number;
  baseOpacity?: number;
  activeOpacity?: number;
  lineWidth?: number;
  scrollable?: boolean;
  interactive?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [docH, setDocH] = useState<number>(0);

  useEffect(() => {
    const measure = () =>
      setDocH(document.documentElement.scrollHeight);

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.documentElement);

    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!interactive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    const c = ctx;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;
    let raf = 0;

    let rawScroll = window.scrollY;

    const mouse = { x: -9999, y: -9999 };
    let mouseActive = false;

    let needsDraw = true;

    const parseColor = (css: string): [number, number, number] => {
      const tmp = document.createElement("canvas");
      tmp.width = tmp.height = 1;
      const t = tmp.getContext("2d")!;
      t.fillStyle = css;
      t.fillRect(0, 0, 1, 1);
      const d = t.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2]];
    };

    const getVar = (v: string, fallback: string) =>
      getComputedStyle(document.documentElement)
        .getPropertyValue(v)
        .trim() || fallback;

    let baseRGB: [number, number, number];
    let activeRGB: [number, number, number];

    const updateColors = () => {
      baseRGB = parseColor(getVar("--foreground", "#000"));
      activeRGB = parseColor(getVar("--primary", "#888"));
      needsDraw = true;
    };

    const init = () => {
      updateColors();

      W = window.innerWidth;
      H = scrollable ? docH : window.innerHeight;

      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;

      c.setTransform(dpr, 0, 0, dpr, 0, 0);

      rawScroll = window.scrollY;
      needsDraw = true;
    };

    const draw = () => {
      raf = requestAnimationFrame(draw);

      if (!needsDraw) return;
      needsDraw = false;

      const mwx = mouse.x;
      const mwy = scrollable
        ? mouse.y + window.scrollY
        : mouse.y ;

      c.clearRect(0, 0, W, H);

      const half = gap / 2;
      const radiusSq = radius * radius;
      const totalH = scrollable ? docH : document.documentElement.scrollHeight;

      for (let x = 0; x <= W; x += gap) {
        for (let y = 0; y <= totalH; y += gap) {
          const sy = scrollable ? y : y;
          if (!scrollable && (sy < -gap || sy > H + gap)) continue;

          let alpha = baseOpacity;
          let [r, g, b] = baseRGB;

          if (mouseActive) {
            const dx = x - mwx;
            const dy = y - mwy;
            const d = dx * dx + dy * dy;

            if (d < radiusSq) {
              const t = 1 - Math.sqrt(d) / radius;
              alpha += t * (activeOpacity - baseOpacity);
              [r, g, b] = activeRGB;
            }
          }

          c.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
          c.lineWidth = lineWidth;

          c.beginPath();
          c.moveTo(x - half, sy - half);
          c.lineTo(x + half, sy - half);
          c.lineTo(x + half, sy + half);
          c.lineTo(x - half, sy + half);
          c.closePath();
          c.stroke();
        }
      }
    };

    const triggerDraw = () => (needsDraw = true);

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouseActive = true;
      triggerDraw();
    };

    const onLeave = () => {
      mouseActive = false;
      triggerDraw();
    };

    const onScroll = () => {
      rawScroll = window.scrollY;
      triggerDraw();
    };

    const onResize = () => init();

    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    init();
    draw();

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [interactive, scrollable, docH, gap, radius]);

  const gridStyle: React.CSSProperties = {
    backgroundSize: `${gap}px ${gap}px`,
    backgroundImage: `
      linear-gradient(to right, color-mix(in srgb, var(--foreground) ${Math.round(baseOpacity * 100)}%, transparent) 1px, transparent 1px),
      linear-gradient(to bottom, color-mix(in srgb, var(--foreground) ${Math.round(baseOpacity * 100)}%, transparent) 1px, transparent 1px)
    `,
  };

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0"
      style={
        scrollable
          ? { position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }
          : { position: "fixed", inset: 0 }
      }
    >
      {!interactive && <div className="absolute inset-0" style={gridStyle} />}

      {interactive && <canvas ref={canvasRef} className="absolute inset-0" />}

      {showMask && (
  <div className="absolute inset-0 bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_25%,black)]" />
)}
    </div>
  );
}