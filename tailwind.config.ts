import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      colors: {
        zinc: {
          50: "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          300: "#d4d4d8",
          400: "#a1a1aa",
          500: "#71717a",
          600: "#52525b",
          700: "#3f3f46",
          800: "#27272a",
          900: "#18181b",
          950: "#09090b",
        },
        accent: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
        cyan: {
          50:  "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#00d4ff",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
        },
        magenta: {
          50:  "#fdf4ff",
          100: "#fae8ff",
          200: "#f5d0fe",
          300: "#f0abfc",
          400: "#e879f9",
          500: "#e040fb",
          600: "#c026d3",
          700: "#a21caf",
          800: "#86198f",
          900: "#701a75",
        },
        dark: {
          bg:      "#080c14",
          surface: "#0f1624",
          card:    "#131d2e",
          border:  "#1e2d45",
          muted:   "#1a2535",
          hover:   "#172038",
        },
      },
      backgroundImage: {
        "brand-gradient":   "linear-gradient(135deg, #00d4ff 0%, #e040fb 100%)",
        "brand-gradient-x": "linear-gradient(90deg, #00d4ff 0%, #e040fb 100%)",
        "mesh-dark":
          "radial-gradient(at 20% 30%, rgba(0,212,255,0.07) 0%, transparent 60%), radial-gradient(at 80% 70%, rgba(224,64,251,0.07) 0%, transparent 60%)",
        "mesh-light":
          "radial-gradient(at 20% 30%, rgba(0,212,255,0.05) 0%, transparent 60%), radial-gradient(at 80% 70%, rgba(224,64,251,0.05) 0%, transparent 60%)",
        "mesh-gradient":
          "radial-gradient(at 40% 20%, hsla(152,60%,74%,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,60%,56%,0.1) 0px, transparent 50%)",
      },
      animation: {
        "slide-up":        "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in":         "fadeIn 0.4s ease forwards",
        shimmer:           "shimmer 2s linear infinite",
        float:             "float 3s ease-in-out infinite",
        "spin-slow":       "spin 8s linear infinite",
        marquee:           "marquee 25s linear infinite",
        "marquee-reverse": "marquee-reverse 25s linear infinite",
        "gradient-x":      "gradient-x 4s ease infinite",
        "glow-pulse":      "glow-pulse 2.5s ease-in-out infinite",
        "bounce-subtle":   "bounce-subtle 2s ease-in-out infinite",
        "neon-flicker":    "neon-flicker 3s ease-in-out infinite",
        "slide-in-right":  "slide-in-right 0.4s cubic-bezier(0.16,1,0.3,1) forwards",
        "scale-in":        "scale-in 0.3s cubic-bezier(0.16,1,0.3,1) forwards",
        "pulse-slow":      "pulse 3s ease-in-out infinite",
      },
      keyframes: {
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-8px)" },
        },
        marquee: {
          "0%":   { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        "marquee-reverse": {
          "0%":   { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0%)" },
        },
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%", backgroundSize: "200% 200%" },
          "50%":      { backgroundPosition: "100% 50%", backgroundSize: "200% 200%" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.5", transform: "scale(1)" },
          "50%":      { opacity: "1",   transform: "scale(1.08)" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-4px)" },
        },
        "neon-flicker": {
          "0%, 100%": { opacity: "1" },
          "90%":      { opacity: "0.85" },
          "92%":      { opacity: "1" },
          "94%":      { opacity: "0.9" },
          "96%":      { opacity: "1" },
        },
        "slide-in-right": {
          "0%":   { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          "0%":   { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      boxShadow: {
        card:            "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
        "card-hover":    "0 4px 6px rgba(0,0,0,0.04), 0 10px 30px rgba(0,0,0,0.08)",
        glow:            "0 0 40px rgba(34,197,94,0.15)",
        "glow-cyan":     "0 0 30px rgba(0,212,255,0.25), 0 0 60px rgba(0,212,255,0.1)",
        "glow-magenta":  "0 0 30px rgba(224,64,251,0.25), 0 0 60px rgba(224,64,251,0.1)",
        "glow-brand":    "0 0 40px rgba(0,212,255,0.2), 0 0 80px rgba(224,64,251,0.15)",
        "neon-cyan":     "0 0 8px rgba(0,212,255,0.6), 0 0 20px rgba(0,212,255,0.3)",
        "neon-magenta":  "0 0 8px rgba(224,64,251,0.6), 0 0 20px rgba(224,64,251,0.3)",
        "dark-card":     "0 4px 24px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.04) inset",
        "dark-card-hover":"0 8px 40px rgba(0,212,255,0.1), 0 4px 24px rgba(0,0,0,0.5)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
