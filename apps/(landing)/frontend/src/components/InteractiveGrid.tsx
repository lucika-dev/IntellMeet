"use client";
import React, { useEffect, useRef } from "react";

export const InteractiveGrid = ({
  gap = 20,
  radius = 150,
  strength = 10,
  smooth = 0.1,
  colorSmooth = 0.04,
  dotSize = 1.2,
  dotHoverScale = 1.5,
  baseColor,
  activeColor,
  scrollSpeed = 0.2,
  scrollInertia = 0.05,
  className = "",
}: {
  gap?: number;
  radius?: number;
  strength?: number;
  smooth?: number;
  colorSmooth?: number;
  dotSize?: number;
  dotHoverScale?: number;
  baseColor?: string;
  activeColor?: string;
  scrollSpeed?: number;
  scrollInertia?: number;
  className?: string;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    const c = ctx;

    const parseColor = (color: string): [number, number, number] => {
      const tmp = document.createElement("canvas");
      tmp.width = tmp.height = 1;
      const tc = tmp.getContext("2d")!;
      tc.fillStyle = color;
      tc.fillRect(0, 0, 1, 1);
      const d = tc.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2]];
    };

const getColors = () => {
  const root = getComputedStyle(document.documentElement);

  return {
    base: baseColor ?? root.getPropertyValue("--foreground").trim(),
    active: activeColor ?? root.getPropertyValue("--primary").trim(),
  };
};

    let baseRGB: [number, number, number] = [136, 136, 136];
    let activeRGB: [number, number, number] = [234, 179, 8];

    const updateColors = () => {
      const { base, active } = getColors();
      baseRGB = parseColor(base);
      activeRGB = parseColor(active);
    };

    const LUT_SIZE = 256;
    const colorLUT = new Uint8Array(LUT_SIZE * 3);
    const buildLUT = () => {
      for (let i = 0; i < LUT_SIZE; i++) {
        const t = i / (LUT_SIZE - 1);
        colorLUT[i * 3 + 0] = baseRGB[0] + (activeRGB[0] - baseRGB[0]) * t;
        colorLUT[i * 3 + 1] = baseRGB[1] + (activeRGB[1] - baseRGB[1]) * t;
        colorLUT[i * 3 + 2] = baseRGB[2] + (activeRGB[2] - baseRGB[2]) * t;
      }
    };

    let rawScroll  = window.scrollY;
    let lerpScroll = rawScroll;

    const mouse = { x: -9999, y: -9999 };
    let mouseActive = false;

    let W = 0, VH = 0, dpr = 1;

    let ox: Float32Array, oy: Float32Array;
    let dx: Float32Array, dy: Float32Array;
    let f: Float32Array;
    let count = 0;

    let cellSize = 0;
    let gridW = 0, gridH = 0;
    let cells: Int32Array[];

    const buildSpatialGrid = (totalH: number) => {
      cellSize = Math.max(radius, 1);
      gridW = Math.ceil(W / cellSize) + 1;
      gridH = Math.ceil(totalH / cellSize) + 1;
      const buckets: number[][] = Array.from({ length: gridW * gridH }, () => []);

      for (let i = 0; i < count; i++) {
        const cx = Math.floor(ox[i] / cellSize);
        const cy = Math.floor(oy[i] / cellSize);
        const ci = cy * gridW + cx;
        if (ci >= 0 && ci < buckets.length) buckets[ci].push(i);
      }
      cells = buckets.map(b => new Int32Array(b));
    };

    const init = () => {
      updateColors();
      buildLUT();

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W  = window.innerWidth;
      VH = window.innerHeight;

      const totalH = Math.max(document.documentElement.scrollHeight, VH * 2);

      canvas.width  = Math.round(W  * dpr);
      canvas.height = Math.round(VH * dpr);
      canvas.style.width  = `${W}px`;
      canvas.style.height = `${VH}px`;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cols = Math.ceil(W / gap) + 1;
      const rows = Math.ceil(totalH / gap) + 1;
      count = cols * rows;

      ox = new Float32Array(count);
      oy = new Float32Array(count);
      dx = new Float32Array(count);
      dy = new Float32Array(count);
      f  = new Float32Array(count);

      let i = 0;
      for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
          const px = col * gap;
          const py = row * gap;
          ox[i] = px; oy[i] = py;
          dx[i] = px; dy[i] = py;
          f[i]  = 0;
          i++;
        }
      }
      count = i;

      buildSpatialGrid(totalH);

      rawScroll  = window.scrollY;
      lerpScroll = rawScroll;
    };

    const FADE_PX = 800;
    let raf: number;
    const activeSet = new Set<number>();

    const loop = () => {
      lerpScroll += (rawScroll - lerpScroll) * scrollInertia;

      const mwx = mouse.x;
      const mwy = mouseActive ? mouse.y + lerpScroll : -9999;

      activeSet.clear();
      if (mouseActive) {
        const minCX = Math.max(0, Math.floor((mwx - radius) / cellSize));
        const maxCX = Math.min(gridW - 1, Math.floor((mwx + radius) / cellSize));
        const minCY = Math.max(0, Math.floor((mwy - radius) / cellSize));
        const maxCY = Math.min(gridH - 1, Math.floor((mwy + radius) / cellSize));

        for (let cy2 = minCY; cy2 <= maxCY; cy2++) {
          for (let cx2 = minCX; cx2 <= maxCX; cx2++) {
            const ci = cy2 * gridW + cx2;
            const cell = cells[ci];
            if (cell) for (let k = 0; k < cell.length; k++) activeSet.add(cell[k]);
          }
        }
      }

      const viewTop    = rawScroll - gap * 2;
      const viewBottom = rawScroll + VH + gap * 2;

      c.clearRect(0, 0, W, VH);

      for (let i = 0; i < count; i++) {
        const oyi = oy[i];

        if (oyi < viewTop || oyi > viewBottom) {
          if (f[i] > 0.001) {
            f[i] *= 0.9;
            dx[i] += (ox[i] - dx[i]) * smooth;
            dy[i] += (oyi   - dy[i]) * smooth;
          }
          continue;
        }

        if (activeSet.has(i)) {
          const ddx = mwx - ox[i];
          const ddy = mwy - oyi;
          const dist = Math.sqrt(ddx * ddx + ddy * ddy);

          if (dist < radius) {
            const angle = Math.atan2(ddy, ddx);
            const force = Math.sin((1 - dist / radius) * Math.PI * 0.5);
            dx[i] += (ox[i] - Math.cos(angle) * force * strength - dx[i]) * smooth;
            dy[i] += (oyi   - Math.sin(angle) * force * strength - dy[i]) * smooth;
            f[i]  += (force - f[i]) * colorSmooth;
          } else {
            dx[i] += (ox[i] - dx[i]) * smooth;
            dy[i] += (oyi   - dy[i]) * smooth;
            f[i]  += (0     - f[i])  * colorSmooth;
          }
        } else if (f[i] > 0.001) {
          dx[i] += (ox[i] - dx[i]) * smooth;
          dy[i] += (oyi   - dy[i]) * smooth;
          f[i]  += (0     - f[i])  * colorSmooth;
        }

        const sy = dy[i] - rawScroll;

        if (sy < -gap || sy > VH + gap) continue;

        const fi     = f[i];
        const lutIdx = Math.min(LUT_SIZE - 1, Math.round(fi * (LUT_SIZE - 1)));
        const r      = colorLUT[lutIdx * 3];
        const g      = colorLUT[lutIdx * 3 + 1];
        const b      = colorLUT[lutIdx * 3 + 2];

        const fadeStart = VH - FADE_PX;
        let alpha = fi > 0.02 ? 0.5 : 0.6;
        if (sy > fadeStart) alpha *= Math.max(0, 1 - (sy - fadeStart) / FADE_PX);
        if (alpha < 0.005) continue;

        c.beginPath();
        c.arc(dx[i], sy, dotSize + fi * dotHoverScale, 0, Math.PI * 2);
        c.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        c.fill();
      }

      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouseActive = true;
    };

    const onLeave = () => {
      mouseActive = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const onScroll = () => {
      rawScroll = window.scrollY;
    };

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(init, 150);
    };

    init();
    loop();

    window.addEventListener("mousemove",  onMove);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("scroll",     onScroll, { passive: true });
    window.addEventListener("resize",     onResize);

    return () => {
      window.removeEventListener("mousemove",  onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("scroll",     onScroll);
      window.removeEventListener("resize",     onResize);
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
    };
  }, [gap, radius, strength, smooth, colorSmooth, dotSize, dotHoverScale,
      baseColor, activeColor, scrollSpeed, scrollInertia]);

  return (
    <div ref={wrapperRef} className={className}>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 -z-10 pointer-events-none"
      />
    </div>
  );
};