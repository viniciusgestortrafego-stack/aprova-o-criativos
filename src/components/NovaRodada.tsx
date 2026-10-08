"use client";

import { useFormState, useFormStatus } from "react-dom";
import { criarRodadaAcao, type EstadoCriacao } from "@/app/aprovacoes/acoes";
import { botaoPrimario, campo, cartao, rotulo } from "./estilos";

function Enviar() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className={botaoPrimario}>
      {pending ? "Criando rodada..." : "Criar rodada e gerar link"}
    </button>
  );
}

export function NovaRodada({ clientes }: { clientes: string[] }) {
  const [estado, acao] = useFormState<EstadoCriacao, FormData>(criarRodadaAcao, {});
  return (
    <form action={acao} className={`mb-10 flex flex-col gap-4 p-5 ${cartao}`}>
      <h2 className="font-titulo text-xl font-normal tracking-wide">Nova rodada de aprovação</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className={rotulo}>Cliente</span>
          <input name="cliente" list="clientes" placeholder="Comece a digitar o nome da conta" required className={campo} />
        </label>
        <datalist id="clientes">
          {clientes.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <label className="flex flex-col gap-1.5">
          <span className={rotulo}>Nome da rodada</span>
          <input name="nome" placeholder="Ex.: Criativos de outubro" required className={campo} />
        </label>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className={rotulo}>Criativos</span>
        <textarea name="lista" rows={8} required aria-describedby="ajuda-lista" className={campo} />
        <span id="ajuda-lista" className="text-sm text-texto-fraco">
          Um link por linha: posts do Instagram, vídeos do Google Drive ou pastas do Drive compartilhadas como
          &ldquo;Qualquer pessoa com o link&rdquo;. O texto depois de cada link vira a observação do criativo.
        </span>
      </label>
      {estado.erro && (
        <p role="alert" className="text-sm font-medium text-red-700 dark:text-red-400">
          {estado.erro}
        </p>
      )}
      <div>
        <Enviar />
      </div>
    </form>
  );
}
