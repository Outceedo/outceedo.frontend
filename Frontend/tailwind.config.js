/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enables dark mode with the `dark` class
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"], // Specify where Tailwind should look for class names
  theme: {
    extend: {
      fontFamily: {
        Raleway: ['Raleway', 'serif'],
        Opensans: ['Open Sans', 'serif'],
      },
      colors: {
        customYellow: '#F9DC5C',
        lightYellow: '#FDE394',
        customGrey: '#D9D9D9',
      },
    },
  },
  plugins: [],
};
