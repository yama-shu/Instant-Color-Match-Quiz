// ★共通の型を読み込む
import type { Shop } from '../../../types'; 

export type GameState = 'LOBBY' | 'WAITING' | 'PLAY' | 'GAME_OVER';
export type QuestionType = 'TEXT' | 'COLOR';
export type PlayerRole = 'HOST' | 'GUEST';

export type ColorDefinition = {
  id: string;
  name: string;
  hex: string;
};

export interface Question {
  text: ColorDefinition;
  color: ColorDefinition;
  type: QuestionType;
}

// Playerはゲームごとに固有のスコアなどを持つので、ここで拡張して定義
export interface Player {
  name: string;
  score: number;
  combo: number;
  alive: boolean;
  selectedShopId: string | null;
}

export interface RoomData {
  status: 'WAITING' | 'PLAY' | 'FINISHED';
  gameType: 'COLOR_MATCH'; 
  players: {
    [key: string]: Player;
  };
  shopCandidates: Shop[]; // ★共通のShop型を使用
  winnerSelectionId: string | null;
  startTime?: number; 
}