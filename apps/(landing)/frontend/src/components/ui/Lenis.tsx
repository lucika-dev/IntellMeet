"use client";

import { ReactLenis, useLenis } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Lenis({ children }: { children: React.ReactNode }) {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove((time) => {
        lenis.raf(time * 1000);
      });
    };
  }, [lenis]);

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.15,
        duration: 1.2,
        smoothWheel: true,
        wheelMultiplier: 1.4,
        touchMultiplier: 0.1,
      }}
    >
      {children}
    </ReactLenis>
  );
}