import { useEffect, useRef } from "react";

declare global { 
  interface Window { 
    kakao: any 
  } 
}

type LatLng = { lat: number; lng: number };
type Store = { id: number; name: string; category_std: string; lat: number; lng: number };

export default function Map({ start, stops, path }: {
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

    const map = new kakao.maps.Map(ref.current, { 
      center, 
      level: 4,
      mapTypeId: kakao.maps.MapTypeId.ROADMAP
    });

    // 시작점 마커 (파란색)
    if (start) {
      const pos = new kakao.maps.LatLng(start.lat, start.lng);
      const marker = new kakao.maps.Marker({ 
        position: pos,
        map: map
      });
      
      // 시작점 인포윈도우
      const infoWindow = new kakao.maps.InfoWindow({
        content: `
          <div style="padding: 8px; text-align: center; font-weight: 600; color: #2563eb;">
            <div>📍 시작점</div>
            <div style="font-size: 12px; color: #6b7280;">현재 위치</div>
          </div>
        `
      });
      infoWindow.open(map, marker);
    }

    // 상점 마커들 (주황색)
    (stops ?? []).forEach((store, index) => {
      const pos = new kakao.maps.LatLng(store.lat, store.lng);
      const marker = new kakao.maps.Marker({ 
        position: pos,
        map: map
      });
      
      // 상점 인포윈도우
      const infoWindow = new kakao.maps.InfoWindow({
        content: `
          <div style="padding: 8px; min-width: 120px;">
            <div style="font-weight: 600; color: #dc2626; margin-bottom: 4px;">
              ${index + 1}. ${store.name}
            </div>
            <div style="font-size: 12px; color: #6b7280;">
              ${store.category_std}
            </div>
          </div>
        `
      });
      infoWindow.open(map, marker);
    });

    // 경로 선 (주황색, 두껍게)
    if (path?.length) {
      const polyline = new kakao.maps.Polyline({
        path: path.map(p => new kakao.maps.LatLng(p.lat, p.lng)),
        strokeWeight: 5,
        strokeColor: '#FF6B6B',
        strokeOpacity: 0.8,
        strokeStyle: 'solid'
      });
      polyline.setMap(map);

      // 경로가 모두 보이도록 지도 범위 조정
      const bounds = new kakao.maps.LatLngBounds();
      path.forEach(p => bounds.extend(new kakao.maps.LatLng(p.lat, p.lng)));
      map.setBounds(bounds);
    }
  }, [start, stops, path]);

  return (
    <div 
      ref={ref} 
      className="w-full h-96 rounded-xl overflow-hidden shadow-lg border-2 border-gray-100"
      style={{ minHeight: '400px' }}
    />
  );
}