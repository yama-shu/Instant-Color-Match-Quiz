export type GameState = 'LOBBY' | 'WAITING' | 'PLAY' | 'GAME_OVER'; // LOBBYとWAITINGを追加
export type QuestionType = 'TEXT' | 'COLOR';

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

// 通信対戦用の型定義
export type PlayerRole = 'HOST' | 'GUEST';

export interface Player {
  name: string;
  score: number;
  combo: number;
  alive: boolean; // ゲームオーバーになっていないか
}

export interface RoomData {
  status: 'WAITING' | 'PLAY' | 'FINISHED';
  players: {
    [key: string]: Player; // "host" または "guest" というキーでプレイヤー情報を保存
  };
  startTime?: number; // ゲーム開始時刻（同期用）
}