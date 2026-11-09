import { describe, expect, it } from 'vitest';
import { calculate, DEFAULT_SETTINGS, distribute, packPieces, splitRow, validate } from './calc';

const S = { ...DEFAULT_SETTINGS, loss: 0 };
const room = (length: number, width: number) => ({ mode: 'dimensions' as const, length, width, area: 0 });

describe('distribute', () => {
  it('nunca excede o espaçamento máximo e inclui extremidades', () => {
    for (const span of [0.5, 0.6, 1, 3, 3.01, 4.7, 10]) {
      const p = distribute(0, span, 0.6);
      expect(p[0]).toBe(0);
      expect(p[p.length - 1]).toBeCloseTo(span, 6);
      for (let i = 1; i < p.length; i++) expect(p[i] - p[i - 1]).toBeLessThanOrEqual(0.6 + 1e-6);
    }
  });
});

describe('calculate 4 x 3 (padrão, sem perda)', () => {
  const r = calculate(room(4, 3), S);
  it('placas', () => expect(r.plates.base).toBe(6)); // 12/2.16=5.56
  it('fileiras: 3/0.6 -> 5 vãos -> 6 fileiras', () => {
    expect(r.channels.rows).toBe(6);
    expect(r.channels.realSpacing).toBeCloseTo(0.6);
  });
  it('metros lineares', () => expect(r.channels.linearMeters).toBe(24));
  it('tirantes: vão útil 3.6 -> 4 pontos por fileira', () => {
    expect(r.hangers.perRow).toBe(4);
    expect(r.hangers.realSpacing).toBeCloseTo(1.2);
    expect(r.hangers.total).toBe(24);
  });
  it('barras: cada fileira 3 + 1.1 (emenda); sobras de 1.9 abrigam peças 1.1? só 1', () => {
    // peças por fileira: [3, 1.1] -> 6 de 3m + 6 de 1.1 (cabem 2 por barra: 2.2) => 6 + 3 = 9
    expect(r.channels.bars).toBe(9);
  });
});

describe('outros ambientes', () => {
  it('exato 3 x 3: fileira = 1 barra', () => {
    const r = calculate(room(3, 3), S);
    expect(r.channels.rows).toBe(6);
    expect(r.channels.bars).toBe(6);
    expect(r.hangers.perRow).toBe(Math.ceil((3 - 0.4) / 1.2) + 1); // 4
  });
  it('2,5 x 2,5 mantém vãos <= configurados', () => {
    const r = calculate(room(2.5, 2.5), S);
    expect(r.channels.realSpacing).toBeLessThanOrEqual(0.6 + 1e-9);
    expect(r.hangers.realSpacing).toBeLessThanOrEqual(1.2 + 1e-9);
    expect(r.channels.rows).toBe(6); // 2.5/0.6=4.17 -> 5 vãos
  });
  it('9 x 4.3 com perda 10%', () => {
    const r = calculate(room(9, 4.3), { ...S, loss: 10 });
    expect(r.channels.rows).toBe(9); // 4.3/.6=7.17 -> 8 vãos -> 9
    expect(r.channels.linearMeters).toBeCloseTo(81);
    expect(r.hangers.perRow).toBe(Math.ceil((9 - 0.4) / 1.2) + 1); // 9
    expect(r.plates.withLoss).toBe(Math.ceil((9 * 4.3 * 1.1) / 2.16));
    expect(r.channels.bars).toBeGreaterThanOrEqual(r.channels.barsBase);
  });
  it('modo área usa √A', () => {
    const r = calculate({ mode: 'area', length: 0, width: 0, area: 16 }, S);
    expect(r.length).toBe(4);
    expect(r.width).toBe(4);
  });
  it('geometria consistente: barras cobrem todos os metros', () => {
    for (const [l, w] of [[3.7, 2.9], [5, 5], [12, 3.1], [1.2, 0.9]]) {
      const r = calculate(room(l, w), S);
      expect(r.channels.bars * 3).toBeGreaterThanOrEqual(r.channels.linearMeters - 1e-6);
    }
  });
});

describe('splitRow / packPieces', () => {
  it('sem emenda para fileira <= barra', () => expect(splitRow(3, 3, 0.1)).toEqual([3]));
  it('emenda adiciona transpasse', () => expect(splitRow(4, 3, 0.1)).toEqual([3, 1.1]));
  it('empacota sobras', () => expect(packPieces([1.5, 1.5, 1.5, 1.5], 3)).toHaveLength(2));
});

describe('validate', () => {
  it('rejeita zero e negativos', () => {
    const e = validate(room(0, -1), { ...DEFAULT_SETTINGS, channelSpacing: 0 });
    expect(e.length && e.width && e.channelSpacing).toBeTruthy();
  });
});

