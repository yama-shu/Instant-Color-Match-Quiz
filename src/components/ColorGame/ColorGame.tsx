import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../firebase'; // Firebase接続
import { ref, set, onValue, update, get } from 'firebase/database'; // データベース操作

import { COLORS, GAME_DURATION, TIME_BONUS } from './constants';
import type { GameState, Question, QuestionType, PlayerRole, RoomData } from './types';
// import { StartScreen } from './StartScreen';
import { PlayScreen } from './PlayScreen';
import { GameOverScreen } from './GameOverScreen';
import { LobbyScreen } from './LobbyScreen';
import './ColorGame.css';
import { RuleDescription } from './RuleDescription';

// ユーティリティ
const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const generateQuestion = (): Question => {
  const text = getRandomElement(COLORS);
  const color = getRandomElement(COLORS); 
  const type: QuestionType = Math.random() > 0.5 ? 'TEXT' : 'COLOR';
  return { text, color, type };
};

const ColorGame: React.FC = () => {
  // --- State ---
  const [gameState, setGameState] = useState<GameState>('LOBBY');
  const [myRole, setMyRole] = useState<PlayerRole | null>(null);
  const [roomId, setRoomId] = useState('');
  const [myName, setMyName] = useState('');
  
  // ゲームデータ
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [question, setQuestion] = useState<Question | null>(null);
  const [combo, setCombo] = useState(0);

  // 対戦相手のデータ
  const [opponentName, setOpponentName] = useState('');
  const [opponentScore, setOpponentScore] = useState(0);
  const [opponentAlive, setOpponentAlive] = useState(true);

  // --- Firebase Logic ---

  // 1. 部屋に参加 / 作成
  const joinRoom = async (name: string, id: string, role: PlayerRole) => {
    setMyName(name);
    setRoomId(id);
    setMyRole(role);

    const roomRef = ref(db, `rooms/${id}`);

    if (role === 'HOST') {
      // ホストなら部屋を初期化
      await set(roomRef, {
        status: 'WAITING',
        players: {
          host: { name, score: 0, combo: 0, alive: true }
        }
      });
      setGameState('WAITING');
    } else {
      // ゲストなら参加を確認して登録
      const snapshot = await get(roomRef);
      if (snapshot.exists()) {
        await update(ref(db, `rooms/${id}/players/guest`), {
          name, score: 0, combo: 0, alive: true
        });
        setGameState('WAITING');
      } else {
        alert("その部屋は見つかりませんでした");
        setGameState('LOBBY');
      }
    }
  };

  // 2. 部屋の状態を監視 (リアルタイム同期)
  useEffect(() => {
    if (!roomId || !myRole) return;

    const roomRef = ref(db, `rooms/${roomId}`);
    
    // データが変わるたびに呼ばれる
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

      // ゲーム状態の同期
      if (gameState === 'WAITING' && data.status === 'PLAY') {
        startGameLocal();
      }
    });

    return () => unsubscribe();
  }, [roomId, myRole, gameState]);

  // 3. スコアをFirebaseに送る
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

  // ホストが「ゲーム開始」ボタンを押したとき
  const handleHostStartGame = () => {
    if (roomId) {
      update(ref(db, `rooms/${roomId}`), { status: 'PLAY' });
    }
  };

  // ゲーム終了時
  const endGame = useCallback(() => {
    setGameState('GAME_OVER');
    updateMyScore(score, combo, false); // 死んだことを通知
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

      // ★スコア送信
      updateMyScore(newScore, newCombo, true);
    } else {
      endGame();
    }
  };

  // --- Render ---

  if (gameState === 'LOBBY') {
    return (
      <div className="game-container">
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
             <p>あなた: {myName}</p>
             <p>相手: {opponentName || '待機中...'}</p>
          </div>
          
          {myRole === 'HOST' ? (
             <button 
               className="btn btn-primary" 
               onClick={handleHostStartGame}
               disabled={!opponentName} // 相手がいないと押せない
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
    return (
      <div className="game-container">
        <GameOverScreen 
          score={score} 
          highScore={0} // 対戦モードなのでハイスコアは一旦無視
          onRestart={() => setGameState('LOBBY')} 
          onHome={() => setGameState('LOBBY')} 
        />
        {/* 結果の下に対戦相手の情報を出す */}
        <div className="card" style={{ marginTop: '1rem' }}>
          <h3>対戦結果</h3>
          <p className={`title ${isWin ? 'text-red' : ''}`}>
             {isWin ? 'WIN!' : (score === opponentScore ? 'DRAW' : 'LOSE...')}
          </p>
          <p>相手のスコア: {opponentScore}</p>
        </div>
      </div>
    );
  }

  // PLAY中の表示（相手のスコアも出す）
  return (
    <div className="game-container">
      {/* 相手の状況を表示するミニバー */}
      <div style={{ width: '100%', maxWidth: '400px', background: '#334155', color: 'white', padding: '0.5rem', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <span style={{ fontSize: '0.8rem' }}>
           VS {opponentName || 'Player'}
           {/* ↓↓↓ 追加: 相手が死んでいたら(Game Over)と表示する ↓↓↓ */}
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

export default ColorGame;