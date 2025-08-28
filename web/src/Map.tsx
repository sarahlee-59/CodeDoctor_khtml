import { useEffect, useRef } from "react";
declare global { interface Window { kakao:any } }

type LatLng = { lat:number; lng:number };
type Store = { id:number; name:string; category_std:string; lat:number; lng:number };

export default function Map({ start, stops, path }: {
  start?: LatLng; stops?: Store[]; path?: LatLng[];
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const { kakao } = window;
    const center = start
      ? new kakao.maps.LatLng(start.lat, start.lng)
      : new kakao.maps.LatLng(37.58, 127.04);

    const map = new kakao.maps.Map(ref.current, { center, level: 4 });

    // 시작점
    if (start) {
      const pos = new kakao.maps.LatLng(start.lat, start.lng);
      const m = new kakao.maps.Marker({ position: pos });
      m.setMap(map);
      new kakao.maps.InfoWindow({ content: `<div style="padding:2px">START</div>`}).open(map, m);
    }

    // 추천 정거장
    (stops ?? []).forEach((s, i) => {
      const pos = new kakao.maps.LatLng(s.lat, s.lng);
      const m = new kakao.maps.Marker({ position: pos });
      m.setMap(map);
      new kakao.maps.InfoWindow({
        content: `<div style="padding:2px">${i + 1}. ${s.name}</div>`
      }).open(map, m);
    });

    // 경로
    if (path?.length) {
      const poly = new kakao.maps.Polyline({
        path: path.map(p => new kakao.maps.LatLng(p.lat, p.lng)),
        strokeWeight: 4
      });
      poly.setMap(map);
      const bounds = new kakao.maps.LatLngBounds();
      path.forEach(p => bounds.extend(new kakao.maps.LatLng(p.lat, p.lng)));
      map.setBounds(bounds);
    }
  }, [start, stops, path]);

  return <div ref={ref} style={{ height: 420, border:'1px solid #eee', borderRadius:8 }} />;
}