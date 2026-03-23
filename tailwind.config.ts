import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-geist-sans)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        /** Gold Amber — accent for pastry chef UI */
        gold: {
          DEFAULT: "#D4AF37",
          light: "#E4C45A",
          dark: "#B8941F",
          muted: "rgba(212, 175, 55, 0.15)",
        },
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.07)",
        "glass-gold": "0 8px 32px 0 rgba(212, 175, 55, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
