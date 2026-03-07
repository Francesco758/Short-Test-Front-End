// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        mont: ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f3f8ff',
          100: '#dbeeff',
          500: '#0ea5e9', // use as primary if you like
        }
      },
      borderRadius: {
        'lg-2xl': '1rem',
      },
      spacing: {
        '9': '2.25rem'
      }
    },
  },
  plugins: [],
}