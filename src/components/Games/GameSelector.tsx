import React from 'react';
import { Palette, Dumbbell } from 'lucide-react'; 
// 修正箇所: ドット1つ(.)からドット2つ(..)に変更しました
import { BackToRestaurantButton } from '../NavigationButtons'; 

interface Props {
  onSelect: (gameId: 'COLOR' | 'CLICKER') => void;
  onBack: () => void; 
}

export const GameSelector: React.FC<Props> = ({ onSelect, onBack }) => {
  const games = [
    { 
      id: 'COLOR', 
      name: '瞬間色あて', 
      desc: '脳の処理速度を競う！', 
      icon: <Palette size={40} className="text-white" />,
      color: 'bg-indigo-500' 
    },
    { 
      id: 'CLICKER', 
      name: '連打バトル(仮)', 
      desc: '指の体力を競う！', 
      icon: <Dumbbell size={40} className="text-white" />,
      color: 'bg-orange-500' 
    },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl">
         {/* 戻るボタン */}
        <BackToRestaurantButton onBack={onBack} />
        
        <h2 className="text-3xl font-black text-slate-800 mb-8 text-center">勝負するゲームを選べ</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => onSelect(game.id)}
              className="bg-white rounded-3xl p-6 shadow-xl border-4 border-transparent hover:border-slate-300 transition-all transform hover:-translate-y-1 flex flex-col items-center text-center group"
            >
              <div className={`${game.color} p-4 rounded-2xl mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                {game.icon}
              </div>
              <h3 className="text-2xl font-bold text-slate-700 mb-2">{game.name}</h3>
              <p className="text-slate-500 font-bold">{game.desc}</p>
            </button>
          ))}
        </div>
        
        <p className="mt-8 text-slate-400 text-sm text-center">※ランダム機能は準備中です</p>
      </div>
    </div>
  );
};