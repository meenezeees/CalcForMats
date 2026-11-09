import { budget, type CalcResult, type Prices } from '../lib/calc';
import { fmtBRL, fmtInt } from '../lib/format';
import { Btn, Card, NumField } from './ui';

export interface PriceStrings {
  plate: string;
  bar: string;
  hanger: string;
}

export function BudgetSection({
  r,
  prices,
  setPrices,
  parsed,
  onPrint,
  onPdf,
  onShare,
  shareMsg,
}: {
  r: CalcResult | null;
  prices: PriceStrings;
  setPrices: (p: PriceStrings) => void;
  parsed: Prices;
  onPrint: () => void;
  onPdf: () => void;
  onShare: () => void;
  shareMsg: string;
}) {
  const b = r ? budget(r, parsed) : null;
  const rowsData = r && b
    ? [
        ['Placas de gesso', r.plates.withLoss, parsed.plate, b.plates],
        ['Barras de canaleta', r.channels.bars, parsed.bar, b.channels],
        ['Tirantes', r.hangers.total, parsed.hanger, b.hangers],
      ]
    : [];
  return (
    <Card title="Orçamento de materiais" icon="💰">
      <p className="mb-4 text-sm text-slate-500">Opcional: informe o preço unitário (R$) para estimar o custo.</p>
      <div className="grid gap-4 sm:grid-cols-3 no-print">
        <NumField id="p-plate" label="Preço por placa" unit="R$" value={prices.plate} onChange={(v) => setPrices({ ...prices, plate: v })} />
        <NumField id="p-bar" label="Preço por barra de canaleta" unit="R$" value={prices.bar} onChange={(v) => setPrices({ ...prices, bar: v })} />
        <NumField id="p-hanger" label="Preço por tirante" unit="R$" value={prices.hanger} onChange={(v) => setPrices({ ...prices, hanger: v })} />
      </div>

      {r && b ? (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-2 font-medium">Material</th>
                <th className="py-2 text-right font-medium">Qtd.</th>
                <th className="py-2 text-right font-medium">Unitário</th>
                <th className="py-2 text-right font-medium">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {rowsData.map(([n, q, u, t]) => (
                <tr key={n as string} className="border-b border-slate-100">
                  <td className="py-2">{n}</td>
                  <td className="py-2 text-right">{fmtInt(q as number)}</td>
                  <td className="py-2 text-right">{fmtBRL(u as number)}</td>
                  <td className="py-2 text-right font-semibold">{fmtBRL(t as number)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-brand-50 p-4">
            <span className="font-medium text-brand-700">Valor total estimado</span>
            <span className="text-3xl font-extrabold text-brand-700">{fmtBRL(b.total)}</span>
          </div>
        </div>
      ) : (
        <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Calcule os materiais para ver o orçamento.</p>
      )}

      <div className="no-print mt-5 flex flex-wrap gap-3">
        <Btn onClick={onPrint}>🖨️ Imprimir resultados</Btn>
        <Btn onClick={onPdf} variant="dark">📄 Gerar orçamento em PDF</Btn>
        <Btn onClick={onShare}>🔗 Compartilhar orçamento</Btn>
      </div>
      {shareMsg && <p className="no-print mt-2 text-sm text-green-700">{shareMsg}</p>}
    </Card>
  );
}

