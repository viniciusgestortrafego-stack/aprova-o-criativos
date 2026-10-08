import "server-only";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { senhaValida } from "./senha";

// Segunda checagem, além do middleware: se o middleware for pulado, a página não abre.
export function exigirAdmin() {
  if (!senhaValida(headers().get("authorization"))) notFound();
}
