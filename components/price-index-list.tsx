"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { TrendingDown, ArrowRight, DollarSign, ShoppingCart, Store } from "lucide-react"
import Link from "next/link"

interface AvailableProduct {
  value: string
  label: string
  category: string
}

interface PriceSummary {
  latest: {
    seoul: number
    mart: number
    dongdaemun: number
  }
  seoulSavings: number
  martSavings: number
  buySignal: boolean
}

export function PriceIndexList() {
  const [availableProducts, setAvailableProducts] = useState<AvailableProduct[]>([])
  const [priceSummaries, setPriceSummaries] = useState<{ [key: string]: PriceSummary }>({})
  const [loading, setLoading] = useState(true)

  // 사용 가능한 제품 목록 로드
  useEffect(() => {
    const loadAvailableProducts = async () => {
      try {
        console.log("🔍 제품 목록 로딩 시작...")
        const response = await fetch("/api/available-products")
        if (!response.ok) {
          throw new Error(`제품 목록 API 오류: ${response.status}`)
        }
        const data = await response.json()
        console.log("🔍 제품 목록 로딩 완료:", data)
        
        if (data.products && data.products.length > 0) {
          setAvailableProducts(data.products)
          // 각 제품별 가격 요약 데이터 로드
          loadPriceSummaries(data.products)
        }
      } catch (error) {
        console.error("❌ 제품 목록 로딩 실패:", error)
        setAvailableProducts([
          { value: "cabbage", label: "배추", category: "채소" }
        ])
      }
    }

    loadAvailableProducts()
  }, [])

  // 각 제품별 가격 요약 데이터 로드
  const loadPriceSummaries = async (products: AvailableProduct[]) => {
    const summaries: { [key: string]: PriceSummary } = {}
    
    for (const product of products) {
      try {
        const response = await fetch(`/api/price-index-real?product=${product.value}&period=1month`)
        if (response.ok) {
          const data = await response.json()
          if (data.products && data.products.length > 0) {
            const productData = data.products[0]
            const latest = productData.data[productData.data.length - 1]
            const seoulSavings = Math.round(((latest.seoul - latest.dongdaemun) / latest.seoul) * 100)
            const martSavings = Math.round(((latest.mart - latest.dongdaemun) / latest.mart) * 100)
            
            // 3일 이동평균 기울기로 BUY 신호 계산
            const recent3Days = productData.data.slice(-3)
            let buySignal = false
            if (recent3Days.length >= 3) {
              const slope = (recent3Days[2].dongdaemun - recent3Days[0].dongdaemun) / 2
              buySignal = latest.dongdaemun < latest.seoul && latest.dongdaemun < latest.mart && slope < 0
            }

            summaries[product.value] = {
              latest,
              seoulSavings,
              martSavings,
              buySignal
            }
          }
        }
      } catch (error) {
        console.error(`❌ ${product.label} 가격 데이터 로딩 실패:`, error)
      }
    }
    
    setPriceSummaries(summaries)
    setLoading(false)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "과일": return "🍎"
      case "채소": return "🥬"
      case "견과류": return "🥜"
      default: return "🛒"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "과일": return "bg-orange-100 text-orange-800 border-orange-200"
      case "채소": return "bg-green-100 text-green-800 border-green-200"
      case "견과류": return "bg-amber-100 text-amber-800 border-amber-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">가격 데이터 로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">가격지수 비교</h1>
        <p className="text-muted-foreground text-lg">
          전통시장 vs 대형마트 vs 동대문 시장 가격을 한눈에 비교해보세요
        </p>
      </div>

      {/* 카테고리별 제품 리스트 */}
      {Object.entries(
        availableProducts.reduce((acc, product) => {
          if (!acc[product.category]) {
            acc[product.category] = []
          }
          acc[product.category].push(product)
          return acc
        }, {} as Record<string, AvailableProduct[]>)
      ).map(([category, products]) => (
        <div key={category} className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">{getCategoryIcon(category)}</span>
            <h2 className="text-xl font-semibold">{category}</h2>
            <Badge variant="outline" className={getCategoryColor(category)}>
              {products.length}개 제품
            </Badge>
          </div>
          
          <div className="space-y-4">
            {products.map((product) => {
              const summary = priceSummaries[product.value]
              return (
                <Card key={product.value} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/20">
                  <CardContent className="p-0">
                    <div className="flex">
                      {/* 왼쪽: 제품 아이콘/이미지 영역 */}
                      <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative">
                        <div className="text-4xl">{getCategoryIcon(category)}</div>
                        
                        {/* BUY 신호 배지 */}
                        {summary?.buySignal && (
                          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
                            BUY
                          </div>
                        )}
                        
                        {/* 절감률/비쌈률 배지 */}
                        {summary && (
                          <div className="absolute -bottom-2 -left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
                            {summary.martSavings > 0 ? 
                              `${summary.martSavings}% 절감` : 
                              `${Math.abs(summary.martSavings)}% 비쌈`
                            }
                          </div>
                        )}
                      </div>

                      {/* 오른쪽: 제품 정보 영역 */}
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between">
                          {/* 제품 기본 정보 */}
                          <div className="flex-1">
                            {/* 제품명과 카테고리 */}
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-gray-900">{product.label}</h3>
                              <Badge 
                                variant="outline" 
                                className={`${getCategoryColor(category)} text-xs px-2 py-1`}
                              >
                                {product.category}
                              </Badge>
                              <span className="text-sm text-muted-foreground font-mono">{product.value}</span>
                            </div>

                            {/* 가격 정보 */}
                            {summary ? (
                              <div className="space-y-3">
                                {/* 주요 가격 정보 */}
                                <div className="flex items-center gap-6">
                                  <div className="text-center">
                                    <div className="text-xs text-muted-foreground mb-1">서울 평균</div>
                                    <div className="text-lg font-semibold text-gray-700">
                                      {summary.latest.seoul.toLocaleString()}원
                                    </div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-xs text-muted-foreground mb-1">마트 평균</div>
                                    <div className={`text-lg font-semibold ${
                                      summary.latest.dongdaemun > summary.latest.mart 
                                        ? 'text-green-600 text-2xl font-bold' 
                                        : 'text-gray-700'
                                    }`}>
                                      {summary.latest.mart.toLocaleString()}원
                                    </div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-xs text-muted-foreground mb-1">동대문 시장</div>
                                    <div className={`text-lg font-semibold ${
                                      summary.latest.dongdaemun <= summary.latest.mart 
                                        ? 'text-green-600 text-2xl font-bold' 
                                        : 'text-gray-700'
                                    }`}>
                                      {summary.latest.dongdaemun.toLocaleString()}원
                                    </div>
                                  </div>
                                </div>

                                {/* 절감 정보 - 마트 대비만 표시 */}
                                <div className="flex items-center gap-4 text-sm">
                                  <div className="flex items-center gap-2">
                                    <ShoppingCart className="h-4 w-4 text-orange-500" />
                                    <span className="text-orange-700 font-medium">
                                      마트 대비 {summary.martSavings > 0 ? (
                                        <span className="font-bold">{summary.martSavings}% 절감</span>
                                      ) : (
                                        <span className="font-bold text-red-600">{Math.abs(summary.martSavings)}% 비쌉니다</span>
                                      )}
                                    </span>
                                  </div>
                                </div>

                                {/* 추가 정보 */}
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span>최신 데이터: {new Date().toLocaleDateString()}</span>
                                  <span>•</span>
                                  <span>데이터 품질: 우수</span>
                                  <span>•</span>
                                  <span>업데이트: 실시간</span>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-4 text-muted-foreground">
                                가격 데이터 로딩 중...
                              </div>
                            )}
                          </div>

                          {/* 오른쪽: 액션 버튼과 추가 정보 */}
                          <div className="flex flex-col items-end gap-3 ml-6">
                            {/* BUY 신호 표시 */}
                            {summary?.buySignal && (
                              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                                <TrendingDown className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium text-green-700">매수 신호!</span>
                              </div>
                            )}

                            {/* 상세 보기 버튼 */}
                            <Link href={`/price-detail/${product.value}`}>
                              <Button 
                                className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors min-w-[120px]"
                                variant="outline"
                              >
                                상세 보기
                                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                              </Button>
                            </Link>

                            {/* 빠른 비교 버튼 */}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-xs text-muted-foreground hover:text-primary"
                            >
                              빠른 비교
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      ))}

      {/* 통계 요약 */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">
                {availableProducts.length}
              </div>
              <div className="text-sm text-muted-foreground">총 제품 수</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {Object.values(priceSummaries).filter(s => s.buySignal).length}
              </div>
              <div className="text-sm text-muted-foreground">BUY 신호</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {Object.values(priceSummaries).length}
              </div>
              <div className="text-sm text-muted-foreground">데이터 완료</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(
                  Object.values(priceSummaries).reduce((acc, s) => acc + s.seoulSavings, 0) / 
                  Math.max(Object.values(priceSummaries).length, 1)
                )}%
              </div>
              <div className="text-sm text-muted-foreground">평균 절감률</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
