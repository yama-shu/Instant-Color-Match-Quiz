// 飲食店情報（どのゲームでも共通）
export interface Shop {
  id: string;
  name: string;
  url: string;
  photoUrl: string;
  genre: string;
  address: string;
  lat?: number;
  lng?: number;
}

// プレイヤー情報（基本形）
export interface BasePlayer {
  name: string;
  selectedShopId: string | null;
  alive: boolean;
}