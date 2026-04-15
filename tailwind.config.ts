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
          DEFAULT: '#2f2f34',
          light: '#4a4a51',
          dark: '#1f1f23',
        },
      },
    },
  },
  plugins: [],
};
export default config;



