import { contexts, helpers, senses, sensoryDetails } from './catalog.ts';
import type { Context, Helper, Sense, SensoryDetail } from './catalog.ts';
import type { SensoryEvent } from './types.ts';

export const MIN_EVENTS = 5;
const TOP_SIZE = 3;

export interface Count<T extends string> {
  key: T;
  count: number;
}

export interface Profile {
  total: number;
  enough: boolean;
  topDetails: Count<SensoryDetail>[];
  topSenses: Count<Sense>[];
  topContexts: Count<Context>[];
  topHelpers: Count<Helper>[];
}

function countValues<T extends string>(
  values: T[],
  catalog: readonly T[],
  limit: number,
): Count<T>[] {
  const counts = new Map<T, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return catalog.indexOf(a.key) - catalog.indexOf(b.key);
    })
    .slice(0, limit);
}

export function buildProfile(events: SensoryEvent[], minimum = MIN_EVENTS): Profile {
  return {
    total: events.length,
    enough: events.length >= minimum,
    topDetails: countValues(
      events.flatMap((event) => event.details?.options ?? []),
      sensoryDetails,
      TOP_SIZE,
    ),
    topSenses: countValues(
      events.flatMap((event) => event.senses),
      senses,
      TOP_SIZE,
    ),
    topContexts: countValues(
      events.map((event) => event.context),
      contexts,
      TOP_SIZE,
    ),
    topHelpers: countValues(
      events.flatMap((event) => event.helpers),
      helpers,
      TOP_SIZE,
    ),
  };
}
