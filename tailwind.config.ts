import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-geist-sans)",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        /** Design system — mesh background stops */
        mesh: {
          mint: "#e0f7fa",
          lilac: "#ede7f6",
          powder: "#e3f2fd",
        },
        /** Gold Amber — accent for pastry chef UI */
        gold: {
          DEFAULT: "#D4AF37",
          light: "#E4C45A",
          dark: "#B8941F",
          muted: "rgba(212, 175, 55, 0.15)",
        },
      },
      backgroundImage: {
        /** Full-viewport mesh (Design.md §2) */
        "mesh-gradient":
          "linear-gradient(to bottom right, rgb(224 247 250 / 0.9), rgb(237 231 246 / 0.85), rgb(227 242 253 / 0.9))",
      },
      boxShadow: {
        /** Glassmorphism token (Design.md §3) */
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.07)",
        "glass-gold": "0 8px 32px 0 rgba(212, 175, 55, 0.12)",
        "glass-modal": "0 24px 80px -12px rgba(31, 38, 135, 0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
