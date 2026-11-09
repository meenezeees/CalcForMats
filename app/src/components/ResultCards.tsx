import type { CalcResult } from '../lib/calc';
import { fmt, fmtInt } from '../lib/format';
import { Stat } from './ui';

function BigCard({ icon, title, big, unit, color, children }: { icon: string; title: string; big: string; unit: string; color: string; children: React.ReactNode }) {
  return (
    <div className="print-card rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="mb-3 flex items-center gap-3">
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl text-2xl ${color}`}>{icon}</span>
        <h3 className="font-semibold text-slate-900">{title}</h3>
      </div>
      <div className="mb-3 flex items-baseline gap-2">
        <span className="text-5xl font-extrabold tracking-tight text-slate-900">{big}</span>
        <span className="text-base font-medium text-slate-500">{unit}</span>
      </div>
      {children}
    </div>
  );
}

export function ResultCards({ r }: { r: CalcResult }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <BigCard icon="🧱" title="Placas de gesso" big={fmtInt(r.plates.withLoss)} unit="placas" color="bg-amber-100">
        <Stat label="Área do ambiente" value={`${fmt(r.area)} m²`} />
        <Stat label="Área coberta pelas placas" value={`${fmt(r.plates.coveredArea)} m²`} />
        <Stat label={`Adicional (perda ${fmt(r.loss, 0)}%)`} value={`+${fmtInt(r.plates.extra)}`} sub="placas" />
        <Stat label="Sem perda" value={fmtInt(r.plates.base)} sub="placas" />
      </BigCard>

      <BigCard icon="📏" title="Canaletas" big={fmtInt(r.channels.bars)} unit="barras" color="bg-blue-100">
        <Stat label="Metros lineares" value={`${fmt(r.channels.linearMeters)} m`} />
        <Stat label="Fileiras" value={fmtInt(r.channels.rows)} />
        <Stat label="Comprimento de cada fileira" value={`${fmt(r.channels.rowLength)} m`} />
        <Stat label="Emendas" value={fmtInt(r.channels.splicesTotal)} sub={`(${r.channels.piecesPerRow} peça(s)/fileira)`} />
        <Stat label="Sobra de corte (sem perda)" value={`${fmt(r.channels.leftoverMeters)} m`} />
      </BigCard>

      <BigCard icon="🔩" title="Tirantes" big={fmtInt(r.hangers.total)} unit="tirantes" color="bg-orange-100">
        <Stat label="Pontos por fileira" value={fmtInt(r.hangers.perRow)} />
        <Stat label="Espaçamento real entre pontos" value={`${fmt(r.hangers.realSpacing)} m`} />
        <Stat label="Sem perda" value={`${fmtInt(r.hangers.base)}`} sub={`(${r.channels.rows} × ${r.hangers.perRow})`} />
      </BigCard>

      <div className="print-card rounded-2xl bg-slate-900 p-5 text-slate-100 md:col-span-3">
        <h3 className="mb-1 font-semibold">Comparativo: estimativa por área</h3>
        <p className="mb-3 text-sm text-slate-400">
          Fórmula simplificada (área ÷ espaçamento). Apenas referência — o resultado principal acima usa a geometria real.
        </p>
        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <Cmp label="Placas" est={r.areaEstimate.plates} real={r.plates.base} />
          <Cmp label="Metros de canaleta" est={r.areaEstimate.linearMeters} real={r.channels.linearMeters} dec />
          <Cmp label="Barras (3 m)" est={r.areaEstimate.bars} real={r.channels.barsBase} />
          <Cmp label="Tirantes" est={r.areaEstimate.hangers} real={r.hangers.base} />
        </div>
        {r.areaEquivalent && (
          <p className="mt-3 text-xs text-amber-300">
            Modo "área total": o desenho e o cálculo geométrico consideram um ambiente retangular equivalente (quadrado de lado √A). Informe comprimento e largura para precisão.
          </p>
        )}
      </div>
    </div>
  );
}

function Cmp({ label, est, real, dec }: { label: string; est: number; real: number; dec?: boolean }) {
  const f = (v: number) => (dec ? fmt(v) : fmtInt(v));
  return (
    <div className="rounded-xl bg-slate-800 p-3">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-lg font-bold">{f(real)} <span className="text-xs font-normal text-slate-400">geométrico</span></div>
      <div className="text-sm text-slate-300">{f(est)} <span className="text-xs text-slate-500">por área</span></div>
    </div>
  );
}

