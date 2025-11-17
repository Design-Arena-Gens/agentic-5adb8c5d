import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f1f7ff",
          100: "#d9e9ff",
          200: "#b0d3ff",
          300: "#80b4ff",
          400: "#4a8aff",
          500: "#1f5fff",
          600: "#1446db",
          700: "#1238af",
          800: "#122f8a",
          900: "#112a6f"
        }
      }
    }
  },
  plugins: []
};

export default config;
