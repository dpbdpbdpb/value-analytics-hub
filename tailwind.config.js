/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cs-primary': '#BA4896',
        'cs-secondary': '#7B2D65',
      }
    },
  },
  plugins: [],
}
