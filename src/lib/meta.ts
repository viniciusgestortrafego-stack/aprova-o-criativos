import "server-only";

const GRAPH = "https://graph.facebook.com/v23.0";
const CACHE_SEGUNDOS = 300;

export type Conta = { id: string; nome: string; ativa: boolean };

// 1 = ativa, 9 = período de carência (ainda veicula). O resto não veicula.
const STATUS_QUE_VEICULAM = [1, 9];

export type Criativo = {
  id: string;
  nome: string;
  campanha: string;
  objetivo: string;
  conjunto: string;
  miniatura: string | null;
  instagram: string | null;
  inativo: string | null;
  etapa: string | null;
};

type Pagina<T> = { data: T[]; paging?: { next?: string } };

async function graphGet<T>(url: string): Promise<T> {
  const token = process.env.META_ACCESS_TOKEN;
  if (!token) throw new Error("META_ACCESS_TOKEN não configurado");
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: CACHE_SEGUNDOS },
  });
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(`Meta API: ${json.error?.message ?? res.status}`);
  }
  return json;
}

async function todasAsPaginas<T>(primeira: string): Promise<T[]> {
  const itens: T[] = [];
  let url: string | undefined = primeira;
  while (url) {
    const pagina: Pagina<T> = await graphGet<Pagina<T>>(url);
    itens.push(...pagina.data);
    url = pagina.paging?.next;
  }
  return itens;
}

type ContaBruta = { account_id: string; name: string; account_status: number };

// Lista pela BM (contas próprias + de clientes). /me/adaccounts só traz as atribuídas
// direto ao usuário do sistema, e o ADMIN da BM lê todas.
export async function listarContas(): Promise<Conta[]> {
  const bm = process.env.META_BUSINESS_ID;
  if (!bm) throw new Error("META_BUSINESS_ID não configurado");
  const campos = "fields=account_id,name,account_status&limit=200";
  const [proprias, clientes] = await Promise.all([
    todasAsPaginas<ContaBruta>(`${GRAPH}/${bm}/owned_ad_accounts?${campos}`),
    todasAsPaginas<ContaBruta>(`${GRAPH}/${bm}/client_ad_accounts?${campos}`),
  ]);
  const brutas = Array.from(new Map([...proprias, ...clientes].map((c) => [c.account_id, c])).values());
  return brutas
    .map((c) => ({ id: c.account_id, nome: c.name, ativa: STATUS_QUE_VEICULAM.includes(c.account_status) }))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

export async function dadosDaConta(actId: string): Promise<Conta> {
  const conta = await graphGet<{ name: string; account_status: number }>(
    `${GRAPH}/act_${actId}?fields=name,account_status`
  );
  return { id: actId, nome: conta.name, ativa: STATUS_QUE_VEICULAM.includes(conta.account_status) };
}

type AnuncioBruto = {
  id: string;
  name: string;
  effective_status: string;
  campaign?: { name: string; objective: string; stop_time?: string };
  adset?: { name: string; end_time?: string };
  creative?: {
    thumbnail_url?: string;
    image_url?: string;
    instagram_permalink_url?: string;
  };
};

const CAMPOS_ANUNCIO = [
  "name",
  "effective_status",
  "campaign{name,objective,stop_time}",
  "adset{name,end_time}",
  "creative.thumbnail_width(600).thumbnail_height(600){thumbnail_url,image_url,instagram_permalink_url}",
].join(",");

const MOTIVOS: Record<string, string> = {
  PAUSED: "Anúncio desligado",
  ADSET_PAUSED: "Conjunto desligado",
  CAMPAIGN_PAUSED: "Campanha desligada",
  ARCHIVED: "Arquivado",
  DELETED: "Excluído",
  DISAPPROVED: "Reprovado",
  WITH_ISSUES: "Com problema",
};

// A Meta mantém ACTIVE depois da data de término do conjunto/campanha.
function passouDoFim(a: Pick<AnuncioBruto, "adset" | "campaign">, agora: number): boolean {
  return [a.adset?.end_time, a.campaign?.stop_time].some((fim) => fim && Date.parse(fim) < agora);
}

// Em análise/processamento conta como ativo (Leon), com a etapa ao lado.
const ETAPAS: Record<string, string | null> = {
  ACTIVE: null,
  PENDING_REVIEW: "em análise",
  IN_PROCESS: "em processamento",
};

// null = ativo de verdade.
function motivoInativo(a: AnuncioBruto, agora: number): string | null {
  if (!(a.effective_status in ETAPAS)) return MOTIVOS[a.effective_status] ?? "Inativo";
  return passouDoFim(a, agora) ? "Encerrado" : null;
}

// Anúncios com entrega nos últimos 7 dias, pelo relatório de veiculação.
async function idsQueVeicularam(actId: string): Promise<string[]> {
  const linhas = await todasAsPaginas<{ ad_id: string }>(
    `${GRAPH}/act_${actId}/insights?level=ad&fields=ad_id&date_preset=last_7d&limit=500`
  );
  return linhas.map((l) => l.ad_id);
}

async function buscarPorIds(ids: string[]): Promise<AnuncioBruto[]> {
  const lotes: string[][] = [];
  for (let i = 0; i < ids.length; i += 50) lotes.push(ids.slice(i, i + 50));
  const respostas = await Promise.all(
    lotes.map((lote) => graphGet<Record<string, AnuncioBruto>>(`${GRAPH}/?ids=${lote.join(",")}&fields=${CAMPOS_ANUNCIO}`))
  );
  return respostas.flatMap((r) => Object.values(r));
}

// Ativos de verdade + os que veicularam nos últimos 7 dias e agora estão inativos.
// Primeiro só ids e datas (leve); detalhes e miniatura só dos que vão aparecer.
export async function listarCriativos(actId: string): Promise<Criativo[]> {
  const filtro = encodeURIComponent(
    JSON.stringify([{ field: "effective_status", operator: "IN", value: Object.keys(ETAPAS) }])
  );
  const [ativosNaMeta, recentes] = await Promise.all([
    todasAsPaginas<Pick<AnuncioBruto, "id" | "adset" | "campaign">>(
      `${GRAPH}/act_${actId}/ads?fields=campaign{stop_time},adset{end_time}&filtering=${filtro}&limit=500`
    ),
    idsQueVeicularam(actId),
  ]);
  const agora = Date.now();
  const ativosDeVerdade = ativosNaMeta.filter((a) => !passouDoFim(a, agora)).map((a) => a.id);
  const detalhes = await buscarPorIds(Array.from(new Set([...ativosDeVerdade, ...recentes])));
  const veicularam = new Set(recentes);
  return detalhes
    .map((a) => ({
      id: a.id,
      nome: a.name,
      campanha: a.campaign?.name ?? "",
      objetivo: a.campaign?.objective ?? "",
      conjunto: a.adset?.name ?? "",
      miniatura: a.creative?.image_url ?? a.creative?.thumbnail_url ?? null,
      // Mesmo link do "Post do Instagram com comentários" do Gerenciador.
      instagram: a.creative?.instagram_permalink_url ? `${a.creative.instagram_permalink_url}#advertiser` : null,
      inativo: motivoInativo(a, agora),
      etapa: ETAPAS[a.effective_status] ?? null,
    }))
    .filter((c) => !c.inativo || veicularam.has(c.id));
}
