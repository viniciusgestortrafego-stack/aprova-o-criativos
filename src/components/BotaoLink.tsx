import Link from "next/link";
import { botaoPrimario, botaoSecundario } from "./estilos";

export function Seta({ volta }: { volta?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d={volta ? "M19 12H5M11 18l-6-6 6-6" : "M5 12h14M13 6l6 6-6 6"} />
    </svg>
  );
}

// Indica que a linha inteira leva para outra página.
export function Chevron() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-texto-fraco" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

// Volta para a página anterior: botão contornado com seta à esquerda.
export function BotaoVoltar({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={`mb-8 ${botaoSecundario}`}>
      <Seta volta />
      {children}
    </Link>
  );
}

// Leva para outra área: botão de ação principal com seta à direita.
export function BotaoIr({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={`shrink-0 ${botaoPrimario}`}>
      {children}
      <Seta />
    </Link>
  );
}
