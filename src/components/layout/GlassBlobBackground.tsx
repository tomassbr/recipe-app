"use client";

import { motion } from "framer-motion";

/**
 * Soft blurred shapes behind glass UI — adds depth like premium Dribbble shots.
 */
export function GlassBlobBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-20 overflow-hidden"
      aria-hidden
    >
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.65]"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter id="soft-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="42" />
          </filter>
          <linearGradient id="blob-a" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0f7fa" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#b8e0eb" stopOpacity="0.35" />
          </linearGradient>
          <linearGradient id="blob-b" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ede7f6" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#e3f2fd" stopOpacity="0.4" />
          </linearGradient>
          <radialGradient id="blob-c" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="70%" stopColor="#D4AF37" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#e3f2fd" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g filter="url(#soft-blur)">
          <ellipse cx="20%" cy="30%" rx="22%" ry="26%" fill="url(#blob-a)" />
          <ellipse cx="82%" cy="68%" rx="24%" ry="20%" fill="url(#blob-b)" />
          <ellipse cx="52%" cy="20%" rx="16%" ry="18%" fill="url(#blob-c)" />
        </g>
      </svg>

      <motion.div
        className="absolute -left-[8%] top-[12%] h-[min(520px,52vh)] w-[min(520px,52vw)] rounded-full bg-[#e0f7fa]/45 blur-[100px]"
        animate={{ x: [0, 28, 0], y: [0, 18, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 21, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-[6%] bottom-[8%] h-[min(460px,46vh)] w-[min(460px,46vw)] rounded-full bg-[#ede7f6]/40 blur-[92px]"
        animate={{ x: [0, -22, 0], y: [0, -14, 0], scale: [1, 1.05, 1] }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2.5,
        }}
      />
      <motion.div
        className="absolute left-[38%] top-[58%] h-[min(300px,36vh)] w-[min(300px,36vw)] rounded-full bg-[#D4AF37]/12 blur-[88px]"
        animate={{ opacity: [0.35, 0.6, 0.35], x: [0, 14, 0] }}
        transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
