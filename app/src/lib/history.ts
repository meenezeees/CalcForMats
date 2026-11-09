import type { MaterialSettings, RoomInput } from './calc';

export interface HistoryEntry {
  id: string;
  date: string;
  room: RoomInput;
  settings: MaterialSettings;
  summary: { area: number; plates: number; bars: number; hangers: number };
}

const KEY = 'calc-forro:history:v1';
const MAX = 10;

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveHistory(list: HistoryEntry[]): HistoryEntry[] {
  const trimmed = list.slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch {
    /* armazenamento indisponível */
  }
  return trimmed;
}

