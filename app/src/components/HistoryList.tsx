import type { HistoryEntry } from '../lib/history';
import { fmt, fmtInt } from '../lib/format';
import { Btn, Card } from './ui';

export function HistoryList({ items, onLoad, onClear }: { items: HistoryEntry[]; onLoad: (e: HistoryEntry) => void; onClear: () => void }) {
  return (
    <Card
      title="Histórico de cálculos"
      icon="🕘"
      className="no-print"
      action={items.length > 0 ? <Btn onClick={onClear} className="!py-1.5">Limpar histórico</Btn> : undefined}
    >
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">Nenhum cálculo salvo ainda. Os últimos 10 ficam guardados neste navegador.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map((h) => (
            <li key={h.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <div className="font-semibold">
                  {h.room.mode === 'dimensions' ? `${fmt(h.room.length)} × ${fmt(h.room.width)} m` : `Área ${fmt(h.room.area)} m²`}
                  <span className="ml-2 text-sm font-normal text-slate-400">{fmt(h.summary.area)} m²</span>
                </div>
                <div className="text-xs text-slate-500">
                  {new Date(h.date).toLocaleString('pt-BR')} · {fmtInt(h.summary.plates)} placas · {fmtInt(h.summary.bars)} barras · {fmtInt(h.summary.hangers)} tirantes
                </div>
              </div>
              <Btn onClick={() => onLoad(h)} className="!py-1.5">Abrir</Btn>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

