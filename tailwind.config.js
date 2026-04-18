/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        navy: "#0B2545",
        primary: "#1D4ED8",
        "primary-soft": "#EEF3FF",
        teal: "#0F766E",
        "teal-soft": "#E6F4F2",
        warn: "#B91C1C",
        "warn-soft": "#FBEAEA",
        ink: "#0F172A",
        ink2: "#475569",
        ink3: "#94A3B8",
        line: "#E6EAF0",
        surface: "#F5F7FA",
        card: "#FFFFFF",
      },
    },
  },
  plugins: [],
};
