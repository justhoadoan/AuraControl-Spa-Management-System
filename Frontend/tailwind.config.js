/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"], // Đảm bảo dòng này đúng
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#C37C90",
        "background-light": "#FFF7F9",
        "background-dark": "#1A1A1A",
        "surface-light": "#FFFFFF",
        "surface-dark": "#2C2C2C",
        "text-light": "#1F2937",
        "text-dark": "#E5E7EB",
        "subtle-light": "#6B7280",
        "subtle-dark": "#9CA3AF"
      },
      fontFamily: {
        display: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
}