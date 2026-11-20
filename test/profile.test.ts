import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildProfile } from '../src/profile.ts';
import type { SensoryEvent } from '../src/types.ts';

function event(
  id: string,
  context: SensoryEvent['context'],
  senses: SensoryEvent['senses'],
  helpers: SensoryEvent['helpers'] = [],
): SensoryEvent {
  return {
    id,
    createdAt: Number(id),
    context,
    senses,
    intensity: 3,
    helpers,
    note: '',
  };
}

test('não libera o perfil antes de cinco registros', () => {
  const profile = buildProfile([event('1', 'home', ['sound'])]);
  assert.equal(profile.total, 1);
  assert.equal(profile.enough, false);
  assert.deepEqual(profile.topSenses, [{ key: 'sound', count: 1 }]);
});

test('agrega sentidos, contextos e ajudas em ordem decrescente', () => {
  const events = [
    event('1', 'transport', ['sound', 'light'], ['headphones']),
    event('2', 'transport', ['sound'], ['headphones', 'quiet']),
    event('3', 'work', ['light'], ['pause']),
    event('4', 'work', ['sound', 'light'], []),
    event('5', 'home', ['sound'], ['quiet']),
  ];

  const profile = buildProfile(events);
  assert.equal(profile.enough, true);
  assert.deepEqual(profile.topSenses, [
    { key: 'sound', count: 4 },
    { key: 'light', count: 3 },
  ]);
  assert.deepEqual(profile.topContexts, [
    { key: 'work', count: 2 },
    { key: 'transport', count: 2 },
    { key: 'home', count: 1 },
  ]);
  assert.deepEqual(profile.topHelpers, [
    { key: 'headphones', count: 2 },
    { key: 'quiet', count: 2 },
    { key: 'pause', count: 1 },
  ]);
});

test('empate segue a ordem do catálogo e limita a três itens', () => {
  const profile = buildProfile([
    event('1', 'other', ['body', 'sound', 'light', 'touch']),
    event('2', 'street', ['body', 'sound', 'light', 'touch']),
    event('3', 'market', ['body', 'sound', 'light', 'touch']),
    event('4', 'health', ['body', 'sound', 'light', 'touch']),
    event('5', 'social', ['body', 'sound', 'light', 'touch']),
  ]);

  assert.deepEqual(profile.topSenses.map(({ key }) => key), ['sound', 'light', 'touch']);
  assert.equal(profile.topSenses.length, 3);
});

test('perfil vazio é seguro e não inventa itens', () => {
  const profile = buildProfile([]);
  assert.deepEqual(profile, {
    total: 0,
    enough: false,
    topDetails: [],
    topSenses: [],
    topContexts: [],
    topHelpers: [],
  });
});

test('agrega detalhes do catálogo e aceita registros anteriores sem detalhes', () => {
  const events: SensoryEvent[] = [
    { ...event('1', 'transport', ['sound', 'light']), details: {
      options: ['overlap', 'flashing'],
      custom: {},
      customHelper: '',
    } },
    { ...event('2', 'work', ['sound']), details: {
      options: ['overlap'],
      custom: { sound: 'microfone' },
      customHelper: '',
    } },
    event('3', 'home', ['sound']),
  ];
  assert.deepEqual(buildProfile(events).topDetails, [
    { key: 'overlap', count: 2 },
    { key: 'flashing', count: 1 },
  ]);
});
