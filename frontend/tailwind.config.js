/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        violet: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2d0040', // Deep Dark Violet
        },
        gold: {
          50: '#fffdf0',
          100: '#fff9d6',
          200: '#fff1a1',
          300: '#ffe25e',
          400: '#ffd029',
          500: '#ffd700', // Classic Gold
          600: '#e6b800',
          700: '#bf9000',
          800: '#997300',
          900: '#735600',
        }
      }
    },
  },
  plugins: [],
}