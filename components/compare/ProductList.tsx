"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Heart, Star, ShoppingCart, Search, Gift, Calculator } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useVoucher } from "@/hooks/use-voucher"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface Product {
  id: string
  name: string
  category: string
  subcategory: string
  origin: string
  region: string
  weight: string
  grade: string
  image: string
  basePrice: number
  discountRate: number
  finalPrice: number
  lowestPrice: number
  lowestPriceVendor: string
  distance: string
  rating: number
  reviewCount: number
  registeredDate: string
  benefits: string[]
  inStock: boolean
  freshness: string
}

interface ProductListProps {
  products: Product[]
  loading?: boolean
  sortBy: string
  onSortChange: (value: string) => void
  viewMode: "list" | "grid"
  onViewModeChange: (mode: "list" | "grid") => void
  onProductClick?: (item: string) => void
}

// 최저가 추이 데이터 (목업 데이터) - price detail 스타일 적용
const mockPriceTrendData = [
  { date: "2024-01-01", traditionalMarket: 8000, largeRetail: 9500 },
  { date: "2024-01-02", traditionalMarket: 7800, largeRetail: 9200 },
  { date: "2024-01-03", traditionalMarket: 8200, largeRetail: 9800 },
  { date: "2024-01-04", traditionalMarket: 7600, largeRetail: 9000 },
  { date: "2024-01-05", traditionalMarket: 7500, largeRetail: 8800 },
  { date: "2024-01-06", traditionalMarket: 7400, largeRetail: 8700 },
  { date: "2024-01-07", traditionalMarket: 7300, largeRetail: 8500 },
]

