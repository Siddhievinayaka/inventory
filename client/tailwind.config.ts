/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f8f6f3',
          100: '#f0ede7',
          200: '#ddd5cc',
          300: '#cabdb1',
          400: '#b0927f',
          500: '#96774e',
          600: '#7d6242',
          700: '#654d36',
          800: '#4c382a',
          900: '#33231f',
        },
      },
      boxShadow: {
        'sm-soft': '0 1px 3px rgba(0,0,0,0.08)',
        'lg-soft': '0 8px 24px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
