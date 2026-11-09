const nf = (d: number) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });

export const fmt = (v: number, d = 2) => nf(d).format(v);
export const fmtInt = (v: number) => nf(0).format(v);
export const fmtM = (v: number, d = 2) => `${fmt(v, d)} m`;
export const fmtBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

/** Converte texto (aceita vírgula) em número; vazio/ inválido -> NaN. */
export function parseNum(text: string): number {
  const t = text.trim().replace(',', '.');
  if (t === '') return NaN;
  return Number(t);
}

