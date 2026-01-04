import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../../firebase'; 
import { ref, set, onValue, update, get } from 'firebase/database';

import { GAME_DURATION } from './constants';
import type { Shop } from '../../Restaurant/RestaurantSelector';
import type { GameState, PlayerRole, RoomData, Player } from './types';

// コンポーネント
import { ClickerPlayScreen } from './ClickerPlayScreen';
import { LobbyScreen } from '../ColorGame/LobbyScreen';
import { GameOverScreen } from '../ColorGame/GameOverScreen';
import { RuleDescription } from './RuleDescription'; // 新しく作った説明文
import '../ColorGame/ColorGame.css'; // デザイン統一のためCSS流用

interface Props {
  shop: Shop | null;
  onGameEnd: () => void;
}

export const ClickerGame: React.FC<Props> = ({ shop, onGameEnd }) => {
  // --- ゲーム状態管理 ---
  const [gameState, setGameState] = useState<GameState>('LOBBY');
  const [myRole, setMyRole] = useState<PlayerRole | null>(null);
  const [roomId, setRoomId] = useState('');
  const [myName, setMyName] = useState('');

  // --- 自分のデータ ---
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [startCount, setStartCount] = useState(3); // 開始前のカウントダウン用

  // --- 相手のデータ ---
  const [opponentName, setOpponentName] = useState('');
  const [opponentScore, setOpponentScore] = useState(0);

  // --- 店舗データ ---
  const [shopCandidates, setShopCandidates] = useState<Shop[]>([]);

  // --- Firebase連携 ---
  const joinRoom = async (name: string, id: string, role: PlayerRole) => {
    setMyName(name);
    setRoomId(id);
    setMyRole(role);

    const roomRef = ref(db, `rooms/${id}`);
    const playerData: Player = {
       name, clicks: 0, alive: true, selectedShopId: shop ? shop.id : null 
    };
    const shopList = shop ? [shop] : [];

    if (role === 'HOST') {
      await set(roomRef, {
        status: 'WAITING',
        gameType: 'CLICKER_BATTLE',
        players: { host: playerData },
        shopCandidates: shopList
      });
      setGameState('WAITING');
    } else {
      const snapshot = await get(roomRef);
      if (snapshot.exists()) {
        const currentData = snapshot.val() as RoomData;
        const currentShops = currentData.shopCandidates || [];
        if (shop && !currentShops.find(s => s.id === shop.id)) currentShops.push(shop);

        await update(ref(db, `rooms/${id}`), {
          "players/guest": playerData,
          "shopCandidates": currentShops
        });
        setGameState('WAITING');
      } else {
        alert("部屋が見つかりません");
      }
    }
  };

  useEffect(() => {
    if (!roomId || !myRole) return;
    const roomRef = ref(db, `rooms/${roomId}`);
    return onValue(roomRef, (snapshot) => {
      const data = snapshot.val() as RoomData;
      if (!data) return;

      const opponentRole = myRole === 'HOST' ? 'guest' : 'host';
      const opponentData = data.players[opponentRole];
      if (opponentData) {
        setOpponentName(opponentData.name);
        setOpponentScore(opponentData.clicks);
      }
      if (data.shopCandidates) setShopCandidates(data.shopCandidates);
      
      // ゲーム開始シグナルを受け取ったら、まずは「STARTING」にする
      if (gameState === 'WAITING' && data.status === 'PLAY') {
        setStartCount(3);
        setGameState('STARTING');
      }
    });
  }, [roomId, myRole, gameState]);

  const updateMyScore = (newClicks: number) => {
    if (!roomId || !myRole) return;
    const myKey = myRole === 'HOST' ? 'host' : 'guest';
    update(ref(db, `rooms/${roomId}/players/${myKey}`), {
      clicks: newClicks
    });
  };

  // --- ゲームロジック ---

  const handleHostStartGame = () => {
    if (roomId) update(ref(db, `rooms/${roomId}`), { status: 'PLAY' });
  };

  // 3, 2, 1 カウントダウン処理
  useEffect(() => {
    if (gameState === 'STARTING') {
      const timer = setInterval(() => {
        setStartCount((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setClicks(0);
            setTimeLeft(GAME_DURATION);
            setGameState('PLAY'); // ここで本当にゲーム開始
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState]);

  const endGame = useCallback(() => {
    setGameState('GAME_OVER');
  }, []);

  // ゲーム本番タイマー処理
  useEffect(() => {
    let timer: number;
    if (gameState === 'PLAY' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0.1) {
            endGame();
            return 0;
          }
          return prev - 0.1;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, endGame]);

  const handleClick = () => {
    if (gameState !== 'PLAY') return;
    const newClicks = clicks + 1;
    setClicks(newClicks);
    updateMyScore(newClicks);
  };

  const getWinnerShop = () => {
    const isWin = clicks > opponentScore;
    if (isWin) return shop;
    return shopCandidates.find(s => s.id !== shop?.id) || null;
  };

  // --- レンダリング ---

  if (gameState === 'LOBBY') {
    return (
      <div className="game-container">
        <button 
          onClick={onGameEnd}
          className="fixed top-4 left-4 z-50 text-slate-400 font-bold hover:text-slate-600 bg-white/80 px-3 py-1 rounded-full shadow-sm"
        >
          ← ゲーム選択へ
        </button>
        <LobbyScreen onJoin={joinRoom} title="連打バトル" />
      </div>
    );
  }

  // 待機画面 (瞬間色あてと統一)
  if (gameState === 'WAITING') {
    return (
      <div className="game-container">
        <div className="card w-full max-w-md bg-white p-6 rounded-3xl shadow-xl">
          <h2 className="text-2xl font-black text-slate-800 mb-4 text-center">待機中...</h2>
          
          <RuleDescription />
          
          <div className="bg-yellow-50 p-4 rounded-xl text-left border border-yellow-100 mb-6 space-y-2">
             <p className="flex justify-between">
               <span className="text-slate-500 text-xs font-bold">ROOM ID</span>
               <span className="font-mono font-bold text-lg text-slate-800">{roomId}</span>
             </p>
             <div className="h-px bg-yellow-200 my-2"></div>
             <p className="text-sm">あなた: <span className="font-bold">{myName}</span></p>
             <p className="text-sm">相手: <span className="font-bold">{opponentName || '...'}</span></p>
          </div>
          
          {myRole === 'HOST' ? (
             <button 
               className="btn btn-primary w-full py-4 text-lg shadow-lg" 
               onClick={handleHostStartGame}
               disabled={!opponentName}
               style={{ opacity: !opponentName ? 0.5 : 1 }}
             >
               ゲームスタート！
             </button>
          ) : (
             <div className="text-center py-4 bg-slate-50 rounded-xl">
               <span className="animate-pulse text-slate-500 font-bold">ホストが開始するのを待っています...</span>
             </div>
          )}
        </div>
      </div>
    );
  }

  // ゲーム終了画面 (中央寄せに修正)
  if (gameState === 'GAME_OVER') {
    const isWin = clicks > opponentScore;
    const resultShop = getWinnerShop();
    return (
      <div className="game-container">
        <GameOverScreen 
          score={clicks} 
          highScore={0} 
          onRestart={() => setGameState('LOBBY')} 
          onHome={onGameEnd}
		  title="ゲーム終了〜"
          subtitle="" // 空文字にして非表示にする
        />
        
        <div className="card mt-4 flex flex-col items-center text-center">
            <h3 className="font-bold text-lg text-slate-500 mb-2">対戦結果</h3>
            <div className={`text-4xl font-black mb-4 ${isWin ? 'text-red-500' : 'text-slate-400'}`}>
              {isWin ? 'YOU WIN!' : (clicks === opponentScore ? 'DRAW' : 'LOSE...')}
            </div>
            <div className="flex gap-8 mb-2">
              <div className="flex flex-col">
                <span className="text-xs text-slate-400">あなた</span>
                <span className="text-2xl font-bold">{clicks}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-400">相手</span>
                <span className="text-2xl font-bold">{opponentScore}</span>
              </div>
            </div>
        </div>

        {resultShop && (
           <div className="card mt-4 animate-in slide-in-from-bottom-5 bg-orange-50 border-2 border-orange-400 flex flex-col items-center text-center">
             <h3 className="text-orange-600 font-bold mb-2 flex items-center gap-2">
               🎉 今夜のお店決定！ 🎉
             </h3>
             <img src={resultShop.photoUrl} alt="" className="w-full h-32 object-cover rounded-lg mb-2 shadow-sm"/>
             <p className="font-bold text-xl text-slate-800">{resultShop.name}</p>
             <p className="text-xs text-slate-500 mb-4">{resultShop.genre}</p>
           </div>
        )}
      </div>
    );
  }

  // プレイ画面 (3, 2, 1カウントダウンのオーバーレイ表示付き)
  return (
    // 背景を明るいポップな黄色に変更
    <div className="w-full h-full min-h-screen bg-yellow-50 overflow-hidden relative flex flex-col items-center p-4">
      
      {/* 3, 2, 1 カウントダウンのオーバーレイ */}
      {gameState === 'STARTING' && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in">
          <div className="text-9xl font-black text-white animate-bounce drop-shadow-xl">
            {startCount}
          </div>
        </div>
      )}

      {/* VSバー */}
      <div className="w-full max-w-sm bg-white/90 backdrop-blur shadow-md text-slate-700 px-4 py-2 rounded-full mb-4 flex justify-between items-center z-10 border border-slate-200">
         <span className="text-xs font-bold flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
           VS {opponentName || 'Unknown'}
         </span>
         <span className="font-mono text-xl font-bold text-slate-800">{opponentScore} pts</span>
      </div>

      <ClickerPlayScreen 
        clicks={clicks}
        timeLeft={timeLeft}
        onClick={handleClick}
      />
    </div>
  );
};