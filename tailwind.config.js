/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#00f0ff',
        secondary: '#1f2937',
        accent: '#ff00ff',
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-fast': 'pulse 1s linear infinite',
      },
    },
  },
  plugins: [],
};
