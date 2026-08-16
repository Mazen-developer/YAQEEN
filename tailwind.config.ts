import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      colors: {
        line: "rgba(0,0,0,0.18)",
        brand: {
          50: "#fff0f6",
          100: "#ffe1ee",
          200: "#ffc2dd",
          300: "#ff9cc6",
          400: "#fb6fac",
          500: "#f0428d",
          600: "#d92a72",
          700: "#b31d5c",
          800: "#8f1a4b",
          900: "#731a40",
        },
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "toast-in": {
          "0%": { opacity: "0", transform: "translate(-50%, 12px)" },
          "100%": { opacity: "1", transform: "translate(-50%, 0)" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.92) translateY(8px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "blob-float-1": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(4%, 6%) scale(1.08)" },
          "66%": { transform: "translate(-3%, 3%) scale(0.96)" },
        },
        "blob-float-2": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "40%": { transform: "translate(-5%, -4%) scale(1.05)" },
          "70%": { transform: "translate(3%, -6%) scale(0.94)" },
        },
        "blob-float-3": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(-4%, 5%) scale(1.1)" },
        },
        flicker: {
          "0%, 100%": { transform: "scaleY(1) scaleX(1) rotate(-1deg)", opacity: "1" },
          "20%": { transform: "scaleY(1.04) scaleX(0.98) rotate(1deg)", opacity: "0.96" },
          "40%": { transform: "scaleY(0.96) scaleX(1.03) rotate(-2deg)", opacity: "1" },
          "60%": { transform: "scaleY(1.06) scaleX(0.97) rotate(1.5deg)", opacity: "0.94" },
          "80%": { transform: "scaleY(0.98) scaleX(1.01) rotate(-1deg)", opacity: "1" },
        },
        glow: {
          "0%, 100%": { opacity: "0.55", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(1.12)" },
        },
        "fade-out-loader": {
          "0%": { opacity: "1", visibility: "visible" },
          "99%": { opacity: "0", visibility: "visible" },
          "100%": { opacity: "0", visibility: "hidden" },
        },
      },
      animation: {
        "fade-in": "fade-in .25s ease both",
        "toast-in": "toast-in .2s ease both",
        "pop-in": "pop-in .35s cubic-bezier(0.22,1,0.36,1) both",
        "blob-float-1": "blob-float-1 16s ease-in-out infinite",
        "blob-float-2": "blob-float-2 20s ease-in-out infinite",
        "blob-float-3": "blob-float-3 24s ease-in-out infinite",
        flicker: "flicker 2.4s ease-in-out infinite",
        glow: "glow 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
