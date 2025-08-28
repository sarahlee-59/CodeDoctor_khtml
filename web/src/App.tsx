import { useEffect, useState, useRef } from "react";

/** Kakao 타입 전역 선언 */
declare global {
  interface Window {
    kakao: any;
  }
}

/** API Base URL (예: http://localhost:3000) */
const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

/** 타입들 */
type LatLng = { lat: number; lng: number };
type Store = {
  id: number;
  name: string;
  category_std: "카페" | "마트" | "과일가게" | "디저트" | string;
  lat: number;
  lng: number;
};

/** 아주 심플한 fetch 래퍼 */
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

/** 지도 컴포넌트 (동일 파일 내부에 정의) */
function MapView({
  start,
  stops,
  path,
}: {
  start?: LatLng;
  stops?: Store[];
  path?: LatLng[];
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const { kakao } = window;
    if (!kakao?.maps) return;

    const center = start
      ? new kakao.maps.LatLng(start.lat, start.lng)
      : new kakao.maps.LatLng(37.58, 127.04);

    const map = new kakao.maps.Map(ref.current, { center, level: 4 });

    // 시작점 마커
    if (start) {
      const pos = new kakao.maps.LatLng(start.lat, start.lng);
      const m = new kakao.maps.Marker({ position: pos });
      m.setMap(map);
      new kakao.maps.InfoWindow({ content: `<div style="padding:2px">START</div>` }).open(map, m);
    }

    // 정거장 마커
    (stops ?? []).forEach((s, i) => {
      const pos = new kakao.maps.LatLng(s.lat, s.lng);
      const m = new kakao.maps.Marker({ position: pos });
      m.setMap(map);
      new kakao.maps.InfoWindow({
        content: `<div style="padding:2px">${i + 1}. ${s.name}</div>`,
      }).open(map, m);
    });

    // 경로 선
    if (path?.length) {
      const poly = new kakao.maps.Polyline({
        path: path.map((p) => new kakao.maps.LatLng(p.lat, p.lng)),
        strokeWeight: 4,
      });
      poly.setMap(map);

      const bounds = new kakao.maps.LatLngBounds();
      path.forEach((p) => bounds.extend(new kakao.maps.LatLng(p.lat, p.lng)));
      map.setBounds(bounds);
    }
  }, [start, stops, path]);

  return <div ref={ref} style={{ height: 420, border: "1px solid #eee", borderRadius: 8 }} />;
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

  // 현재 위치
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (p) => setPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setPos({ lat: 37.58, lng: 127.04 }) // 실패 시 기본값(청량리 근처)
    );
  }, []);

  // 근처 검색
  async function fetchNearby() {
    if (!pos) return;
    setLoading(true);
    setMsg("");
    try {
      const data = await getJSON<{ items: Store[] }>("/stores/search", {
        lat: pos.lat,
        lng: pos.lng,
        category,
        k: 10,
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
    <div style={{ padding: 16, maxWidth: 960, margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 22, marginBottom: 12 }}>동대문 전통시장 데모</h1>

      <section
        style={{
          display: "grid",
          gap: 8,
          gridTemplateColumns: "1fr auto auto",
          alignItems: "center",
        }}
      >
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ padding: 8 }}
        >
          <option>카페</option>
          <option>마트</option>
          <option>과일가게</option>
          <option>디저트</option>
        </select>
        <button onClick={fetchNearby} disabled={!pos || loading} style={{ padding: "8px 12px", border: "1px solid #ddd" }}>
          근처 검색
        </button>
        <button onClick={makePlan} disabled={!pos || loading} style={{ padding: "8px 12px", border: "1px solid #ddd" }}>
          경로 생성
        </button>
      </section>

      {msg && (
        <div style={{ marginTop: 8, color: "#c00" }}>
          {msg}
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <MapView
          start={pos ?? undefined}
          stops={plan ? plan.stops : nearby}
          path={plan?.path}
        />
      </div>

      <section style={{ marginTop: 12 }}>
        <h2 style={{ fontSize: 18, margin: "8px 0" }}>목록</h2>
        <ul>
          {list.slice(0, 10).map((s, i) => (
            <li key={s.id}>
              {(plan ? `${i + 1}. ` : "")}
              {s.name} <small>({s.category_std})</small>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}