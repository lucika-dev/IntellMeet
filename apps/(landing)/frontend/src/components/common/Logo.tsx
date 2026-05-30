"use client";

import React from "react";
import Link from "next/link";

interface LogoProps {
  src: string;
  alt: string;
  href?: string;
  size?: number;
  className?: string;
}

export function Logo({
  src,
  alt,
  href = "/",
  size = 48,
  className = "",
}: LogoProps) {
  return (
    <Link href={href} aria-label={alt} className="shrink-0">
      <div
        role="img"
        className={`
          transition-all duration-300
          bg-foreground hover:opacity-80
          ${className}
        `}
        style={{
          width: size,
          height: size,
          maskImage: `url("${src}")`,
          maskSize: "contain",
          maskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskImage: `url("${src}")`,
          WebkitMaskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
        }}
      />
    </Link>
  );
}
