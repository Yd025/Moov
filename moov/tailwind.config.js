/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'moov-dark': '#121212',
        'moov-primary': '#33E1ED',
        'moov-primary-dark': '#2AC5D0',
      },
      fontSize: {
        'base': '18px',
        'lg': '20px',
        'xl': '24px',
        '2xl': '30px',
        '3xl': '36px',
      },
      minHeight: {
        'touch': '48px',
      },
    },
  },
  plugins: [],
}

