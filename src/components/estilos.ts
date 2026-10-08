// Vocabulário visual único: mesmo botão, mesmo campo, mesmo cartão em todas as telas.

export const cartao = "rounded-xl border border-borda bg-superficie";

export const campo =
  "min-h-11 rounded-lg border border-borda-forte bg-superficie px-3 py-2 text-sm text-texto placeholder:text-texto-fraco transition-colors focus:border-destaque focus:outline-none focus-visible:ring-2 focus-visible:ring-destaque/30";

export const rotulo = "text-sm font-medium text-texto-suave";

// Ação principal da tela: a única coisa em cor de destaque.
export const botaoPrimario =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-destaque px-4 py-2 text-sm font-semibold text-sobre-destaque transition-colors hover:bg-destaque-hover disabled:cursor-not-allowed disabled:opacity-40";

export const botaoSecundario =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-borda-forte bg-superficie px-3 py-2 text-sm font-medium text-texto-suave transition-colors hover:border-texto-fraco hover:text-texto";

// Filtro: selecionado usa o destaque, os demais ficam neutros.
export const chip = (ativo: boolean) =>
  `inline-flex min-h-11 items-center rounded-full border px-3 text-sm transition-colors sm:min-h-9 ${
    ativo
      ? "border-destaque bg-destaque text-sobre-destaque"
      : "border-borda-forte bg-superficie text-texto-suave hover:border-texto-fraco hover:text-texto"
  }`;

export const linhaClicavel = "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-superficie-2";
