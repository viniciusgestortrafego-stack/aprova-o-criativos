import { notFound } from "next/navigation";
import { dadosDaConta, listarCriativos } from "@/lib/meta";
import { validarToken } from "@/lib/assinatura";
import { agruparPorObjetivo } from "@/lib/tags";
import { Cabecalho } from "@/components/Cabecalho";
import { ListaCriativos } from "@/components/ListaCriativos";

export const revalidate = 300;

export default async function PaginaDoCliente({ params }: { params: { token: string } }) {
  const actId = validarToken(params.token);
  if (!actId) notFound();
  const [conta, criativos] = await Promise.all([dadosDaConta(actId), listarCriativos(actId)]);
  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-20">
      <Cabecalho
        conta={conta}
        ativos={criativos.filter((c) => !c.inativo).length}
        inativos={criativos.filter((c) => c.inativo).length}
      />
      <ListaCriativos grupos={agruparPorObjetivo(criativos)} veiculando={conta.ativa} />
    </main>
  );
}
