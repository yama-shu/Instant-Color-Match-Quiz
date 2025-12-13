import React from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';

// 1. お店を選ばずに進むボタン
interface SkipProps {
  onSkip: () => void;
}

export const SkipToGameButton: React.FC<SkipProps> = ({ onSkip }) => {
  return (
    <button
      onClick={onSkip}
      className="mt-4 w-full py-3 bg-white text-slate-600 font-bold text-sm shadow-md border border-slate-100 rounded-xl hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center gap-2"
    >
      お店は後で決める <ArrowRight size={16} />
    </button>
  );
};

// 2. お店選択に戻るボタン
interface BackProps {
  onBack: () => void;
}

export const BackToRestaurantButton: React.FC<BackProps> = ({ onBack }) => {
  return (
    <button
      onClick={onBack}
      className="mb-4 text-slate-500 font-bold text-sm hover:text-slate-700 flex items-center gap-1 px-2 py-1 -ml-2 rounded-lg hover:bg-slate-100 transition-colors"
    >
      <ArrowLeft size={16} /> お店選択に戻る
    </button>
  );
};