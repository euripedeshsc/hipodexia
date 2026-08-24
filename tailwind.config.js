/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        medical: {
          blue: '#0284c7', // Ocean blue
          blueDark: '#0f172a',
          blueLight: '#e0f2fe',
          yellow: '#eab308',
          yellowLight: '#fef08a',
          red: '#ef4444',
          redLight: '#fee2e2',
        }
      },
      boxShadow: {
        'glow': '0 0 15px rgba(255, 255, 255, 0.8)',
        'glow-blue': '0 0 15px rgba(2, 132, 199, 0.8)'
      },
      animation: {
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
