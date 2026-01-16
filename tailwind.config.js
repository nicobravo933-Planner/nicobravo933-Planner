/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        indigo: {
          50: '#f5f7ff',
          100: '#ebf0fe',
          200: '#ced9fb',
          300: '#adc0f7',
          400: '#89a2f1',
          500: '#637eeb',
          600: '#4f46e5',
          700: '#3f36d0',
          800: '#342da6',
          900: '#2e2985',
          950: '#1e1b4b',
        },
      },
    },
  },
  plugins: [],
}