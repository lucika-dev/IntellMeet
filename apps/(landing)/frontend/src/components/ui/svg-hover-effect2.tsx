"use client";
import React, { useRef, useEffect, useState, useId } from "react";
import { motion } from "motion/react";

export const SvgHoverEffect = ({
  path,
  duration = 0.3,
  strokeWidth = 1.5,
  className = "",
  reverse = false,
}: {
  path: string;
  duration?: number;
  strokeWidth?: number;
  className?: string;
  reverse?: boolean;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const gradientId = useId();
  const maskId = useId();
  const radialId = useId();

  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [maskPosition, setMaskPosition] = useState({
    cx: "50%",
    cy: "50%",
  });

  const randomColor = () =>
    `hsl(${Math.floor(Math.random() * 360)}, 90%, 60%)`;

  const [colors, setColors] = useState<string[]>([]);

  useEffect(() => {
    setColors([
      randomColor(),
      randomColor(),
      randomColor(),
      randomColor(),
      randomColor(),
    ]);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setColors([
        randomColor(),
        randomColor(),
        randomColor(),
        randomColor(),
        randomColor(),
      ]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();

    const cx = ((cursor.x - rect.left) / rect.width) * 100;
    const cy = ((cursor.y - rect.top) / rect.height) * 100;

    setMaskPosition({
      cx: `${cx}%`,
      cy: `${cy}%`,
    });
  }, [cursor]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 375 75"
      className={`w-full h-full select-none ${className}`}
      preserveAspectRatio="xMidYMid meet"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
    >
      <defs>
        <motion.linearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          initial={{ x1: "0%", x2: "100%" }}
          animate={{ x1: "100%", x2: "0%" }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {colors.map((c, i) => (
            <stop
              key={i}
              offset={`${(i / (colors.length - 1)) * 100}%`}
              stopColor={c}
            />
          ))}
        </motion.linearGradient>

        <motion.radialGradient
          id={radialId}
          gradientUnits="userSpaceOnUse"
          r="28%"
          initial={{ cx: "50%", cy: "50%" }}
          animate={maskPosition}
          transition={{ duration, ease: "easeOut" }}
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="60%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>

        <mask id={maskId}>
          <rect width="100%" height="100%" fill={`url(#${radialId})`} />
        </mask>
      </defs>

      {!reverse && (
        <>
          <motion.path
            d={path}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            vectorEffect="non-scaling-stroke"
            initial={{ strokeDasharray: 2000, strokeDashoffset: 2000 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 3, ease: "easeInOut" }}
          />

          {hovered && (
            <path
              d={path}
              stroke={`url(#${gradientId})`}
              strokeWidth={strokeWidth}
              fill="transparent"
              vectorEffect="non-scaling-stroke"
              mask={`url(#${maskId})`}
            />
          )}
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

          {hovered && (
            <path
              d={path}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              vectorEffect="non-scaling-stroke"
              mask={`url(#${maskId})`}
            />
          )}
        </>
      )}
    </svg>
  );
};