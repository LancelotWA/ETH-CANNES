import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Sora", "ui-sans-serif", "system-ui"]
      },
      colors: {
        brand: {
          50: "#ecfdf5",
          500: "#10b981",
          700: "#047857"
        }
      }
    }
  },
  plugins: []
};

export default config;
