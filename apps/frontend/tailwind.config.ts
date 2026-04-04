import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Syne", "sans-serif"],
        mono: ["DM Mono", "monospace"]
      },
      colors: {
        white: "rgb(var(--tw-color-white) / <alpha-value>)",
        black: "rgb(var(--tw-color-black) / <alpha-value>)",
        surface: "var(--surface)",
        "surface-hover": "var(--surface-hover)",
        border: "var(--border)",
        "border-hover": "var(--border-hover)",
        "text-muted": "var(--text-muted)",
        public: "var(--public)",
        "public-dim": "var(--public-dim)",
        private: "var(--private)",
        "private-dim": "var(--private-dim)",
      }
    }
  },
  plugins: []
};

export default config;
