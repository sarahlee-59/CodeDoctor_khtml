"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Store, Phone, Star } from "lucide-react"

interface StoreInfo {
  id: string
  place_name: string
  address_name: string
  phone: string
  x: string // 경도
  y: string // 위도
  category_group_name: string
  rating?: number
  review_count?: number
}

interface ProductStoreMapProps {
  selectedProduct: string
  onStoreSelect?: (store: StoreInfo) => void
}

declare global {
  interface Window {
    kakao: any
  }
}

export function ProductStoreMap({ selectedProduct, onStoreSelect }: ProductStoreMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [stores, setStores] = useState<StoreInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)

  // 카카오맵 초기화
  useEffect(() => {
    if (!mapRef.current) return

    // 이미 로드된 스크립트가 있는지 확인
    if (document.querySelector('script[src*="dapi.kakao.com"]')) {
      if (window.kakao?.maps?.services?.Places) {
        initializeMap()
      } else {
        // 스크립트는 있지만 services가 로드되지 않은 경우
        window.kakao?.maps?.load(() => {
          setTimeout(initializeMap, 100) // 약간의 지연 후 재시도
        })
      }
      return
    }

    const script = document.createElement("script")
    const apiKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY || '164e2060bb06268114bcf01942061e6d'
    console.log('카카오맵 API 키:', apiKey) // API 키 확인용 로그
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false&libraries=services`
    script.async = true

    script.onload = () => {
      if (window.kakao) {
        window.kakao.maps.load(() => {
          setTimeout(initializeMap, 100) // services 라이브러리 로딩을 위한 지연
        })
      }
    }

    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  const initializeMap = () => {
    if (!mapRef.current) return

    // services 라이브러리가 제대로 로드되었는지 확인
    if (!window.kakao?.maps?.services?.Places) {
      console.error('카카오맵 services 라이브러리를 로드할 수 없습니다.')
      return
    }

    const center = new window.kakao.maps.LatLng(37.5665, 126.9780) // 서울시청
    
    const mapInstance = new window.kakao.maps.Map(mapRef.current, {
      center,
      level: 7,
      mapTypeId: window.kakao.maps.MapTypeId.ROADMAP
    })

    setMap(mapInstance)
    setMapLoaded(true)
  }

  // 상품 선택 시 가게 검색
  useEffect(() => {
    if (!mapLoaded || !selectedProduct) return
    
    searchStores(selectedProduct)
  }, [selectedProduct, mapLoaded])

  const searchStores = async (product: string) => {
    if (!map || !product) return

    // services 라이브러리 확인
    if (!window.kakao?.maps?.services?.Places) {
      console.error('카카오맵 Places 서비스를 사용할 수 없습니다.')
      setLoading(false)
      return
    }

    setLoading(true)
    
    try {
      // 기존 마커 제거
      const existingMarkers = document.querySelectorAll('.store-marker')
      existingMarkers.forEach(marker => marker.remove())

      // 장소 검색 객체 생성
      const ps = new window.kakao.maps.services.Places()
      
      // 검색 키워드 설정 (상품명 + 관련 키워드)
      const searchKeywords = getSearchKeywords(product)
      const allStores: StoreInfo[] = []

      // 여러 키워드로 검색하여 결과 통합
      for (const keyword of searchKeywords) {
        await new Promise<void>((resolve) => {
          ps.keywordSearch(keyword, (data: any, status: any) => {
            if (status === window.kakao.maps.services.Status.OK) {
              // 중복 제거하면서 결과 추가
              data.forEach((place: any) => {
                const existingIndex = allStores.findIndex(store => store.id === place.id)
                if (existingIndex === -1) {
                  allStores.push({
                    id: place.id,
                    place_name: place.place_name,
                    address_name: place.address_name,
                    phone: place.phone || '',
                    x: place.x,
                    y: place.y,
                    category_group_name: place.category_group_name || '',
                    rating: Math.random() * 2 + 3, // 임시 평점 (실제로는 API에서 받아와야 함)
                    review_count: Math.floor(Math.random() * 100) + 10 // 임시 리뷰 수
                  })
                }
              })
            }
            resolve()
          })
        })
      }

      setStores(allStores)
      displayStores(allStores)
      
    } catch (error) {
      console.error('가게 검색 중 오류 발생:', error)
      // 에러 발생 시 사용자에게 알림
      setStores([])
    } finally {
      setLoading(false)
    }
  }

  const getSearchKeywords = (product: string) => {
    const keywordMap: { [key: string]: string[] } = {
      '아오리 사과': ['아오리 사과', '사과', '과일', '과일가게', '농산물'],
      '배': ['배', '과일', '과일가게', '농산물'],
      '마늘': ['마늘', '채소', '농산물', '야채'],
      '양파': ['양파', '채소', '농산물', '야채'],
      '감자': ['감자', '채소', '농산물', '야채'],
      '당근': ['당근', '채소', '농산물', '야채'],
      '상추': ['상추', '채소', '농산물', '야채'],
      '배추': ['배추', '채소', '농산물', '야채'],
      '무': ['무', '채소', '농산물', '야채'],
      '고구마': ['고구마', '채소', '농산물', '야채']
    }

    return keywordMap[product] || [product, '농산물', '과일가게', '채소가게']
  }

  const displayStores = (stores: StoreInfo[]) => {
    if (!map || !stores.length) return

    const bounds = new window.kakao.maps.LatLngBounds()
    const infowindow = new window.kakao.maps.InfoWindow({ zIndex: 1 })

    stores.forEach((store, index) => {
      const position = new window.kakao.maps.LatLng(parseFloat(store.y), parseFloat(store.x))
      
      // 마커 생성
      const marker = new window.kakao.maps.Marker({
        position,
        map: map
      })

      // 마커에 클래스 추가 (나중에 제거하기 위해)
      marker.getElement().classList.add('store-marker')

      // 마커 클릭 이벤트
      window.kakao.maps.event.addListener(marker, 'click', () => {
        const content = `
          <div style="padding: 12px; min-width: 250px; font-family: 'Pretendard', sans-serif;">
            <div style="font-weight: 600; font-size: 16px; color: #1f2937; margin-bottom: 8px;">
              ${store.place_name}
            </div>
            <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
                <span style="color: #f59e0b;">★</span>
                <span>${store.rating?.toFixed(1)} (${store.review_count}개 리뷰)</span>
              </div>
              <div style="margin-bottom: 4px;">
                <strong>주소:</strong> ${store.address_name}
              </div>
              ${store.phone ? `<div><strong>전화:</strong> ${store.phone}</div>` : ''}
            </div>
            <div style="margin-top: 8px;">
              <span style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-size: 11px;">
                ${store.category_group_name || '농산물'}
              </span>
            </div>
          </div>
        `

        infowindow.setContent(content)
        infowindow.open(map, marker)
        
        if (onStoreSelect) {
          onStoreSelect(store)
        }
      })

      bounds.extend(position)
    })

    // 검색된 가게들이 모두 보이도록 지도 범위 조정
    map.setBounds(bounds)
  }

  if (!selectedProduct) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            상품별 가게 위치
          </CardTitle>
          <CardDescription>
            상품을 선택하면 해당 상품을 파는 가게를 지도에서 찾아드립니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded-xl flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Store className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">상품을 선택해주세요</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 카카오맵 서비스 로드 실패 시 표시할 메시지
  if (!mapLoaded && !window.kakao?.maps?.services?.Places) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {selectedProduct} 판매 가게
          </CardTitle>
          <CardDescription>
            카카오맵 서비스를 불러오는 중입니다...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded-xl flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm">카카오맵 로딩 중...</p>
              <p className="text-xs mt-1">잠시만 기다려주세요</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          {selectedProduct} 판매 가게
        </CardTitle>
        <CardDescription>
          {selectedProduct}을(를) 파는 가게 {stores.length}곳을 찾았습니다
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 검색 결과 요약 */}
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="px-3 py-1">
              검색 결과: {stores.length}곳
            </Badge>
            {loading && (
              <Badge variant="outline" className="px-3 py-1">
                검색 중...
              </Badge>
            )}
          </div>

          {/* 지도 */}
          <div 
            ref={mapRef} 
            className="w-full h-96 rounded-lg overflow-hidden border border-border"
            style={{ minHeight: '400px' }}
          />

          {/* 가게 목록 */}
          {stores.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">찾은 가게 목록</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {stores.map((store) => (
                  <div
                    key={store.id}
                    className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => onStoreSelect?.(store)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium text-sm line-clamp-1">{store.place_name}</h5>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span>{store.rating?.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {store.address_name}
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline" className="text-xs">
                        {store.category_group_name || '농산물'}
                      </Badge>
                      {store.phone && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          <span>{store.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
