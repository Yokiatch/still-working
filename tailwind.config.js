/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      dropShadow: {
        'blue-glow': '0 0 2em #646cffaa',
        'react-glow': '0 0 2em #61dafbaa',
      },
      keyframes: {
        'logo-spin': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'logo-spin-slow': 'logo-spin 20s linear infinite',
      },
    },
  },
  plugins: [],
  variants: {
    extend: {
      dropShadow: ['hover'],
      animation: ['motion-safe'],
    },
  },
};
