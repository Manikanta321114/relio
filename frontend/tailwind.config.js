/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#14532d",
        secondary: "#d4a017",
        background: "#f8fafc",
        text: "#111827",
      },
    },
  },
  plugins: [],
}