export default function ProductList({
  products,
  loading = false,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  onProductClick,
}: ProductListProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [activeSort, setActiveSort] = useState("인기상품순")
  const [detailOptions, setDetailOptions] = useState(false)
  const [couponDiscount, setCouponDiscount] = useState(false)
  const [includeShipping, setIncludeShipping] = useState(false)
  const [showOnnuriCalculator, setShowOnnuriCalculator] = useState<string | null>(null)
  const [onnuriAmount, setOnnuriAmount] = useState<{ [key: string]: number }>({})
  
  const { balance: voucherBalance, deductVoucher } = useVoucher()

  const toggleFavorite = (productId: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId)
    } else {
      newFavorites.add(productId)
    }
    setFavorites(newFavorites)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price) + "원"
  }

  const getBenefitIcon = (benefit: string) => {
    switch (benefit) {
      case "온누리상품권":
        return "🎫"
      case "카드할인":
        return "💳"
      case "쿠폰할인":
        return "🎟️"
      default:
        return "🏷️"
    }
  }

  const calculateOnnuriPrice = (product: Product, amount: number) => {
    if (!product.benefits.includes("온누리상품권")) {
      return {
        originalPrice: product.finalPrice,
        onnuriUsed: 0,
        finalPrice: product.finalPrice,
        savings: 0
      }
    }
    
    const onnuriDiscount = Math.min(amount, product.finalPrice)
    const finalPrice = product.finalPrice - onnuriDiscount
    
    return {
      originalPrice: product.finalPrice,
      onnuriUsed: onnuriDiscount,
      finalPrice: Math.max(0, finalPrice),
      savings: onnuriDiscount
    }
  }

  const handleOnnuriPurchase = (product: Product) => {
    const amount = onnuriAmount[product.id] || 0
    if (amount <= 0) return
    
    try {
      const priceInfo = calculateOnnuriPrice(product, amount)
      if (priceInfo.onnuriUsed > 0) {
        deductVoucher(priceInfo.onnuriUsed, `${product.name} 구매 - 온누리상품권 사용`)
        alert(`온누리상품권 ${formatPrice(priceInfo.onnuriUsed)} 사용 완료!\n최종 결제금액: ${formatPrice(priceInfo.finalPrice)}`)
        setOnnuriAmount({ ...onnuriAmount, [product.id]: 0 })
        setShowOnnuriCalculator(null)
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "온누리상품권 사용 중 오류가 발생했습니다.")
    }
  }

  const ProductRow = ({ product }: { product: Product }) => {
    const currentOnnuriAmount = onnuriAmount[product.id] || 0
    const priceInfo = calculateOnnuriPrice(product, currentOnnuriAmount)
    const hasOnnuriBenefit = product.benefits.includes("온누리상품권")
    
    return (
      <div className="border-b border-gray-200 py-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-32 h-32 border border-gray-200 bg-white flex items-center justify-center overflow-hidden">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                width={128}
                height={128}
                className="object-cover"
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-4">
                <button
                  onClick={() => onProductClick?.(product.name)}
                  className="block hover:text-blue-600 transition-colors text-left w-full"
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">{product.name}</h3>
                </button>

                <div className="text-sm text-gray-600 leading-relaxed mb-3">
                  <span className="text-blue-600 font-medium">{product.category}</span> |
                  <span className="mx-1">원산지: {product.origin}</span> |
                  <span className="mx-1">중량: {product.weight}</span> |
                  <span className="mx-1">등급: {product.grade}</span> |
                  <span className="mx-1">지역: {product.region}</span> |
                  <span className="mx-1">신선도: {product.freshness}</span>
                </div>

                <div className="flex items-center space-x-2 mb-3">
                  {product.benefits.map((benefit) => (
                    <span
                      key={benefit}
                      className="inline-flex items-center px-2 py-1 text-xs bg-blue-50 text-blue-700 border border-blue-200"
                    >
                      {getBenefitIcon(benefit)} {benefit}
                    </span>
                  ))}
                </div>

                {/* 온누리 혜택 계산기 */}
                {hasOnnuriBenefit && (
                  <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Gift className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">온누리 혜택 계산</span>
                      </div>
                      <span className="text-xs text-green-600">잔액: {formatPrice(voucherBalance)}</span>
                    </div>
                    
                    {showOnnuriCalculator === product.id ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            placeholder="사용할 온누리상품권 금액"
                            value={currentOnnuriAmount}
                            onChange={(e) => setOnnuriAmount({
                              ...onnuriAmount,
                              [product.id]: parseInt(e.target.value) || 0
                            })}
                            className="w-32 h-8 text-sm"
                            max={Math.min(voucherBalance, product.finalPrice)}
                          />
                          <span className="text-xs text-gray-500">원</span>
                          <Button
                            size="sm"
                            onClick={() => handleOnnuriPurchase(product)}
                            disabled={currentOnnuriAmount <= 0 || currentOnnuriAmount > voucherBalance}
                            className="h-8 px-3 bg-green-600 hover:bg-green-700 text-white"
                          >
                            사용
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowOnnuriCalculator(null)}
                            className="h-8 px-3"
                          >
                            닫기
                          </Button>
                        </div>
                        
                        {currentOnnuriAmount > 0 && (
                          <div className="text-xs space-y-1">
                            <div className="flex justify-between">
                              <span>정상가:</span>
                              <span className="line-through">{formatPrice(priceInfo.originalPrice)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>온누리 할인:</span>
                              <span className="text-green-600">-{formatPrice(priceInfo.savings)}</span>
                            </div>
                            <div className="flex justify-between font-medium">
                              <span>최종 결제금액:</span>
                              <span className="text-blue-600">{formatPrice(priceInfo.finalPrice)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowOnnuriCalculator(product.id)}
                        className="h-8 px-3 border-green-300 text-green-700 hover:bg-green-50"
                      >
                        <Calculator className="w-3 h-3 mr-1" />
                        온누리 혜택 계산
                      </Button>
                    )}
                  </div>
                )}

                <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                  <span>등록일 {product.registeredDate}</span>
                  <div className="flex items-center">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="font-medium text-gray-700">{product.rating}</span>
                    <span className="ml-1">({product.reviewCount})</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(product.id)}
                    className="p-0 h-auto text-gray-500 hover:text-red-500"
                  >
                    <Heart className={`w-4 h-4 ${favorites.has(product.id) ? "fill-red-500 text-red-500" : ""}`} />
                    <span className="ml-1">관심</span>
                  </Button>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {hasOnnuriBenefit && currentOnnuriAmount > 0 ? (
                    <div className="space-y-1">
                      <div className="line-through text-lg text-gray-400">
                        {formatPrice(priceInfo.originalPrice)}
                      </div>
                      <div className="text-2xl text-green-600">
                        {formatPrice(priceInfo.finalPrice)}
                      </div>
                    </div>
                  ) : (
                    formatPrice(product.finalPrice)
                  )}
                  <Button size="sm" className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1">
                    <ShoppingCart className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-sm text-gray-500">{product.reviewCount}몰</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="office-card p-4">
            <div className="flex items-start space-x-4">
              <div className="w-24 h-24 bg-muted office-border animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-muted animate-pulse office-border w-1/3" />
                <div className="h-4 bg-muted animate-pulse office-border w-1/2" />
                <div className="h-4 bg-muted animate-pulse office-border w-2/3" />
              </div>
              <div className="w-24 space-y-2">
                <div className="h-6 bg-muted animate-pulse office-border" />
                <div className="h-4 bg-muted animate-pulse office-border" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-6">
      {/* 메인 상품 리스트 */}
      <div className="flex-1 bg-white">
        <div className="border-b border-gray-200">
          <div className="flex items-center space-x-0">
            <button className="px-4 py-3 border-b-2 border-blue-600 text-blue-600 font-medium">
              전체 ({products.length.toLocaleString()})
            </button>
            <button className="px-4 py-3 text-gray-600 hover:text-gray-900">가격비교 (953)</button>
            <button className="px-4 py-3 text-gray-600 hover:text-gray-900">특가 상품 (73,082)</button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50">
            <div className="flex items-center space-x-4">
              <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger className="w-32 h-8 text-sm">
                  <SelectValue placeholder="소팅별 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">최신순</SelectItem>
                  <SelectItem value="price-low">가격 낮은순</SelectItem>
                  <SelectItem value="price-high">가격 높은순</SelectItem>
                  <SelectItem value="rating">평점순</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Input placeholder="리스트 내 검색" className="w-48 h-8 text-sm" />
                <Button size="sm" className="h-8 px-3 bg-gray-600 hover:bg-gray-700">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              <Select defaultValue="결과 내 검색">
                <SelectTrigger className="w-32 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="결과 내 검색">결과 내 검색</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="h-8 bg-transparent">
                  ☰
                </Button>
                <Button variant="outline" size="sm" className="h-8 bg-transparent">
                  ⊞
                </Button>
              </div>
              <Select defaultValue="40개">
                <SelectTrigger className="w-20 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20개">20개</SelectItem>
                  <SelectItem value="40개">40개</SelectItem>
                  <SelectItem value="80개">80개</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" defaultChecked />
              <span className="text-sm font-medium">인기상품순</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" />
              <span className="text-sm text-gray-600">낮은가격순</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" />
              <span className="text-sm text-gray-600">높은가격순</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" />
              <span className="text-sm text-gray-600">신상품순</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" />
              <span className="text-sm text-gray-600">상품평 많은순</span>
            </label>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm">상세옵션설정</span>
              <div className="relative">
                <Switch
                  checked={detailOptions}
                  onCheckedChange={setDetailOptions}
                  className="data-[state=checked]:bg-blue-600"
                />
                <span className="absolute -right-8 top-0 text-xs text-blue-600 font-medium">
                  {detailOptions ? "ON" : "OFF"}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm">쿠팡와우할인</span>
              <div className="relative">
                <Switch checked={couponDiscount} onCheckedChange={setCouponDiscount} />
                <span className="absolute -right-8 top-0 text-xs text-gray-400 font-medium">
                  {couponDiscount ? "ON" : "OFF"}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm">배송비포함</span>
              <div className="relative">
                <Switch checked={includeShipping} onCheckedChange={setIncludeShipping} />
                <span className="absolute -right-8 top-0 text-xs text-gray-400 font-medium">
                  {includeShipping ? "ON" : "OFF"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white">
          {products.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>검색 결과가 없습니다</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {products.map((product) => (
                <ProductRow key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 우측 최저가 추이 그래프 */}
      <div className="w-80 flex-shrink-0">
        <Card className="sticky top-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">최저가 추이</CardTitle>
            <p className="text-sm text-gray-600">최근 7일간 가격 변동</p>
          </CardHeader>
          <CardContent>
            <div className="h-64 border border-border">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockPriceTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value: string) => {
                      const date = new Date(value)
                      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                    }}
                  />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(value: number) => `${value.toLocaleString()}원`} />
                  <Tooltip
                    formatter={(value: number, name: string) => {
                      const labels: Record<string, string> = {
                        largeRetail: "대형유통사",
                        traditionalMarket: "전통시장",
                      }
                      return [`${value.toLocaleString()}원`, labels[name] || name]
                    }}
                    labelFormatter={(label: string) => {
                      const date = new Date(label)
                      return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="largeRetail"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="대형유통사"
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="traditionalMarket"
                    stroke="#22c55e"
                    strokeWidth={2}
                    name="전통시장"
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* 최저가 정보 */}
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.min(...mockPriceTrendData.map((d: any) => Math.min(d.traditionalMarket, d.largeRetail))).toLocaleString()}원
                </div>
                <div className="text-sm text-green-600 mt-1">최저가</div>
                <div className="text-xs text-gray-500 mt-1">
                  전통시장
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
