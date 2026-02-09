/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  corePlugins: {
    container: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
}

