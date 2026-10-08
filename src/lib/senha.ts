// Usado no middleware (edge) e nas páginas do painel. Sem dependência de Node.
export function senhaValida(authorization: string | null): boolean {
  const esperada = process.env.ADMIN_PASSWORD;
  if (!esperada || !authorization?.startsWith("Basic ")) return false;
  let decodificado: string;
  try {
    decodificado = atob(authorization.slice(6));
  } catch {
    return false;
  }
  const recebida = decodificado.slice(decodificado.indexOf(":") + 1);
  if (recebida.length !== esperada.length) return false;
  let diferenca = 0;
  for (let i = 0; i < esperada.length; i++) diferenca |= esperada.charCodeAt(i) ^ recebida.charCodeAt(i);
  return diferenca === 0;
}
