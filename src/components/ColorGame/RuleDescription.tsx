import React from 'react';
import { Zap } from 'lucide-react';

export const RuleDescription: React.FC = () => {
  return (
    <div style={{ 
      textAlign: 'left', 
      margin: '1.5rem 0', 
      padding: '1rem', 
      background: '#f8fafc', // 薄いグレー背景
      borderRadius: '0.75rem',
      border: '2px solid #e2e8f0'
    }}>
      <h3 style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem', 
        fontSize: '1.1rem', 
        fontWeight: 'bold', 
        color: '#1e293b',
        marginBottom: '0.75rem' 
      }}>
        <Zap size={20} fill="#eab308" color="#eab308" />
        遊び方
      </h3>
      
      <ul style={{ 
        listStyle: 'none', 
        padding: 0, 
        margin: 0, 
        color: '#475569', 
        fontSize: '0.9rem',
        lineHeight: '1.6',
        fontWeight: '500'
      }}>
        <li style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ color: '#94a3b8' }}>●</span>
          <span>お題の指示に従って色を選ぼう</span>
        </li>
        <li style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ color: '#94a3b8' }}>●</span>
          <span>「文字の色」か「文字の意味」か瞬時に判断！</span>
        </li>
        <li style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ color: '#94a3b8' }}>●</span>
          <span>間違えるか時間切れでゲームオーバー</span>
        </li>
        <li style={{ display: 'flex', gap: '0.5rem' }}>
          <span style={{ color: '#94a3b8' }}>●</span>
          <span>素早く正解すると高得点！</span>
        </li>
      </ul>
    </div>
  );
};