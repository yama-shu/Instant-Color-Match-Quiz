import React from 'react';
import { Palette, Dumbbell } from 'lucide-react'; 

interface Props {
  onSelect: (gameId: 'COLOR' | 'CLICKER') => void;
}

export const GameSelector: React.FC<Props> = ({ onSelect }) => {
const games = [
    { 
      id: 'COLOR', 
      name: '瞬間色あて', 
      desc: '脳の処理速度を競う！', 
      icon: <Palette size={40} className="text-white" />,
      color: 'bg-indigo-500',
      shadow: 'shadow-indigo-200',
      disabled: false // ←★これを追加してください！
    },
    { 
      id: 'CLICKER', 
      name: '連打バトル', 
      desc: '指の体力を競う！(準備中)', 
      icon: <Dumbbell size={40} className="text-white" />,
      color: 'bg-orange-500',
      shadow: 'shadow-orange-200',
      disabled: true 
    },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center">
      <h2 className="text-3xl font-black text-slate-800 mb-2">GAME SELECT</h2>
      <p className="text-slate-500 mb-8 font-bold">勝負するゲームを選べ</p>
      
      <div className="grid grid-cols-1 gap-6 w-full max-w-md">
        {games.map((game) => (
          <button
            key={game.id}
            onClick={() => !game.disabled && onSelect(game.id as any)}
            disabled={game.disabled}
            className={`
              relative bg-white rounded-3xl p-6 shadow-xl border-4 border-transparent 
              flex items-center text-left gap-6 transition-all
              ${game.disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:border-slate-200 hover:-translate-y-1 active:translate-y-0'}
            `}
          >
            <div className={`${game.color} p-4 rounded-2xl shadow-lg ${game.shadow}`}>
              {game.icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-700">{game.name}</h3>
              <p className="text-sm text-slate-400 font-bold mt-1">{game.desc}</p>
            </div>
            
            {game.disabled && (
              <span className="absolute top-4 right-4 bg-slate-100 text-slate-400 text-xs px-2 py-1 rounded font-bold">
                Coming Soon
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};