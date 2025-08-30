"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { fetcher } from "@/lib/fetcher"
import { MapPin, Users, Award, TrendingUp, Store, ShoppingCart } from "lucide-react"
import { ProductStoreMap } from "./product-store-map"

interface QualityShop {
  id: string
  name: string
  category: string
  location: [number, number] // lat, lng for mini map
  qualityScore: number // 품질 점수 (1-100)
  crowdLevel: number // 혼잡도 (1-5, 낮을수록 좋음)
  priceAdvantage: number // 가격 우위 (1-100)
  currentAvailability: "여유" | "보통" | "붐빔"
  specialties: string[]
  benefits: string[]
  image: string
  description: string
  totalScore?: number // 계산된 종합 점수
}

interface RecommendationData {
  shops: QualityShop[]
  lastUpdated: string
}

interface UserPreferences {
  visitTime: string
  visitDate: string
  targetGroup: string
  basketCategories: string[]
  selectedProduct: string // 추가된 상품 선택 필드
}

export function RecommendationTab() {
  const [data, setData] = useState<RecommendationData | null>(null)
  const [recommendations, setRecommendations] = useState<QualityShop[]>([])
  const [preferences, setPreferences] = useState<UserPreferences>({
    visitTime: "오전",
    visitDate: "오늘",
    targetGroup: "혼자",
    basketCategories: [],
    selectedProduct: "", // 추가된 상품 선택 필드
  })
  const [loading, setLoading] = useState(true)
  const [showProductMap, setShowProductMap] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const recoData = await fetcher<RecommendationData>("/api/reco.json")
        setData(recoData)
      } catch (error) {
        console.error("Failed to load recommendation data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    if (!data?.shops) return

    const scoredShops = data.shops.map((shop) => {
      // 점수식: 품질→가중치+, 혼잡도→가중치-, 가격우위→가중치+
      const qualityWeight = 0.4
      const crowdWeight = 0.3 // 혼잡도는 낮을수록 좋으므로 역산
      const priceWeight = 0.3

      const crowdScore = (6 - shop.crowdLevel) * 20 // 1->100, 5->20으로 변환
      const totalScore = Math.round(
        shop.qualityScore * qualityWeight + crowdScore * crowdWeight + shop.priceAdvantage * priceWeight,
      )

      return {
        ...shop,
        totalScore,
      }
    })

    // 필터링 및 정렬
    let filtered = scoredShops

    // 장바구니 카테고리 필터
    if (preferences.basketCategories.length > 0) {
      filtered = filtered.filter((shop) => preferences.basketCategories.includes(shop.category))
    }

    // 시간대별 혼잡도 조정
    if (preferences.visitTime === "오후" || preferences.visitTime === "저녁") {
      filtered = filtered.filter((shop) => shop.currentAvailability !== "붐빔")
    }

    // 점수순 정렬 후 상위 3-5개만 선택
    filtered.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
    setRecommendations(filtered.slice(0, 5))
  }, [data, preferences])

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "여유":
        return "text-green-600 bg-green-50"
      case "보통":
        return "text-yellow-600 bg-yellow-50"
      case "붐빔":
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const handleProductSelect = (product: string) => {
    setPreferences({ ...preferences, selectedProduct: product })
    setShowProductMap(true)
  }

  const handleStoreSelect = (store: any) => {
    console.log('선택된 가게:', store)
    // 여기에 가게 선택 시 추가 로직을 구현할 수 있습니다
  }

  const popularProducts = [
    { name: '아오리 사과', image: '/apple_aori.jpg', category: '과일' },
    { name: '배', image: '/apple_fuji.jpg', category: '과일' },
    { name: '마늘', image: '/garlic.jpg', category: '채소' },
    { name: '양파', image: '/placeholder.jpg', category: '채소' },
    { name: '감자', image: '/potato.jpg', category: '채소' },
    { name: '당근', image: '/placeholder.jpg', category: '채소' },
    { name: '상추', image: '/placeholder.jpg', category: '채소' },
    { name: '배추', image: '/cabbage.jpg', category: '채소' },
    { name: '무', image: '/radish.jpg', category: '채소' },
    { name: '고구마', image: '/placeholder.jpg', category: '채소' }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>추천</CardTitle>
            <CardDescription>품질 보장 집 중 지금 여유로운 타이밍 + 가격 우위 종합 추천</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-muted rounded-xl flex items-center justify-center">
              <p className="text-muted-foreground">추천 데이터 로딩 중...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>방문 정보</CardTitle>
          <CardDescription>방문 계획에 맞는 품질 보장 집을 추천받아보세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">방문시간</label>
              <Select
                value={preferences.visitDate}
                onValueChange={(value) => setPreferences({ ...preferences, visitDate: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="오늘">오늘</SelectItem>
                  <SelectItem value="내일">내일</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">시간대</label>
              <Select
                value={preferences.visitTime}
                onValueChange={(value) => setPreferences({ ...preferences, visitTime: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="오전">오전</SelectItem>
                  <SelectItem value="오후">오후</SelectItem>
                  <SelectItem value="저녁">저녁</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">대상</label>
              <Select
                value={preferences.targetGroup}
                onValueChange={(value) => setPreferences({ ...preferences, targetGroup: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="혼자">혼자</SelectItem>
                  <SelectItem value="커플">커플</SelectItem>
                  <SelectItem value="3040가족">30-40대 가족</SelectItem>
                  <SelectItem value="5060">50-60대</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">바구니</label>
              <Select
                value={preferences.basketCategories[0] || "전체"}
                onValueChange={(value) =>
                  setPreferences({
                    ...preferences,
                    basketCategories: value === "전체" ? [] : [value],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="전체">전체</SelectItem>
                  <SelectItem value="채소">채소</SelectItem>
                  <SelectItem value="정육">정육</SelectItem>
                  <SelectItem value="반찬">반찬</SelectItem>
                  <SelectItem value="간식">간식</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 상품 선택 섹션 추가 */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            구매하고 싶은 상품 선택
          </CardTitle>
          <CardDescription>
            특정 상품을 선택하면 해당 상품을 파는 가게를 지도에서 찾아드립니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {popularProducts.map((product) => (
              <div
                key={product.name}
                className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  preferences.selectedProduct === product.name
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleProductSelect(product.name)}
              >
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 mx-auto rounded-lg overflow-hidden bg-muted">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {preferences.selectedProduct && (
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">
                  선택된 상품: <span className="text-primary">{preferences.selectedProduct}</span>
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreferences({ ...preferences, selectedProduct: "" })}
              >
                선택 해제
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 상품별 가게 지도 */}
      {showProductMap && preferences.selectedProduct && (
        <ProductStoreMap
          selectedProduct={preferences.selectedProduct}
          onStoreSelect={handleStoreSelect}
        />
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">품질 보장 집 추천</h2>
          <p className="text-muted-foreground">
            {preferences.visitDate} {preferences.visitTime} 방문 기준 상위 {recommendations.length}곳
          </p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          업데이트: {data?.lastUpdated || "2025-08-20"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {recommendations && recommendations.length > 0 ? recommendations.map((shop, index) => (
            <Card key={shop.id} className="rounded-2xl overflow-hidden hover:shadow-lg transition-all">
              <div className="flex">
                <div className="w-32 h-32 flex-shrink-0">
                  <img
                    src={shop.image || `/placeholder.svg?height=128&width=128&query=${shop.category} shop`}
                    alt={shop.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{shop.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{shop.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="bg-blue-600">
                        #{index + 1}
                      </Badge>
                      <Badge variant="secondary">{shop.totalScore}점</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Award className="w-3 h-3 text-blue-500" />
                      <span>품질 {shop.qualityScore}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-orange-500" />
                      <span className={getAvailabilityColor(shop.currentAvailability).split(" ")[0]}>
                        {shop.currentAvailability}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span>가격우위 {shop.priceAdvantage}</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">{shop.description}</p>

                  {shop.specialties && shop.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {shop.specialties.map((specialty, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {shop.benefits && shop.benefits.length > 0 && (
                    <div className="space-y-1">
                      {shop.benefits.map((benefit, idx) => (
                        <div key={idx} className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                          • {benefit}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )) : (
            <div className="col-span-2">
              <Card className="rounded-2xl">
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground mb-4">추천 데이터를 불러오는 중입니다...</p>
                  <p className="text-sm text-muted-foreground">잠시만 기다려주세요.</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">추천 위치</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded-xl flex items-center justify-center mb-4">
                <div className="text-center text-muted-foreground">
                  <MapPin className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">미니맵</p>
                  <p className="text-xs">동대문 전통시장</p>
                </div>
              </div>
              <div className="space-y-2">
                {recommendations && recommendations.length > 0 ? recommendations.slice(0, 3).map((shop, index) => (
                  <div
                    key={shop.id}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                  >
                    <Badge
                      variant="secondary"
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                    >
                      {index + 1}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{shop.name}</p>
                      <p className="text-xs text-muted-foreground">{shop.category}</p>
                    </div>
                    <Badge className={getAvailabilityColor(shop.currentAvailability)} variant="secondary">
                      {shop.currentAvailability}
                    </Badge>
                  </div>
                )) : (
                  <div className="text-center text-muted-foreground py-4">
                    <p className="text-sm">추천 데이터가 없습니다</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">점수 기준</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>품질 점수</span>
                <span className="font-medium">40% 가중치</span>
              </div>
              <div className="flex justify-between">
                <span>혼잡도 (낮을수록 좋음)</span>
                <span className="font-medium">30% 가중치</span>
              </div>
              <div className="flex justify-between">
                <span>가격 우위</span>
                <span className="font-medium">30% 가중치</span>
              </div>
              <div className="pt-2 border-t text-xs text-muted-foreground">* 품질 보장 집만 선별하여 추천</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {(!recommendations || recommendations.length === 0) && (
        <Card className="rounded-2xl">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">조건에 맞는 품질 보장 집이 없습니다.</p>
            <p className="text-sm text-muted-foreground">다른 시간대나 카테고리를 선택해보세요.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
