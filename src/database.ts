import type { SQLiteDatabase } from 'expo-sqlite';
import {
  contexts,
  detailsBySense,
  helpers,
  isContext,
  isHelper,
  isSense,
  senses,
} from './catalog.ts';
import type { Context, Helper, Sense } from './catalog.ts';
import { languages } from './i18n.ts';
import type { Language } from './i18n.ts';
import { defaultSettings } from './types.ts';
import type { EventDetails, EventDraft, SensoryEvent, Settings, ThemeMode } from './types.ts';

export type Database = Pick<
  SQLiteDatabase,
  'execAsync' | 'runAsync' | 'getAllAsync' | 'getFirstAsync'
>;

const SCHEMA_VERSION = 2;
const MAX_NOTE = 500;

interface EventRow {
  id: string;
  created_at: number;
  context: string;
  intensity: number;
  note: string;
  details: string | null;
}

interface RelationRow {
  event_id: string;
  sense?: string;
  helper?: string;
}

interface SettingsRow {
  language: string;
  theme: string;
  larger_text: number;
  name: string;
}

function order<T extends string>(values: readonly T[]) {
  return new Map(values.map((value, index) => [value, index]));
}

const senseOrder = order(senses);
const contextOrder = order(contexts);
const helperOrder = order(helpers);

function sortByCatalog<T extends string>(values: T[], catalog: Map<T, number>) {
  return [...values].sort((a, b) => (catalog.get(a) ?? 99) - (catalog.get(b) ?? 99));
}

function unique<T extends string>(values: T[]): T[] {
  return [...new Set(values)];
}

export function newId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export async function initialize(db: SQLiteDatabase) {
  await db.execAsync('PRAGMA foreign_keys = ON;');

  const version = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const current = version?.user_version ?? 0;

  if (current > SCHEMA_VERSION) {
    throw new Error('Versão do banco incompatível');
  }

  if (current < SCHEMA_VERSION) {
    await db.withExclusiveTransactionAsync(async (tx) => {
      if (current === 0) await tx.execAsync(`
        CREATE TABLE IF NOT EXISTS events (
          id TEXT PRIMARY KEY,
          created_at INTEGER NOT NULL,
          context TEXT NOT NULL,
          intensity INTEGER NOT NULL CHECK (intensity BETWEEN 1 AND 5),
          note TEXT NOT NULL DEFAULT ''
        );

        CREATE INDEX IF NOT EXISTS idx_events_created_at ON events (created_at DESC);

        CREATE TABLE IF NOT EXISTS event_senses (
          event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
          sense TEXT NOT NULL,
          PRIMARY KEY (event_id, sense)
        );

        CREATE TABLE IF NOT EXISTS event_helpers (
          event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
          helper TEXT NOT NULL,
          PRIMARY KEY (event_id, helper)
        );

        CREATE TABLE IF NOT EXISTS settings (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          language TEXT NOT NULL DEFAULT 'pt',
          theme TEXT NOT NULL DEFAULT 'system',
          larger_text INTEGER NOT NULL DEFAULT 0,
          name TEXT NOT NULL DEFAULT ''
        );

        INSERT INTO settings (id) VALUES (1)
          ON CONFLICT(id) DO NOTHING;

      `);
      await tx.execAsync(`
        ALTER TABLE events ADD COLUMN details TEXT;
        PRAGMA user_version = 2;
      `);
    });
  }
}

export async function saveEvent(
  db: SQLiteDatabase,
  draft: EventDraft,
  id?: string,
): Promise<string> {
  const eventId = id ?? newId();
  const intensity = Math.min(5, Math.max(1, Math.round(draft.intensity)));
  const note = draft.note.trim().slice(0, MAX_NOTE);
  const eventSenses = sortByCatalog(unique(draft.senses), senseOrder);
  const eventHelpers = sortByCatalog(unique(draft.helpers), helperOrder);

  const details = draft.details;
  const custom: EventDetails['custom'] = {};
  const options = eventSenses.flatMap((sense) => {
    const label = details?.custom[sense]?.trim().slice(0, 120);
    if (label) custom[sense] = label;
    return detailsBySense[sense].filter((option) => details?.options.includes(option));
  });
  const customHelper = details?.customHelper.trim().slice(0, 120) ?? '';
  const helpOutcome = eventHelpers.length || customHelper ? undefined : details?.helpOutcome;
  const detailData = options.length || Object.keys(custom).length || customHelper || helpOutcome
    ? JSON.stringify({ options, custom, customHelper, helpOutcome })
    : null;

  await db.withExclusiveTransactionAsync(async (tx) => {
    if (id) {
      await tx.runAsync(
        'UPDATE events SET context = ?, intensity = ?, note = ?, details = ? WHERE id = ?',
        draft.context,
        intensity,
        note,
        detailData,
        id,
      );
      await tx.runAsync('DELETE FROM event_senses WHERE event_id = ?', id);
      await tx.runAsync('DELETE FROM event_helpers WHERE event_id = ?', id);
    } else {
      await tx.runAsync(
        'INSERT INTO events (id, created_at, context, intensity, note, details) VALUES (?, ?, ?, ?, ?, ?)',
        eventId,
        Date.now(),
        draft.context,
        intensity,
        note,
        detailData,
      );
    }

    for (const sense of eventSenses) {
      await tx.runAsync(
        'INSERT INTO event_senses (event_id, sense) VALUES (?, ?)',
        eventId,
        sense,
      );
    }

    for (const helper of eventHelpers) {
      await tx.runAsync(
        'INSERT INTO event_helpers (event_id, helper) VALUES (?, ?)',
        eventId,
        helper,
      );
    }
  });

  return eventId;
}

