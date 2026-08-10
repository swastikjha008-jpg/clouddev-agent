import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        sans: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        violet: {
          DEFAULT: "hsl(var(--violet) / <alpha-value>)",
        },
        cyan: {
          DEFAULT: "hsl(var(--cyan) / <alpha-value>)",
        },
        // Gradient stop tokens for the TextColor headline
        "gradient-1-start": "#3B82F6",
        "gradient-1-end": "#22D3EE",
        "gradient-2-start": "#8B5CF6",
        "gradient-2-end": "#3B82F6",
        "gradient-3-start": "#22D3EE",
        "gradient-3-end": "#8B5CF6",
      },
      backgroundImage: {
        "gradient-conic": "conic-gradient(var(--conic-position), var(--tw-gradient-stops))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "gradient-background-1": {
          "0%": { width: "0%", opacity: "0" },
          "100%": { width: "100%", opacity: "1" },
        },
        "gradient-background-2": {
          "0%": { width: "0%", opacity: "0" },
          "100%": { width: "100%", opacity: "1" },
        },
        "gradient-background-3": {
          "0%": { width: "0%", opacity: "0" },
          "100%": { width: "100%", opacity: "1" },
        },
        "gradient-foreground-1": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "gradient-foreground-2": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "gradient-foreground-3": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "gradient-background-1": "gradient-background-1 0.9s ease-out 0.1s both",
        "gradient-background-2": "gradient-background-2 0.9s ease-out 0.4s both",
        "gradient-background-3": "gradient-background-3 0.9s ease-out 0.7s both",
        "gradient-foreground-1": "gradient-foreground-1 6s ease-in-out infinite",
        "gradient-foreground-2": "gradient-foreground-2 6s ease-in-out infinite 0.3s",
        "gradient-foreground-3": "gradient-foreground-3 6s ease-in-out infinite 0.6s",
        "fade-up": "fade-up 0.6s ease-out both",
        "pulse-glow": "pulse-glow 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
