import { useState } from 'react';
import { Home } from './components/Home';
import { RestaurantSelector } from './components/Restaurant/RestaurantSelector';
import { GameSelector } from './components/Games/GameSelector';
import ColorGame from './components/Games/ColorGame/ColorGame';
import type { Shop } from './types';

// アプリのフェーズ管理
type AppPhase = 'HOME' | 'RESTAURANT_SELECT' | 'GAME_SELECT' | 'PLAYING';

function App() {
  const [phase, setPhase] = useState<AppPhase>('HOME');
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [selectedGameId, setSelectedGameId] = useState<'COLOR' | 'CLICKER'>('COLOR');

  // 1. ホーム画面
  if (phase === 'HOME') {
    return <Home onStart={() => setPhase('RESTAURANT_SELECT')} />;
  }

  // 2. お店選択画面
  if (phase === 'RESTAURANT_SELECT') {
    return (
      <RestaurantSelector 
        onConfirm={(shop) => {
          setSelectedShop(shop);
          setPhase('GAME_SELECT');
        }} 
      />
    );
  }

  // 3. ゲーム選択画面
  if (phase === 'GAME_SELECT') {
    return (
      <GameSelector 
        onSelect={(gameId) => {
          setSelectedGameId(gameId);
          setPhase('PLAYING');
        }} 
      />
    );
  }

  // 4. ゲームプレイ画面（ロビー含む）
  if (phase === 'PLAYING') {
    // 選択されたゲームIDに応じてコンポーネントを切り替える
    if (selectedGameId === 'COLOR') {
      return (
        <ColorGame 
          shop={selectedShop} 
          onBack={() => setPhase('GAME_SELECT')} 
        />
      );
    }
    
    // 他のゲームがあればここに追加...
    return <div>Game Not Found</div>;
  }

  return null;
}

export default App;