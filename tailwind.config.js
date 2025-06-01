/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/pages/**/*.{html,js}",
    "./public/js/**/*.js",
    "./src/**/*.{html,js}"
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif']
      }
    }
  },
  plugins: []
} 