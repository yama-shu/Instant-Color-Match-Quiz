import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import type { Shop } from '../../../types';

interface Props {
  onSelect: (shop: Shop) => void;
}

export const ShopSearch: React.FC<Props> = ({ onSelect }) => {
  const [keyword, setKeyword] = useState('');
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);

  const searchShops = async () => {
    if (!keyword) return;
    setLoading(true);
    try {
      // あなたが作ったAPIを呼び出す
      const res = await fetch(`/api/shops?keyword=${encodeURIComponent(keyword)}&count=5`);
      const data = await res.json();
      if (data.shops) {
        setShops(data.shops);
      }
    } catch (error) {
      console.error('Search failed', error);
      alert('検索に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 p-4 bg-white rounded-xl border-2 border-slate-200">
      <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
        <MapPin size={18} /> 勝ったら行きたいお店を選ぶ
      </h3>
      
      <div className="flex gap-2 mb-4">
        <input 
          type="text" 
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="例: 渋谷 焼肉"
          className="flex-1 p-2 border border-slate-300 rounded-lg text-sm"
        />
        <button 
          onClick={searchShops}
          disabled={loading}
          className="bg-indigo-600 text-white p-2 rounded-lg"
        >
          <Search size={18} />
        </button>
      </div>

      <div className="space-y-2">
        {shops.map((shop) => (
          <div key={shop.id} className="flex gap-3 p-2 border border-slate-100 rounded-lg hover:bg-slate-50">
            <img src={shop.photoUrl} alt={shop.name} className="w-16 h-16 object-cover rounded" />
            <div className="flex-1 text-left">
              <p className="font-bold text-sm line-clamp-1">{shop.name}</p>
              <p className="text-xs text-slate-500 mb-1">{shop.genre}</p>
              <button 
                onClick={() => onSelect(shop)}
                className="text-xs bg-orange-500 text-white px-2 py-1 rounded hover:bg-orange-600"
              >
                このお店にする！
              </button>
            </div>
          </div>
        ))}
        {shops.length === 0 && !loading && <p className="text-xs text-slate-400">キーワードで検索してください</p>}
      </div>
    </div>
  );
};