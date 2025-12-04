import type { ColorDefinition } from './types';

export const COLORS: ColorDefinition[] = [
  { id: 'red', name: 'あか', hex: '#EF4444' },
  { id: 'blue', name: 'あお', hex: '#3B82F6' },
  { id: 'green', name: 'みどり', hex: '#22C55E' },
  { id: 'yellow', name: 'きいろ', hex: '#EAB308' },
  { id: 'purple', name: 'むらさき', hex: '#A855F7' },
  { id: 'orange', name: 'オレンジ', hex: '#F97316' },
];

export const GAME_DURATION = 30; // 制限時間
export const TIME_BONUS = 2.0;   // 正解時の回復時間