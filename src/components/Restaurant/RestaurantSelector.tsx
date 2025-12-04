import React, { useState } from 'react';
import { Search, MapPin, Navigation, Store } from 'lucide-react';
import type { Shop } from '../../types';

interface Props {
  onConfirm: (shop: Shop) => void;
}

export const RestaurantSelector: React.FC<Props> = ({ onConfirm }) => {
  const [keyword, setKeyword] = useState('');
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false); // 検索したかどうか

  // 現在地取得して検索
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("お使いのブラウザでは位置情報が使えません");
      return;
    }
    setLoading(true);
    setSearched(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        searchShops(undefined, latitude, longitude);
      },
      (err) => {
        console.error(err);
        alert("位置情報の取得に失敗しました");
        setLoading(false);
      }
    );
  };

  // 検索実行
  const searchShops = async (searchKeyword?: string, lat?: number, lng?: number) => {
    setLoading(true);
    setSearched(true);
    try {
      // 検索範囲は広め(range=5: 3000m)に設定
      let query = `/api/shops?count=20&range=5`;
      
      if (searchKeyword) {
        query += `&keyword=${encodeURIComponent(searchKeyword)}`;
      }
      if (lat && lng) {
        query += `&lat=${lat}&lng=${lng}`;
      }

      const res = await fetch(query);
      if (!res.ok) throw new Error('API Error');
      
      const data = await res.json();
      if (data.shops) {
        setShops(data.shops);
      } else {
        setShops([]);
      }
    } catch (error) {
      console.error(error);
      alert('検索に失敗しました。ローカル環境の場合は "vercel dev" コマンドが必要です。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* ヘッダーエリア */}
      <div className="bg-white shadow-sm p-4 z-10">
        <div className="max-w-4xl mx-auto w-full space-y-3">
          <h2 className="font-bold text-slate-700 flex items-center gap-2 text-lg">
            <Store className="text-orange-500" /> 行きたいお店を決める
          </h2>
          
          <div className="flex gap-2">
            <input 
              type="text" 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="場所・店名 (例: 梅田 焼肉)"
              className="flex-1 p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-indigo-500 transition-all outline-none"
              onKeyDown={(e) => e.key === 'Enter' && searchShops(keyword)}
            />
            <button 
              onClick={() => searchShops(keyword)}
              className="bg-indigo-600 text-white p-3 rounded-xl font-bold shadow-sm hover:bg-indigo-700 active:scale-95 transition-all"
            >
              <Search />
            </button>
          </div>
          
          <button 
            onClick={handleUseCurrentLocation}
            className="text-indigo-600 text-sm font-bold flex items-center gap-1 hover:underline px-1"
          >
            <Navigation size={14} /> 現在地周辺のお店を探す
          </button>
        </div>
      </div>

      {/* コンテンツエリア */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          
          {loading && (
            <div className="text-center py-20 text-slate-400 font-bold animate-pulse">
              お店を探しています...
            </div>
          )}

          {!loading && searched && shops.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              <p>お店が見つかりませんでした。</p>
              <p className="text-sm mt-2">条件を変えて検索してみてください。</p>
            </div>
          )}

          {/* 検索結果一覧 (グリッド表示) */}
          {/* モバイル: 2列 (grid-cols-2) / PC: 4列 (md:grid-cols-4) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-20">
            {shops.map((shop) => (
              <div 
                key={shop.id} 
                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all flex flex-col h-full"
              >
                {/* 写真 */}
                <div className="aspect-video w-full bg-slate-100 relative">
                  <img 
                    src={shop.photoUrl} 
                    alt={shop.name} 
                    className="w-full h-full object-cover"
                    loading="lazy" 
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <span className="text-white text-xs font-bold bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
                      {shop.genre}
                    </span>
                  </div>
                </div>

                {/* 情報 */}
                <div className="p-3 flex flex-col flex-1">
                  <h3 className="font-bold text-slate-800 text-sm line-clamp-2 mb-1 leading-tight">
                    {shop.name}
                  </h3>
                  <p className="text-xs text-slate-400 mb-3 line-clamp-1">
                    <MapPin size={10} className="inline mr-0.5" />
                    {shop.address}
                  </p>
                  
                  <div className="mt-auto">
                    <button 
                      onClick={() => onConfirm(shop)}
                      className="w-full bg-orange-50 text-orange-600 border border-orange-200 py-2 rounded-lg text-sm font-bold hover:bg-orange-500 hover:text-white transition-colors"
                    >
                      この店にする
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};