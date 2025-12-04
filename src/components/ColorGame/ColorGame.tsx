import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../firebase'; 
import { ref, set, onValue, update, get } from 'firebase/database';

import { COLORS, GAME_DURATION, TIME_BONUS } from './constants';
import type { GameState, Question, QuestionType, PlayerRole, RoomData, Shop, Player } from './types';
import { PlayScreen } from './PlayScreen';
import { GameOverScreen } from './GameOverScreen';
import { LobbyScreen } from './LobbyScreen';
import { RuleDescription } from './RuleDescription';
import './ColorGame.css';

const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const generateQuestion = (): Question => {
  const text = getRandomElement(COLORS);
  const color = getRandomElement(COLORS); 
  const type: QuestionType = Math.random() > 0.5 ? 'TEXT' : 'COLOR';
  return { text, color, type };
};

const ColorGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('LOBBY');
  const [myRole, setMyRole] = useState<PlayerRole | null>(null);
  const [roomId, setRoomId] = useState('');
  const [myName, setMyName] = useState('');
  const [myShop, setMyShop] = useState<Shop | null>(null); // 自分の選んだ店
  
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [question, setQuestion] = useState<Question | null>(null);
  const [combo, setCombo] = useState(0);

  const [opponentName, setOpponentName] = useState('');
  const [opponentScore, setOpponentScore] = useState(0);
  const [opponentAlive, setOpponentAlive] = useState(true);
  
  // 勝者の店情報
  const [shopCandidates, setShopCandidates] = useState<Shop[]>([]); // 全員の候補

  // 1. 部屋に参加 / 作成 (Shop引数を追加)
  const joinRoom = async (name: string, id: string, role: PlayerRole, shop: Shop | null) => {
    setMyName(name);
    setRoomId(id);
    setMyRole(role);
    setMyShop(shop);

    const roomRef = ref(db, `rooms/${id}`);
    const playerData: Player = {
       name, score: 0, combo: 0, alive: true,
       selectedShopId: shop ? shop.id : null 
    };

    // 選んだ店を候補リストに追加するための準備
    const shopList = shop ? [shop] : [];

    if (role === 'HOST') {
      await set(roomRef, {
        status: 'WAITING',
        players: { host: playerData },
        shopCandidates: shopList
      });
      setGameState('WAITING');
    } else {
      const snapshot = await get(roomRef);
      if (snapshot.exists()) {
        const currentData = snapshot.val() as RoomData;
        const currentShops = currentData.shopCandidates || [];
        
        // 既存のリストに自分の店を追加
        if (shop) currentShops.push(shop);

        await update(ref(db, `rooms/${id}`), {
          "players/guest": playerData,
          "shopCandidates": currentShops
        });
        setGameState('WAITING');
      } else {
        alert("部屋が見つかりません");
        setGameState('LOBBY');
      }
    }
  };

  // 2. 監視
  useEffect(() => {
    if (!roomId || !myRole) return;
    const roomRef = ref(db, `rooms/${roomId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val() as RoomData;
      if (!data) return;

      const opponentRole = myRole === 'HOST' ? 'guest' : 'host';
      const opponentData = data.players[opponentRole];
      
      if (opponentData) {
        setOpponentName(opponentData.name);
        setOpponentScore(opponentData.score);
        setOpponentAlive(opponentData.alive);
      }
      
      // お店の候補リストを更新
      if (data.shopCandidates) {
        setShopCandidates(data.shopCandidates);
      }

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

  const startGameLocal = () => {
    setScore(0);
    setCombo(0);
    setTimeLeft(GAME_DURATION);
    setQuestion(generateQuestion());
    setGameState('PLAY');
  };

  const handleHostStartGame = () => {
    if (roomId) update(ref(db, `rooms/${roomId}`), { status: 'PLAY' });
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
          if (prev <= 0.1) { endGame(); return 0; }
          return prev - 0.1;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, endGame]);

  const handleAnswer = (selectedColorId: string) => {
    if (!question || gameState !== 'PLAY') return;
    const isCorrect = (question.type === 'TEXT' && selectedColorId === question.text.id) || 
                      (question.type === 'COLOR' && selectedColorId === question.color.id);

    if (isCorrect) {
      const comboBonus = Math.floor(combo / 5) * 50; 
      const speedBonus = Math.ceil(timeLeft);
      const newScore = score + 100 + comboBonus + speedBonus;
      setScore(newScore);
      setCombo(combo + 1);
      setTimeLeft((prev) => Math.min(prev + TIME_BONUS, GAME_DURATION));
      setQuestion(generateQuestion());
      updateMyScore(newScore, combo + 1, true);
    } else {
      endGame();
    }
  };

  // 結果表示用：勝者の店を特定
  const getWinnerShopDisplay = () => {
    const isWin = score > opponentScore;
    if (isWin) return myShop; // 自分が勝ちなら自分の店
    // 相手が勝ちなら、候補リストから相手の店を探す（簡易実装：相手が選んだ店IDと一致するものを探す）
    // 今回は簡易的に「自分が負けなら、相手の店を表示したい」が、
    // 相手の selectedShopId を取得するロジックが必要。
    // ここではシンプルに「shopCandidates の中から自分のではないもの」を表示する簡易ロジックにします
    return shopCandidates.find(s => s.id !== myShop?.id) || null;
  };

  if (gameState === 'LOBBY') return <div className="game-container"><LobbyScreen onJoin={joinRoom} /></div>;

  if (gameState === 'WAITING') {
    return (
      <div className="game-container">
        <div className="card">
          <h2 className="title">待機中...</h2>
          <RuleDescription />
          <div className="bg-yellow" style={{textAlign: 'left'}}>
             <p>部屋番号: <strong>{roomId}</strong></p>
             <p>あなた: {myName} {myShop && `(希望: ${myShop.name})`}</p>
             <p>相手: {opponentName || '待機中...'} </p>
          </div>
          {myRole === 'HOST' ? (
             <button className="btn btn-primary" onClick={handleHostStartGame} disabled={!opponentName} style={{ opacity: !opponentName ? 0.5 : 1 }}>
               ゲームスタート！
             </button>
          ) : (<p className="subtitle">ホストが開始するのを待っています...</p>)}
        </div>
      </div>
    );
  }

  if (gameState === 'GAME_OVER') {
    const isWin = score > opponentScore;
    const resultShop = getWinnerShopDisplay();

    return (
      <div className="game-container">
        <GameOverScreen score={score} highScore={0} onRestart={() => setGameState('LOBBY')} onHome={() => setGameState('LOBBY')} />
        
        <div className="card" style={{ marginTop: '1rem' }}>
          <h3>対戦結果</h3>
          <p className={`title ${isWin ? 'text-red' : ''}`}>{isWin ? 'WIN!' : 'LOSE...'}</p>
          <p>相手: {opponentScore}</p>
        </div>

        {/* 勝者の店を表示 */}
        {resultShop && (
          <div className="card" style={{ marginTop: '1rem', background: '#fff7ed', border: '2px solid #f97316' }}>
            <h3 className="text-orange-600 font-bold mb-2">🎉 今夜のお店決定！ 🎉</h3>
            <img src={resultShop.photoUrl} alt="" className="w-full h-32 object-cover rounded mb-2"/>
            <p className="font-bold text-xl">{resultShop.name}</p>
            <p className="text-sm text-slate-500 mb-4">{resultShop.genre}</p>
            <a href={resultShop.url} target="_blank" rel="noreferrer" className="btn btn-primary" style={{background: '#f97316', boxShadow: '0 4px 0 #c2410c'}}>
              ホットペッパーで見る
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="game-container">
      <div style={{ width: '100%', maxWidth: '400px', background: '#334155', color: 'white', padding: '0.5rem', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <span>VS {opponentName || 'Player'} {!opponentAlive && <span style={{ color: '#ef4444' }}>(Game Over)</span>}</span>
         <span>{opponentScore} pts</span>
      </div>
      <PlayScreen score={score} timeLeft={timeLeft} combo={combo} question={question} onAnswer={handleAnswer} />
    </div>
  );
};

export default ColorGame;