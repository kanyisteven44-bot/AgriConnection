/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E8F5E9', 100: '#C8E6C9', 200: '#A5D6A7', 300: '#81C784',
          400: '#66BB6A', 500: '#4CAF50', 600: '#43A047', 700: '#388E3C',
          800: '#2E7D32', 900: '#1B5E20',
        },
        accent: { 400: '#FFD54F', 500: '#FFC107', 600: '#FF9800' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
}
