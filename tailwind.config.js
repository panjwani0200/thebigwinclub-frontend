/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        casino: {
          bg: "#020617",
          panel: "#0b1220",
          panelSoft: "#111b30",
          text: "#f8fafc",
          muted: "#94a3b8",
          gold: "#f5c542",
          goldDeep: "#c48d1d",
          success: "#22c55e",
          danger: "#ef4444",
        },
      },
      fontFamily: {
        display: ["Sora", "Manrope", "Segoe UI", "sans-serif"],
        body: ["Manrope", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        casino: "0 14px 30px rgba(2,6,23,0.45)",
        glow: "0 0 28px rgba(245,197,66,0.25)",
      },
      animation: {
        riseIn: "riseIn 220ms ease-out",
      },
      keyframes: {
        riseIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
