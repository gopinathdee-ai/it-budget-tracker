/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        lato: ['Lato', 'sans-serif'],
        segoe: ['Segoe UI', 'sans-serif'],
        jetbrains: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
