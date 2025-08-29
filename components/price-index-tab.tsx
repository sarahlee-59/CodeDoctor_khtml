"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useState, useEffect } from "react"
import { fetcher } from "@/lib/fetcher"
import { TrendingDown, Eye, EyeOff, ExternalLink } from "lucide-react"
import Link from "next/link"

interface PricePoint {
  date: string
  seoul: number
  mart: number
  dongdaemun: number
}

interface ProductData {
  product: string
  data: PricePoint[]
}

interface PriceIndexData {
  products: ProductData[]
  lastUpdated: string
}

interface AvailableProduct {
  value: string
  label: string
  category: string
}

export function PriceIndexTab() {
  const [data, setData] = useState<PriceIndexData | null>(null)
  const [availableProducts, setAvailableProducts] = useState<AvailableProduct[]>([])
  const [selectedProduct, setSelectedProduct] = useState<string>("cabbage")
  const [selectedPeriod, setSelectedPeriod] = useState<string>("1week")
  const [showTable, setShowTable] = useState(false)
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
          // 첫 번째 제품을 기본 선택
          setSelectedProduct(data.products[0].value)
          console.log("🔍 기본 제품 선택:", data.products[0].value)
        }
      } catch (error) {
        console.error("❌ 제품 목록 로딩 실패:", error)
        // 에러 발생 시 기본 제품 설정
        setAvailableProducts([
          { value: "cabbage", label: "배추", category: "채소" }
        ])
        setSelectedProduct("cabbage")
      }
    }

    loadAvailableProducts()
  }, [])

  useEffect(() => {
    const loadData = async () => {
      if (!selectedProduct) {
        console.log("🔍 제품이 선택되지 않음, 데이터 로딩 건너뜀")
        return
      }
      
      try {
        console.log("🔍 가격 데이터 로딩 시작:", selectedProduct, selectedPeriod)
        setLoading(true)
        
        // 실제 데이터베이스 API 사용
        const url = `/api/price-index-real?product=${selectedProduct}&period=${selectedPeriod}`
        console.log("🔍 API URL:", url)
        
        const priceData = await fetcher<PriceIndexData>(url)
        console.log("🔍 가격 데이터 로딩 완료:", priceData)
        console.log("🔍 데이터 구조:", JSON.stringify(priceData, null, 2))
        
        if (priceData && priceData.products && priceData.products.length > 0) {
          console.log("🔍 제품 데이터 확인:", priceData.products)
          setData(priceData)
        } else {
          console.warn("⚠️ 빈 데이터 또는 잘못된 구조:", priceData)
          setData(null)
        }
      } catch (error) {
        console.error("❌ 가격 데이터 로딩 실패:", error)
        console.error("❌ 에러 상세:", error instanceof Error ? error.message : error)
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [selectedProduct, selectedPeriod])

  const getCurrentProductData = () => {
    if (!data) return null
    const product = data.products.find((p) => p.product === selectedProduct)
    if (!product) return null

    const periodDays = selectedPeriod === "1week" ? 7 : 30
    const filteredData = product.data.slice(-periodDays)

    if (filteredData.length === 0) return null

    const latest = filteredData[filteredData.length - 1]
    const seoulSavings = Math.round(((latest.seoul - latest.dongdaemun) / latest.seoul) * 100)
    const martSavings = Math.round(((latest.mart - latest.dongdaemun) / latest.mart) * 100)

    // Calculate 3-day moving average slope for BUY signal
    const recent3Days = filteredData.slice(-3)
    let buySignal = false
    if (recent3Days.length >= 3) {
      const slope = (recent3Days[2].dongdaemun - recent3Days[0].dongdaemun) / 2
      buySignal = latest.dongdaemun < latest.seoul && latest.dongdaemun < latest.mart && slope < 0
    }

    return {
      data: filteredData,
      latest,
      seoulSavings,
      martSavings,
      buySignal,
    }
  }

  const productData = getCurrentProductData()

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="office-card rounded-sm">
          <CardHeader className="office-header">
            <CardTitle>가격지수</CardTitle>
            <CardDescription>서울 평균가 vs 대형마트 평균가 vs 동대문 시장가 비교</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-muted border border-border flex items-center justify-center">
              <p className="text-muted-foreground">가격 데이터 로딩 중...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="office-section">
        <div className="office-header mb-3">
          <span className="text-sm font-medium">가격 분석 요약</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {productData && (
            <>
              <Badge variant="secondary" className="rounded-sm px-3 py-1 text-xs font-medium">
                서울 기준 {productData.seoulSavings}% 절감
              </Badge>
              <Badge variant="secondary" className="rounded-sm px-3 py-1 text-xs font-medium">
                마트 기준 {productData.martSavings}% 절감
              </Badge>
              {productData.buySignal && (
                <Badge
                  variant="default"
                  className="rounded-sm px-3 py-1 text-xs font-medium bg-green-600 hover:bg-green-700"
                >
                  <TrendingDown className="w-3 h-3 mr-1" />
                  BUY 신호
                </Badge>
              )}
              <Link href={`/compare?item=${selectedProduct}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="office-button rounded-sm px-3 py-1 text-xs h-auto bg-transparent"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  상세 비교
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      <Card className="office-card rounded-sm">
        <CardHeader className="office-header border-b border-border">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-lg font-semibold">가격지수</CardTitle>
              <CardDescription className="text-sm">
                서울 평균가 vs 대형마트 평균가 vs 동대문 시장가 라인차트 비교
              </CardDescription>
            </div>
            <div className="office-grid grid-cols-3 gap-0">
              <div className="office-header flex items-center justify-between px-3 py-2">
                <span className="text-xs font-medium">상품</span>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger className="office-input rounded-sm w-20 h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-sm">
                    {Object.entries(
                      availableProducts.reduce((acc, product) => {
                        if (!acc[product.category]) {
                          acc[product.category] = []
                        }
                        acc[product.category].push(product)
                        return acc
                      }, {} as Record<string, AvailableProduct[]>)
                    ).map(([category, products]) => (
                      <div key={category}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted">
                          {category}
                        </div>
                        {products.map((product) => (
                          <SelectItem key={product.value} value={product.value}>
                            {product.label}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="office-header flex items-center justify-between px-3 py-2">
                <span className="text-xs font-medium">기간</span>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="office-input rounded-sm w-16 h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-sm">
                    <SelectItem value="1week">1주</SelectItem>
                    <SelectItem value="1month">1개월</SelectItem>
                    <SelectItem value="3months">3개월</SelectItem>
                    <SelectItem value="6months">6개월</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="office-header flex items-center justify-center px-3 py-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTable(!showTable)}
                  className="office-button rounded-sm h-7 px-2 text-xs"
                >
                  {showTable ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                  {showTable ? "차트" : "테이블"}
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {!showTable ? (
            <div className="h-80 border border-border">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={productData?.data || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return `${date.getMonth() + 1}/${date.getDate()}`
                    }}
                  />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `${value.toLocaleString()}원`} />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value.toLocaleString()}원`,
                      name === "seoul" ? "서울 평균가" : name === "mart" ? "대형마트 평균가" : "동대문 시장가",
                    ]}
                    labelFormatter={(label) => {
                      const date = new Date(label)
                      return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="seoul"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="서울 평균가"
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="mart"
                    stroke="#f97316"
                    strokeWidth={2}
                    name="대형마트 평균가"
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="dongdaemun"
                    stroke="#22c55e"
                    strokeWidth={3}
                    name="동대문 시장가"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="office-grid grid-cols-1 gap-0">
              <div className="office-header grid grid-cols-6 gap-0 text-xs font-medium">
                <div className="px-3 py-2 border-r border-border">날짜</div>
                <div className="px-3 py-2 border-r border-border text-right">서울 평균가</div>
                <div className="px-3 py-2 border-r border-border text-right">대형마트 평균가</div>
                <div className="px-3 py-2 border-r border-border text-right">동대문 시장가</div>
                <div className="px-3 py-2 border-r border-border text-right">절감액 (서울)</div>
                <div className="px-3 py-2 text-right">절감액 (마트)</div>
              </div>
              {productData?.data.map((item, index) => (
                <div key={index} className="grid grid-cols-6 gap-0 text-xs border-t border-border hover:bg-accent/30">
                  <div className="px-3 py-2 border-r border-border">
                    {new Date(item.date).toLocaleDateString("ko-KR")}
                  </div>
                  <div className="px-3 py-2 border-r border-border text-right">{item.seoul.toLocaleString()}원</div>
                  <div className="px-3 py-2 border-r border-border text-right">{item.mart.toLocaleString()}원</div>
                  <div className="px-3 py-2 border-r border-border text-right font-medium text-green-600">
                    {item.dongdaemun.toLocaleString()}원
                  </div>
                  <div className="px-3 py-2 border-r border-border text-right text-green-600">
                    -{(item.seoul - item.dongdaemun).toLocaleString()}원
                  </div>
                  <div className="px-3 py-2 text-right text-green-600">
                    -{(item.mart - item.dongdaemun).toLocaleString()}원
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {productData && (
        <div className="office-grid grid-cols-4 gap-0">
          <Card className="office-card rounded-sm">
            <CardContent className="office-header text-center px-4 py-4">
              <div className="text-xl font-bold text-green-600">{productData.latest.dongdaemun.toLocaleString()}원</div>
              <div className="text-xs text-muted-foreground mt-1">동대문 시장가</div>
            </CardContent>
          </Card>
          <Card className="office-card rounded-sm">
            <CardContent className="office-header text-center px-4 py-4">
              <div className="text-xl font-bold text-green-600">{productData.seoulSavings}%</div>
              <div className="text-xs text-muted-foreground mt-1">서울 기준 절감률</div>
            </CardContent>
          </Card>
          <Card className="office-card rounded-sm">
            <CardContent className="office-header text-center px-4 py-4">
              <div className="text-xl font-bold text-green-600">{productData.martSavings}%</div>
              <div className="text-xs text-muted-foreground mt-1">마트 기준 절감률</div>
            </CardContent>
          </Card>
          <Card className="office-card rounded-sm">
            <CardContent className="office-header text-center px-4 py-4">
              <div className="text-xl font-bold">
                {productData.buySignal ? (
                  <span className="text-green-600">BUY</span>
                ) : (
                  <span className="text-gray-500">HOLD</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-1">매수 신호</div>
              <Link href={`/compare?item=${selectedProduct}`} className="block mt-2">
                <Button variant="ghost" size="sm" className="office-button rounded-sm text-xs h-6 px-2">
                  상세 비교 보기
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
