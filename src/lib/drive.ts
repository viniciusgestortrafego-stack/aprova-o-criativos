import "server-only";
import type { ItemNovo, PastaDrive } from "./links";

// Mensagem que pode ir direto para a tela do painel.
export class ErroPasta extends Error {}

type Arquivo = { id: string; name: string; mimeType: string };

// Lista vídeos e imagens do nível de cima da pasta. A chave de API só enxerga pasta
// compartilhada como "Qualquer pessoa com o link"; pasta restrita volta vazia.
export async function arquivosDaPasta(pasta: PastaDrive): Promise<ItemNovo[]> {
  const chave = process.env.GOOGLE_API_KEY;
  if (!chave) throw new ErroPasta("A chave do Google Drive (GOOGLE_API_KEY) não está configurada.");
  const arquivos: Arquivo[] = [];
  let pagina: string | undefined;
  do {
    const params = new URLSearchParams({
      q: `'${pasta.codigo}' in parents and trashed = false`,
      fields: "nextPageToken,files(id,name,mimeType)",
      pageSize: "1000",
      supportsAllDrives: "true",
      includeItemsFromAllDrives: "true",
      key: chave,
    });
    if (pagina) params.set("pageToken", pagina);
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
      cache: "no-store",
      headers: pasta.chaveRecurso ? { "X-Goog-Drive-Resource-Keys": `${pasta.codigo}/${pasta.chaveRecurso}` } : {},
    });
    const json = await res.json();
    if (res.status === 404) {
      throw new ErroPasta(
        "Pasta do Drive não encontrada. Confira o link e se ela está compartilhada como \"Qualquer pessoa com o link\"."
      );
    }
    if (!res.ok) throw new ErroPasta(`O Google Drive recusou a leitura da pasta: ${json.error?.message ?? res.status}`);
    arquivos.push(...json.files);
    pagina = json.nextPageToken;
  } while (pagina);

  const midias = arquivos
    .filter((a) => a.mimeType.startsWith("video/") || a.mimeType.startsWith("image/"))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR", { numeric: true }));
  if (midias.length === 0) {
    throw new ErroPasta(
      "Nenhum vídeo ou imagem encontrado na pasta. Confira se ela está compartilhada como \"Qualquer pessoa com o link\"."
    );
  }
  return midias.map((a) => ({
    tipo: "drive",
    codigo: a.id,
    url: `https://drive.google.com/file/d/${a.id}/view`,
    observacao: [a.name.replace(/\.[^.]+$/, ""), pasta.observacao].filter(Boolean).join(" · "),
  }));
}
