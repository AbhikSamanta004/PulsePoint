/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': "#2F80ED",
        'primary-hover': "#1C5ED6",
        'light-tint': "#EAF3FF",
        'heading': "#1F2937",
        'body': "#6B7280",
        'page-bg': "#F9FAFB",
        'border-color': "#E5E7EB",
        'success-color': "#22C55E",
      },
      boxShadow: {
        'card-hover': '0px 10px 25px rgba(47,128,237,0.15)',
      }
    },
  },
  plugins: [],
}