import { useMemo, useState } from 'react';
import { BudgetSection, type PriceStrings } from './components/BudgetSection';
import { CeilingDrawing } from './components/CeilingDrawing';
import { HistoryList } from './components/HistoryList';
import { ResultCards } from './components/ResultCards';
import { RoomForm, type RoomStrings } from './components/RoomForm';
import { DEFAULT_STRINGS, SettingsPanel, toStrings, type SettingsStrings } from './components/SettingsPanel';
import { Card, Logo } from './components/ui';
import { budget, calculate, validate, type MaterialSettings, type RoomInput, type ValidationErrors } from './lib/calc';
import { fmt, fmtBRL, fmtInt, parseNum } from './lib/format';
import { loadHistory, saveHistory, type HistoryEntry } from './lib/history';

const EMPTY_ROOM: RoomStrings = { mode: 'dimensions', length: '', width: '', area: '' };
const EMPTY_PRICES: PriceStrings = { plate: '', bar: '', hanger: '' };

const parseSettings = (s: SettingsStrings): MaterialSettings =>
  Object.fromEntries(Object.entries(s).map(([k, v]) => [k, parseNum(v)])) as unknown as MaterialSettings;

export default function App() {
  const [room, setRoom] = useState<RoomStrings>(EMPTY_ROOM);
  const [settings, setSettings] = useState<SettingsStrings>(DEFAULT_STRINGS);
  const [prices, setPrices] = useState<PriceStrings>(EMPTY_PRICES);
  const [calculated, setCalculated] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);
  const [shareMsg, setShareMsg] = useState('');

  const roomNum: RoomInput = useMemo(
    () => ({ mode: room.mode, length: parseNum(room.length), width: parseNum(room.width), area: parseNum(room.area) }),
    [room],
  );
  const settingsNum = useMemo(() => parseSettings(settings), [settings]);
  const errors: ValidationErrors = useMemo(() => (calculated ? validate(roomNum, settingsNum) : {}), [calculated, roomNum, settingsNum]);
  const settingsErrors = useMemo(() => validate({ mode: 'area', length: 1, width: 1, area: 1 }, settingsNum), [settingsNum]);
  const hasErrors = Object.keys(errors).length > 0 || Object.keys(settingsErrors).length > 0;

  // Resultado reativo: após o primeiro cálculo, tudo (cards, desenho, orçamento) acompanha as alterações.
  const result = useMemo(() => (calculated && !hasErrors ? calculate(roomNum, settingsNum) : null), [calculated, hasErrors, roomNum, settingsNum]);

  const parsedPrices = { plate: Math.max(0, parseNum(prices.plate) || 0), bar: Math.max(0, parseNum(prices.bar) || 0), hanger: Math.max(0, parseNum(prices.hanger) || 0) };

  function handleCalculate() {
    setCalculated(true);
    const errs = { ...validate(roomNum, settingsNum) };
    if (Object.keys(errs).length) return;
    const r = calculate(roomNum, settingsNum);
    const entry: HistoryEntry = {
      id: String(Date.now()),
      date: new Date().toISOString(),
      room: roomNum,
      settings: settingsNum,
      summary: { area: r.area, plates: r.plates.withLoss, bars: r.channels.bars, hangers: r.hangers.total },
    };
    setHistory((h) => {
      const prev = h[0];
      const same = prev && JSON.stringify([prev.room, prev.settings]) === JSON.stringify([entry.room, entry.settings]);
      return saveHistory(same ? h : [entry, ...h]);
    });
    setTimeout(() => document.getElementById('resultados')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  function handleClear() {
    setRoom(EMPTY_ROOM);
    setCalculated(false);
    setShareMsg('');
  }

  function loadEntry(e: HistoryEntry) {
    setRoom({ mode: e.room.mode, length: String(e.room.length || '').replace('.', ','), width: String(e.room.width || '').replace('.', ','), area: String(e.room.area || '').replace('.', ',') });
    setSettings(toStrings(e.settings));
    setCalculated(true);
    setTimeout(() => document.getElementById('resultados')?.scrollIntoView({ behavior: 'smooth' }), 50);
  }

  function summaryText() {
    if (!result) return '';
    const b = budget(result, parsedPrices);
    const lines = [
      'Calculadora de Forro – Orçamento de materiais',
      `Ambiente: ${fmt(result.length)} × ${fmt(result.width)} m (${fmt(result.area)} m²)`,
      `Placas de gesso: ${fmtInt(result.plates.withLoss)}`,
      `Canaletas: ${fmtInt(result.channels.bars)} barras (${fmt(result.channels.linearMeters)} m, ${result.channels.rows} fileiras)`,
      `Tirantes: ${fmtInt(result.hangers.total)}`,
      `Margem de perda: ${fmt(result.loss, 0)}%`,
    ];
    if (b.total > 0) lines.push(`Valor total estimado: ${fmtBRL(b.total)}`);
    return lines.join('\n');
  }

  async function handleShare() {
    if (!result) return setShareMsg('Calcule os materiais antes de compartilhar.');
    const text = summaryText();
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Orçamento – Calculadora de Forro', text });
        setShareMsg('');
      } else {
        await navigator.clipboard.writeText(text);
        setShareMsg('Orçamento copiado para a área de transferência.');
      }
    } catch {
      /* cancelado pelo usuário */
    }
  }

  function handlePrint(pdf = false) {
    if (!result) return setShareMsg('Calcule os materiais primeiro.');
    const old = document.title;
    if (pdf) {
      document.title = 'Orcamento-Forro-de-Gesso';
      setShareMsg('Na janela de impressão, escolha "Salvar como PDF" como destino.');
    }
    window.print();
    document.title = old;
  }

  return (
    <div className="min-h-screen">
      <header className="no-print border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4">
          <Logo />
          <div>
            <h1 className="text-xl font-extrabold leading-tight text-slate-900">Calculadora de Forro</h1>
            <p className="text-sm text-slate-500">Materiais para forro de gesso · placas, canaletas e tirantes</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        <div className="print-only">
          <h1 className="text-2xl font-bold">Calculadora de Forro – Orçamento</h1>
          <p className="text-sm text-slate-500">{new Date().toLocaleString('pt-BR')}</p>
        </div>

        <RoomForm
          room={room}
          setRoom={setRoom}
          loss={settings.loss}
          setLoss={(v) => setSettings({ ...settings, loss: v })}
          errors={errors}
          onCalculate={handleCalculate}
          onClear={handleClear}
          hasResult={calculated}
        />

        <SettingsPanel value={settings} onChange={setSettings} errors={settingsErrors} onReset={() => setSettings(DEFAULT_STRINGS)} />

        <div id="resultados" className="scroll-mt-4">
          {result ? (
            <div className="space-y-6">
              <ResultCards r={result} />
              <Card title="Desenho técnico do forro" icon="📐">
                <CeilingDrawing r={result} />
              </Card>
            </div>
          ) : (
            <Card title="Resultados" icon="📊" className="no-print">
              <p className="text-sm text-slate-500">
                {calculated ? 'Corrija os campos destacados para ver os resultados.' : 'Informe as medidas do ambiente e clique em “Calcular materiais”.'}
              </p>
            </Card>
          )}
        </div>

        <BudgetSection
          r={result}
          prices={prices}
          setPrices={setPrices}
          parsed={parsedPrices}
          onPrint={() => handlePrint(false)}
          onPdf={() => handlePrint(true)}
          onShare={handleShare}
          shareMsg={shareMsg}
        />

        <HistoryList
          items={history}
          onLoad={loadEntry}
          onClear={() => setHistory(saveHistory([]))}
        />
      </main>

      <footer className="no-print py-6 text-center text-xs text-slate-400">Calculadora de Forro · todos os cálculos são feitos localmente no seu navegador.</footer>
    </div>
  );
}
