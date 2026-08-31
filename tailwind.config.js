/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#b3c9db',
          300: '#8cb0ca',
          400: '#6697b9',
          500: '#1a4d7a',
          600: '#153e62',
          700: '#102e4a',
          800: '#0a1f31',
          900: '#050f19',
        },
        accent: {
          50: '#fef5e7',
          100: '#fde6cc',
          200: '#facc99',
          300: '#f8b366',
          400: '#f59933',
          500: '#e67e22',
          600: '#b8651b',
          700: '#8a4c14',
          800: '#5c330e',
          900: '#2e1907',
        }
      }
    },
  },
  plugins: [],
}