"use client";

import { useRef } from "react";
import { useLenis } from "lenis/react";
import { HeroIllustration } from "../svg/HeroIllustration";

const Hero = () => {
  const fadeRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useLenis(({ scroll }) => {
    if (!fadeRef.current) return;

    const vh = window.innerHeight;
    const progress = Math.min(scroll / (vh * 0.8), 1);
    const opacity = 1 - progress * progress;
    
    fadeRef.current.style.opacity = String(Math.max(opacity, 0));
    
    if (overlayRef.current) {
      overlayRef.current.style.opacity = String(progress);
    }
  });

  return (
    <section className="sticky top-0 h-screen w-full overflow-hidden px-6 flex justify-center">
      <div 
        ref={fadeRef} 
        className="absolute inset-0 will-change-opacity"
      >
        <div
          ref={overlayRef}
          className="absolute inset-0 bg-background pointer-events-none opacity-0"
        />

        <div className="relative z-10 max-w-8xl text-center flex flex-col pt-40 items-center gap-6 mx-auto">
          <h1 className="text-4xl md:text-8xl tracking-tight text-foreground">
            Smart Meeting & <br />
            Collaboration Platform
          </h1>

          <p className="text-muted-foreground text-base md:text-lg max-w-2xl">
            Real-Time Video Meetings • AI Summaries • Smart Action Items • Team Collaboration
          </p>

          <div className="flex items-center rounded-xl border border-border bg-card mt-9 overflow-hidden shadow-sm">
            <input
              type="text"
              placeholder="Just Enter a code or link"
              className="px-5 py-3 bg-transparent outline-none text-base md:text-lg w-[240px] md:w-[320px] text-foreground placeholder:text-muted-foreground"
            />
            <button className="bg-primary text-primary-foreground px-6 py-3 m-1 rounded-md">
              Join Now
            </button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full pointer-events-none">
          <HeroIllustration className="w-full h-auto" />
        </div>
      </div>
    </section>
  );
};

export default Hero;