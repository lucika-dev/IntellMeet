'use client';
import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function Magnetic({ children }: { children: React.ReactElement }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 350, damping: 20, mass: 0.5 };
  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);
  
  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;

    x.set(distanceX * 0.4);
    y.set(distanceY * 0.4);
  };

  const leave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMove}
      onMouseLeave={leave}
      style={{ 
        x: smoothX, 
        y: smoothY,
        display: "inline-block", 
        position: "relative" 
      }}
      data-magnetic 
    >
      {children}
    </motion.div>
  );
}