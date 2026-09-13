/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Placeholder palette — reemplazar por los colores reales de marca de Dirty
        ink: {
          DEFAULT: '#111110',
          light: '#1C1B19',
        },
        bone: {
          DEFAULT: '#F4F1EA',
          dim: '#D8D3C8',
        },
        rust: {
          DEFAULT: '#C43D2E',
          light: '#E8695A',
          dark: '#8C2A1F',
        },
        muted: {
          DEFAULT: '#8A867D',
        },
        whatsapp: {
          DEFAULT: '#25D366',
          dark: '#1DA851',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
        display: ['"Bebas Neue"', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '6px',
        lg: '10px',
      },
    },
  },
  plugins: [],
}
