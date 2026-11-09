/**
 * Lógica matemática pura (sem dependência de UI).
 * Todas as medidas em metros.
 */

export interface MaterialSettings {
  plateLength: number; // m
  plateWidth: number; // m
  barLength: number; // m
  channelSpacing: number; // m (entre canaletas / fileiras)
  hangerSpacing: number; // m (entre tirantes ao longo da fileira)
  hangerInset: number; // m (recuo do primeiro/último tirante em relação à parede)
  channelInset: number; // m (recuo da primeira/última fileira em relação à parede)
  splice: number; // m (transpasse em emendas de canaleta)
  loss: number; // % margem de perda
}

export const DEFAULT_SETTINGS: MaterialSettings = {
  plateLength: 1.8,
  plateWidth: 1.2,
  barLength: 3,
  channelSpacing: 0.6,
  hangerSpacing: 1.2,
  hangerInset: 0.2,
  channelInset: 0,
  splice: 0.1,
  loss: 10,
};

export interface RoomInput {
  mode: 'dimensions' | 'area';
  length: number;
  width: number;
  area: number;
}

export interface CalcResult {
  length: number; // comprimento usado (m)
  width: number; // largura usada (m)
  areaEquivalent: boolean; // true se dimensões derivadas da área (√A)
  area: number;
  loss: number;

  plates: {
    base: number;
    withLoss: number;
    extra: number;
    plateArea: number;
    coveredArea: number; // withLoss * plateArea
  };

  channels: {
    rows: number;
    rowLength: number;
    rowPositions: number[]; // posição de cada fileira ao longo da largura
    realSpacing: number; // espaçamento real entre fileiras
    linearMeters: number; // metros líquidos (rows × rowLength)
    purchasedMeters: number; // bars × barLength
    piecesPerRow: number; // segmentos por fileira
    splicesTotal: number;
    barsBase: number;
    bars: number; // com perda
    leftoverMeters: number;
    cuts: number[][]; // plano de corte por barra
  };

  hangers: {
    perRow: number;
    realSpacing: number;
    positions: number[]; // posições ao longo da fileira
    base: number;
    total: number; // com perda
  };

  areaEstimate: {
    plates: number;
    linearMeters: number;
    bars: number;
    hangers: number;
  };
}

const EPS = 1e-9;
/** Teto com tolerância para ruído de ponto flutuante. */
export const ceilSafe = (v: number) => Math.ceil(v - 1e-9);

export type ValidationErrors = Partial<Record<keyof MaterialSettings | 'length' | 'width' | 'area', string>>;

export function validate(room: RoomInput, s: MaterialSettings): ValidationErrors {
  const e: ValidationErrors = {};
  const pos = (v: number) => Number.isFinite(v) && v > 0;
  const msg = 'Informe um valor maior que zero.';
  if (room.mode === 'dimensions') {
    if (!pos(room.length)) e.length = msg;
    if (!pos(room.width)) e.width = msg;
  } else if (!pos(room.area)) e.area = msg;
  (['plateLength', 'plateWidth', 'barLength', 'channelSpacing', 'hangerSpacing'] as const).forEach((k) => {
    if (!pos(s[k])) e[k] = msg;
  });
  (['hangerInset', 'channelInset', 'splice', 'loss'] as const).forEach((k) => {
    if (!Number.isFinite(s[k]) || s[k] < 0) e[k] = 'Não pode ser negativo.';
  });
  if (!e.splice && !e.barLength && s.splice >= s.barLength) e.splice = 'Deve ser menor que a barra.';
  if (!e.loss && s.loss > 100) e.loss = 'Máximo 100%.';
  return e;
}

/**
 * Distribui pontos entre `start` e `end` de modo que nenhum vão exceda `maxGap`,
 * incluindo sempre as duas extremidades.
 */
export function distribute(start: number, end: number, maxGap: number): number[] {
  const span = end - start;
  if (span <= EPS) return [round((start + end) / 2)];
  const n = ceilSafe(span / maxGap) + 1;
  const gap = span / (n - 1);
  return Array.from({ length: n }, (_, i) => round(start + i * gap));
}

const round = (v: number) => Math.round(v * 1e6) / 1e6;

/**
 * Divide uma fileira de comprimento `len` em segmentos de barra,
 * somando o transpasse a cada emenda.
 */
