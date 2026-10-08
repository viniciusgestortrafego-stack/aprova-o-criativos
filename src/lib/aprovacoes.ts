import "server-only";
import { randomUUID } from "crypto";
import { neon } from "@neondatabase/serverless";
import type { ItemNovo } from "./links";

export type Decisao = "aprovado" | "ajustar" | "reprovado";
export const DECISOES: Decisao[] = ["aprovado", "ajustar", "reprovado"];

export type Resposta = { nome: string; decisao: Decisao; comentario: string; criado_em: string };
export type Item = ItemNovo & { id: string; respostas: Resposta[] };
export type Rodada = { id: string; cliente: string; nome: string; criado_em: string };
export type ResumoRodada = Rodada & { total: number; respondidos: number; aprovados: number };

function sql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL não configurado");
  // O driver consulta via fetch POST, e o Next 14 cacheia até POST: sem isto a página mostra resposta velha.
  return neon(url, { fetchOptions: { cache: "no-store" } });
}

export async function criarRodada(cliente: string, nome: string, itens: ItemNovo[]): Promise<string> {
  const db = sql();
  const id = randomUUID();
  await db.transaction([
    db`insert into rodadas (id, cliente, nome) values (${id}, ${cliente}, ${nome})`,
    ...itens.map(
      (i, ordem) => db`insert into itens (id, rodada_id, ordem, tipo, url, codigo, observacao)
        values (${randomUUID()}, ${id}, ${ordem}, ${i.tipo}, ${i.url}, ${i.codigo}, ${i.observacao})`
    ),
  ]);
  return id;
}

// "Respondido" e "aprovado" olham só a resposta mais recente de cada item.
export async function listarRodadas(): Promise<ResumoRodada[]> {
  const linhas = await sql()`
    select r.id, r.cliente, r.nome, r.criado_em,
      count(i.id)::int as total,
      count(u.decisao)::int as respondidos,
      count(*) filter (where u.decisao = 'aprovado')::int as aprovados
    from rodadas r
    left join itens i on i.rodada_id = r.id
    left join lateral (
      select decisao from respostas where item_id = i.id order by criado_em desc limit 1
    ) u on true
    group by r.id
    order by r.criado_em desc`;
  return linhas as ResumoRodada[];
}

export async function carregarRodada(id: string): Promise<{ rodada: Rodada; itens: Item[] } | null> {
  const db = sql();
  const [rodadas, itens, respostas] = await Promise.all([
    db`select id, cliente, nome, criado_em from rodadas where id = ${id}`,
    db`select id, tipo, url, codigo, observacao from itens where rodada_id = ${id} order by ordem`,
    db`select s.item_id, s.nome, s.decisao, s.comentario, s.criado_em
       from respostas s join itens i on i.id = s.item_id
       where i.rodada_id = ${id} order by s.criado_em desc`,
  ]);
  if (rodadas.length === 0) return null;
  return {
    rodada: rodadas[0] as Rodada,
    itens: itens.map((i) => ({
      ...(i as Omit<Item, "respostas">),
      respostas: respostas.filter((s) => s.item_id === i.id) as Resposta[],
    })),
  };
}

// Só grava se o item for mesmo da rodada do link.
export async function registrarResposta(
  rodadaId: string,
  itemId: string,
  nome: string,
  decisao: Decisao,
  comentario: string
): Promise<boolean> {
  const linhas = await sql()`
    insert into respostas (item_id, nome, decisao, comentario)
    select ${itemId}, ${nome}, ${decisao}, ${comentario}
    where exists (select 1 from itens where id = ${itemId} and rodada_id = ${rodadaId})
    returning id`;
  return linhas.length > 0;
}
