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
          DEFAULT: '#1A6329',
          light: '#228B3A',
          dark: '#145023',
        },
      },
    },
  },
  plugins: [],
};
export default config;



