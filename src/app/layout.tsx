import type { Metadata } from "next";
import { Anton, Montserrat } from "next/font/google";
import "./globals.css";
import { BotaoTema } from "@/components/BotaoTema";
import { Marca } from "@/components/Marca";

// Baixada no build e servida pelo próprio site: nenhuma chamada ao Google ao abrir a página.
// Montserrat no texto corrido (a mesma família do "ASSESORIA DIGITAL" da logo) e Anton nos títulos (condensada e pesada, como o "GENIUS").
const fonte = Montserrat({ subsets: ["latin"], variable: "--fonte", display: "swap" });
const fonteTitulo = Anton({ subsets: ["latin"], weight: "400", variable: "--fonte-titulo", display: "swap" });

export const metadata: Metadata = {
  title: "Criativos · Genius Assessoria Digital",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${fonte.variable} ${fonteTitulo.variable}`} suppressHydrationWarning>
      <head>
        {/* Aplica o tema antes da pintura para não piscar claro no modo escuro. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("tema");if(t==="escuro"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`,
          }}
        />
      </head>
      <body className="relative min-h-screen font-sans antialiased">
        <Marca />
        <BotaoTema />
        {children}
      </body>
    </html>
  );
}
