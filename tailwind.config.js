/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        "primary-dark": "#1D4ED8",
        accent: "#EF4444",
        surface: "#F8FAFC",
        "text-primary": "#1E293B",
        "text-secondary": "#64748B",
      },
    },
  },
  plugins: [],
};
