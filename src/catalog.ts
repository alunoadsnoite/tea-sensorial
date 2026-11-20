export const senses = [
  'sound',
  'light',
  'touch',
  'smell',
  'taste',
  'temperature',
  'movement',
  'body',
] as const;

export type Sense = (typeof senses)[number];

export const detailsBySense = {
  sound: ['overlap', 'loud', 'repeated', 'sudden'],
  light: ['flashing', 'glare', 'sun', 'screen'],
  touch: ['seams', 'tight', 'unexpectedTouch', 'texture'],
  smell: ['perfume', 'cleaning', 'foodSmell', 'smoke'],
  taste: ['strongTaste', 'bitter', 'aftertaste'],
  temperature: ['heat', 'cold', 'change'],
  movement: ['vehicle', 'spinning', 'crowd'],
  body: ['hunger', 'thirst', 'tired', 'standing'],
} as const satisfies Record<Sense, readonly string[]>;

export type SensoryDetail = (typeof detailsBySense)[Sense][number];
export const sensoryDetails = Object.values(detailsBySense).flat();

export const contexts = [
  'home',
  'work',
  'school',
  'transport',
  'market',
  'street',
  'health',
  'social',
  'other',
] as const;

export type Context = (typeof contexts)[number];

export const helpers = [
  'headphones',
  'sunglasses',
  'leave',
  'pause',
  'water',
  'fidget',
  'warning',
  'quiet',
  'breathing',
  'earplugs',
  'moveSeat',
  'dimLights',
  'oneSpeaker',
  'repeatMovement',
  'other',
] as const;

export type Helper = (typeof helpers)[number];

export const senseEmoji: Record<Sense, string> = {
  sound: '🔉',
  light: '💡',
  touch: '✋',
  smell: '👃',
  taste: '👅',
  temperature: '🌡️',
  movement: '🌀',
  body: '🫀',
};

export const contextEmoji: Record<Context, string> = {
  home: '🏠',
  work: '💼',
  school: '🎓',
  transport: '🚌',
  market: '🛒',
  street: '🌳',
  health: '🏥',
  social: '👥',
  other: '📍',
};

export const helperEmoji: Record<Helper, string> = {
  headphones: '🎧',
  sunglasses: '🕶️',
  leave: '🚪',
  pause: '⏸️',
  water: '💧',
  fidget: '🧸',
  warning: '⏰',
  quiet: '🤫',
  breathing: '🌬️',
  earplugs: '🔇',
  moveSeat: '🪑',
  dimLights: '💡',
  oneSpeaker: '💬',
  repeatMovement: '🔁',
  other: '✨',
};

export function isSense(value: string): value is Sense {
  return (senses as readonly string[]).includes(value);
}

export function isContext(value: string): value is Context {
  return (contexts as readonly string[]).includes(value);
}

export function isHelper(value: string): value is Helper {
  return (helpers as readonly string[]).includes(value);
}
