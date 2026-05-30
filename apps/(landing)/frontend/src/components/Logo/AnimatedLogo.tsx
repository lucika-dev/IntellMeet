"use client";
import React, { useRef, useEffect, useState } from "react";
import { motion } from "motion/react";

const LogoHoverEffect = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [maskPosition, setMaskPosition] = useState({
    cx: "50%",
    cy: "50%",
  });

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
      className="w-[600px] md:w-[800px]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
    >
      <defs>
        <linearGradient id="logoGradient" gradientUnits="userSpaceOnUse">
          <animateTransform
            attributeName="gradientTransform"
            type="rotate"
            from="0 187.5 37.5"
            to="360 187.5 37.5"
            dur="10s"
            repeatCount="indefinite"
          />
          <stop offset="0%" stopColor="rgb(168,85,247)" />
          <stop offset="25%" stopColor="rgb(6,182,212)" />
          <stop offset="50%" stopColor="rgb(59,130,246)" />
          <stop offset="75%" stopColor="rgb(6,182,212)" />
          <stop offset="100%" stopColor="rgb(168,85,247)" />
        </linearGradient>

        <motion.radialGradient
          id="revealMask"
          gradientUnits="userSpaceOnUse"
          r="25%"
          initial={{ cx: "50%", cy: "50%" }}
          animate={maskPosition}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 30,
          }}
        >
          <stop offset="0%" stopColor="black" />
          <stop offset="60%" stopColor="rgba(0,0,0,0.85)" />
          <stop offset="100%" stopColor="white" />
        </motion.radialGradient>

        <mask id="logoMask">
          <rect width="100%" height="100%" fill="url(#revealMask)" />
        </mask>
      </defs>

      <path
        d="M 349.535156 8.054688 C 348.371094 11.992188 344.828125 16.117188 341.171875 17.789062 C 339.34375 18.621094 334.59375 19.414062 332.394531 19.25 C 331.71875 19.199219 331.472656 19.375 331.390625 19.972656 C 331.28125 20.722656 331.414062 20.761719 334.242188 20.859375 L 337.207031 20.964844 L 337.566406 50.207031 L 338.914062 52.933594"
        stroke="url(#logoGradient)"
        strokeWidth="1.5"
        fill="transparent"
        mask={hovered ? "url(#logoMask)" : undefined}
      />
    </svg>
  );
};

export default LogoHoverEffect;