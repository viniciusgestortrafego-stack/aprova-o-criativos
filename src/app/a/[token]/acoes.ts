"use server";

import { DECISOES, registrarResposta, type Decisao } from "@/lib/aprovacoes";
import { validarTokenRodada } from "@/lib/assinatura";

export async function responderAcao(
  token: string,
  itemId: string,
  nome: string,
  decisao: Decisao,
  comentario: string
): Promise<{ erro?: string }> {
  const rodadaId = validarTokenRodada(token);
  if (!rodadaId) return { erro: "Link inválido." };
  if (!/^[0-9a-f-]{36}$/.test(itemId)) return { erro: "Criativo inválido." };
  if (!DECISOES.includes(decisao)) return { erro: "Resposta inválida." };
  const nomeLimpo = String(nome).trim().slice(0, 80);
  const comentarioLimpo = String(comentario).trim().slice(0, 2000);
  if (!nomeLimpo) return { erro: "Informe seu nome." };
  if (decisao !== "aprovado" && !comentarioLimpo) return { erro: "Escreva o que precisa mudar." };
  const ok = await registrarResposta(rodadaId, itemId, nomeLimpo, decisao, comentarioLimpo);
  return ok ? {} : { erro: "Criativo não encontrado nesta rodada." };
}
