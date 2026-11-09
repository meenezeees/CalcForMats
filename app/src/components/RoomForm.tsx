import type { ValidationErrors } from '../lib/calc';
import { Btn, Card, NumField } from './ui';

export interface RoomStrings {
  mode: 'dimensions' | 'area';
  length: string;
  width: string;
  area: string;
}

export function RoomForm({
  room,
  setRoom,
  loss,
  setLoss,
  errors,
  onCalculate,
  onClear,
  hasResult,
}: {
  room: RoomStrings;
  setRoom: (r: RoomStrings) => void;
  loss: string;
  setLoss: (v: string) => void;
  errors: ValidationErrors;
  onCalculate: () => void;
  onClear: () => void;
  hasResult: boolean;
}) {
  const tab = (m: RoomStrings['mode'], label: string) => (
    <button
      type="button"
      onClick={() => setRoom({ ...room, mode: m })}
      className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${room.mode === m ? 'bg-white text-brand-700 shadow' : 'text-slate-500 hover:text-slate-700'}`}
    >
      {label}
    </button>
  );
  const lossNum = Number(loss.replace(',', '.'));
  return (
    <Card title="Dimensões do ambiente" icon="📐" className="no-print">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onCalculate();
        }}
      >
        <div className="mb-4 flex gap-1 rounded-xl bg-slate-100 p-1">
          {tab('dimensions', 'Comprimento × Largura')}
          {tab('area', 'Área total (m²)')}
        </div>

        {room.mode === 'dimensions' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <NumField id="length" label="Comprimento do ambiente" unit="m" value={room.length} error={errors.length} onChange={(v) => setRoom({ ...room, length: v })} />
            <NumField id="width" label="Largura do ambiente" unit="m" value={room.width} error={errors.width} onChange={(v) => setRoom({ ...room, width: v })} />
          </div>
        ) : (
          <NumField id="area" label="Área total do ambiente" unit="m²" value={room.area} error={errors.area} onChange={(v) => setRoom({ ...room, area: v })} hint="Será considerado um ambiente retangular equivalente (quadrado)." />
        )}

        <div className="mt-4">
          <span className="mb-1 block text-sm font-medium text-slate-600">Margem de perda de material</span>
          <div className="flex flex-wrap items-start gap-2">
            {[5, 10, 15].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setLoss(String(p))}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold ring-1 transition ${lossNum === p ? 'bg-brand-600 text-white ring-brand-600' : 'bg-white text-slate-700 ring-slate-300 hover:bg-slate-50'}`}
              >
                {p}%
              </button>
            ))}
            <div className="w-36">
              <NumField id="loss" label="" unit="%" value={loss} error={errors.loss} onChange={setLoss} />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Btn type="submit" variant="primary" className="flex-1 !py-3.5 text-base sm:flex-none sm:px-10">🧮 Calcular materiais</Btn>
          {hasResult && <Btn onClick={onCalculate}>🔄 Recalcular</Btn>}
          <Btn onClick={onClear}>🗑️ Limpar campos</Btn>
        </div>
      </form>
    </Card>
  );
}

