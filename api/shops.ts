import type { IncomingMessage, ServerResponse } from 'http'; 
import fetch from 'node-fetch'; 

// ... (ShopResultなどの型定義は同じ)
interface ShopResult {
  results: {
    shop: any[]; 
  };
}

export default async (request: IncomingMessage, response: ServerResponse) => {
  const req = request as any;
  const res = response as any;
  
  const apiKey = process.env.HOTPEPPER_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  const url = new URL(req.url || '', `http://${req.headers.host}`);
  
  // パラメータ取得
  const keyword = url.searchParams.get('keyword');
  const lat = url.searchParams.get('lat');
  const lng = url.searchParams.get('lng');
  const genre = url.searchParams.get('genre'); // ★これが必要です！
  const range = url.searchParams.get('range') || '3'; 
  const count = url.searchParams.get('count') || '20';

  // 条件チェック
  if (!keyword && !genre && (!lat || !lng)) {
    return res.status(400).json({ error: 'Search condition is required' });
  }

  const params = new URLSearchParams({
    key: apiKey,
    count: count,
    format: 'json', 
  });

  if (keyword) params.append('keyword', keyword);
  if (genre) params.append('genre', genre); // ★APIに渡す
  if (lat && lng) {
    params.append('lat', lat);
    params.append('lng', lng);
    params.append('range', range);
  } else {
     // 場所指定がない場合のデフォルト（必要なら）
  }

  const HOTPEPPER_API_URL = 'http://webservice.recruit.co.jp/hotpepper/gourmet/v1/';
  const fullUrl = `${HOTPEPPER_API_URL}?${params.toString()}`;
  
  // ... (以下、fetch処理は以前と同じ)
  try {
    const apiResponse = await fetch(fullUrl);
    // ... エラーハンドリング ...
    const data: ShopResult = await apiResponse.json() as ShopResult; 
    
    // ... データ変換処理 ...
    const shops = data.results?.shop?.map((shop: any) => ({
      id: shop.id,
      name: shop.name,
      url: shop.urls.pc,
      photoUrl: shop.photo.pc.l,
      genre: shop.genre.name,
      address: shop.address,
      lat: shop.lat,
      lng: shop.lng
    })) || [];

    return res.status(200).json({ shops });
  } catch (error) {
     return res.status(500).json({ error: 'Internal server error' });
  }
};