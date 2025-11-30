import React, { useState, useEffect, useCallback } from 'react';
import { COLORS, GAME_DURATION, TIME_BONUS } from './constants';
import type { GameState, Question, QuestionType } from './types';
import { StartScreen } from './StartScreen';
import { PlayScreen } from './PlayScreen';
import { GameOverScreen } from './GameOverScreen';
import './ColorGame.css';

// ユーティリティ関数
const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateQuestion = (): Question => {
  const text = getRandomElement(COLORS);
  // 完全ランダム（文字と色が一致する場合も、しない場合もある）
  const color = getRandomElement(COLORS); 
  const type: QuestionType = Math.random() > 0.5 ? 'TEXT' : 'COLOR';
  
  return { text, color, type };
};

const ColorGame: React.FC = () => {
  // State
  const [gameState, setGameState] = useState<GameState>('START');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [question, setQuestion] = useState<Question | null>(null);
  const [combo, setCombo] = useState(0);

  // ハイスコアの読み込み
  useEffect(() => {
    const savedScore = localStorage.getItem('colorGameHighScore');
    if (savedScore) {
      setHighScore(parseInt(savedScore, 10));
    }
  }, []);

  // ゲーム終了処理
  const endGame = useCallback(() => {
    setGameState('GAME_OVER');
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('colorGameHighScore', score.toString());
    }
  }, [score, highScore]);

  // タイマーロジック
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

  // ゲーム開始
  const startGame = () => {
    setScore(0);
    setCombo(0);
    setTimeLeft(GAME_DURATION);
    setQuestion(generateQuestion());
    setGameState('PLAY');
  };

  // 回答処理
  const handleAnswer = (selectedColorId: string) => {
    if (!question || gameState !== 'PLAY') return;

    let isCorrect = false;
    
    if (question.type === 'TEXT') {
      // 「文字の意味」を答える
      isCorrect = selectedColorId === question.text.id;
    } else {
      // 「文字の色」を答える
      isCorrect = selectedColorId === question.color.id;
    }

    if (isCorrect) {
      // 正解処理
      const comboBonus = Math.floor(combo / 5) * 50; 
      const speedBonus = Math.ceil(timeLeft);
      
      setScore((prev) => prev + 100 + comboBonus + speedBonus);
      setCombo((prev) => prev + 1);
      
      // 時間回復（最大値を超えないように）
      setTimeLeft((prev) => Math.min(prev + TIME_BONUS, GAME_DURATION));
      
      // 次の問題
      setQuestion(generateQuestion());
    } else {
      // 不正解 -> 即終了
      endGame();
    }
  };

  return (
    <div className="game-container">
      {gameState === 'START' && (
        <StartScreen onStart={startGame} highScore={highScore} />
      )}

      {gameState === 'PLAY' && (
        <PlayScreen 
          score={score} 
          timeLeft={timeLeft} 
          combo={combo} 
          question={question} 
          onAnswer={handleAnswer} 
        />
      )}

      {gameState === 'GAME_OVER' && (
        <GameOverScreen 
          score={score} 
          highScore={highScore} 
          onRestart={startGame} 
          onHome={() => setGameState('START')} 
        />
      )}
    </div>
  );
};

export default ColorGame;