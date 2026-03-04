/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'background-dark': 'var(--bg-main)',
        'background-card': 'var(--bg-card)',
        'border-color': 'var(--border-color)',
        primary: 'var(--primary)',
        highlight: 'var(--highlight)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
      },
    },
  },
  plugins: [],
}
