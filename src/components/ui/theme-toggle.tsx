"use client";

import { useTheme } from "@/components/providers";
import { Moon, Sun } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md";
}

export function ThemeToggle({ className = "", size = "md" }: ThemeToggleProps) {
  const { theme, toggle } = useTheme();
  const dim = size === "sm" ? "w-8 h-8" : "w-9 h-9";
  const iconSize = size === "sm" ? 14 : 16;

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className={`${dim} relative flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-cyan-500/40 hover:bg-[var(--hover-bg)] transition-all duration-200 overflow-hidden ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === "dark" ? (
          <motion.span
            key="sun"
            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <Sun size={iconSize} className="text-cyan-400" weight="fill" />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <Moon size={iconSize} className="text-[var(--text-muted)]" weight="fill" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
