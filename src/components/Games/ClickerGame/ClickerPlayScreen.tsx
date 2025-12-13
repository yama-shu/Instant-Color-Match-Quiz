import React from 'react';
import { Dumbbell } from 'lucide-react';

interface Props {
  clicks: number;
  timeLeft: number;
  onClick: () => void;
}

export const ClickerPlayScreen: React.FC<Props> = ({ clicks, timeLeft, onClick }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full gap-6 animate-in fade-in duration-500 relative z-10">
      
      {/* 変更: タイマーを一番上に大きく表示 */}
      <div className="flex flex-col items-center">
        <span className="text-orange-600 font-black text-6xl drop-shadow-sm tabular-nums">
          {timeLeft.toFixed(1)}
        </span>
        <span className="text-orange-400 font-bold text-sm">SECONDS LEFT</span>
      </div>

      {/* 連打ボタン */}
      <button
        onClick={onClick}
        className="
          relative group
          w-56 h-56 rounded-full 
          bg-gradient-to-br from-yellow-400 to-orange-500 
          shadow-[0_12px_0_rgb(194,65,12)]
          active:shadow-[0_4px_0_rgb(194,65,12)]
          active:translate-y-2
          transition-all duration-75
          flex flex-col items-center justify-center
          border-4 border-white
        "
      >
        <Dumbbell className="text-white w-20 h-20 mb-2 group-active:scale-110 transition-transform" />
        <span className="text-white font-black text-2xl tracking-wider">PUSH!!</span>
      </button>

      {/* 回数表示 */}
      <div className="flex flex-col items-center bg-white/80 px-8 py-3 rounded-2xl shadow-sm backdrop-blur-sm">
        <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">Your Score</span>
        <span className="text-5xl font-black text-slate-800 tabular-nums">
          {clicks}
        </span>
      </div>
    </div>
  );
};