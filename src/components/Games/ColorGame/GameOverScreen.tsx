import React from 'react';
import { RotateCcw, Home, Trophy } from 'lucide-react';

interface Props {
  score: number;
  highScore: number;
  onRestart: () => void;
  onHome: () => void;
  // 追加: 文字を変えられるようにする（? は省略可能という意味）
  title?: string;
  subtitle?: string;
}

export const GameOverScreen: React.FC<Props> = ({ 
  score, 
  highScore, 
  onRestart, 
  onHome,
  // デフォルト値を設定（指定がない場合はこれらが表示されます）
  title = "GAME OVER",
  subtitle = "集中力が途切れました..."
}) => {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm text-center animate-in zoom-in duration-300">
      
      {/* アイコン部分 */}
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-500">
           <span className="text-3xl font-black">!</span>
        </div>
      </div>
      
      {/* タイトル（変更可能） */}
      <h2 className="text-3xl font-black text-slate-800 mb-2">
        {title}
      </h2>
      
      {/* サブタイトル（空文字の場合は表示しない） */}
      {subtitle && (
        <p className="text-slate-400 font-bold mb-6">
          {subtitle}
        </p>
      )}

      {/* スコア表示 */}
      <div className="bg-slate-50 p-4 rounded-2xl mb-6">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Final Score</p>
        <p className="text-5xl font-black text-indigo-600 tabular-nums">{score}</p>
      </div>

      {/* ハイスコア更新演出（ハイスコアが0より大きく、かつ今回のスコアがそれ以上の時） */}
      {highScore > 0 && score >= highScore && (
        <div className="bg-yellow-100 text-yellow-700 py-2 px-4 rounded-xl font-bold mb-6 flex items-center justify-center gap-2 animate-bounce">
          <Trophy size={16} /> New High Score! 🎉
        </div>
      )}

      {/* ボタン */}
      <div className="space-y-3">
        <button 
          onClick={onRestart}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-md hover:bg-indigo-700 active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <RotateCcw size={20} /> もう一度挑戦
        </button>
        <button 
          onClick={onHome}
          className="w-full py-3 bg-white text-slate-500 border-2 border-slate-100 rounded-xl font-bold hover:bg-slate-50 active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <Home size={20} /> トップに戻る
        </button>
      </div>
    </div>
  );
};