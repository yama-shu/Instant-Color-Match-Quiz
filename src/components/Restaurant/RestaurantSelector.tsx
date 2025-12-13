import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Search, Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { Shop } from '../ColorGame/types';

// Leafletのマーカーアイコン設定（表示されないバグ対策）
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// ホットペッパーグルメの全ジャンル定義
const GENRES = [
  { code: 'G001', name: '居酒屋', icon: '🍺' },
  { code: 'G002', name: 'ダイニングバー・バル', icon: '🍸' },
  { code: 'G003', name: '創作料理', icon: '👨‍🍳' },
  { code: 'G004', name: '和食', icon: '🍣' },
  { code: 'G005', name: '洋食', icon: '🍛' },
  { code: 'G006', name: 'イタリアン・フレンチ', icon: '🍝' },
  { code: 'G007', name: '中華', icon: '🥟' },
  { code: 'G008', name: '焼肉・ホルモン', icon: '🥩' },
  { code: 'G017', name: '韓国料理', icon: '🥓' },
  { code: 'G009', name: 'アジア・エスニック料理', icon: '🌮' },
  { code: 'G010', name: '各国料理', icon: '🌍' },
  { code: 'G011', name: 'カラオケ・パーティ', icon: '🎤' },
  { code: 'G012', name: 'バー・カクテル', icon: '🥃' },
  { code: 'G013', name: 'ラーメン', icon: '🍜' },
  { code: 'G016', name: 'お好み焼き・もんじゃ', icon: '🥞' },
  { code: 'G014', name: 'カフェ・スイーツ', icon: '🍰' },
  { code: 'G015', name: 'その他グルメ', icon: '🍽️' },
];

interface Props {
  onConfirm: (shop: Shop) => void;
}

// 地図の中心を移動させるためのサブコンポーネント
const MapUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  map.setView(center, 15);
  return null;
};

export const RestaurantSelector: React.FC<Props> = ({ onConfirm }) => {
  const [keyword, setKeyword] = useState('');
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPos, setCurrentPos] = useState<[number, number]>([35.6812, 139.7671]); // デフォルト東京駅
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  // 汎用検索関数
  const searchShops = async (params: { genre?: string; keyword?: string; lat?: number; lng?: number }) => {
    setLoading(true);
    if (params.genre) setSelectedGenre(params.genre);

    try {
      const queryParams = new URLSearchParams();
      queryParams.set('count', '20');

      // パラメータの組み立て
      if (params.genre) queryParams.set('genre', params.genre);
      if (params.keyword) queryParams.set('keyword', params.keyword);
      
      // 場所指定（優先度: 引数 > 現在のstate）
      const lat = params.lat || currentPos[0];
      const lng = params.lng || currentPos[1];
      
      // キーワードもジャンルもない場合は、現在地周辺の全ジャンル検索とする
      if (!params.keyword && !params.genre) {
         // 特に指定がなければ「居酒屋(G001)」などをデフォルトにするか、パラメータなしで投げる
         // ここではAPI側のデフォルトに任せるため何もしない
      }

      // 常に緯度経度を送る（現在地周辺を探すため）
      queryParams.set('lat', lat.toString());
      queryParams.set('lng', lng.toString());
      queryParams.set('range', '3'); // 1000m範囲

      const res = await fetch(`/api/shops?${queryParams.toString()}`);
      const data = await res.json();
      
      if (data.shops) {
        setShops(data.shops);
        // 検索結果の最初のお店の位置に地図を移動
        if (data.shops.length > 0 && data.shops[0].lat) {
          setCurrentPos([data.shops[0].lat, data.shops[0].lng]);
        }
      }
    } catch (error) {
      console.error(error);
      alert('検索に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 現在地取得ボタン処理
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("お使いのブラウザでは位置情報が使えません");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentPos([latitude, longitude]);
        // 位置を更新して、現在選択中のジャンルがあればそれで再検索
        searchShops({ lat: latitude, lng: longitude, genre: selectedGenre || undefined });
      },
      (err) => {
        console.error(err);
        alert("位置情報の取得に失敗しました");
        setLoading(false);
      }
    );
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* 上部コントロールエリア */}
      <div className="bg-white shadow-md z-10 flex flex-col max-h-[40vh]">
        
        {/* 1. 現在地・場所設定 */}
        <div className="p-3 border-b border-slate-100 flex gap-2">
           <button 
            onClick={handleUseCurrentLocation}
            className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Navigation size={16} /> 現在地から探す
          </button>
          {/* ここに将来的に「エリア選択」ボタンなどを追加可能 */}
        </div>

        {/* 2. ジャンル一覧 (横スクロール) */}
        <div className="py-3 overflow-x-auto whitespace-nowrap px-2 scrollbar-hide">
          <div className="flex gap-2">
            {GENRES.map((g) => (
              <button
                key={g.code}
                onClick={() => searchShops({ genre: g.code })}
                className={`flex flex-col items-center justify-center min-w-[70px] h-[70px] p-1 rounded-xl border-2 transition-all
                  ${selectedGenre === g.code 
                    ? 'bg-orange-50 border-orange-500 text-orange-700 shadow-sm scale-105' 
                    : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                  }`}
              >
                <span className="text-2xl mb-1">{g.icon}</span>
                <span className="text-[10px] font-bold truncate w-full text-center">{g.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. 店名検索 (ピンポイントで探したい時用) */}
        <div className="p-3 bg-slate-50 border-t border-slate-100">
          <div className="flex gap-2">
            <input 
              type="text" 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="店名で検索 (例: 鳥貴族)"
              className="flex-1 p-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
            <button 
              onClick={() => searchShops({ keyword })}
              className="bg-slate-700 text-white p-2 rounded-lg"
            >
              <Search size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* 地図エリア */}
      <div className="flex-1 relative z-0">
        <MapContainer center={currentPos} zoom={15} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater center={currentPos} />

          {shops.map((shop: any) => (
             shop.lat && shop.lng && (
              <Marker key={shop.id} position={[shop.lat, shop.lng]}>
                <Popup>
                  <div className="text-center w-48">
                    <img src={shop.photoUrl} className="w-full h-24 object-cover rounded mb-2" alt={shop.name} />
                    <strong className="block text-sm mb-1">{shop.name}</strong>
                    <p className="text-xs text-slate-500 mb-2">{shop.genre}</p>
                    <button 
                      onClick={() => onConfirm(shop)}
                      className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold w-full shadow-md active:scale-95 transition-transform"
                    >
                      ここにする！
                    </button>
                  </div>
                </Popup>
              </Marker>
             )
          ))}
        </MapContainer>
        
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center z-[1000]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-2"></div>
            <p className="font-bold text-slate-700 text-sm">美味しいお店を探しています...</p>
          </div>
        )}
        
        {/* 検索結果ゼロの時のメッセージ */}
        {!loading && shops.length === 0 && (
           <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/90 px-4 py-2 rounded-full shadow-lg z-[500] text-xs font-bold text-slate-500">
             マップ上のエリアまたはジャンルを選択してください
           </div>
        )}
      </div>
    </div>
  );
};