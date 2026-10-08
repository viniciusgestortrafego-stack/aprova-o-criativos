import type { Conta } from "@/lib/meta";

export function Cabecalho({ conta, ativos, inativos }: { conta: Conta; ativos: number; inativos: number }) {
  const hora = new Date().toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <header className="mb-8">
      <h1 className="text-balance font-titulo text-3xl font-normal tracking-wide sm:text-4xl">{conta.nome}</h1>
      <p className="mt-2 text-sm tabular-nums text-texto-fraco">
        Criativos ativos · {ativos} {ativos === 1 ? "anúncio rodando" : "anúncios rodando"}
        {inativos > 0 && ` · ${inativos} ${inativos === 1 ? "inativo" : "inativos"} nos últimos 7 dias`} · atualizado em {hora}
      </p>
      {!conta.ativa && (
        <p className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200">
          Conta com restrição na Meta: os anúncios abaixo estão marcados como ativos, mas não estão veiculando.
        </p>
      )}
    </header>
  );
}
