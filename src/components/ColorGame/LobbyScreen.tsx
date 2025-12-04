import React, { useState } from 'react';
import { Users, LogIn } from 'lucide-react';
import { ShopSearch } from './ShopSearch'; // 新規追加
import type { Shop } from './types'; // 型追加
import './ColorGame.css';

interface Props {
  // お店(Shop)も渡せるように変更
  onJoin: (name: string, roomId: string, role: 'HOST' | 'GUEST', shop: Shop | null) => void;
}

export const LobbyScreen: React.FC<Props> = ({ onJoin }) => {
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null); // 選んだ店
  const [mode, setMode] = useState<'SELECT' | 'CREATE' | 'JOIN'>('SELECT');

  const handleStart = (role: 'HOST' | 'GUEST') => {
    if (!name || !roomId) return;
    onJoin(name, roomId, role, selectedShop);
  };

  return (
    <div className="card">
      <h1 className="title">通信対戦</h1>
      <p className="subtitle">勝者が今夜のお店を決める！</p>

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

          {/* お店検索コンポーネントを表示 */}
          <ShopSearch onSelect={(shop) => setSelectedShop(shop)} />

          {selectedShop && (
             <div className="bg-orange-100 p-2 rounded text-orange-800 text-sm font-bold border border-orange-200">
               選択中: {selectedShop.name}
             </div>
          )}

          <button 
            className="btn btn-primary" 
            onClick={() => handleStart(mode === 'CREATE' ? 'HOST' : 'GUEST')}
            disabled={!name || !roomId}
            style={{ opacity: (!name || !roomId) ? 0.5 : 1 }}
          >
            {mode === 'CREATE' ? '部屋を作成' : '部屋に参加'}
          </button>

          <button className="btn btn-secondary" onClick={() => setMode('SELECT')}>
            戻る
          </button>
        </div>
      )}
    </div>
  );
};