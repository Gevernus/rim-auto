import themeVariants from '@tailwindcss/theme-variants'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
	 "./src/styles/**/*.{css}"
  ],
  theme: {
    extend: {},
  },
  plugins: [
	themeVariants({ themes: ['dark'] }),
  ],
} 