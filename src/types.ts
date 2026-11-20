import type { Context, Helper, Sense, SensoryDetail } from './catalog.ts';
import type { Language } from './i18n.ts';

export type ThemeMode = 'light' | 'dark' | 'system';

export type HelpOutcome = 'nothingHelped' | 'nothingTried';

export interface EventDetails {
  options: SensoryDetail[];
  custom: Partial<Record<Sense, string>>;
  customHelper: string;
  helpOutcome?: HelpOutcome;
}

export interface EventDraft {
  context: Context;
  senses: Sense[];
  intensity: number;
  helpers: Helper[];
  note: string;
  details?: EventDetails;
}

export interface SensoryEvent extends EventDraft {
  id: string;
  createdAt: number;
}

export interface Settings {
  language: Language;
  theme: ThemeMode;
  largerText: boolean;
  name: string;
}

export const defaultSettings: Settings = {
  language: 'pt',
  theme: 'system',
  largerText: false,
  name: '',
};
