// Marca no canto superior esquerdo de todas as telas (inclusive as do cliente).
// Ícone: arquivo original da logo. "GENIUS" e "ASSESORIA DIGITAL" seguem a tipografia da logo.
export function Marca() {
  return (
    <div className="absolute left-4 top-4 flex h-11 items-center gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/genius-icone.png"
        alt=""
        width={622}
        height={619}
        className="h-8 w-8 shrink-0 object-contain dark:brightness-150"
      />
      <span className="flex flex-col leading-none">
        <span className="font-titulo text-xl tracking-wide text-destaque">GENIUS</span>
        <span className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-texto-fraco">Assessoria Digital</span>
      </span>
    </div>
  );
}
