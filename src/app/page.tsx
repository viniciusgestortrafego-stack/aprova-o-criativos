import Link from "next/link";
import { listarContas } from "@/lib/meta";
import { exigirAdmin } from "@/lib/painel";
import { BotaoIr, Chevron } from "@/components/BotaoLink";
import { cartao, linhaClicavel } from "@/components/estilos";

export const dynamic = "force-dynamic";

export default async function Painel() {
  exigirAdmin();
  const contas = await listarContas();
  return (
    <main className="mx-auto max-w-3xl px-4 pb-16 pt-20">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-titulo text-3xl font-normal tracking-wide tabular-nums">Contas de anúncio ({contas.length})</h1>
        <BotaoIr href="/aprovacoes">Aprovação de criativos</BotaoIr>
      </div>
      <ul className={`divide-y divide-borda ${cartao}`}>
        {contas.map((c) => (
          <li key={c.id}>
            <Link href={`/conta/${c.id}`} className={linhaClicavel}>
              <span className="min-w-0 flex-1">
                <span className="font-medium">{c.nome}</span>
                {!c.ativa && (
                  <span className="ml-2 whitespace-nowrap rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-900 dark:bg-amber-400/15 dark:text-amber-200">
                    com restrição
                  </span>
                )}
              </span>
              <span className="hidden text-sm tabular-nums text-texto-fraco sm:inline">{c.id}</span>
              <Chevron />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
