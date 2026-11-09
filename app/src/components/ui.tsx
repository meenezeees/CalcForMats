import type { ReactNode } from 'react';

export function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <rect width="48" height="48" rx="12" fill="#ea580c" />
      <rect x="9" y="11" width="30" height="20" rx="2" fill="none" stroke="#fff" strokeWidth="2.5" />
      <path d="M9 18h30M9 25h30" stroke="#fff" strokeWidth="2" />
      <path d="M17 31v6M31 31v6M13 37h8M27 37h8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function Card({
  title,
  icon,
  children,
  action,
  className = '',
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`print-card rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6 ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          {icon && <span className="text-xl">{icon}</span>}
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function NumField({
  label,
  value,
  onChange,
  unit,
  error,
  hint,
  id,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  unit?: string;
  error?: string;
  hint?: string;
  id: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-600">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          className={`w-full rounded-xl border bg-slate-50 px-3 py-2.5 pr-12 text-base outline-none transition focus:bg-white focus:ring-2 ${
            error ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
          }`}
        />
        {unit && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">{unit}</span>}
      </div>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}

export function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-t border-slate-100 py-2 text-sm first:border-t-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-semibold text-slate-800">
        {value}
        {sub && <span className="ml-1 text-xs font-normal text-slate-400">{sub}</span>}
      </span>
    </div>
  );
}

export function Btn({
  children,
  onClick,
  variant = 'ghost',
  className = '',
  type = 'button',
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'ghost' | 'dark';
  className?: string;
  type?: 'button' | 'submit';
}) {
  const styles = {
    primary: 'bg-brand-600 text-white shadow-md shadow-brand-500/30 hover:bg-brand-700',
    dark: 'bg-slate-900 text-white hover:bg-slate-700',
    ghost: 'bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50',
  }[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98] ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

