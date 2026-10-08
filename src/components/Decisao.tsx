import type { Decisao, Resposta } from "@/lib/aprovacoes";

export const ROTULO: Record<Decisao, string> = {
  aprovado: "Aprovado",
  ajustar: "Ajustar",
  reprovado: "Reprovado",
};

export const COR: Record<Decisao, string> = {
  aprovado: "bg-green-100 text-green-800 dark:bg-green-400/15 dark:text-green-300",
  ajustar: "bg-amber-100 text-amber-900 dark:bg-amber-400/15 dark:text-amber-200",
  reprovado: "bg-red-100 text-red-800 dark:bg-red-400/15 dark:text-red-300",
};

export function dataHora(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SeloDecisao({ resposta }: { resposta?: Resposta }) {
  if (!resposta) {
    return (
      <span className="rounded bg-superficie-2 px-2 py-0.5 text-xs text-texto-suave">
        Aguardando
      </span>
    );
  }
  return <span className={`rounded px-2 py-0.5 text-xs font-medium ${COR[resposta.decisao]}`}>{ROTULO[resposta.decisao]}</span>;
}
