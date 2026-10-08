import { notFound } from "next/navigation";
import { carregarRodada } from "@/lib/aprovacoes";
import { gerarTokenRodada } from "@/lib/assinatura";
import { exigirAdmin } from "@/lib/painel";
import { BotaoVoltar } from "@/components/BotaoLink";
import { CopiarLink } from "@/components/CopiarLink";
import { ROTULO, SeloDecisao, dataHora } from "@/components/Decisao";
import { cartao } from "@/components/estilos";

export const dynamic = "force-dynamic";

export default async function Rodada({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { ignorados?: string };
}) {
  exigirAdmin();
  if (!/^[0-9a-f-]{36}$/.test(params.id)) notFound();
  const dados = await carregarRodada(params.id);
  if (!dados) notFound();
  const { rodada, itens } = dados;
  const ultimas = itens.map((i) => i.respostas[0]?.decisao);

  return (
    <main className="mx-auto max-w-4xl px-4 pb-16 pt-20">
      <BotaoVoltar href="/aprovacoes">Rodadas de aprovação</BotaoVoltar>
      <header className="mb-8">
        <h1 className="text-balance font-titulo text-3xl font-normal tracking-wide">{rodada.nome}</h1>
        <p className="mt-2 text-sm tabular-nums text-texto-fraco">
          {rodada.cliente} · {ultimas.filter((d) => d === "aprovado").length} aprovados ·{" "}
          {ultimas.filter((d) => d === "ajustar").length} ajustar · {ultimas.filter((d) => d === "reprovado").length} reprovados ·{" "}
          {ultimas.filter((d) => !d).length} aguardando
        </p>
      </header>

      {searchParams.ignorados && (
        <p className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200">
          Links ignorados (não são do Instagram nem do Drive): {searchParams.ignorados}
        </p>
      )}

      <CopiarLink caminho={`/a/${gerarTokenRodada(rodada.id)}`} />

      <ol className={`divide-y divide-borda ${cartao}`}>
        {itens.map((item, n) => (
          <li key={item.id} className="px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 truncate font-medium underline-offset-2 hover:text-destaque hover:underline"
              >
                <span className="tabular-nums">Criativo {n + 1}</span>{" "}
                <span className="font-normal text-texto-fraco">· {item.url}</span>
              </a>
              <SeloDecisao resposta={item.respostas[0]} />
            </div>
            {item.observacao && <p className="mt-1 text-sm text-texto-suave">{item.observacao}</p>}
            {item.respostas.length > 0 && (
              <ul className="mt-3 space-y-1 border-l border-borda-forte pl-3 text-xs tabular-nums text-texto-fraco">
                {item.respostas.map((r, i) => (
                  <li key={i}>
                    <strong className="font-semibold text-texto-suave">{ROTULO[r.decisao]}</strong> por {r.nome} em{" "}
                    {dataHora(r.criado_em)}
                    {r.comentario && <span className="text-texto-suave"> · “{r.comentario}”</span>}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </main>
  );
}
