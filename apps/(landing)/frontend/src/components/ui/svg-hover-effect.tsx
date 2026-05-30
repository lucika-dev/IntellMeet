"use client";
import React, { useRef, useState, useId } from "react";
import { motion, AnimatePresence } from "motion/react";

export const SvgHoverEffect = ({
  path,
  strokeWidth = 1.5,
  className = "",
  reverse = false,
}: {
  path: string;
  strokeWidth?: number;
  className?: string;
  reverse?: boolean;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const gradientId = useId();
  const maskId = useId();
  const radialId = useId();

  const [hovered, setHovered] = useState(false);
  const [maskPosition, setMaskPosition] = useState({
    cx: "50%",
    cy: "50%",
  });

  const updatePosition = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const cx = ((e.clientX - rect.left) / rect.width) * 100;
    const cy = ((e.clientY - rect.top) / rect.height) * 100;

    setMaskPosition({
      cx: `${cx}%`,
      cy: `${cy}%`,
    });
  };

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 375 75"
      className={`w-full h-full select-none ${className}`}
      preserveAspectRatio="xMidYMid meet"
      onMouseEnter={(e) => {
        setHovered(true);
        updatePosition(e);
      }}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={updatePosition}
    >
      <defs>
        <linearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" stopColor="oklch(62% 0.24 25)" />
          <stop offset="50%" stopColor="oklch(65% 0.22 290)" />
          <stop offset="100%" stopColor="oklch(62% 0.24 250)" />
        </linearGradient>

        <radialGradient
          id={radialId}
          gradientUnits="userSpaceOnUse"
          cx={maskPosition.cx}
          cy={maskPosition.cy}
          r="28%"
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="60%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </radialGradient>

        <mask id={maskId}>
          <rect width="100%" height="100%" fill={`url(#${radialId})`} />
        </mask>
      </defs>

      {!reverse && (
        <>
          <path
            d={path}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            vectorEffect="non-scaling-stroke"
          />

          <AnimatePresence>
            {hovered && (
              <motion.path
                d={path}
                stroke={`url(#${gradientId})`}
                strokeWidth={strokeWidth}
                fill="transparent"
                vectorEffect="non-scaling-stroke"
                mask={`url(#${maskId})`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              />
            )}
          </AnimatePresence>
        </>
      )}

      {reverse && (
        <>
          <path
            d={path}
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            fill="transparent"
            vectorEffect="non-scaling-stroke"
          />

          <AnimatePresence>
            {hovered && (
              <motion.path
                d={path}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                fill="transparent"
                vectorEffect="non-scaling-stroke"
                mask={`url(#${maskId})`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              />
            )}
          </AnimatePresence>
        </>
      )}
    </svg>
  );
};