import React from 'react';

export const RuleDescription: React.FC = () => {
  return (
    <div className="bg-orange-50 p-4 rounded-xl text-left text-sm text-slate-600 mb-6 border-2 border-orange-100">
      <h3 className="font-bold text-orange-600 mb-2 flex items-center gap-2">
        🔥 連打バトルのルール
      </h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>制限時間は<strong>10秒間！</strong></li>
        <li>ひたすらボタンを<strong>連打</strong>しろ！</li>
        <li>相手より回数が多いほうが勝ち！</li>
        <li>勝つと<strong>自分の行きたいお店</strong>に決定！</li>
      </ul>
    </div>
  );
};