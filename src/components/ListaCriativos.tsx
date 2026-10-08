"use client";

import { useState } from "react";
import type { Grupo } from "@/lib/tags";
import { botaoSecundario, campo, cartao, chip } from "./estilos";

type Status = "ativos" | "inativos" | "todos";

function IconeLinkExterno() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </svg>
  );
}

// Busca sem diferenciar maiúscula nem acento ("impulsionado" acha "Posts impulsionados").
function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export function ListaCriativos({ grupos, veiculando }: { grupos: Grupo[]; veiculando: boolean }) {
  const [status, setStatus] = useState<Status>("ativos");
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<string | null>(null);

  const todos = grupos.flatMap((g) => g.criativos);
  const contagem = {
    ativos: todos.filter((c) => !c.inativo).length,
    inativos: todos.filter((c) => c.inativo).length,
    todos: todos.length,
  };

  const termo = normalizar(busca.trim());
  const porStatus = grupos.map((g) => ({
    ...g,
    criativos: g.criativos.filter((c) => status === "todos" || (status === "ativos") === !c.inativo),
  }));
  const tags = Array.from(new Set(porStatus.flatMap((g) => g.criativos.flatMap((c) => c.tags))));
  const visiveis = porStatus
    .map((g) => ({
      ...g,
      criativos: g.criativos.filter(
        (c) =>
          (!filtro || c.tags.includes(filtro)) &&
          (!termo || normalizar(`${g.titulo} ${c.nome} ${c.campanha} ${c.conjunto}`).includes(termo))
      ),
    }))
    .filter((g) => g.criativos.length > 0);

  if (todos.length === 0) {
    return <p className="text-texto-fraco">Nenhum anúncio ativo nem veiculado nos últimos 7 dias.</p>;
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          aria-label="Buscar criativos"
          placeholder="Buscar por anúncio, campanha, conjunto ou seção"
          className={`flex-1 ${campo}`}
        />
        <div className="flex gap-2" role="group" aria-label="Status">
          {(["ativos", "inativos", "todos"] as const).map((s) => (
            <button
              key={s}
              aria-pressed={status === s}
              onClick={() => {
                setStatus(s);
                setFiltro(null);
              }}
              className={`tabular-nums ${chip(status === s)}`}
            >
              {s[0].toUpperCase() + s.slice(1)} ({contagem[s]})
            </button>
          ))}
        </div>
      </div>

      {tags.length > 0 && (
        <div
          className="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
          role="group"
          aria-label="Filtrar por tag da campanha"
        >
          {[null, ...tags].map((t) => (
            <button
              key={t ?? "todas"}
              aria-pressed={filtro === t}
              onClick={() => setFiltro(t)}
              className={`shrink-0 whitespace-nowrap ${chip(filtro === t)}`}
            >
              {t ?? "Todas as tags"}
            </button>
          ))}
        </div>
      )}

      {visiveis.length === 0 && (
        <div className={`flex flex-col items-start gap-3 p-6 ${cartao}`}>
          <p className="text-texto-suave">Nenhum anúncio com essa busca e esses filtros.</p>
          <button
            onClick={() => {
              setBusca("");
              setFiltro(null);
              setStatus("todos");
            }}
            className={botaoSecundario}
          >
            Limpar filtros
          </button>
        </div>
      )}

      {visiveis.map((g) => (
        <section key={g.titulo} className={`mb-8 ${cartao}`}>
          <h2 className="flex justify-between border-b border-borda px-4 py-3 text-xs font-semibold uppercase tracking-wide text-texto-fraco">
            <span className="tabular-nums">
              {g.titulo} ({g.criativos.length})
            </span>
            <span>Status</span>
          </h2>
          <ul className="divide-y divide-borda">
            {g.criativos.map((c) => (
              <li key={c.id} className="flex items-center gap-3 px-4 py-3">
                <a
                  href={c.instagram ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Abrir ${c.nome} no Instagram`}
                  className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-superficie-2"
                >
                  {c.miniatura && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.miniatura}
                      alt=""
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className={`h-full w-full object-cover ${c.inativo ? "opacity-50 grayscale" : ""}`}
                    />
                  )}
                </a>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className={`truncate font-medium ${c.inativo ? "text-texto-suave" : ""}`}>{c.nome}</span>
                    {c.instagram && (
                      <a
                        href={c.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Abrir ${c.nome} no Instagram`}
                        className="-my-2 shrink-0 rounded-md p-2 text-texto-fraco transition-colors hover:text-destaque"
                      >
                        <IconeLinkExterno />
                      </a>
                    )}
                  </div>
                  <p className="truncate text-xs text-texto-fraco">
                    {c.campanha} · {c.conjunto}
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-2 text-sm text-texto-suave">
                  <span
                    aria-hidden
                    className={`h-2.5 w-2.5 rounded-full ${
                      c.inativo ? "bg-texto-fraco" : veiculando ? "bg-green-500" : "bg-amber-400"
                    }`}
                  />
                  <span className="sr-only sm:not-sr-only">
                    {c.inativo ?? (veiculando ? (c.etapa ? `Ativo · ${c.etapa}` : "Ativo") : "Sem veicular")}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
