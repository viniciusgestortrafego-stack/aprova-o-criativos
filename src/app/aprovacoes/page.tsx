import Link from "next/link";
import { listarRodadas } from "@/lib/aprovacoes";
import { listarContas } from "@/lib/meta";
import { exigirAdmin } from "@/lib/painel";
import { BotaoVoltar, Chevron } from "@/components/BotaoLink";
import { dataHora } from "@/components/Decisao";
import { cartao, chip, linhaClicavel } from "@/components/estilos";
import { NovaRodada } from "@/components/NovaRodada";

export const dynamic = "force-dynamic";

export default async function Aprovacoes({ searchParams }: { searchParams: { cliente?: string } }) {
  exigirAdmin();
  // Sugestões de cliente vêm das contas de anúncio; se a Meta falhar, o campo continua livre.
  const [rodadas, contas] = await Promise.all([listarRodadas(), listarContas().catch(() => [])]);
  const clientes = Array.from(new Set(rodadas.map((r) => r.cliente))).sort((a, b) => a.localeCompare(b, "pt-BR"));
  const sugestoes = Array.from(new Set([...clientes, ...contas.map((c) => c.nome)]));
  const filtro = searchParams.cliente;
  const visiveis = clientes.filter((c) => !filtro || c === filtro);

  return (
    <main className="mx-auto max-w-4xl px-4 pb-16 pt-20">
      <BotaoVoltar href="/">Contas de anúncio</BotaoVoltar>
      <h1 className="mb-6 font-titulo text-3xl font-normal tracking-wide">Aprovação de criativos</h1>
      <NovaRodada clientes={sugestoes} />

      <h2 className="mb-4 font-titulo text-xl font-normal tracking-wide">Rodadas</h2>

      {clientes.length > 1 && (
        <nav className="mb-6 flex flex-wrap gap-2" aria-label="Filtrar por cliente">
          <Link href="/aprovacoes" aria-current={!filtro ? "page" : undefined} className={chip(!filtro)}>
            Todos
          </Link>
          {clientes.map((c) => (
            <Link
              key={c}
              href={`/aprovacoes?cliente=${encodeURIComponent(c)}`}
              aria-current={filtro === c ? "page" : undefined}
              className={chip(filtro === c)}
            >
              {c}
            </Link>
          ))}
        </nav>
      )}

      {rodadas.length === 0 && (
        <p className={`p-6 text-texto-suave ${cartao}`}>
          Nenhuma rodada ainda. Cole os links no formulário acima para criar a primeira e gerar o link do cliente.
        </p>
      )}

      {visiveis.map((cliente) => (
        <section key={cliente} className={`mb-6 ${cartao}`}>
          <h3 className="border-b border-borda px-4 py-3 text-xs font-semibold uppercase tracking-wide text-texto-fraco">
            {cliente}
          </h3>
          <ul className="divide-y divide-borda">
            {rodadas
              .filter((r) => r.cliente === cliente)
              .map((r) => (
                <li key={r.id}>
                  <Link href={`/aprovacoes/${r.id}`} className={linhaClicavel}>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{r.nome}</span>
                      <span className="text-xs tabular-nums text-texto-fraco">criada em {dataHora(r.criado_em)}</span>
                    </span>
                    <span className="shrink-0 text-right text-sm tabular-nums text-texto-suave">
                      {r.aprovados} aprovados
                      <span className="block text-xs text-texto-fraco">
                        {r.respondidos} de {r.total} respondidos
                      </span>
                    </span>
                    <Chevron />
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
