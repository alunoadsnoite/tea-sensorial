export interface Palette {
  ink: string;
  muted: string;
  accent: string;
  onAccent: string;
  canvas: string;
  surface: string;
  line: string;
  pale: string;
  highlight: string;
  danger: string;
}

export const lightPalette: Palette = {
  ink: '#1B2A33',
  muted: '#4F6470',
  accent: '#2F6B5F',
  onAccent: '#FFFFFF',
  canvas: '#F5F8F7',
  surface: '#FFFFFF',
  line: '#C6D5D0',
  pale: '#E3EFEA',
  highlight: '#F3EBDD',
  danger: '#8A4B2A',
};

export const darkPalette: Palette = {
  ink: '#EDF5F2',
  muted: '#B4C7C1',
  accent: '#8FD3C1',
  onAccent: '#10231E',
  canvas: '#0F1715',
  surface: '#1B2724',
  line: '#4E6660',
  pale: '#263833',
  highlight: '#3A3227',
  danger: '#E7B08C',
};
