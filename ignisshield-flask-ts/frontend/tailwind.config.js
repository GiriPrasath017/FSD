/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        sand: '#EAEBD0',
        rose: '#DA6C6C',
        brick: '#CD5656',
        wine: '#AF3E3E',
      },
      boxShadow: {
        glow: '0 0 30px rgba(218,108,108,0.55)',
        glowGreen: '0 0 30px rgba(16,185,129,0.45)'
      },
      animation: {
        pulseSoft: 'pulseSoft 1.4s ease-in-out infinite'
      },
      keyframes: {
        pulseSoft: {
          '0%, 100%': { boxShadow: '0 0 0 rgba(175,62,62,0.3)' },
          '50%': { boxShadow: '0 0 18px rgba(175,62,62,0.7)' }
        }
      }
    },
  },
  plugins: [],
}

