/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // <-- ESSA É A LINHA MÁGICA
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "node_modules/flowbite-react/lib/esm/**/*.js"
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('flowbite/plugin')
  ],
}