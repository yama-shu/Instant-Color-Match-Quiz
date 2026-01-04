import React from 'react';
import { Timer, Zap } from 'lucide-react';
import type { Question, ColorDefinition } from './types';
import { COLORS, GAME_DURATION } from './constants';
import './ColorGame.css';

interface Props {
  score: number;
  timeLeft: number;
  combo: number;
  question: Question | null;
  onAnswer: (id: string) => void;
}

export const PlayScreen: React.FC<Props> = ({ score, timeLeft, combo, question, onAnswer }) => {
  if (!question) return null;

  return (
    <div style={{ width: '100%', maxWidth: '400px' }}>
      {/* ヘッダー情報 */}
      <div className="header-info">
        <div>
          <span className="info-label">Time</span>
          <div className={`info-value ${timeLeft < 5 ? 'text-red pulse' : ''}`}>
            <Timer size={20} />
            {timeLeft.toFixed(1)}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span className="info-label">Score</span>
          <div className="info-value" style={{ color: '#4f46e5' }}>{score}</div>
        </div>
      </div>

      {/* コンボ表示 */}
      <div style={{ height: '24px', textAlign: 'center', marginBottom: '8px' }}>
        {combo > 1 && (
          <span style={{ color: '#f97316', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <Zap size={14} fill="currentColor" /> {combo} COMBO!
          </span>
        )}
      </div>

      {/* 問題エリア */}
      <div className="question-box">
        <div 
          className="progress-bar" 
          style={{ width: `${(timeLeft / GAME_DURATION) * 100}%` }} 
        />
        
        <span 
          className="question-badge"
          style={{ backgroundColor: question.type === 'COLOR' ? '#ec4899' : '#1e293b' }}
        >
          {question.type === 'COLOR' ? '「色」を答えろ！' : '「文字」を読め！'}
        </span>

        <div className="question-text" style={{ color: question.color.hex }}>
          {question.text.name}
        </div>
      </div>

      {/* 回答ボタン */}
      <div className="grid-answers">
        {COLORS.map((c: ColorDefinition) => (
          <button
            key={c.id}
            className="btn btn-answer"
            // 背景色を動的にセット
            style={{ 
              backgroundColor: c.hex, 
              color: 'white', // 文字は白にする
              textShadow: '0 2px 2px rgba(0,0,0,0.3)' // 文字を読みやすくする影
            }}
            onClick={() => onAnswer(c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
};