export function splitRow(len: number, barLen: number, splice: number): number[] {
  const pieces: number[] = [];
  let remaining = len;
  while (remaining > barLen + EPS) {
    pieces.push(barLen);
    remaining = remaining - barLen + splice;
  }
  pieces.push(round(remaining));
  return pieces;
}

/** First-Fit Decreasing: aproveita sobras de corte em outras barras. */
export function packPieces(pieces: number[], barLen: number): number[][] {
  const sorted = [...pieces].sort((a, b) => b - a);
  const bars: { used: number; cuts: number[] }[] = [];
  for (const p of sorted) {
    const bar = bars.find((b) => b.used + p <= barLen + EPS);
    if (bar) {
      bar.used += p;
      bar.cuts.push(p);
    } else bars.push({ used: p, cuts: [p] });
  }
  return bars.map((b) => b.cuts);
}

export function calculate(room: RoomInput, s: MaterialSettings): CalcResult {
  let L = room.length;
  let W = room.width;
  let area = L * W;
  let areaEquivalent = false;
  if (room.mode === 'area') {
    area = room.area;
    L = W = Math.sqrt(area);
    areaEquivalent = true;
  }
  const lossFactor = 1 + s.loss / 100;

  // Placas
  const plateArea = s.plateLength * s.plateWidth;
  const platesBase = ceilSafe(area / plateArea);
  const platesLoss = ceilSafe((area * lossFactor) / plateArea);

  // Fileiras de canaletas (ao longo do comprimento, distribuídas pela largura)
  const rowPositions = distribute(s.channelInset, Math.max(W - s.channelInset, s.channelInset), s.channelSpacing);
  const rows = rowPositions.length;
  const realSpacing = rows > 1 ? (rowPositions[rows - 1] - rowPositions[0]) / (rows - 1) : 0;
  const rowLength = L;
  const linear = rows * rowLength;

  // Barras, cortes, emendas e aproveitamento de sobras
  const rowPieces = splitRow(rowLength, s.barLength, s.splice);
  const allPieces: number[] = [];
  for (let i = 0; i < rows; i++) allPieces.push(...rowPieces);
  const cuts = packPieces(allPieces, s.barLength);
  const barsBase = cuts.length;
  const bars = ceilSafe(barsBase * lossFactor);
  const splicesTotal = (rowPieces.length - 1) * rows;
  const usedMeters = allPieces.reduce((a, b) => a + b, 0);

  // Tirantes: pontos em cada fileira
  const hangerPositions = distribute(s.hangerInset, Math.max(L - s.hangerInset, s.hangerInset), s.hangerSpacing);
  const perRow = hangerPositions.length;
  const hangerReal = perRow > 1 ? (hangerPositions[perRow - 1] - hangerPositions[0]) / (perRow - 1) : 0;
  const hangersBase = perRow * rows;
  const hangers = ceilSafe(hangersBase * lossFactor);

  // Estimativa por área
  const estLinear = area / s.channelSpacing;

  return {
    length: L,
    width: W,
    areaEquivalent,
    area,
    loss: s.loss,
    plates: {
      base: platesBase,
      withLoss: platesLoss,
      extra: platesLoss - platesBase,
      plateArea,
      coveredArea: platesLoss * plateArea,
    },
    channels: {
      rows,
      rowLength,
      rowPositions,
      realSpacing,
      linearMeters: linear,
      purchasedMeters: bars * s.barLength,
      piecesPerRow: rowPieces.length,
      splicesTotal,
      barsBase,
      bars,
      leftoverMeters: barsBase * s.barLength - usedMeters,
      cuts,
    },
    hangers: {
      perRow,
      realSpacing: hangerReal,
      positions: hangerPositions,
      base: hangersBase,
      total: hangers,
    },
    areaEstimate: {
      plates: ceilSafe(area / plateArea),
      linearMeters: estLinear,
      bars: ceilSafe(estLinear / s.barLength),
      hangers: ceilSafe(estLinear / s.hangerSpacing),
    },
  };
}

export interface Prices {
  plate: number;
  bar: number;
  hanger: number;
}

export function budget(r: CalcResult, p: Prices) {
  const plates = r.plates.withLoss * p.plate;
  const channels = r.channels.bars * p.bar;
  const hangers = r.hangers.total * p.hanger;
  return { plates, channels, hangers, total: plates + channels + hangers };
}

