/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#FF6C1F",
        secondary: "#162247",
        accent: "#757575",
      },
    },
  },
  plugins: [],
};
