import React, { useState } from 'react';
import { Users, LogIn, User } from 'lucide-react';
import type { PlayerRole } from './types'; 
import './ColorGame.css';

interface Props {
  onJoin: (name: string, roomId: string, role: PlayerRole) => void;
  title?: string; // タイトルを受け取る
}

// 内部の画面遷移用ステートの型
type LobbyMode = 'SELECT' | 'CREATE' | 'JOIN';

export const LobbyScreen: React.FC<Props> = ({ onJoin, title = '瞬間色あて' }) => {
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  // 修正: 初期値を 'SELECT' にし、型を正しく定義
  const [mode, setMode] = useState<LobbyMode>('SELECT');

  const handleStart = () => {
    if (!name || !roomId) return;
    // モードに応じて役割を決定
    const role = mode === 'CREATE' ? 'HOST' : 'GUEST';
    onJoin(name, roomId, role);
  };

  return (
    <div className="card w-full max-w-md bg-white p-8 rounded-3xl shadow-xl">
      {/* タイトル表示 */}
      <h1 className="text-3xl font-black text-center text-indigo-600 mb-2">
        {title}
      </h1>
      <p className="text-center text-slate-400 font-bold mb-8">部屋に入って対戦！</p>

      {/* 1. 選択画面 */}
      {mode === 'SELECT' && (
        <div className="space-y-4">
          <div className="relative">
            <button 
              disabled 
              className="btn w-full bg-slate-100 text-slate-400 border-2 border-slate-200 cursor-not-allowed flex items-center justify-center gap-2"
            >
              <User size={24} /> ひとりで遊ぶ (CPU戦)
            </button>
            
            {/* 準備中バッジ */}
            <span className="absolute -top-2 -right-2 bg-yellow-400 text-slate-800 text-xs font-bold px-2 py-1 rounded-full shadow-sm transform rotate-12 border border-white">
              準備中
            </span>
          </div>

          <div className="border-t border-slate-100 my-2"></div>
          <button className="btn btn-primary" onClick={() => setMode('CREATE')}>
            <Users size={24} /> 部屋を作る (ホスト)
          </button>
          <button className="btn btn-secondary" onClick={() => setMode('JOIN')}>
            <LogIn size={24} /> 部屋に入る (ゲスト)
          </button>
        </div>
      )}

      {/* 2. 入力画面（作成 または 参加） */}
      {(mode === 'CREATE' || mode === 'JOIN') && (
        <div className="flex flex-col gap-4">
          <div>
            <label className="info-label">あなたの名前</label>
            <input 
              type="text" 
              className="btn" 
              style={{ border: '2px solid #cbd5e1', textAlign: 'left', background: '#f8fafc' }}
              placeholder="例: たろう"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div>
            <label className="info-label">部屋番号</label>
            <input 
              type="text" 
              className="btn" 
              style={{ border: '2px solid #cbd5e1', textAlign: 'left', background: '#f8fafc' }}
              placeholder="例: 1234"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
          </div>

          <button 
            className="btn btn-primary" 
            onClick={handleStart}
            disabled={!name || !roomId}
            style={{ opacity: (!name || !roomId) ? 0.5 : 1 }}
          >
            {mode === 'CREATE' ? '準備完了' : '参加する'}
          </button>

          <button className="btn btn-secondary" onClick={() => setMode('SELECT')}>
            戻る
          </button>
        </div>
      )}
    </div>
  );
};