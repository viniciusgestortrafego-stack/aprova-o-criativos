import type { Criativo } from "./meta";

// Ordem das seções na página.
const OBJETIVOS: [string, string][] = [
  ["OUTCOME_SALES", "Vendas"],
  ["OUTCOME_LEADS", "Leads"],
  ["OUTCOME_ENGAGEMENT", "Engajamento"],
  ["OUTCOME_TRAFFIC", "Tráfego"],
  ["OUTCOME_AWARENESS", "Reconhecimento"],
  ["OUTCOME_APP_PROMOTION", "Promoção de app"],
];
const IMPULSIONADOS = "Posts impulsionados";
const OUTROS = "Outros";
const ORDEM = [...OBJETIVOS.map(([, titulo]) => titulo), IMPULSIONADOS, OUTROS];

export function tagsDoNome(nome: string): string[] {
  return Array.from(nome.matchAll(/\[([^\]]+)\]/g), (m) => m[1].trim().toUpperCase());
}

function secao(c: Criativo): string {
  // Nomes que a Meta dá ao impulsionar: "Post do Instagram:", "Instagram post:", "Publicação do Instagram:", "Publicação:".
  if (/^(post do instagram|instagram post|publicação( do instagram)?)\b/i.test(c.campanha)) return IMPULSIONADOS;
  return OBJETIVOS.find(([codigo]) => codigo === c.objetivo)?.[1] ?? OUTROS;
}

export type Grupo = { titulo: string; criativos: (Criativo & { tags: string[] })[] };

// Agrupa pelo objetivo da campanha na Meta; as tags do nome viram filtro.
export function agruparPorObjetivo(criativos: Criativo[]): Grupo[] {
  const grupos = new Map<string, Grupo>();
  for (const c of criativos) {
    const titulo = secao(c);
    if (!grupos.has(titulo)) grupos.set(titulo, { titulo, criativos: [] });
    grupos.get(titulo)!.criativos.push({ ...c, tags: tagsDoNome(c.campanha) });
  }
  for (const g of grupos.values()) {
    g.criativos.sort(
      (a, b) =>
        Number(!!a.inativo) - Number(!!b.inativo) ||
        a.campanha.localeCompare(b.campanha, "pt-BR") ||
        a.nome.localeCompare(b.nome, "pt-BR")
    );
  }
  return Array.from(grupos.values()).sort((a, b) => ORDEM.indexOf(a.titulo) - ORDEM.indexOf(b.titulo));
}
