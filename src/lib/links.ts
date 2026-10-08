export type ItemNovo = {
  tipo: "instagram" | "drive";
  url: string;
  codigo: string;
  observacao: string;
};

// Pasta do Drive: só a lista; os arquivos são buscados na API ao criar a rodada.
export type PastaDrive = { tipo: "pasta"; codigo: string; chaveRecurso: string | null; observacao: string };

const PASTA = /drive\.google\.com\/drive\/(?:u\/\d+\/)?folders\/([\w-]+)/i;
const INSTAGRAM = /instagram\.com\/(?:[\w.]+\/)?(?:p|reels?|tv)\/([\w-]+)/i;
const DRIVE = /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:[^ ]*&)?id=)([\w-]+)/i;

function identificar(url: string): Omit<ItemNovo, "observacao"> | Omit<PastaDrive, "observacao"> | null {
  const pasta = url.match(PASTA);
  if (pasta) return { tipo: "pasta", codigo: pasta[1], chaveRecurso: url.match(/resourcekey=([\w-]+)/)?.[1] ?? null };
  const ig = url.match(INSTAGRAM);
  if (ig) return { tipo: "instagram", codigo: ig[1], url: `https://www.instagram.com/p/${ig[1]}/` };
  const drive = url.match(DRIVE);
  if (drive) return { tipo: "drive", codigo: drive[1], url: `https://drive.google.com/file/d/${drive[1]}/view` };
  return null;
}

// Cada link vira um item; o texto até o próximo link vira a observação dele.
export function lerLista(texto: string): { itens: (ItemNovo | PastaDrive)[]; ignorados: string[] } {
  const achados = Array.from(texto.matchAll(/https?:\/\/\S+/g));
  const itens: (ItemNovo | PastaDrive)[] = [];
  const ignorados: string[] = [];
  achados.forEach((m, i) => {
    const url = m[0];
    let resto = texto.slice(m.index! + url.length, achados[i + 1]?.index ?? texto.length);
    // Link colado com espaço no meio do parâmetro (ex.: "?stkn=ZjF0 MTBy..."): descarta o pedaço solto.
    if (url.includes("?")) resto = resto.replace(/^[ \t]+(?=[A-Za-z+/=_-]*\d)[A-Za-z0-9+/=_-]{8,}(?=\s|$)/, "");
    const observacao = resto
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^\((.*)\)$/, "$1")
      .trim();
    const item = identificar(url);
    if (item) itens.push({ ...item, observacao } as ItemNovo | PastaDrive);
    else ignorados.push(url);
  });
  return { itens, ignorados };
}
