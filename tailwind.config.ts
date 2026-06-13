import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#121212",
          900: "#161413",
          800: "#1C1917",
          700: "#262220",
          600: "#3A332F",
        },
        copper: {
          DEFAULT: "#B68D40",
          dark: "#C2410C",
          light: "#D9B26A",
        },
        cream: "#F5F0E6",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
