import { useState } from 'react';
import { Home } from './components/Home';
import { RestaurantSelector, type Shop } from './components/Restaurant/RestaurantSelector';
import { GameSelector } from './components/Games/GameSelector';
import { ColorGame } from './components/Games/ColorGame/ColorGame';

type Phase = 'START' | 'RESTAURANT_SELECT' | 'GAME_SELECT' | 'PLAY';
type GameType = 'COLOR' | 'CLICKER';

function App() {
  const [phase, setPhase] = useState<Phase>('START');
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);

  // ゲーム終了時の処理
  const handleGameEnd = () => {
    setPhase('GAME_SELECT');
  };

  return (
    <div className="w-full h-full min-h-screen bg-slate-50">
      
      {/* 1. スタート画面 */}
      {phase === 'START' && (
        <Home onStart={() => setPhase('RESTAURANT_SELECT')} />
      )}

      {/* 2. 飲食店選択画面 */}
      {phase === 'RESTAURANT_SELECT' && (
        <RestaurantSelector 
          onConfirm={(shop) => {
            setSelectedShop(shop); 
            setPhase('GAME_SELECT'); 
          }}
          onSkip={() => {
            setSelectedShop(null); 
            setPhase('GAME_SELECT'); 
          }}
        />
      )}

      {/* 3. ゲーム選択画面 */}
      {phase === 'GAME_SELECT' && (
        <GameSelector 
          onSelect={(gameId) => {
            setSelectedGame(gameId);
            setPhase('PLAY'); 
          }}
          onBack={() => {
            setPhase('RESTAURANT_SELECT'); 
          }}
        />
      )}

      {/* 4. ゲームプレイ画面 */}
      {phase === 'PLAY' && selectedGame === 'COLOR' && (
        <ColorGame 
          shop={selectedShop} 
          onGameEnd={handleGameEnd} 
        />
      )}

      {/* 他のゲームが選ばれた場合の仮表示 */}
      {phase === 'PLAY' && selectedGame === 'CLICKER' && (
        <div className="flex flex-col items-center justify-center h-screen">
          <h2 className="text-2xl font-bold mb-4">連打バトル(仮)</h2>
          <p className="mb-4">このゲームはまだ準備中です。</p>
          <button 
            onClick={() => setPhase('GAME_SELECT')}
            className="px-6 py-2 bg-slate-500 text-white rounded-lg"
          >
            戻る
          </button>
        </div>
      )}

    </div>
  );
}

export default App;