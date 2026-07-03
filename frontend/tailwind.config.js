/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      colors: {
        brand: {
          dark: '#0B0D17', // Very dark blue/black
          card: '#16192B', // Slightly lighter for cards
          blue: '#2D6BFF', // Vibrant blue for buttons
          glow: '#1A3B8A', // Darker blue for glow effects
        }
      }
    },
  },
  plugins: [],
}
