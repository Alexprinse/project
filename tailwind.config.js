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
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        neumorphism: '10px 10px 20px #1c1c1c, -10px -10px 20px #2a2a2a',
      },
    },
  },
  plugins: [],
};
