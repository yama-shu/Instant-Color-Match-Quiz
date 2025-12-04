export type GameState = 'LOBBY' | 'WAITING' | 'PLAY' | 'GAME_OVER'; // LOBBYとWAITINGを追加
export type QuestionType = 'TEXT' | 'COLOR';

export type ColorDefinition = {
  id: string;
  name: string;
  hex: string;
};

// 新規：飲食店の情報
export interface Shop {
  id: string;
  name: string;
  url: string;
  photoUrl: string;
  genre: string;
}

// RoomDataの変更：候補リストと勝者の選択IDを追加
export interface RoomData {
  status: 'WAITING' | 'PLAY' | 'FINISHED';
  gameType: 'COLOR_MATCH'; // 今後ゲームが増えた時に使うためのタグ
  players: {
    [key: string]: Player;
  };
  shopCandidates: Shop[]; // 候補のリスト（全プレイヤー共通）
  winnerSelectionId: string | null; // 勝者が選んだ店のID
  startTime?: number; 
}

// Playerの変更：各プレイヤーが選んだ店のIDを保持
export interface Player {
  name: string;
  score: number;
  combo: number;
  alive: boolean;
  selectedShopId: string | null; // プレイヤーが密かに選んだ店
}