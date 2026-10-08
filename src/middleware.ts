import { NextRequest, NextResponse } from "next/server";
import { senhaValida } from "./lib/senha";

export function middleware(req: NextRequest) {
  if (senhaValida(req.headers.get("authorization"))) return NextResponse.next();
  return new NextResponse("Acesso restrito", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Painel de criativos"' },
  });
}

// Tudo é protegido, menos as páginas do cliente (/c/ criativos, /a/ aprovação) e os arquivos estáticos (inclui a logo e o ícone da marca, que o cliente precisa ver).
export const config = {
  matcher: ["/((?!c/|a/|_next/static|_next/image|favicon.ico|icon.png|genius-).*)"],
};
