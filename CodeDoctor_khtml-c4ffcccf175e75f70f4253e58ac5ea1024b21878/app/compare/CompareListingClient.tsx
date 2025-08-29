"use client"

import { useState, useEffect } from "react"
import ProductList from "@/components/compare/ProductList"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Grid, List, ChevronDown } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

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

interface FilterData {
  categories: Array<{ id: string; name: string; count: number }>
  origins: Array<{ id: string; name: string; count: number }>
  vendors: Array<{ id: string; name: string; count: number }>
  benefits: Array<{ id: string; name: string; count: number }>
  priceRanges: Array<{ id: string; name: string; min: number; max: number; count: number }>
}

interface CompareListingClientProps {
  onProductClick?: (item: string) => void
}

const CompareListingClient = ({ onProductClick }: CompareListingClientProps) => {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [filters, setFilters] = useState<FilterData>({
    categories: [],
    origins: [],
    vendors: [],
    benefits: [],
    priceRanges: [],
  })
  const [selectedFilters, setSelectedFilters] = useState({
    categories: [] as string[],
    origins: [] as string[],
    vendors: [] as string[],
    benefits: [] as string[],
    priceRange: [0, 100000] as [number, number],
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("latest")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/compare-list.json")
        const data = await response.json()
        setProducts(data.products)
        setFilters(data.filters)
        setFilteredProducts(data.products)
      } catch (error) {
        console.error("Failed to fetch products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Apply filters and search
  useEffect(() => {
    let filtered = [...products]

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.region.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply category filter
    if (selectedFilters.categories.length > 0) {
      filtered = filtered.filter((product) =>
        selectedFilters.categories.some((cat) => {
          switch (cat) {
            case "vegetables":
              return product.category === "채소류"
            case "livestock":
              return product.category === "축산물"
            case "fruits":
              return product.category === "과일류"
            case "seafood":
              return product.category === "수산물"
            case "grains":
              return product.category === "곡물류"
            default:
              return false
          }
        }),
      )
    }

    // Apply origin filter
    if (selectedFilters.origins.length > 0) {
      filtered = filtered.filter((product) =>
        selectedFilters.origins.some((origin) => {
          switch (origin) {
            case "domestic":
              return product.origin === "국산"
            case "imported":
              return product.origin === "수입산"
            case "local":
              return product.origin === "지역특산"
            default:
              return false
          }
        }),
      )
    }

    // Apply benefits filter
    if (selectedFilters.benefits.length > 0) {
      filtered = filtered.filter((product) =>
        selectedFilters.benefits.some((benefit) => {
          switch (benefit) {
            case "onnuri":
              return product.benefits.includes("온누리상품권")
            case "card":
              return product.benefits.includes("카드할인")
            case "coupon":
              return product.benefits.includes("쿠폰할인")
            default:
              return false
          }
        }),
      )
    }

    // Apply price range filter
    filtered = filtered.filter(
      (product) =>
        product.finalPrice >= selectedFilters.priceRange[0] && product.finalPrice <= selectedFilters.priceRange[1],
    )

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.finalPrice - b.finalPrice)
        break
      case "price-high":
        filtered.sort((a, b) => b.finalPrice - a.finalPrice)
        break
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case "distance":
        filtered.sort((a, b) => Number.parseFloat(a.distance) - Number.parseFloat(b.distance))
        break
      case "discount":
        filtered.sort((a, b) => b.discountRate - a.discountRate)
        break
      case "latest":
      default:
        filtered.sort((a, b) => new Date(b.registeredDate).getTime() - new Date(a.registeredDate).getTime())
        break
    }

    setFilteredProducts(filtered)
  }, [products, selectedFilters, searchQuery, sortBy])

  const handleFilterChange = (filterType: string, value: any) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }))
  }

  const clearFilters = () => {
    setSelectedFilters({
      categories: [],
      origins: [],
      vendors: [],
      benefits: [],
      priceRange: [0, 100000],
    })
    setSearchQuery("")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="office-header border-b office-border bg-white">
        <div className="container mx-auto px-4 py-4">
          {/* Top Navigation Tabs */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-1">
              <Button variant="outline" className="office-button-outline bg-blue-50 border-blue-200">
                전체 <span className="text-blue-600 ml-1">(13)</span>
              </Button>
              <Button variant="ghost" className="office-button-ghost">
                가격비교 <span className="text-muted-foreground ml-1">(13)</span>
              </Button>
              <Button variant="ghost" className="office-button-ghost">
                특가 상품 <span className="text-muted-foreground ml-1">(5)</span>
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="상품명 검색"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 office-input"
                />
              </div>

              <div className="flex items-center space-x-1 office-border bg-muted p-1">
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="office-button-ghost"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="office-button-ghost"
                >
                  <Grid className="w-4 h-4" />
                </Button>
              </div>

              <select className="office-input w-20" value="13" onChange={() => {}}>
                <option>13개</option>
                <option>전체</option>
              </select>
            </div>
          </div>

          {/* Filter Categories - Simplified Layout */}
          <div className="space-y-4 p-4 bg-gray-50 office-border">
            {/* Main Filter Dropdowns */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm">카테고리</span>
                  <Button
                    variant="outline"
                    className="office-button-outline text-sm bg-white border-2 border-gray-300 hover:border-blue-400"
                  >
                    전체 <ChevronDown className="w-3 h-3 ml-1" />
                    <span className="text-blue-600 ml-2">13</span>
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    className="office-button-outline text-sm bg-white border-2 border-gray-300 hover:border-blue-400"
                  >
                    원산지 <ChevronDown className="w-3 h-3 ml-1" />
                    <span className="text-muted-foreground ml-2">3</span>
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    className="office-button-outline text-sm bg-white border-2 border-gray-300 hover:border-blue-400"
                  >
                    품질등급 <ChevronDown className="w-3 h-3 ml-1" />
                    <span className="text-muted-foreground ml-2">3</span>
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    className="office-button-outline text-sm bg-white border-2 border-gray-300 hover:border-blue-400"
                  >
                    혜택유형 <ChevronDown className="w-3 h-3 ml-1" />
                    <span className="text-muted-foreground ml-2">3</span>
                  </Button>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">총 13개 상품</div>
            </div>

            {/* Detailed Filter Options */}
            <div className="grid grid-cols-4 gap-8">
              {/* 카테고리 */}
              <div className="border-2 border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-sm">카테고리</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 border border-gray-200 rounded hover:bg-gray-50">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="vegetables" />
                      <label htmlFor="vegetables" className="text-sm">
                        채소류
                      </label>
                    </div>
                    <span className="text-xs text-muted-foreground">4</span>
                  </div>
                  <div className="flex items-center justify-between p-2 border border-gray-200 rounded hover:bg-gray-50">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="fruits" />
                      <label htmlFor="fruits" className="text-sm">
                        과일류
                      </label>
                    </div>
                    <span className="text-xs text-muted-foreground">4</span>
                  </div>
                  <div className="flex items-center justify-between p-2 border border-gray-200 rounded hover:bg-gray-50">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="livestock" />
                      <label htmlFor="livestock" className="text-sm">
                        축산물
                      </label>
                    </div>
                    <span className="text-xs text-muted-foreground">3</span>
                  </div>
                  <div className="flex items-center justify-between p-2 border border-gray-200 rounded hover:bg-gray-50">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="seafood" />
                      <label htmlFor="seafood" className="text-sm">
                        수산물
                      </label>
                    </div>
                    <span className="text-xs text-muted-foreground">2</span>
                  </div>
                </div>
              </div>

              {/* 원산지 */}
              <div className="border-2 border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="font-medium text-sm">원산지</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 border border-gray-200 rounded hover:bg-gray-50">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="domestic" />
                      <label htmlFor="domestic" className="text-sm">
                        국산
                      </label>
                    </div>
                    <span className="text-xs text-muted-foreground">11</span>
                  </div>
                  <div className="flex items-center justify-between p-2 border border-gray-200 rounded hover:bg-gray-50">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="imported" />
                      <label htmlFor="imported" className="text-sm">
                        수입산
                      </label>
                    </div>
                    <span className="text-xs text-muted-foreground">2</span>
                  </div>
                </div>
              </div>

              {/* 품질등급 */}
              <div className="border-2 border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="font-medium text-sm">품질등급</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 border border-gray-200 rounded hover:bg-gray-50">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="premium" />
                      <label htmlFor="premium" className="text-sm">
                        특급
                      </label>
                    </div>
                    <span className="text-xs text-muted-foreground">5</span>
                  </div>
                  <div className="flex items-center justify-between p-2 border border-gray-200 rounded hover:bg-gray-50">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="grade1" />
                      <label htmlFor="grade1" className="text-sm">
                        1급
                      </label>
                    </div>
                    <span className="text-xs text-muted-foreground">6</span>
                  </div>
                  <div className="flex items-center justify-between p-2 border border-gray-200 rounded hover:bg-gray-50">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="grade2" />
                      <label htmlFor="grade2" className="text-sm">
                        2급
                      </label>
                    </div>
                    <span className="text-xs text-muted-foreground">2</span>
                  </div>
                </div>
              </div>

              {/* 혜택유형 */}
              <div className="border-2 border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="font-medium text-sm">혜택유형</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 border border-gray-200 rounded hover:bg-gray-50">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="onnuri" />
                      <label htmlFor="onnuri" className="text-sm">
                        온누리상품권
                      </label>
                    </div>
                    <span className="text-xs text-muted-foreground">13</span>
                  </div>
                  <div className="flex items-center justify-between p-2 border border-gray-200 rounded hover:bg-gray-50">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="card" />
                      <label htmlFor="card" className="text-sm">
                        카드할인
                      </label>
                    </div>
                    <span className="text-xs text-muted-foreground">8</span>
                  </div>
                  <div className="flex items-center justify-between p-2 border border-gray-200 rounded hover:bg-gray-50">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="coupon" />
                      <label htmlFor="coupon" className="text-sm">
                        쿠폰할인
                      </label>
                    </div>
                    <span className="text-xs text-muted-foreground">5</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Range */}
            <div className="flex items-center justify-between pt-4 border-t-2 border-gray-300">
              <div className="flex items-center space-x-4">
                <span className="font-medium text-sm">가격대</span>
                <div className="flex items-center space-x-2">
                  <Input
                    className="w-24 office-input text-sm border-2 border-gray-300 focus:border-blue-400"
                    placeholder="최소"
                  />
                  <span>~</span>
                  <Input
                    className="w-24 office-input text-sm border-2 border-gray-300 focus:border-blue-400"
                    placeholder="최대"
                  />
                  <span className="text-sm text-muted-foreground">원</span>
                  <Button className="office-button text-sm border-2 border-blue-500 bg-blue-500 hover:bg-blue-600">
                    적용
                  </Button>
                </div>
              </div>

              <Button
                variant="outline"
                className="office-button-outline text-sm bg-transparent border-2 border-gray-300 hover:border-red-400"
                onClick={clearFilters}
              >
                필터 초기화
              </Button>
            </div>
          </div>

          {/* Sort Options Row */}
          <div className="flex items-center justify-between py-3 border-t office-border">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Checkbox id="popular" checked />
                <label htmlFor="popular" className="text-sm font-medium">
                  인기상품순
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="lowprice" />
                <label htmlFor="lowprice" className="text-sm">
                  낮은가격순
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="highprice" />
                <label htmlFor="highprice" className="text-sm">
                  높은가격순
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="newest" />
                <label htmlFor="newest" className="text-sm">
                  신상품순
                </label>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <span className="text-sm">온누리할인</span>
                <Button className="bg-blue-600 text-white text-xs px-3 py-1 rounded-sm">ON</Button>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm">배송비포함</span>
                <Button variant="outline" className="text-xs px-3 py-1 rounded-sm bg-transparent">
                  OFF
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <ProductList
          products={filteredProducts}
          loading={loading}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onProductClick={onProductClick}
        />
      </div>
    </div>
  )
}

export { CompareListingClient }
export default CompareListingClient
