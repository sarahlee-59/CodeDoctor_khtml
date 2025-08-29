"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Store } from "lucide-react"

interface MarketZone {
  id: string
  centroid: [number, number]
  scoreZ: number // Z세대 (20대)
  score3040: number // 30-40대
  score5060: number // 50-60대
  shopCount: number // 점포 수
  category: string // 상권 카테고리
}

interface ProcessedZone extends MarketZone {
  currentFlow: number
  relativeIndex: number
}

interface KakaoMapProps {
  zones: ProcessedZone[]
  selectedAge: string
  selectedDay: string
  selectedTime: string
  onZoneClick?: (zone: ProcessedZone) => void
}

declare global {
  interface Window {
    kakao: any
  }
}

// Vite 환경변수 타입 선언
interface ImportMetaEnv {
  readonly VITE_KAKAO_JS_KEY: string
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

export function KakaoMap({ zones, selectedAge, selectedDay, selectedTime, onZoneClick }: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [markers, setMarkers] = useState<any[]>([])
  const [infoWindows, setInfoWindows] = useState<any[]>([])

  // 카카오맵 초기화
  useEffect(() => {
    if (!mapRef.current) return

    const script = document.createElement("script")
    const apiKey = (import.meta as any).env?.VITE_KAKAO_JS_KEY || '164e2060bb06268114bcf01942061e6d'
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`
    script.async = true

    script.onload = () => {
      if (window.kakao) {
        window.kakao.maps.load(() => {
          const center = new window.kakao.maps.LatLng(37.5665, 126.9780) // 서울시청
          
          const mapInstance = new window.kakao.maps.Map(mapRef.current, {
            center,
            level: 8,
            mapTypeId: window.kakao.maps.MapTypeId.ROADMAP
          })

          setMap(mapInstance)
        })
      }
    }

    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  // 마커와 인포윈도우 업데이트
  useEffect(() => {
    if (!map || !zones.length) return

    // 기존 마커와 인포윈도우 제거
    markers.forEach(marker => marker.setMap(null))
    infoWindows.forEach(infoWindow => infoWindow.close())

    const newMarkers: any[] = []
    const newInfoWindows: any[] = []

    zones.forEach((zone, index) => {
      if (!zone.centroid || zone.centroid.length !== 2) return

      const [lat, lng] = zone.centroid
      const position = new window.kakao.maps.LatLng(lat, lng)

      // 마커 생성
      const marker = new window.kakao.maps.Marker({
        position,
        map: map
      })

      // 마커 스타일 설정
      const markerColor = getMarkerColor(zone.currentFlow)
      const markerSize = getMarkerSize(zone.currentFlow)

      // 원형 마커 생성 (SVG 사용)
      const markerElement = document.createElement('div')
      markerElement.innerHTML = `
        <div style="
          width: ${markerSize}px;
          height: ${markerSize}px;
          background: ${markerColor};
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: ${Math.max(8, markerSize * 0.4)}px;
        ">
          ${index + 1}
        </div>
      `

      marker.setMap(map)
      newMarkers.push(marker)

      // 인포윈도우 생성
      const infoContent = `
        <div style="padding: 12px; min-width: 200px; font-family: 'Pretendard', sans-serif;">
          <div style="font-weight: 600; font-size: 14px; color: #1f2937; margin-bottom: 8px;">
            ${zone.id} 상권
          </div>
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 6px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>Z세대 (20대):</span>
              <span style="font-weight: 500;">${zone.scoreZ || 0}점</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>30-40대:</span>
              <span style="font-weight: 500;">${zone.score3040 || 0}점</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>50-60대:</span>
              <span style="font-weight: 500;">${zone.score5060 || 0}점</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span>점포 수:</span>
              <span style="font-weight: 500;">${zone.shopCount}개</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>현재 유동인구:</span>
              <span style="font-weight: 600; color: ${markerColor};">${Math.round(zone.currentFlow)}점</span>
            </div>
            <div style="margin-top: 8px;">
              <span style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 11px;">
                ${zone.category}
              </span>
            </div>
          </div>
        </div>
      `

      const infoWindow = new window.kakao.maps.InfoWindow({
        content: infoContent,
        removable: true
      })

      newInfoWindows.push(infoWindow)

      // 마커 클릭 이벤트
      window.kakao.maps.event.addListener(marker, 'click', () => {
        infoWindow.open(map, marker)
        if (onZoneClick) {
          onZoneClick(zone)
        }
      })
    })

    setMarkers(newMarkers)
    setInfoWindows(newInfoWindows)

    // 모든 마커가 보이도록 지도 범위 조정
    if (newMarkers.length > 0) {
      const bounds = new window.kakao.maps.LatLngBounds()
      newMarkers.forEach(marker => {
        bounds.extend(marker.getPosition())
      })
      map.setBounds(bounds)
    }
  }, [map, zones, selectedAge, selectedDay, selectedTime])

  const getMarkerColor = (flow: number) => {
    if (flow > 80) return "#ef4444" // 매우 높은 유동인구
    if (flow > 60) return "#f97316" // 높은 유동인구
    if (flow > 40) return "#eab308" // 보통 유동인구
    if (flow > 20) return "#22c55e" // 낮은 유동인구
    return "#3b82f6" // 매우 낮은 유동인구
  }

  const getMarkerSize = (flow: number) => {
    return Math.max(12, Math.min(30, (flow / 100) * 25 + 8))
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          세대별 유동인구 지도
        </CardTitle>
        <CardDescription>
          {selectedAge === "Z" ? "20대" : selectedAge === "3040" ? "30-40대" : "50-60대"} 
          {selectedDay === "weekday" ? "평일" : "주말"} 
          {selectedTime === "morning" ? "오전" : selectedTime === "afternoon" ? "오후" : "저녁"} 
          기준 상권별 유동인구 밀도
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 범례 */}
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span>매우 높음 (80점+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500"></div>
              <span>높음 (60-79점)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <span>보통 (40-59점)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span>낮음 (20-39점)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span>매우 낮음 (0-19점)</span>
            </div>
          </div>

          {/* 지도 */}
          <div 
            ref={mapRef} 
            className="w-full h-96 rounded-lg overflow-hidden border border-border"
            style={{ minHeight: '400px' }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
