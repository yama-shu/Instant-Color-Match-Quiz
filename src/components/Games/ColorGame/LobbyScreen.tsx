import React, { useState } from 'react';
import { Users, LogIn } from 'lucide-react';
import './ColorGame.css';

interface Props {
  // お店は親から渡されるので、ここでの引数からは削除（または無視）でもOKですが
  // わかりやすくシンプルにします
  onJoin: (name: string, roomId: string, role: 'HOST' | 'GUEST') => void;
}

export const LobbyScreen: React.FC<Props> = ({ onJoin }) => {
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [mode, setMode] = useState<'SELECT' | 'CREATE' | 'JOIN'>('SELECT');

  const handleStart = (role: 'HOST' | 'GUEST') => {
    if (!name || !roomId) return;
    onJoin(name, roomId, role);
  };

  return (
    <div className="card">
      <h1 className="title">瞬間色あて</h1>
      <p className="subtitle">部屋に入って対戦！</p>

      {mode === 'SELECT' && (
        <div className="space-y-4">
          <button className="btn btn-primary" onClick={() => setMode('CREATE')}>
            <Users size={24} /> 部屋を作る (ホスト)
          </button>
          <button className="btn btn-secondary" onClick={() => setMode('JOIN')}>
            <LogIn size={24} /> 部屋に入る (ゲスト)
          </button>
        </div>
      )}

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
            onClick={() => handleStart(mode === 'CREATE' ? 'HOST' : 'GUEST')}
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