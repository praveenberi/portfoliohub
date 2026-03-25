"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// ─── Animated Grid Background (21st.dev style) ───────────────────────────────
// Subtle CSS grid lines that fade in with a shimmer

export function GridBackground({ color = "#22c55e" }: { color?: string }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
      style={{
        backgroundImage: `
          linear-gradient(${color}12 1px, transparent 1px),
          linear-gradient(90deg, ${color}12 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
        maskImage: "radial-gradient(ellipse 80% 80% at 50% 0%, black 40%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 0%, black 40%, transparent 100%)",
      }}
    />
  );
}

// ─── Dot Matrix Background (21st.dev style) ──────────────────────────────────

export function DotBackground({ color = "#22c55e" }: { color?: string }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
      style={{
        backgroundImage: `radial-gradient(${color}30 1px, transparent 1px)`,
        backgroundSize: "28px 28px",
        maskImage: "radial-gradient(ellipse 90% 90% at 50% 0%, black 30%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 90% 90% at 50% 0%, black 30%, transparent 100%)",
      }}
    />
  );
}

// ─── Aurora Background (21st.dev style) ──────────────────────────────────────
// Animated colorful gradient blobs

export function AuroraBackground({ color = "#22c55e" }: { color?: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <motion.div
        className="absolute -top-1/2 -left-1/4 w-[800px] h-[600px] rounded-full opacity-20 blur-[120px]"
        style={{ background: color }}
        animate={{
          x: [0, 60, -40, 0],
          y: [0, -40, 30, 0],
          scale: [1, 1.15, 0.9, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -top-1/4 right-0 w-[600px] h-[500px] rounded-full opacity-15 blur-[140px]"
        style={{ background: `${color}aa` }}
        animate={{
          x: [0, -50, 30, 0],
          y: [0, 40, -20, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />
      <motion.div
        className="absolute top-1/3 left-1/3 w-[500px] h-[400px] rounded-full opacity-10 blur-[100px]"
        style={{ background: `${color}66` }}
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -30, 20, 0],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 8 }}
      />
    </div>
  );
}

// ─── Meteors / Shooting Stars (21st.dev style) ────────────────────────────────

export function Meteors({ count = 12, color = "#22c55e" }: { count?: number; color?: string }) {
  const meteors = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 6,
    duration: 3 + Math.random() * 4,
    size: 1 + Math.random() * 1.5,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {meteors.map((m) => (
        <motion.span
          key={m.id}
          className="absolute top-0 block rounded-full"
          style={{
            left: m.left,
            width: `${m.size}px`,
            height: `${80 + Math.random() * 60}px`,
            background: `linear-gradient(to bottom, ${color}, transparent)`,
            opacity: 0,
          }}
          animate={{
            y: ["0vh", "110vh"],
            opacity: [0, 0.8, 0.8, 0],
          }}
          transition={{
            duration: m.duration,
            repeat: Infinity,
            delay: m.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

// ─── Sparkles (21st.dev style) ────────────────────────────────────────────────

export function Sparkles({ color = "#22c55e" }: { color?: string }) {
  const sparkles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: `${10 + Math.random() * 80}%`,
    y: `${10 + Math.random() * 60}%`,
    size: 4 + Math.random() * 6,
    delay: Math.random() * 3,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {sparkles.map((s) => (
        <motion.div
          key={s.id}
          className="absolute"
          style={{ left: s.x, top: s.y }}
          animate={{
            scale: [0, 1, 0],
            rotate: [0, 180],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: s.delay,
            ease: "easeInOut",
          }}
        >
          <SparkleIcon size={s.size} color={color} />
        </motion.div>
      ))}
    </div>
  );
}

function SparkleIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5L8 0Z"
        fill={color}
      />
    </svg>
  );
}

// ─── Background switcher ──────────────────────────────────────────────────────
// Used in the public portfolio to apply the correct animation

export function PortfolioBackground({
  style,
  color,
  bgColor,
  children,
}: {
  style?: string;
  color: string;
  bgColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative" style={{ backgroundColor: bgColor }}>
      {style === "grid" && <GridBackground color={color} />}
      {style === "dots" && <DotBackground color={color} />}
      {style === "aurora" && <AuroraBackground color={color} />}
      {style === "meteors" && <Meteors color={color} />}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
