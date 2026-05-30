"use client";

import React, { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

export default function Loading() {
  const [progress, setProgress] = useState(0);

  const springProgress = useSpring(0, {
    stiffness: 60,
    damping: 30,
    restDelta: 0.001,
  });

  const displayValue = useTransform(springProgress, (latest: number) =>
    Math.round(latest)
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (progress < 100) {
        const increment = Math.floor(Math.random() * 15) + 5;
        setProgress(Math.min(progress + increment, 100));
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [progress]);

  useEffect(() => {
    springProgress.set(progress);
  }, [progress, springProgress]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black">
      <div className="flex flex-col items-start">
        <div className="flex items-baseline gap-2">
          <motion.span 
            className="text-8xl md:text-9xl font-bold tracking-tighter text-white tabular-nums"
          >
            {displayValue}
          </motion.span>
          <span className="text-3xl font-medium text-zinc-500">%</span>
        </div>

        <div className="relative mt-4 h-1 w-64 overflow-hidden rounded-full bg-zinc-800">
          <motion.div
            className="absolute inset-y-0 left-0 bg-white"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "circOut", duration: 0.5 }}
          />
        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 font-mono text-[10px] uppercase tracking-[0.4em] text-zinc-600"
        >
          {progress < 100 ? "Syncing System Data" : "System Ready"}
        </motion.p>
      </div>
    </div>
  );
}