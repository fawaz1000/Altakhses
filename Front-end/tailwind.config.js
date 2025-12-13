/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#062b2d",
        accent: "#48d690",
        overlay: "rgba(6, 43, 45, 0.5)",
      },
    },
  },
  plugins: [],
};
