"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { responderAcao } from "@/app/a/[token]/acoes";
import type { Decisao, Item } from "@/lib/aprovacoes";
import { ROTULO, SeloDecisao, dataHora } from "./Decisao";
import { botaoPrimario, campo, cartao, rotulo } from "./estilos";

const BOTAO: Record<Decisao, string> = {
  aprovado: "bg-green-700 text-white hover:bg-green-800",
  ajustar: "bg-amber-400 text-amber-950 hover:bg-amber-300",
  reprovado: "bg-red-600 text-white hover:bg-red-700",
};

const ACAO: Record<Decisao, string> = { aprovado: "Aprovar", ajustar: "Ajustar", reprovado: "Reprovar" };

function previa(item: Item): string {
  return item.tipo === "instagram"
    ? `https://www.instagram.com/p/${item.codigo}/embed/`
    : `https://drive.google.com/file/d/${item.codigo}/preview`;
}

function Cartao({ item, numero, token, nome }: { item: Item; numero: number; token: string; nome: string }) {
  const router = useRouter();
  const [pendente, iniciar] = useTransition();
  const [enviando, setEnviando] = useState<Decisao | null>(null);
  const [aberto, setAberto] = useState<Decisao | null>(null);
  const [comentario, setComentario] = useState("");
  const [erro, setErro] = useState("");
  const ultima = item.respostas[0];

  function enviar(decisao: Decisao) {
    setErro("");
    setEnviando(decisao);
    iniciar(async () => {
      const r = await responderAcao(token, item.id, nome, decisao, comentario);
      setEnviando(null);
      if (r.erro) return setErro(r.erro);
      setAberto(null);
      setComentario("");
      router.refresh();
    });
  }

  return (
    <li className={`flex flex-col overflow-hidden ${cartao}`}>
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm font-semibold tabular-nums">Criativo {numero}</span>
        <SeloDecisao resposta={ultima} />
      </div>
      <iframe
        src={previa(item)}
        title={`Prévia do criativo ${numero}`}
        loading="lazy"
        allowFullScreen
        className="h-[560px] w-full border-0 bg-superficie-2"
      />
      <div className="flex flex-1 flex-col gap-3 p-4">
        {item.observacao && (
          <p className="rounded-lg bg-superficie-2 px-3 py-2 text-sm text-texto-suave">{item.observacao}</p>
        )}
        {ultima && (
          <p className="text-xs tabular-nums text-texto-fraco">
            {ROTULO[ultima.decisao]} por {ultima.nome} em {dataHora(ultima.criado_em)}
            {ultima.comentario && <span className="mt-1 block text-sm text-texto-suave">“{ultima.comentario}”</span>}
          </p>
        )}
        <div className="mt-auto grid grid-cols-3 gap-2">
          {(["aprovado", "ajustar", "reprovado"] as const).map((d) => (
            <button
              key={d}
              disabled={!nome || pendente}
              aria-expanded={d === "aprovado" ? undefined : aberto === d}
              onClick={() => (d === "aprovado" ? enviar(d) : setAberto(aberto === d ? null : d))}
              className={`min-h-11 rounded-lg px-2 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${BOTAO[d]}`}
            >
              {enviando === d && d === "aprovado" ? "Enviando..." : ACAO[d]}
            </button>
          ))}
        </div>
        {!nome && (
          <a href="#seu-nome" className="text-sm text-texto-fraco underline underline-offset-2 hover:text-texto">
            Informe seu nome no topo da página para responder.
          </a>
        )}
        {aberto && (
          <div className="flex flex-col gap-2">
            <label className="flex flex-col gap-1.5">
              <span className={rotulo}>{aberto === "ajustar" ? "O que precisa ajustar?" : "Por que não aprovou?"}</span>
              <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} rows={3} className={campo} />
            </label>
            <button disabled={pendente} onClick={() => enviar(aberto)} className={botaoPrimario}>
              {enviando === aberto ? "Enviando..." : `Enviar (${ROTULO[aberto]})`}
            </button>
          </div>
        )}
        {erro && (
          <p role="alert" className="text-sm font-medium text-red-700 dark:text-red-400">
            {erro}
          </p>
        )}
      </div>
    </li>
  );
}

export function AprovacaoCliente({ token, itens }: { token: string; itens: Item[] }) {
  const [nome, setNome] = useState("");
  const [rascunho, setRascunho] = useState("");

  useEffect(() => {
    try {
      setNome(localStorage.getItem("aprovador") ?? "");
    } catch {}
  }, []);

  function confirmarNome() {
    const limpo = rascunho.trim();
    if (!limpo) return;
    setNome(limpo);
    try {
      localStorage.setItem("aprovador", limpo);
    } catch {}
  }

  const respondidos = itens.filter((i) => i.respostas.length > 0).length;

  return (
    <>
      <div
        id="seu-nome"
        className={`mb-8 flex scroll-mt-6 flex-col gap-3 p-4 sm:flex-row ${nome ? "sm:items-center" : "sm:items-end"} ${cartao}`}
      >
        {nome ? (
          <div className="flex-1">
            <p className="text-sm">
              Respondendo como <strong>{nome}</strong>{" "}
              <button
                onClick={() => setNome("")}
                className="ml-1 rounded px-1 text-texto-fraco underline underline-offset-2 hover:text-texto"
              >
                trocar
              </button>
            </p>
            <p className="mt-0.5 text-xs text-texto-fraco">O nome fica salvo só neste navegador. Se não for você, clique em trocar.</p>
          </div>
        ) : (
          <form
            className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-end"
            onSubmit={(e) => {
              e.preventDefault();
              confirmarNome();
            }}
          >
            <label className="flex flex-1 flex-col gap-1.5">
              <span className={rotulo}>Seu nome</span>
              <input
                value={rascunho}
                onChange={(e) => setRascunho(e.target.value)}
                placeholder="Antes de começar, digite seu nome"
                autoComplete="name"
                className={campo}
              />
            </label>
            <button className={botaoPrimario}>Começar</button>
          </form>
        )}
        <p className={`text-sm tabular-nums text-texto-fraco ${nome ? "" : "sm:pb-3"}`} aria-live="polite">
          {respondidos} de {itens.length} respondidos
        </p>
      </div>
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {itens.map((item, i) => (
          <Cartao key={item.id} item={item} numero={i + 1} token={token} nome={nome} />
        ))}
      </ul>
    </>
  );
}
