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
      },
      animation: {
        "fade-in": "fade-in .25s ease both",
        "toast-in": "toast-in .2s ease both",
      },
    },
  },
  plugins: [],
};

export default config;
