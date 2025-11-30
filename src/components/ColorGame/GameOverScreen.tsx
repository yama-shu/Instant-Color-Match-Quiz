import React from 'react';
import { RotateCcw, AlertCircle } from 'lucide-react';
import './ColorGame.css';

interface Props {
  score: number;
  highScore: number;
  onRestart: () => void;
  onHome: () => void;
}

export const GameOverScreen: React.FC<Props> = ({ score, highScore, onRestart, onHome }) => {
  const isNewRecord = score >= highScore && score > 0;

  return (
    <div className="card">
      <div style={{ color: '#ef4444', display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
        <AlertCircle size={64} />
      </div>
      <h2 className="title" style={{ fontSize: '1.8rem', color: '#1e293b' }}>GAME OVER</h2>
      <p className="subtitle">集中力が途切れました...</p>

      <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem' }}>
        <p className="info-label">Final Score</p>
        <p style={{ fontSize: '3rem', fontWeight: '900', color: '#4f46e5', lineHeight: 1 }}>{score}</p>
      </div>

      {isNewRecord && (
        <div className="bg-yellow pulse" style={{ fontWeight: 'bold' }}>
          🎉 New High Score! 🎉
        </div>
      )}

      <button className="btn btn-primary" onClick={onRestart}>
        <RotateCcw size={24} /> もう一度挑戦
      </button>

      <button className="btn btn-secondary" onClick={onHome}>
        トップに戻る
      </button>
    </div>
  );
};