"use client"

import { useState } from "react"
import { countByVendorType } from "@/lib/db"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Heart, Star, ShoppingCart, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

// Product 인터페이스는 이제 lib/db.ts에서 가져옵니다
import { type Product } from "@/lib/db"

interface ProductListProps {
  products: Product[]
  loading?: boolean
  sortBy: string
  onSortChange: (value: string) => void
  viewMode: "list" | "grid"
  onViewModeChange: (mode: "list" | "grid") => void
  onProductClick?: (item: string) => void
}

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

  const ProductRow = ({ product }: { product: Product }) => (
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

              <div className="space-y-1 text-sm">
                <div>
                  <span className="font-medium text-gray-700">관련기사</span>
                  <span className="ml-2 text-gray-600">{product.articles[0]?.title}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">사용기</span>
                  <span className="ml-2 text-gray-600">
                    [{product.name} 구매 후기] {product.reviews[0]?.content}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                <span>등록일 {product.registeredDate}</span>
                <span>브랜드로그</span>
                <span>상품외견 {product.reviewCount}</span>
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

              <div className="text-xs text-gray-400 mt-2">주요부품 &gt; {product.category}</div>
            </div>

            <div className="text-right flex-shrink-0">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {formatPrice(product.finalPrice)}
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
    <div className="bg-white">
      <div className="border-b border-gray-200">
        <div className="flex items-center space-x-0">
          <button className="px-4 py-3 border-b-2 border-blue-600 text-blue-600 font-medium">
            전체 ({products.length.toLocaleString()})
          </button>
          <button className="px-4 py-3 text-gray-600 hover:text-gray-900">
            전통시장 ({countByVendorType(products, '전통시장')})
          </button>
          <button className="px-4 py-3 text-gray-600 hover:text-gray-900">
            대형마트 ({countByVendorType(products, '마트')})
          </button>
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
  )
}
