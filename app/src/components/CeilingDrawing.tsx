import type { CalcResult } from '../lib/calc';
import { fmt } from '../lib/format';

/** Desenho técnico 2D do forro (vista de planta), gerado a partir do resultado do cálculo. */
export function CeilingDrawing({ r }: { r: CalcResult }) {
  const { length: L, width: W } = r;
  const padL = 70;
  const padR = 90;
  const padT = 50;
  const padB = 60;
  const maxW = 760;
  const maxH = 460;
  const scale = Math.min(maxW / L, maxH / W);
  const w = L * scale;
  const h = W * scale;
  const vbW = w + padL + padR;
  const vbH = h + padT + padB;
  const x = (m: number) => padL + m * scale;
  const y = (m: number) => padT + m * scale;

  const rows = r.channels.rowPositions;
  const pts = r.hangers.positions;
  const dense = rows.length > 40 || pts.length > 40;
  const dot = dense ? 2 : Math.max(3, Math.min(5, scale / 10));
  const font = 12;

  const firstGap = rows.length > 1 ? rows[1] - rows[0] : 0;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${vbW} ${vbH}`} className="mx-auto h-auto w-full max-w-4xl" role="img" aria-label="Desenho técnico do forro">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" fill="none" stroke="#f1f5f9" strokeWidth="1" />
          </pattern>
          <marker id="arr" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0 0L10 5L0 10z" fill="#64748b" />
          </marker>
        </defs>
        <rect width={vbW} height={vbH} fill="url(#grid)" />
        <rect x={x(0)} y={y(0)} width={w} height={h} fill="#f8fafc" stroke="#0f172a" strokeWidth="2.5" />

        {rows.map((p, i) => (
          <line key={i} x1={x(0)} x2={x(L)} y1={y(p)} y2={y(p)} stroke="#2563eb" strokeWidth={dense ? 1.5 : 3} strokeLinecap="round" />
        ))}
        {rows.map((p, i) =>
          pts.map((q, j) => <circle key={`${i}-${j}`} cx={x(q)} cy={y(p)} r={dot} fill="#ea580c" stroke="#fff" strokeWidth="1" />),
        )}

        {/* cota comprimento */}
        <line x1={x(0)} x2={x(L)} y1={padT - 22} y2={padT - 22} stroke="#64748b" markerStart="url(#arr)" markerEnd="url(#arr)" />
        <text x={x(L / 2)} y={padT - 28} textAnchor="middle" fontSize={font + 1} fontWeight="600" fill="#0f172a">
          {fmt(L)} m{r.areaEquivalent ? ' (equiv.)' : ''}
        </text>
        {/* cota largura */}
        <line x1={padL - 24} x2={padL - 24} y1={y(0)} y2={y(W)} stroke="#64748b" markerStart="url(#arr)" markerEnd="url(#arr)" />
        <text transform={`translate(${padL - 32} ${y(W / 2)}) rotate(-90)`} textAnchor="middle" fontSize={font + 1} fontWeight="600" fill="#0f172a">
          {fmt(W)} m
        </text>
        {/* espaçamento entre canaletas */}
        {rows.length > 1 && (
          <g>
            <line x1={x(L) + 22} x2={x(L) + 22} y1={y(rows[0])} y2={y(rows[1])} stroke="#2563eb" markerStart="url(#arr)" markerEnd="url(#arr)" />
            <text x={x(L) + 28} y={y(rows[0] + firstGap / 2) + 4} fontSize={font} fill="#2563eb" fontWeight="600">
              {fmt(r.channels.realSpacing)} m
            </text>
          </g>
        )}
        {/* espaçamento entre tirantes */}
        {pts.length > 1 && (
          <g>
            <line x1={x(pts[0])} x2={x(pts[1])} y1={y(W) + 22} y2={y(W) + 22} stroke="#ea580c" markerStart="url(#arr)" markerEnd="url(#arr)" />
            <text x={x((pts[0] + pts[1]) / 2)} y={y(W) + 38} textAnchor="middle" fontSize={font} fill="#ea580c" fontWeight="600">
              {fmt(r.hangers.realSpacing)} m
            </text>
          </g>
        )}
        {/* recuo do primeiro tirante */}
        {pts[0] > 0 && pts.length > 1 && (
          <text x={x(pts[0] / 2)} y={y(W) + 38} textAnchor="middle" fontSize={11} fill="#94a3b8">
            {fmt(pts[0])}
          </text>
        )}
      </svg>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-600">
        <span className="flex items-center gap-2">
          <span className="inline-block h-1 w-8 rounded bg-blue-600" /> Canaleta ({r.channels.rows} fileiras)
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-brand-600 ring-2 ring-white" /> Tirante ({r.hangers.perRow} por fileira)
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-5 border-2 border-slate-900 bg-slate-50" /> Paredes do ambiente
        </span>
      </div>
    </div>
  );
}

