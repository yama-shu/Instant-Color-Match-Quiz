import type { Shop } from '../../Restaurant/RestaurantSelector';

// 'STARTING' を追加 (3, 2, 1のカウントダウン用)
export type GameState = 'LOBBY' | 'WAITING' | 'STARTING' | 'PLAY' | 'GAME_OVER';
export type PlayerRole = 'HOST' | 'GUEST';

export interface Player {
  name: string;
  clicks: number;
  alive: boolean;
  selectedShopId: string | null;
}

export interface RoomData {
  status: 'WAITING' | 'PLAY' | 'FINISHED';
  gameType: 'CLICKER_BATTLE';
  players: {
    host: Player;
    guest?: Player;
  };
  shopCandidates?: Shop[];
}