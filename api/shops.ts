// Vercel固有の型ではなく、Node.jsの標準的なRequest/Responseの型を使用し、ローカルのエラーを回避
import type { IncomingMessage, ServerResponse } from 'http'; 
import fetch from 'node-fetch'; 

// --- 型定義 ---
interface ShopResult {
  results: {
    shop: any[]; 
  };
}

export default async (request: IncomingMessage, response: ServerResponse) => {
  // TypeScriptの厳格な型チェックを避けるため、any型にキャスト
  const req = request as any;
  const res = response as any;
  
  // 1. 環境変数からAPIキーを取得
  const apiKey = process.env.HOTPEPPER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  // 2. クエリパラメータ（検索条件）を取得 (Node.jsのURLオブジェクトを使用)
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const keyword = url.searchParams.get('keyword');
  const genre = url.searchParams.get('genre');
  const count = url.searchParams.get('count') || '10';

  if (!keyword) {
    return res.status(400).json({ error: 'Keyword is required' });
  }

  // 3. ホットペッパーAPIへのリクエストURLを構築
  const params = new URLSearchParams({
    key: apiKey,
    keyword: keyword,
    genre: genre || 'G001', 
    count: count,
    format: 'json', 
  });

  const HOTPEPPER_API_URL = 'http://webservice.recruit.co.jp/hotpepper/gourmet/v1/';
  const fullUrl = `${HOTPEPPER_API_URL}?${params.toString()}`;

  try {
    const apiResponse = await fetch(fullUrl);
    
    if (!apiResponse.ok) {
        return res.status(apiResponse.status).json({ error: 'Failed to fetch external API' });
    }
    
    // 取得したJSONデータを明示的にShopResult型として扱う
    const data: ShopResult = await apiResponse.json() as ShopResult; 
    
    if (!data.results || !data.results.shop) {
        return res.status(500).json({ error: 'Invalid response format from Hotpepper API' });
    }

    // 5. 必要な情報だけを抽出して整形
    const shops = data.results.shop.map((shop: any) => ({
      id: shop.id,
      name: shop.name,
      url: shop.urls.pc,
      photoUrl: shop.photo.pc.l,
      genre: shop.genre.name,
      address: shop.address,
    }));

    // 6. クライアントに結果を返す
    return res.status(200).json({ shops });

  } catch (error) {
    console.error('API execution error:', error);
    return res.status(500).json({ error: 'Internal server error during fetch' });
  }
};