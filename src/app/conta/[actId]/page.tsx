import { notFound } from "next/navigation";
import { dadosDaConta, listarCriativos } from "@/lib/meta";
import { gerarToken } from "@/lib/assinatura";
import { exigirAdmin } from "@/lib/painel";
import { BotaoVoltar } from "@/components/BotaoLink";
import { agruparPorObjetivo } from "@/lib/tags";
import { Cabecalho } from "@/components/Cabecalho";
import { CopiarLink } from "@/components/CopiarLink";
import { ListaCriativos } from "@/components/ListaCriativos";

export const dynamic = "force-dynamic";

export default async function Conta({ params }: { params: { actId: string } }) {
  exigirAdmin();
  if (!/^\d+$/.test(params.actId)) notFound();
  const [conta, criativos] = await Promise.all([
    dadosDaConta(params.actId),
    listarCriativos(params.actId),
  ]);
  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-20">
      <BotaoVoltar href="/">Contas de anúncio</BotaoVoltar>
      <Cabecalho
        conta={conta}
        ativos={criativos.filter((c) => !c.inativo).length}
        inativos={criativos.filter((c) => c.inativo).length}
      />
      <CopiarLink caminho={`/c/${gerarToken(params.actId)}`} />
      <ListaCriativos grupos={agruparPorObjetivo(criativos)} veiculando={conta.ativa} />
    </main>
  );
}
