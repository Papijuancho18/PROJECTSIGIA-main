import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Paleta Analítica y de Datos
        primary: {
          DEFAULT: "#334E68", // Azul grisáceo - color principal
          foreground: "#FFFFFF",
          hover: "#2A3F55",
        },
        secondary: {
          DEFAULT: "#3EBD93", // Verde esmeralda - elementos interactivos
          foreground: "#FFFFFF",
          hover: "#35A883",
        },
        accent: {
          DEFAULT: "#FFCA3A", // Amarillo - destacar información importante
          foreground: "#334E68",
          hover: "#F5C033",
        },
        // Colores complementarios
        highlight: {
          DEFAULT: "#F7F9FB", // Blanco azulado - fondos
          foreground: "#334E68",
          hover: "#EEF2F7",
        },
        alert: {
          DEFAULT: "#E63946", // Rojo coral - alertas
          foreground: "#FFFFFF",
          hover: "#D33240",
        },
        // Mantener los colores originales de shadcn/ui pero sobrescribir los que necesitamos
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
