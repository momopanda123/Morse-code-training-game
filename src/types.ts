export interface MorseNode {
  char: string;
  code: string;
  shape: 'circle' | 'rectangle';
  // Position coordinates in a custom grid system
  x: number;
  y: number;
  parentCode: string;
}

export type GameMode = 'sandbox' | 'practice-letters' | 'practice-words' | 'survival' | 'quiz';

export interface ScoreState {
  score: number;
  streak: number;
  highScore: number;
  totalAttempts: number;
  correctAttempts: number;
}

export interface PracticeWord {
  word: string;
  category: string;
  meaning: string;
}
