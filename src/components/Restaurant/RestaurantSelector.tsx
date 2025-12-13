import React, { useState } from 'react';
import { Search, MapPin, Store, Utensils } from 'lucide-react';
import { SkipToGameButton } from '../NavigationButtons'; // 新しいボタン

export interface Shop {
  id: string;
  name: string;
  url: string;
  photoUrl: string;
  genre: string;
  address: string;
  lat?: number;
  lng?: number;
}

// ジャンルリスト
const GENRES = [
  { code: 'G001', name: '居酒屋', icon: '🍺' },
  { code: 'G008', name: '焼肉', icon: '🥩' },
  { code: 'G004', name: '和食', icon: '🍣' },
  { code: 'G013', name: 'ラーメン', icon: '🍜' },
  { code: 'G006', name: 'イタリアン', icon: '🍝' },
  { code: 'G007', name: '中華', icon: '🥟' },
  { code: 'G014', name: 'カフェ', icon: '🍰' },
];

interface Props {
  onConfirm: (shop: Shop) => void;
  onSkip: () => void; // 追加: スキップ機能を受け取る
}

export const RestaurantSelector: React.FC<Props> = ({ onConfirm, onSkip }) => {
  const [location, setLocation] = useState('');
  const [keyword, setKeyword] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (genreCode?: string) => {
    if (!location && !keyword && !genreCode && !selectedGenre) {
      alert("場所かキーワードを入力してください");
      return;
    }

    setLoading(true);
    setSearched(true);
    setShops([]); 

    try {
      const searchTerms = [location, keyword].filter(Boolean).join(' ');
      const queryParams = new URLSearchParams();
      queryParams.set('count', '30'); 
      if (searchTerms) queryParams.set('keyword', searchTerms);
      
      const genre = genreCode || selectedGenre;
      if (genre) queryParams.set('genre', genre);

      const res = await fetch(`/api/shops?${queryParams.toString()}`);
      const data = await res.json();
      let results: Shop[] = data.shops || [];

      if (location && results.length > 0) {
        results = results.filter(shop => {
           return shop.address ? shop.address.indexOf(location) !== -1 : true;
        });
      }
      setShops(results);
    } catch (error) {
      console.error(error);
      alert('検索に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleGenreClick = (code: string) => {
    const newGenre = selectedGenre === code ? null : code;
    setSelectedGenre(newGenre);
    handleSearch(newGenre || undefined);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <div className="bg-white p-4 shadow-sm space-y-4">
        <h2 className="font-bold text-slate-700 flex items-center gap-2">
          <Utensils className="text-orange-500" /> お店を決める
        </h2>

        <div className="flex flex-col gap-3">
          <div className="relative">
            <MapPin className="absolute left-3 top-3 text-slate-400" size={20} />
            <input 
              type="text" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="場所 (例: 梅田, 新宿)"
              className="w-full pl-10 p-3 bg-slate-100 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="relative">
            <Store className="absolute left-3 top-3 text-slate-400" size={20} />
            <input 
              type="text" 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="店名・キーワード (例: 焼肉, 個室)"
              className="w-full pl-10 p-3 bg-slate-100 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto whitespace-nowrap scrollbar-hide -mx-4 px-4">
          <div className="flex gap-2 pb-2">
            {GENRES.map((g) => (
              <button
                key={g.code}
                onClick={() => handleGenreClick(g.code)}
                className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors
                  ${selectedGenre === g.code 
                    ? 'bg-orange-500 text-white border-orange-600' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
              >
                {g.icon} {g.name}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={() => handleSearch()}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-md hover:bg-indigo-700 active:scale-95 transition-transform flex justify-center items-center gap-2"
        >
          {loading ? (
             <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
          ) : (
             <><Search size={20} /> 検索する</>
          )}
        </button>
        
        <SkipToGameButton onSkip={onSkip} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {shops.map((shop) => (
          <div key={shop.id} className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex gap-4">
            <img src={shop.photoUrl} alt={shop.name} className="w-24 h-24 object-cover rounded-lg bg-slate-200" />
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <p className="text-xs text-orange-500 font-bold mb-1">{shop.genre}</p>
                <h3 className="font-bold text-slate-800 leading-tight mb-1">{shop.name}</h3>
                <p className="text-xs text-slate-400 line-clamp-1">{shop.address}</p>
              </div>
              <button 
                onClick={() => onConfirm(shop)}
                className="mt-2 w-full bg-slate-800 text-white py-2 rounded-lg text-sm font-bold hover:bg-slate-700"
              >
                このお店にする
              </button>
            </div>
          </div>
        ))}
        {!loading && searched && shops.length === 0 && (
          <div className="text-center text-slate-400 mt-10">
            <p>お店が見つかりませんでした。</p>
          </div>
        )}
        {!searched && (
          <div className="text-center text-slate-300 mt-10">
            <Search size={48} className="mx-auto mb-2 opacity-20" />
            <p>行きたい場所と食べたいものを<br/>入力してください</p>
          </div>
        )}
      </div>
    </div>
  );
};