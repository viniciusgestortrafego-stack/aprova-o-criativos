import { notFound } from "next/navigation";
import { carregarRodada } from "@/lib/aprovacoes";
import { validarTokenRodada } from "@/lib/assinatura";
import { AprovacaoCliente } from "@/components/AprovacaoCliente";

export const dynamic = "force-dynamic";

export default async function PaginaDeAprovacao({ params }: { params: { token: string } }) {
  const id = validarTokenRodada(params.token);
  if (!id) notFound();
  const dados = await carregarRodada(id);
  if (!dados) notFound();
  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-20">
      <header className="mb-8">
        <h1 className="text-balance font-titulo text-3xl font-normal tracking-wide sm:text-4xl">{dados.rodada.nome}</h1>
        <p className="mt-2 text-sm text-texto-fraco">Aprovação de criativos · {dados.rodada.cliente}</p>
      </header>
      <AprovacaoCliente token={params.token} itens={dados.itens} />
    </main>
  );
}
