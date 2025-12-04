import React from 'react';
import { Play, Trophy } from 'lucide-react';
import './ColorGame.css';

interface Props {
  onStart: () => void;
  highScore: number;
}

export const StartScreen: React.FC<Props> = ({ onStart, highScore }) => {
  return (
    <div className="card">
      <h1 className="title">瞬間色あて</h1>
      <p className="subtitle">脳の処理速度を限界まで高めろ！</p>
      
      <div className="bg-yellow">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold' }}>
          <Trophy size={20} />
          <span>BEST SCORE</span>
        </div>
        <div style={{ fontSize: '2rem', fontWeight: '900' }}>{highScore}</div>
      </div>

      <button className="btn btn-primary" onClick={onStart}>
        <Play size={24} /> ゲームスタート
      </button>
    </div>
  );
};