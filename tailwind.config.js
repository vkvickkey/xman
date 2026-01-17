/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'p-violet': '#8A2BE2',
        'p-magenta': '#BF40FF',
        'p-cyan': '#D966FF',
      },
      fontFamily: {
        poppins: ['"Poppins"', 'sans-serif'],
      },

      backgroundImage: {
        'purple-gradient': 'linear-gradient(to right, #8A2BE2, #BF40FF, #D966FF)',
      },
      boxShadow: {
        'purple-glow': '0 0 15px rgba(183, 71, 255, 0.4), 0 0 25px rgba(183, 71, 255, 0.2)',
      }
    },
    screens: {
      'sm': { 'max': '639px' },
    }
  },
  plugins: [],
}

