"use client";

import { useEffect, useState } from "react";
import { botaoPrimario, cartao } from "./estilos";

export function CopiarLink({ caminho }: { caminho: string }) {
  const [url, setUrl] = useState(caminho);
  const [copiado, setCopiado] = useState(false);
  useEffect(() => setUrl(window.location.origin + caminho), [caminho]);
  return (
    <div className={`mb-8 flex flex-col gap-3 p-4 sm:flex-row sm:items-center ${cartao}`}>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-texto-suave">Link do cliente</p>
        <code className="block truncate text-sm text-texto-fraco">{url}</code>
      </div>
      <button
        onClick={() => {
          navigator.clipboard.writeText(url);
          setCopiado(true);
        }}
        className={botaoPrimario}
      >
        {copiado ? "Link copiado" : "Copiar link"}
      </button>
    </div>
  );
}
