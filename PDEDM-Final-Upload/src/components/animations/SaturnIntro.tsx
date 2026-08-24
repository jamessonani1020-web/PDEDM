"use client";

import { useEffect, useState } from "react";

export function SaturnIntro() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Hide the intro overlay from the DOM shortly after the animation finishes
    const timer = setTimeout(() => setShow(false), 2600);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none animate-overlay-slide bg-black/10 dark:bg-black/30 backdrop-blur-[60px] shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-10px_40px_rgba(255,255,255,0.1)] dark:shadow-[inset_0_1px_3px_rgba(255,255,255,0.2),inset_0_-10px_40px_rgba(255,255,255,0.05)] border-t border-l border-white/30 dark:border-white/10 bg-gradient-to-br from-white/20 via-transparent to-black/20 dark:from-white/5 dark:to-transparent">
      <div className="animate-saturn-zoom text-slate-800 dark:text-slate-100">
        <svg
          viewBox="0 0 800 600"
          className="w-96 h-96 sm:w-[500px] sm:h-[500px] drop-shadow-[0_0_80px_rgba(59,130,246,0.3)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Rings (Back) */}
          <ellipse
            cx="400"
            cy="300"
            rx="280"
            ry="60"
            transform="rotate(-20 400 300)"
            stroke="url(#ringGrad)"
            strokeWidth="32"
            opacity="0.3"
          />

          {/* Planet Body */}
          <circle cx="400" cy="300" r="140" fill="currentColor" />
          <circle cx="400" cy="300" r="140" fill="url(#planetGrad)" />

          {/* Rings (Front) */}
          <g clipPath="url(#frontClip)">
            <ellipse
              cx="400"
              cy="300"
              rx="280"
              ry="60"
              transform="rotate(-20 400 300)"
              stroke="url(#ringGrad)"
              strokeWidth="32"
              opacity="0.9"
            />
            <ellipse
              cx="400"
              cy="300"
              rx="230"
              ry="35"
              transform="rotate(-20 400 300)"
              stroke="url(#ringGrad2)"
              strokeWidth="12"
              opacity="0.6"
            />
          </g>

          {/* Gradients & Masks */}
          <defs>
            <radialGradient
              id="planetGrad"
              cx="330"
              cy="230"
              r="220"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="0.5" stopColor="#1e3a8a" stopOpacity="0.9" />
              <stop offset="1" stopColor="#020617" stopOpacity="1" />
            </radialGradient>
            
            <linearGradient
              id="ringGrad"
              x1="120"
              y1="300"
              x2="680"
              y2="300"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#60a5fa" stopOpacity="0" />
              <stop offset="0.2" stopColor="#93c5fd" stopOpacity="0.8" />
              <stop offset="0.8" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="1" stopColor="#1e3a8a" stopOpacity="0" />
            </linearGradient>

            <linearGradient
              id="ringGrad2"
              x1="170"
              y1="300"
              x2="630"
              y2="300"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#bfdbfe" stopOpacity="0" />
              <stop offset="0.5" stopColor="#bfdbfe" stopOpacity="1" />
              <stop offset="1" stopColor="#2563eb" stopOpacity="0" />
            </linearGradient>

            <clipPath id="frontClip">
              <rect
                x="0"
                y="300"
                width="800"
                height="300"
                transform="rotate(-20 400 300)"
              />
            </clipPath>
          </defs>
        </svg>
      </div>
    </div>
  );
}
