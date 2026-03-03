/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        notion: {
          bg: '#ffffff',
          'bg-dark': '#191919',
          sidebar: '#f7f6f3',
          'sidebar-dark': '#202020',
          border: '#e0e0e0',
          'border-dark': '#373737',
          text: '#37352f',
          'text-dark': '#e0e0e0',
          'text-muted': '#6b6b6b',
        },
      },
    },
  },
  plugins: [],
};
