import React from 'react';
import { Users, User, Utensils } from 'lucide-react';

interface Props {
  onStart: (mode: 'SOLO' | 'MULTI') => void;
}

export const Home: React.FC<Props> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6">
      {/* ロゴ部分 */}
      <div className="mb-12 text-center animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center mb-4 text-orange-500">
          <Utensils size={64} />
        </div>
        <h1 className="text-6xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 tracking-tighter leading-tight">
          GOURMET<br/>BATTLE
        </h1>
        <p className="text-slate-400 font-bold tracking-widest text-sm">今夜の店を、実力で勝ち取れ。</p>
      </div>

      {/* ボタンエリア */}
      <div className="flex flex-col gap-4 w-full max-w-xs animate-in slide-in-from-bottom-10 duration-700 delay-150">
        <button 
          onClick={() => onStart('MULTI')}
          className="group relative bg-indigo-600 hover:bg-indigo-500 text-white p-5 rounded-2xl font-bold text-lg shadow-xl transition-all active:scale-95"
        >
          <div className="flex items-center justify-center gap-3">
            <Users className="group-hover:scale-110 transition-transform" /> 
            みんなで対戦
          </div>
          <span className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-[10px] px-2 py-0.5 rounded-full font-black animate-bounce">
            RECOMMENDED
          </span>
        </button>

        <button 
          onClick={() => onStart('SOLO')}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-5 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95"
        >
          <User /> ひとりで練習
        </button>
      </div>
      
      <p className="mt-12 text-slate-600 text-xs">v2.0.0 - Powered by Hotpepper Gourmet</p>
    </div>
  );
};