import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        rolex: {
          DEFAULT: '#e64d00',
          light: '#ff5500',
          dark: '#cc4400',
        },
      },
    },
  },
  plugins: [],
};
export default config;



