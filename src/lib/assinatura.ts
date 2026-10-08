import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

function assinar(valor: string): string {
  const segredo = process.env.LINK_SECRET;
  if (!segredo) throw new Error("LINK_SECRET não configurado");
  return createHmac("sha256", segredo).update(valor).digest("base64url");
}

function confere(valor: string, assinatura: string): boolean {
  const esperada = Buffer.from(assinar(valor));
  const recebida = Buffer.from(assinatura);
  return esperada.length === recebida.length && timingSafeEqual(esperada, recebida);
}

export function gerarToken(actId: string): string {
  return `${actId}.${assinar(actId)}`;
}

// Devolve o actId se a assinatura bater, senão null.
export function validarToken(token: string): string | null {
  const [actId, assinatura] = decodeURIComponent(token).split(".");
  if (!/^\d+$/.test(actId ?? "") || !assinatura) return null;
  return confere(actId, assinatura) ? actId : null;
}

// Rodadas de aprovação assinam com prefixo próprio: um link de conta não abre rodada e vice-versa.
export function gerarTokenRodada(id: string): string {
  return `${id}.${assinar(`rodada:${id}`)}`;
}

export function validarTokenRodada(token: string): string | null {
  const [id, assinatura] = decodeURIComponent(token).split(".");
  if (!/^[0-9a-f-]{36}$/.test(id ?? "") || !assinatura) return null;
  return confere(`rodada:${id}`, assinatura) ? id : null;
}
