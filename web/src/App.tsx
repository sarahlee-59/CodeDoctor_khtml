import { useEffect, useState } from "react";
import Map from "./Map";
import StoreCard from "./components/StoreCard";

/** Kakao 타입 전역 선언 */
declare global {
  interface Window {
    kakao: any;
  }
}

/** API Base URL */
const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

/** 타입들 */
type LatLng = { lat: number; lng: number };
type Store = {
  id: number;
  name: string;
  category_std: "카페" | "마트" | "과일가게" | "디저트" | string;
  lat: number;
  lng: number;
  hours_json?: any;
};

/** API 함수들 */
async function getJSON<T>(path: string, params?: Record<string, any>): Promise<T> {
  const url = new URL(path, API_BASE);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function postJSON<T>(path: string, body: any): Promise<T> {
  const res = await fetch(new URL(path, API_BASE).toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function App() {
  const [pos, setPos] = useState<LatLng | null>(null);
  const [category, setCategory] = useState<string>("카페");
  const [nearby, setNearby] = useState<Store[]>([]);
  const [plan, setPlan] = useState<{
    start: LatLng;
    stops: Store[];
    path: LatLng[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>("");

  // 현재 위치 가져오기
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (p) => setPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setPos({ lat: 37.58, lng: 127.04 }) // 실패 시 기본값(청량리 근처)
    );
  }, []);

  // 근처 상점 검색
  async function fetchNearby() {
    if (!pos) return;
    setLoading(true);
    setMsg("");
    try {
      const data = await getJSON<{ items: Store[] }>("/stores/search", {
        lat: pos.lat,
        lng: pos.lng,
        category,
      });
      setPlan(null);
      setNearby(data.items);
      if (!data.items?.length) setMsg("해당 카테고리의 결과가 없어요.");
    } catch (e: any) {
      setMsg(e.message || "검색 중 오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  }

  // 경로 생성
  async function makePlan() {
    if (!pos) return;
    setLoading(true);
    setMsg("");
    try {
      const waypoints = [
        { category: "카페" },
        { category: "마트" },
        { category: "과일가게" },
        { category: "디저트" },
      ];
      const data = await postJSON<{
        start: LatLng;
        stops: Store[];
        path: LatLng[];
      }>("/plan", { start: pos, waypoints });
      setPlan(data);
    } catch (e: any) {
      setMsg(e.message || "경로 생성 중 오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  }

  const list = plan?.stops ?? nearby;

  return (
    <div className="min-h-screen bg-neutral-bg">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-text">
                골라먹는 AI시장
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                동대문 전통시장 탐방 가이드
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="카페">카페</option>
                <option value="마트">마트</option>
                <option value="과일가게">과일가게</option>
                <option value="디저트">디저트</option>
              </select>
              
              <button 
                onClick={fetchNearby} 
                disabled={!pos || loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '검색중...' : '근처 검색'}
              </button>
              
              <button 
                onClick={makePlan} 
                disabled={!pos || loading}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '계획중...' : '경로 생성'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {msg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {msg}
          </div>
        )}

        {/* 지도 섹션 */}
        <section className="mb-8">
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="text-xl font-semibold text-neutral-text mb-4">
              {plan ? '추천 경로' : '주변 상점'}
            </h2>
            <Map
              start={pos ?? undefined}
              stops={plan ? plan.stops : nearby}
              path={plan?.path}
            />
          </div>
        </section>

        {/* 상점 리스트 섹션 */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-neutral-text">
              {plan ? '경로 상점' : '추천 상점'}
            </h2>
            {plan && (
              <span className="text-sm text-gray-600">
                총 {plan.stops.length}개 상점 방문
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.slice(0, 9).map((store, index) => (
              <StoreCard
                key={store.id}
                name={plan ? `${index + 1}. ${store.name}` : store.name}
                category={store.category_std}
                open_now={true}
                crowd_level={0.3 + Math.random() * 0.5} // 데모용 랜덤 값
                distance={plan ? undefined : Math.hypot(pos?.lat ? pos.lat - store.lat : 0, pos?.lng ? pos.lng - store.lng : 0)}
                onClick={() => {
                  // 상점 클릭 시 지도에서 해당 위치로 이동하는 로직
                  console.log('Selected store:', store);
                }}
              />
            ))}
          </div>
          
          {list.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <p className="text-lg">검색 결과가 없습니다</p>
              <p className="text-sm">다른 카테고리로 검색해보세요</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}