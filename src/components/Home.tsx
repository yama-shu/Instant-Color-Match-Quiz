import React from 'react';
import { Users, User, Utensils } from 'lucide-react';

interface Props {
  onStart: (mode: 'SOLO' | 'MULTI') => void;
}

export const Home: React.FC<Props> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6 relative overflow-hidden">
      
      {/* 背景装飾 */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* ロゴ部分 */}
      <div className="mb-12 text-center animate-in fade-in zoom-in duration-500 z-10">
        <div className="flex justify-center mb-4 text-orange-500">
          <Utensils size={64} />
        </div>
        <h1 className="text-6xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 tracking-tighter leading-tight">
          GOURMET<br/>BATTLE
        </h1>
        <p className="text-slate-400 font-bold tracking-widest text-sm">今夜の店を、実力で勝ち取れ。</p>
      </div>

      {/* ボタンエリア */}
      <div className="flex flex-col gap-5 w-full max-w-xs animate-in slide-in-from-bottom-10 duration-700 delay-150 z-10">
        
        {/* 1. みんなで対戦ボタン */}
        <div className="relative group">
           {/* animate-bounce を復活させました */}
           <span className="absolute -top-3 right-2 bg-yellow-400 text-slate-900 text-[10px] px-2 py-0.5 rounded-full font-black shadow-sm z-20 border border-slate-900 animate-bounce">
            RECOMMENDED
          </span>
          <button 
            onClick={() => onStart('MULTI')}
            className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white p-5 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-900/50 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <Users className="group-hover:scale-110 transition-transform" /> 
            みんなで対戦
          </button>
        </div>

        {/* 2. ひとりで練習ボタン（準備中） */}
        <div className="relative">
          <button 
            disabled 
            className="w-full bg-slate-800 text-slate-500 p-5 rounded-2xl font-bold text-lg border border-slate-700 cursor-not-allowed flex items-center justify-center gap-3"
          >
            <User /> ひとりで練習
          </button>
          
          {/* 準備中バッジ */}
          <span className="absolute -top-2 -right-2 bg-slate-700 text-slate-300 text-xs font-bold px-2 py-1 rounded-full shadow-md transform rotate-12 border border-slate-600">
            準備中
          </span>
        </div>

      </div>
      
      <p className="mt-16 text-slate-600 text-xs font-mono z-10">v2.0.0 - Powered by Hotpepper Gourmet</p>
    </div>
  );
};