export async function listEvents(db: Database): Promise<SensoryEvent[]> {
  const rows = await db.getAllAsync<EventRow>(
    'SELECT id, created_at, context, intensity, note, details FROM events ORDER BY created_at DESC',
  );
  const senseRows = await db.getAllAsync<RelationRow>(
    'SELECT event_id, sense FROM event_senses',
  );
  const helperRows = await db.getAllAsync<RelationRow>(
    'SELECT event_id, helper FROM event_helpers',
  );

  const sensesByEvent = new Map<string, Sense[]>();
  for (const row of senseRows) {
    if (!row.sense || !isSense(row.sense)) continue;
    const list = sensesByEvent.get(row.event_id) ?? [];
    list.push(row.sense);
    sensesByEvent.set(row.event_id, list);
  }

  const helpersByEvent = new Map<string, Helper[]>();
  for (const row of helperRows) {
    if (!row.helper || !isHelper(row.helper)) continue;
    const list = helpersByEvent.get(row.event_id) ?? [];
    list.push(row.helper);
    helpersByEvent.set(row.event_id, list);
  }

  return rows.map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    context: isContext(row.context) ? row.context : 'other',
    intensity: Math.min(5, Math.max(1, row.intensity)),
    note: row.note,
    details: row.details ? JSON.parse(row.details) as EventDetails : undefined,
    senses: sortByCatalog(sensesByEvent.get(row.id) ?? [], senseOrder),
    helpers: sortByCatalog(helpersByEvent.get(row.id) ?? [], helperOrder),
  }));
}

export async function deleteEvent(db: Database, id: string) {
  await db.runAsync('DELETE FROM events WHERE id = ?', id);
}

export async function deleteAllEvents(db: Database) {
  await db.runAsync('DELETE FROM events');
}

export async function loadSettings(db: Database): Promise<Settings> {
  const row = await db.getFirstAsync<SettingsRow>(
    'SELECT language, theme, larger_text, name FROM settings WHERE id = 1',
  );

  if (!row) return { ...defaultSettings };

  const language: Language =
    row.language in languages ? (row.language as Language) : defaultSettings.language;
  const theme: ThemeMode =
    row.theme === 'light' || row.theme === 'dark' || row.theme === 'system'
      ? row.theme
      : defaultSettings.theme;

  return {
    language,
    theme,
    largerText: row.larger_text === 1,
    name: row.name ?? '',
  };
}

export async function saveSettings(db: Database, settings: Settings) {
  await db.runAsync(
    `INSERT INTO settings (id, language, theme, larger_text, name)
     VALUES (1, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       language = excluded.language,
       theme = excluded.theme,
       larger_text = excluded.larger_text,
       name = excluded.name`,
    settings.language,
    settings.theme,
    settings.largerText ? 1 : 0,
    settings.name.slice(0, 80),
  );
}

export async function exportData(db: Database) {
  const [events, settings] = await Promise.all([listEvents(db), loadSettings(db)]);
  return JSON.stringify(
    {
      app: 'tea-sensorial',
      formatVersion: 1,
      exportedAt: new Date().toISOString(),
      settings,
      events,
    },
    null,
    2,
  );
}

export function toDraft(event: SensoryEvent): EventDraft {
  return {
    context: event.context as Context,
    senses: event.senses,
    intensity: event.intensity,
    helpers: event.helpers,
    note: event.note,
    details: event.details,
  };
}
