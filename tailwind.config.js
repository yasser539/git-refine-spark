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
        blue: {
          500: '#3B82F6',
          600: '#2563EB',
        },
        gray: {
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        green: {
          100: '#D1FAE5',
          500: '#10B981',
          800: '#065F46',
        },
        yellow: {
          100: '#FEF3C7',
          500: '#F59E0B',
          800: '#92400E',
        },
        red: {
          100: '#FEE2E2',
          500: '#EF4444',
          800: '#991B1B',
        },
      },
    },
  },
  plugins: [],
} 