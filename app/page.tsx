"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import SearchBar from "@/components/SearchBar"
import Filters from "@/components/Filters"
import ShopCard from "@/components/ShopCard"
import MapPlaceholder from "@/components/MapPlaceholder"
import BottomCTA from "@/components/BottomCTA"
import { useShopsData, applyFilters } from "@/lib/state"
import type { Shop, Query } from "@/lib/types"

// Skeleton component for loading state
function ShopCardSkeleton() {
  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div className="h-6 bg-gray-200 rounded w-32"></div>
        <div className="h-5 bg-gray-200 rounded w-12"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
      <div className="h-3 bg-gray-200 rounded w-20 mb-3"></div>
      <div className="h-10 bg-gray-200 rounded w-full"></div>
    </div>
  )
}

export default function HomePage() {
  const { allShops, loading, error } = useShopsData()
  const [query, setQuery] = useState<Query>({})
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null)
  const shopRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // Get unique categories from all shops
  const categories = Array.from(new Set(allShops.map((shop) => shop.category)))

  // Apply filters and limit to 50 items
  const filteredShops = applyFilters(allShops, query).slice(0, 50)
  const selectedShop = selectedShopId ? allShops.find((shop) => shop.id === selectedShopId) : null

  const handleSearch = (text: string) => {
    setQuery((prev) => ({ ...prev, text }))
  }

  const handleFilterChange = (filters: Pick<Query, "category" | "time" | "openNow" | "segment">) => {
    setQuery((prev) => ({ ...prev, ...filters }))
  }

  const handleShopFocus = (shop: Shop) => {
    setSelectedShopId(shop.id)
    // Scroll to shop card
    const element = shopRefs.current[shop.id]
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  const handleRoute = () => {
    console.log("route planned")
    // TODO: Implement actual routing logic
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">데이터를 불러오는 중 오류가 발생했습니다.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">골라먹는 AI시장</h1>
              <p className="text-gray-600 text-sm mt-1">맞춤형 상점 추천 서비스</p>
            </div>
            <nav className="flex items-center gap-4">
              <Link
                href="/report"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded transition-colors"
              >
                상점 제보
              </Link>
              <Link
                href="/admin/reports"
                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded transition-colors"
              >
                관리자
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar onSubmit={handleSearch} />
        </div>

        {/* Desktop: 2-column layout, Mobile: stacked */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Filters + Shop List */}
          <div className="space-y-6">
            {/* Filters */}
            <Filters
              categories={categories}
              value={{
                category: query.category,
                time: query.time,
                openNow: query.openNow,
                segment: query.segment,
              }}
              onChange={handleFilterChange}
            />

            {/* Shop List */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  상점 목록 ({loading ? "로딩중..." : `${filteredShops.length}개`})
                </h2>
                {query.text && <span className="text-sm text-gray-500">검색: "{query.text}"</span>}
              </div>

              <div className="space-y-4">
                {loading ? (
                  // Skeleton loading state
                  Array.from({ length: 3 }).map((_, index) => <ShopCardSkeleton key={index} />)
                ) : filteredShops.length === 0 ? (
                  // Empty state
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg
                        className="w-16 h-16 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-medium">조건에 맞는 상점이 없습니다</p>
                    <p className="text-gray-400 text-sm mt-1">필터 조건을 변경해보세요</p>
                  </div>
                ) : (
                  // Shop cards
                  filteredShops.map((shop) => (
                    <div
                      key={shop.id}
                      ref={(el) => {
                        shopRefs.current[shop.id] = el
                      }}
                    >
                      <ShopCard shop={shop} selected={selectedShopId === shop.id} onFocus={handleShopFocus} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Map */}
          <div className="order-first lg:order-last">
            <div className="sticky top-6">
              <MapPlaceholder selected={selectedShop} />
            </div>
          </div>
        </div>
      </main>

      {/* Bottom CTA - Sticky on mobile, regular on desktop */}
      <div className="lg:max-w-7xl lg:mx-auto lg:px-4 lg:pb-6">
        <BottomCTA onRoute={handleRoute} disabled={loading || filteredShops.length === 0} />
      </div>

      {/* Mobile bottom padding to account for sticky CTA */}
      <div className="h-20 lg:hidden" aria-hidden="true"></div>
    </div>
  )
}
