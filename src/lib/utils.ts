import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { AnfrageStatus, Sparte } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const STATUS_LABEL: Record<AnfrageStatus, string> = {
  neu: 'Neu',
  in_bearbeitung: 'In Bearbeitung',
  kalkuliert: 'Kalkuliert',
  angebot_erstellt: 'Angebot erstellt',
  abgeschlossen: 'Abgeschlossen',
};

export const STATUS_COLOR: Record<AnfrageStatus, string> = {
  neu: 'bg-blue-100 text-blue-800',
  in_bearbeitung: 'bg-yellow-100 text-yellow-800',
  kalkuliert: 'bg-purple-100 text-purple-800',
  angebot_erstellt: 'bg-green-100 text-green-800',
  abgeschlossen: 'bg-gray-100 text-gray-600',
};

export const SPARTE_COLOR: Record<Sparte, string> = {
  Strom: 'bg-amber-100 text-amber-800',
  Gas: 'bg-orange-100 text-orange-800',
  Wasser: 'bg-cyan-100 text-cyan-800',
  MSH: 'bg-violet-100 text-violet-800',
};

export const SPARTE_ICON: Record<Sparte, string> = {
  Strom: '⚡',
  Gas: '🔥',
  Wasser: '💧',
  MSH: '🏠',
};

export function formatDatum(iso: string) {
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDatumZeit(iso: string) {
  return new Date(iso).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function formatEuro(betrag: number) {
  return betrag.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}
