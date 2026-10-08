import type { Config } from "tailwindcss";

const token = (nome: string) => `rgb(var(--${nome}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        fundo: token("fundo"),
        superficie: token("superficie"),
        "superficie-2": token("superficie-2"),
        borda: token("borda"),
        "borda-forte": token("borda-forte"),
        texto: token("texto"),
        "texto-suave": token("texto-suave"),
        "texto-fraco": token("texto-fraco"),
        destaque: token("destaque"),
        "destaque-hover": token("destaque-hover"),
        "sobre-destaque": token("sobre-destaque"),
      },
      fontFamily: {
        sans: ["var(--fonte)", "ui-sans-serif", "system-ui", "sans-serif"],
        titulo: ["var(--fonte-titulo)", "Impact", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
