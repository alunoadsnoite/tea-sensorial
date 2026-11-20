import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { test } from 'node:test';
import {
  deleteAllEvents,
  deleteEvent,
  exportData,
  initialize,
  listEvents,
  loadSettings,
  saveEvent,
  saveSettings,
  toDraft,
} from '../src/database.ts';

function connect() {
  const sqlite = new DatabaseSync(':memory:');
  const db = {
    async execAsync(sql: string) {
      sqlite.exec(sql);
    },
    async runAsync(sql: string, ...params: (string | number)[]) {
      sqlite.prepare(sql).run(...params);
    },
    async getAllAsync<T>(sql: string, ...params: (string | number)[]) {
      return sqlite.prepare(sql).all(...params) as T[];
    },
    async getFirstAsync<T>(sql: string, ...params: (string | number)[]) {
      return (sqlite.prepare(sql).get(...params) ?? null) as T | null;
    },
    async withExclusiveTransactionAsync(action: (tx: typeof db) => Promise<void>) {
      sqlite.exec('BEGIN EXCLUSIVE');
      try {
        await action(db);
        sqlite.exec('COMMIT');
      } catch (error) {
        sqlite.exec('ROLLBACK');
        throw error;
      }
    },
  };
  return { db, sqlite, close: () => sqlite.close() };
}

test('inicializa o schema uma vez e mantém as preferências padrão', async () => {
  const { db, close } = connect();
  try {
    await initialize(db);
    await initialize(db);

    assert.deepEqual(await loadSettings(db), {
      language: 'pt',
      theme: 'system',
      largerText: false,
      name: '',
    });
    assert.deepEqual(await listEvents(db), []);
  } finally {
    close();
  }
});

test('salva, ordena e lista sentidos e ajudas', async () => {
  const { db, close } = connect();
  try {
    await initialize(db);
    const id = await saveEvent(db, {
      context: 'transport',
      senses: ['light', 'sound', 'sound'],
      intensity: 4,
      helpers: ['quiet', 'headphones'],
      note: '  ônibus cheio  ',
    });

    const events = await listEvents(db);
    assert.equal(events.length, 1);
    assert.equal(events[0].id, id);
    assert.equal(events[0].context, 'transport');
    assert.equal(events[0].intensity, 4);
    assert.equal(events[0].note, 'ônibus cheio');
    assert.deepEqual(events[0].senses, ['sound', 'light']);
    assert.deepEqual(events[0].helpers, ['headphones', 'quiet']);
  } finally {
    close();
  }
});

test('edita sem duplicar relações e preserva a data de criação', async () => {
  const { db, close } = connect();
  try {
    await initialize(db);
    const id = await saveEvent(db, {
      context: 'home',
      senses: ['sound'],
      intensity: 2,
      helpers: [],
      note: '',
    });

    const before = (await listEvents(db))[0].createdAt;
    await saveEvent(
      db,
      {
        context: 'work',
        senses: ['light'],
        intensity: 5,
        helpers: ['pause'],
        note: 'reunião',
      },
      id,
    );

    const events = await listEvents(db);
    assert.equal(events.length, 1);
    assert.equal(events[0].createdAt, before);
    assert.equal(events[0].context, 'work');
    assert.equal(events[0].intensity, 5);
    assert.deepEqual(events[0].senses, ['light']);
    assert.deepEqual(events[0].helpers, ['pause']);
  } finally {
    close();
  }
});

test('exclui um evento com as relações e apaga todos quando pedido', async () => {
  const { db, sqlite, close } = connect();
  try {
    await initialize(db);
    const first = await saveEvent(db, {
      context: 'home',
      senses: ['sound'],
      intensity: 1,
      helpers: ['water'],
      note: '',
    });
    await saveEvent(db, {
      context: 'street',
      senses: ['smell'],
      intensity: 3,
      helpers: [],
      note: '',
    });

    await deleteEvent(db, first);
    assert.equal((await listEvents(db)).length, 1);
    assert.equal(
      (sqlite.prepare('SELECT COUNT(*) AS total FROM event_senses').get() as { total: number })
        .total,
      1,
    );
    assert.equal(
      (sqlite.prepare('SELECT COUNT(*) AS total FROM event_helpers').get() as { total: number })
        .total,
      0,
    );

    await deleteAllEvents(db);
    assert.deepEqual(await listEvents(db), []);
  } finally {
    close();
  }
});

test('persiste preferências e exporta um JSON válido', async () => {
  const { db, close } = connect();
  try {
    await initialize(db);
    await saveEvent(db, {
      context: 'social',
      senses: ['body'],
      intensity: 3,
      helpers: ['leave'],
      note: '',
    });
    await saveSettings(db, {
      language: 'en',
      theme: 'dark',
      largerText: true,
      name: 'Alex',
    });

    assert.deepEqual(await loadSettings(db), {
      language: 'en',
      theme: 'dark',
      largerText: true,
      name: 'Alex',
    });

    const exported = JSON.parse(await exportData(db));
    assert.equal(exported.app, 'tea-sensorial');
    assert.equal(exported.settings.name, 'Alex');
    assert.equal(exported.events.length, 1);
    assert.deepEqual(exported.events[0].senses, ['body']);
  } finally {
    close();
  }
});

test('migra registros antigos e mantém os detalhes nas edições e na exportação', async () => {
  const { db, close } = connect();
  try {
    await initialize(db);
    const id = await saveEvent(db, {
      context: 'work',
      senses: ['sound'],
      intensity: 3,
      helpers: [],
      note: 'reunião',
    });
    await db.execAsync('ALTER TABLE events DROP COLUMN details; PRAGMA user_version = 1;');
    await initialize(db);

    const [old] = await listEvents(db);
    assert.equal(old.id, id);
    assert.equal(old.note, 'reunião');
    assert.equal(old.details, undefined);

    await saveEvent(db, {
      ...toDraft(old),
      details: {
        options: ['overlap', 'flashing', 'overlap'],
        custom: { sound: '  microfone  ', light: 'ignorado' },
        customHelper: '',
        helpOutcome: 'nothingTried',
      },
    }, id);

    const [updated] = await listEvents(db);
    assert.deepEqual(updated.details, {
      options: ['overlap'],
      custom: { sound: 'microfone' },
      customHelper: '',
      helpOutcome: 'nothingTried',
    });
    assert.deepEqual(JSON.parse(await exportData(db)).events[0].details, updated.details);

    await saveEvent(db, {
      ...toDraft(updated),
      helpers: ['earplugs'],
      details: { ...updated.details!, customHelper: '  sentar perto da porta  ' },
    }, id);
    const [edited] = await listEvents(db);
    assert.deepEqual(edited.helpers, ['earplugs']);
    assert.equal(edited.details?.customHelper, 'sentar perto da porta');
    assert.equal(edited.details?.helpOutcome, undefined);
  } finally {
    close();
  }
});
