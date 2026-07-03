/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          pink: "#FFD6E8",
          "pink-deep": "#E8A0C0",
          mint: "#C8F5E4",
          "mint-deep": "#6BC4A0",
          lavender: "#E4D4F5",
          "lavender-deep": "#A88FD4",
          sky: "#D4ECFF",
          "sky-deep": "#7BB8E8",
          peach: "#FFE4CC",
          "peach-deep": "#E8A878",
          lemon: "#FFF4CC",
          "lemon-deep": "#D4B85C",
          cream: "#FFFBF5",
          rose: "#FFC8D8",
          "rose-deep": "#D47898",
        },
      },
      boxShadow: {
        pastel: "0 4px 24px -4px rgba(200, 170, 220, 0.25)",
        "pastel-sm": "0 2px 12px -2px rgba(200, 170, 220, 0.2)",
      },
    },
  },
  plugins: [],
}
