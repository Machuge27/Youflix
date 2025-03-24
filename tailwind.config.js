// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: [
//       "./src/**/*.{js,jsx,ts,tsx}",
//   ],
//   theme: {
//       extend: {},
//   },
//   plugins: [],
// }

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'netflix-black': '#141414',
        'netflix-gray': '#121212',
        'netflix-red': '#E50914',
      },
    },
  },
  plugins: [],
}