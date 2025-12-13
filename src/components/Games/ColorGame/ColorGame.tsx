import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../../firebase'; 
import { ref, set, onValue, update, get } from 'firebase/database';

import { COLORS, GAME_DURATION, TIME_BONUS } from './constants';
// ↓パスなどはあなたのコードをそのまま採用しています
import type { Shop } from '../../../types'; 
import type { GameState, Question, QuestionType, PlayerRole, RoomData, Player } from './types';
import { PlayScreen } from './PlayScreen';
import { GameOverScreen } from './GameOverScreen';
import { LobbyScreen } from './LobbyScreen';
import { RuleDescription } from './RuleDescription';
import './ColorGame.css';

// --- Props定義 ---
interface Props {
  shop: Shop | null;
  onGameEnd: () => void; // 修正: App.tsxに合わせて 'onBack' を 'onGameEnd' に変更
}

// --- ユーティリティ ---
const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateQuestion = (): Question => {
  const text = getRandomElement(COLORS);
  const color = getRandomElement(COLORS); 
  const type: QuestionType = Math.random() > 0.5 ? 'TEXT' : 'COLOR';
  
  return { text, color, type };
};

// --- メインコンポーネント ---
// 修正: export const に変更し、受け取るPropsを onGameEnd に変更
export const ColorGame: React.FC<Props> = ({ shop, onGameEnd }) => {
  // Game State
  const [gameState, setGameState] = useState<GameState>('LOBBY');
  const [myRole, setMyRole] = useState<PlayerRole | null>(null);
  const [roomId, setRoomId] = useState('');
  const [myName, setMyName] = useState('');
  
  // Play Data
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [question, setQuestion] = useState<Question | null>(null);
  const [combo, setCombo] = useState(0);

  // Opponent Data
  const [opponentName, setOpponentName] = useState('');
  const [opponentScore, setOpponentScore] = useState(0);
  const [opponentAlive, setOpponentAlive] = useState(true);
  
  // Shop Data
  const [shopCandidates, setShopCandidates] = useState<Shop[]>([]);

  // --- Firebase Logic ---

  // 1. 部屋に参加 / 作成
  const joinRoom = async (name: string, id: string, role: PlayerRole) => {
    setMyName(name);
    setRoomId(id);
    setMyRole(role);

    const roomRef = ref(db, `rooms/${id}`);
    
    // プレイヤー情報に「選んだ店のID」を含める
    const playerData: Player = {
       name, 
       score: 0, 
       combo: 0, 
       alive: true,
       selectedShopId: shop ? shop.id : null 
    };

    // 候補リストの準備
    const shopList = shop ? [shop] : [];

    if (role === 'HOST') {
      // ホストなら部屋を作成（お店リストも初期化）
      await set(roomRef, {
        status: 'WAITING',
        gameType: 'COLOR_MATCH',
        players: {
          host: playerData
        },
        shopCandidates: shopList
      });
      setGameState('WAITING');
    } else {
      // ゲストなら参加
      const snapshot = await get(roomRef);
      if (snapshot.exists()) {
        const currentData = snapshot.val() as RoomData;
        const currentShops = currentData.shopCandidates || [];
        
        // 重複チェック: まだリストになければ自分の店を追加
        if (shop && !currentShops.find(s => s.id === shop.id)) {
            currentShops.push(shop);
        }

        await update(ref(db, `rooms/${id}`), {
          "players/guest": playerData,
          "shopCandidates": currentShops
        });
        setGameState('WAITING');
      } else {
        alert("その部屋は見つかりませんでした");
        setGameState('LOBBY');
      }
    }
  };

  // 2. 部屋の状態を監視
  useEffect(() => {
    if (!roomId || !myRole) return;

    const roomRef = ref(db, `rooms/${roomId}`);
    
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val() as RoomData;
      if (!data) return;

      // 相手の情報を更新
      const opponentRole = myRole === 'HOST' ? 'guest' : 'host';
      const opponentData = data.players[opponentRole];
      
      if (opponentData) {
        setOpponentName(opponentData.name);
        setOpponentScore(opponentData.score);
        setOpponentAlive(opponentData.alive);
      }
      
      // お店の候補リストを同期
      if (data.shopCandidates) {
        setShopCandidates(data.shopCandidates);
      }

      // ゲーム開始シグナル
      if (gameState === 'WAITING' && data.status === 'PLAY') {
        startGameLocal();
      }
    });

    return () => unsubscribe();
  }, [roomId, myRole, gameState]);

  // 3. スコア送信
  const updateMyScore = (newScore: number, newCombo: number, isAlive: boolean) => {
    if (!roomId || !myRole) return;
    const myKey = myRole === 'HOST' ? 'host' : 'guest';
    update(ref(db, `rooms/${roomId}/players/${myKey}`), {
      score: newScore,
      combo: newCombo,
      alive: isAlive
    });
  };

  // --- Game Logic ---

  const startGameLocal = () => {
    setScore(0);
    setCombo(0);
    setTimeLeft(GAME_DURATION);
    setQuestion(generateQuestion());
    setGameState('PLAY');
  };

  const handleHostStartGame = () => {
    if (roomId) {
      update(ref(db, `rooms/${roomId}`), { status: 'PLAY' });
    }
  };

  const endGame = useCallback(() => {
    setGameState('GAME_OVER');
    updateMyScore(score, combo, false);
  }, [score, combo, roomId, myRole]);

  // タイマー
  useEffect(() => {
    let timer: number | undefined;
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

  // 回答処理
  const handleAnswer = (selectedColorId: string) => {
    if (!question || gameState !== 'PLAY') return;

    let isCorrect = false;
    if (question.type === 'TEXT') {
      isCorrect = selectedColorId === question.text.id;
    } else {
      isCorrect = selectedColorId === question.color.id;
    }

    if (isCorrect) {
      const comboBonus = Math.floor(combo / 5) * 50; 
      const speedBonus = Math.ceil(timeLeft);
      
      const newScore = score + 100 + comboBonus + speedBonus;
      const newCombo = combo + 1;

      setScore(newScore);
      setCombo(newCombo);
      setTimeLeft((prev) => Math.min(prev + TIME_BONUS, GAME_DURATION));
      
      setQuestion(generateQuestion());
      
      // Firebase更新
      updateMyScore(newScore, newCombo, true);
    } else {
      endGame();
    }
  };

  // 勝者の店を決定するロジック
  const getWinnerShopDisplay = () => {
    const isWin = score > opponentScore;
    
    if (isWin) {
      return shop;
    } else {
      return shopCandidates.find(s => s.id !== shop?.id) || null;
    }
  };

  // --- Render ---

  if (gameState === 'LOBBY') {
    return (
      <div className="game-container">
        {/* 戻るボタン: onBack -> onGameEnd に修正 */}
        <button 
          onClick={onGameEnd}
          className="fixed top-4 left-4 z-50 text-slate-400 font-bold hover:text-slate-600 bg-white/80 px-3 py-1 rounded-full shadow-sm"
        >
          ← ゲーム選択へ
        </button>
        <LobbyScreen onJoin={joinRoom} />
      </div>
    );
  }

  if (gameState === 'WAITING') {
    return (
      <div className="game-container">
        <div className="card">
          <h2 className="title">待機中...</h2>
          <RuleDescription />
          
          <div className="bg-yellow" style={{textAlign: 'left'}}>
             <p>部屋番号: <strong>{roomId}</strong></p>
             <p>あなた: {myName} {shop && <span className="text-xs block text-slate-500">希望: {shop.name}</span>}</p>
             <p>相手: {opponentName || '待機中...'} </p>
          </div>
          
          {myRole === 'HOST' ? (
             <button 
               className="btn btn-primary" 
               onClick={handleHostStartGame}
               disabled={!opponentName}
               style={{ opacity: !opponentName ? 0.5 : 1 }}
             >
               ゲームスタート！
             </button>
          ) : (
             <p className="subtitle">ホストが開始するのを待っています...</p>
          )}
        </div>
      </div>
    );
  }

  if (gameState === 'GAME_OVER') {
    const isWin = score > opponentScore;
    const resultShop = getWinnerShopDisplay();

    return (
      <div className="game-container">
        <GameOverScreen 
          score={score} 
          highScore={0} 
          onRestart={() => setGameState('LOBBY')} 
          onHome={onGameEnd} // 修正: onBack -> onGameEnd
        />
        
        <div className="card" style={{ marginTop: '1rem' }}>
          <h3>対戦結果</h3>
          <p className={`title ${isWin ? 'text-red' : ''}`}>
             {isWin ? 'WIN!' : (score === opponentScore ? 'DRAW' : 'LOSE...')}
          </p>
          <p>相手のスコア: {opponentScore}</p>
        </div>

        {/* 勝者の店を表示エリア */}
        {resultShop && (
          <div className="card animate-in slide-in-from-bottom-5 duration-700" style={{ marginTop: '1rem', background: '#fff7ed', border: '2px solid #f97316' }}>
            <h3 className="text-orange-600 font-bold mb-2 flex justify-center items-center gap-2">
              🎉 今夜のお店決定！ 🎉
            </h3>
            
            <img src={resultShop.photoUrl} alt="" className="w-full h-32 object-cover rounded-lg mb-2 shadow-sm"/>
            
            <p className="font-bold text-xl text-slate-800">{resultShop.name}</p>
            <p className="text-sm text-slate-500 mb-4">{resultShop.genre}</p>
            
            <a 
              href={resultShop.url} 
              target="_blank" 
              rel="noreferrer" 
              className="btn btn-primary" 
              style={{background: '#f97316', boxShadow: '0 4px 0 #c2410c'}}
            >
              ホットペッパーで見る
            </a>
          </div>
        )}
      </div>
    );
  }

  // PLAY中の表示
  return (
    <div className="game-container">
      {/* VSバー */}
      <div style={{ width: '100%', maxWidth: '400px', background: '#334155', color: 'white', padding: '0.5rem', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <span style={{ fontSize: '0.8rem' }}>
           VS {opponentName || 'Player'}
           {!opponentAlive && <span style={{ color: '#ef4444', fontWeight: 'bold', marginLeft: '8px' }}>(Game Over)</span>}
         </span>
         <span style={{ fontWeight: 'bold' }}>{opponentScore} pts</span>
      </div>

      <PlayScreen 
        score={score} 
        timeLeft={timeLeft} 
        combo={combo} 
        question={question} 
        onAnswer={handleAnswer} 
      />
    </div>
  );
};