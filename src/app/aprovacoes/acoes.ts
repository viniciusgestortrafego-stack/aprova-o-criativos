"use server";

import { redirect } from "next/navigation";
import { criarRodada } from "@/lib/aprovacoes";
import { ErroPasta, arquivosDaPasta } from "@/lib/drive";
import { lerLista, type ItemNovo } from "@/lib/links";
import { exigirAdmin } from "@/lib/painel";

export type EstadoCriacao = { erro?: string };

export async function criarRodadaAcao(_: EstadoCriacao, form: FormData): Promise<EstadoCriacao> {
  // Server actions podem ser chamadas por POST em qualquer rota (inclusive /a/ e /c/, fora do middleware).
  exigirAdmin();
  const cliente = String(form.get("cliente") ?? "").trim().slice(0, 120);
  const nome = String(form.get("nome") ?? "").trim().slice(0, 120);
  const { itens: entradas, ignorados } = lerLista(String(form.get("lista") ?? "").slice(0, 50_000));
  if (!cliente || !nome) return { erro: "Preencha o cliente e o nome da rodada." };
  if (entradas.length === 0) return { erro: "Nenhum link do Instagram ou do Google Drive encontrado na lista." };

  let itens: ItemNovo[];
  try {
    itens = (await Promise.all(entradas.map((e) => (e.tipo === "pasta" ? arquivosDaPasta(e) : [e])))).flat();
  } catch (e) {
    return { erro: e instanceof ErroPasta ? e.message : "Não foi possível ler a pasta do Google Drive." };
  }
  if (itens.length > 100) return { erro: `A lista tem ${itens.length} criativos; o máximo por rodada é 100.` };

  const id = await criarRodada(cliente, nome, itens);
  redirect(`/aprovacoes/${id}${ignorados.length ? `?ignorados=${encodeURIComponent(ignorados.join(" "))}` : ""}`);
}
