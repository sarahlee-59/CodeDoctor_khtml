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
        console.log("🔍 제품 개수:", data.products?.length || 0)
        
        if (data.products && data.products.length > 0) {
          console.log("🔍 제품 목록 설정:", data.products)
          setAvailableProducts(data.products)
          // 각 제품별 가격 요약 데이터 로드
          loadPriceSummaries(data.products)
        } else {
          console.warn("⚠️ 제품 목록이 비어있음")
          setLoading(false)
        }
      } catch (error) {
        console.error("❌ 제품 목록 로딩 실패:", error)
        // 에러 발생 시 기본 제품 설정
        const fallbackProducts = [
          { value: "cabbage", label: "배추", category: "채소" },
          { value: "garlic", label: "마늘", category: "채소" },
          { value: "potato", label: "감자", category: "채소" }
        ]
        setAvailableProducts(fallbackProducts)
        
        // 기본 가격 데이터 설정
        const fallbackSummaries: { [key: string]: PriceSummary } = {}
        fallbackProducts.forEach(product => {
          fallbackSummaries[product.value] = {
            latest: {
              seoul: 5000,
              mart: 4500,
              dongdaemun: 4000
            },
            seoulSavings: 20,
            martSavings: 11,
            buySignal: true
          }
        })
        setPriceSummaries(fallbackSummaries)
        setLoading(false)
      }
    }

    loadAvailableProducts()
  }, [])

  // 각 제품별 가격 요약 데이터 로드
  const loadPriceSummaries = async (products: AvailableProduct[]) => {

    console.log("🔍 가격 요약 데이터 로딩 시작, 제품 수:", products.length)
    const summaries: { [key: string]: PriceSummary } = {}
    
    for (const product of products) {
      try {
        console.log(`🔍 ${product.label} 가격 데이터 로딩 중...`)
        const response = await fetch(`/api/price-index-real?product=${product.value}&period=1month`)
        if (response.ok) {
          const data = await response.json()
          console.log(`🔍 ${product.label} 응답 데이터:`, data)
          
          if (data.products && data.products.length > 0) {
            const productData = data.products[0]
            const latest = productData.data[productData.data.length - 1]
            console.log(`🔍 ${product.label} 최신 데이터:`, latest)

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
            console.log(`✅ ${product.label} 요약 데이터 생성 완료:`, summaries[product.value])
          } else {
            console.warn(`⚠️ ${product.label} 제품 데이터가 비어있음`)
          }
        } else {
          console.error(`❌ ${product.label} API 응답 오류:`, response.status)
        }
      } catch (error) {
        console.error(`❌ ${product.label} 가격 데이터 로딩 실패:`, error)
      }
    }
    
    console.log("🔍 최종 요약 데이터:", summaries)
    
    // 요약 데이터가 비어있으면 기본 데이터 설정
    if (Object.keys(summaries).length === 0) {
      console.warn("⚠️ 요약 데이터가 비어있어 기본 데이터 사용")
      const fallbackSummaries: { [key: string]: PriceSummary } = {}
      products.forEach(product => {
        fallbackSummaries[product.value] = {
          latest: {
            seoul: 5000,
            mart: 4500,
            dongdaemun: 4000
          },
          seoulSavings: 20,
          martSavings: 11,
          buySignal: true
        }
      })
      setPriceSummaries(fallbackSummaries)
    } else {
      setPriceSummaries(summaries)
    }
    
    setLoading(false)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "채소":
        return "🥬"
      case "과일":
        return "🍎"
      case "육류":
        return "🥩"
      case "수산물":
        return "🐟"
      case "곡물":
        return "🌾"
      default:
        return "🛒"
    }
  }

  const getSavingsColor = (savings: number) => {
    if (savings >= 20) return "text-green-600"
    if (savings >= 10) return "text-blue-600"
    if (savings >= 5) return "text-yellow-600"
    return "text-gray-600"
  }

  const getSavingsBadgeVariant = (savings: number) => {
    if (savings >= 20) return "default"
    if (savings >= 10) return "secondary"
    if (savings >= 5) return "outline"
    return "outline"
  }

  console.log("🔍 렌더링 상태:", { loading, availableProducts: availableProducts.length, priceSummaries: Object.keys(priceSummaries).length })
  
  if (loading) {
    console.log("🔍 로딩 중...")
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }


  console.log("🔍 메인 렌더링 시작")
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">가격지수 현황</h2>
          <p className="text-muted-foreground">
            서울 평균가 대비 동대문 전통시장 가격 비교
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <TrendingDown className="h-3 w-3" />
            절약율
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            가격
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableProducts.map((product) => {
          const summary = priceSummaries[product.value]
          if (!summary) return null

          return (
            <Card key={product.value} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getCategoryIcon(product.category)}</span>
                    <div>
                      <CardTitle className="text-lg">{product.label}</CardTitle>
                      <CardDescription className="text-sm">{product.category}</CardDescription>
                    </div>
                  </div>
                  {summary.buySignal && (
                    <Badge variant="destructive" className="text-xs">
                      BUY
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* 가격 정보 */}
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center">
                    <div className="font-medium text-muted-foreground">서울</div>
                    <div className="font-bold">{summary.latest.seoul.toLocaleString()}원</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-muted-foreground">대형마트</div>
                    <div className="font-bold">{summary.latest.mart.toLocaleString()}원</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-muted-foreground">동대문</div>
                    <div className="font-bold text-primary">{summary.latest.dongdaemun.toLocaleString()}원</div>
                  </div>
                </div>

                {/* 절약율 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">서울 대비 절약</span>
                    <Badge 
                      variant={getSavingsBadgeVariant(summary.seoulSavings)}
                      className={getSavingsColor(summary.seoulSavings)}
                    >
                      {summary.seoulSavings}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">대형마트 대비 절약</span>
                    <Badge 
                      variant={getSavingsBadgeVariant(summary.martSavings)}
                      className={getSavingsColor(summary.martSavings)}
                    >
                      {summary.martSavings}%
                    </Badge>
                  </div>
                </div>

                {/* 상세보기 버튼 */}
                <div className="flex gap-2">
                  <Button 
                    asChild 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                  >
                    <Link href={`/price-detail/${product.value}`}>
                      <Store className="h-4 w-4 mr-1" />
                      상세분석
                    </Link>
                  </Button>
                  <Button 
                    asChild 
                    variant="default" 
                    size="sm" 
                    className="flex-1"
                  >
                    <Link href={`/compare/${product.value}`}>
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      가격비교
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {availableProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">가격 데이터를 불러올 수 없습니다</h3>
            <p className="text-sm">잠시 후 다시 시도해주세요</p>
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-600">디버깅 정보:</p>
              <p className="text-xs text-red-500">availableProducts: {JSON.stringify(availableProducts)}</p>
              <p className="text-xs text-red-500">priceSummaries: {JSON.stringify(Object.keys(priceSummaries))}</p>
              <p className="text-xs text-red-500">loading: {loading.toString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
