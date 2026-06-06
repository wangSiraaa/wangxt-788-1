/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        seat: {
          available: '#10b981',
          occupied: '#ef4444',
          cleaning: '#f59e0b',
          closed: '#6b7280',
          selected: '#3b82f6'
        }
      }
    },
  },
  plugins: [],
}
