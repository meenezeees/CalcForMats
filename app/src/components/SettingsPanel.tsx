import { DEFAULT_SETTINGS, type MaterialSettings, type ValidationErrors } from '../lib/calc';
import { Btn, Card, NumField } from './ui';

export type SettingsStrings = Record<keyof MaterialSettings, string>;

export const toStrings = (s: MaterialSettings): SettingsStrings =>
  Object.fromEntries(Object.entries(s).map(([k, v]) => [k, String(v).replace('.', ',')])) as SettingsStrings;

export const DEFAULT_STRINGS = toStrings(DEFAULT_SETTINGS);

export function SettingsPanel({
  value,
  onChange,
  errors,
  onReset,
}: {
  value: SettingsStrings;
  onChange: (v: SettingsStrings) => void;
  errors: ValidationErrors;
  onReset: () => void;
}) {
  const f = (k: keyof MaterialSettings, label: string, unit = 'm', hint?: string) => (
    <NumField id={`s-${k}`} label={label} unit={unit} hint={hint} value={value[k]} error={errors[k]} onChange={(v) => onChange({ ...value, [k]: v })} />
  );
  return (
    <Card
      title="Configurações dos materiais"
      icon="⚙️"
      className="no-print"
      action={<Btn onClick={onReset} className="!py-1.5">↺ Restaurar padrão</Btn>}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <fieldset className="space-y-3">
          <legend className="mb-2 text-sm font-semibold text-slate-900">Placa de gesso</legend>
          {f('plateLength', 'Comprimento da placa')}
          {f('plateWidth', 'Largura da placa')}
          <p className="text-xs text-slate-500">
            Área por placa: <b>{(() => { const a = Number(value.plateLength.replace(',', '.')) * Number(value.plateWidth.replace(',', '.')); return Number.isFinite(a) ? a.toFixed(2).replace('.', ',') : '—'; })()} m²</b>
          </p>
        </fieldset>
        <fieldset className="space-y-3">
          <legend className="mb-2 text-sm font-semibold text-slate-900">Canaletas</legend>
          {f('barLength', 'Comprimento da barra')}
          {f('channelSpacing', 'Espaçamento entre canaletas')}
          {f('channelInset', 'Recuo da 1ª/última canaleta (parede)', 'm', '0 = encostada na parede')}
          {f('splice', 'Transpasse em emendas', 'm')}
        </fieldset>
        <fieldset className="space-y-3">
          <legend className="mb-2 text-sm font-semibold text-slate-900">Tirantes</legend>
          {f('hangerSpacing', 'Espaçamento entre tirantes')}
          {f('hangerInset', 'Recuo do 1º/último tirante', 'm', 'Distância da parede ao primeiro ponto')}
          {f('loss', 'Margem de perda', '%')}
        </fieldset>
      </div>
    </Card>
  );
}

