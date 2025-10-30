/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./utils/**/*.{js,ts,jsx,tsx}"],
  plugins: [require("daisyui")],
  darkTheme: "dark",
  // DaisyUI theme colors
  daisyui: {
    themes: [
      {
        dark: {
          primary: "#1a4d2e", // Dark green (Dayak forest)
          "primary-content": "#FFFFFF",
          secondary: "#2d5f3f", // Medium green
          "secondary-content": "#FFFFFF",
          accent: "#4ade80", // Bright green accent
          "accent-content": "#0f172a",
          neutral: "#1e293b", // Dark slate
          "neutral-content": "#ffffff",
          "base-100": "#0f172a", // Very dark blue-slate
          "base-200": "#1e293b", // Dark slate
          "base-300": "#334155", // Medium slate
          "base-content": "#f1f5f9", // Light slate text
          info: "#3b82f6",
          success: "#22c55e", // Green success
          warning: "#f59e0b",
          error: "#ef4444",

          "--rounded-btn": "9999rem",

          ".tooltip": {
            "--tooltip-tail": "6px",
          },
          ".link": {
            textUnderlineOffset: "2px",
          },
          ".link:hover": {
            opacity: "80%",
          },
        },
      },
    ],
  },
  theme: {
    extend: {
      colors: {
        dayak: {
          green: {
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
            950: "#1a4d2e", // Primary dark green
          },
        },
      },
      boxShadow: {
        center: "0 0 12px -2px rgb(0 0 0 / 0.05)",
        glow: "0 0 20px rgba(34, 197, 94, 0.3)",
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      backgroundImage: {
        "dayak-pattern": "url('/dayak-texture.svg')",
      },
    },
  },
};
