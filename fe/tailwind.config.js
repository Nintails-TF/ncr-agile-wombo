/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./*.html','./node_modules/flowbite/**/*.js'], 
  theme: {
    container: {
      center: true
    },
    extend: {
      fontFamily: {
        sans: ['Roboto', 'sans-serif']
      },
      colors: {
        'primary': '#2C3E50',
      }
    },
  },

    plugins: [require('flowbite/plugin')
    ],
}