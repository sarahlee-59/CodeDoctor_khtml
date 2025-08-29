"use client"

import type { Shop } from "@/lib/types"

interface ShopCardProps {
  shop: Shop
  selected?: boolean
  onFocus?: (shop: Shop) => void
}

export default function ShopCard({ shop, selected = false, onFocus }: ShopCardProps) {
  const handleMapClick = () => {
    onFocus?.(shop)
  }

  return (
    <div
      className={`p-4 border rounded-lg transition-all hover:shadow-md ${
        selected ? "border-blue-500 bg-blue-50 shadow-md" : "border-gray-200 bg-white hover:border-gray-300"
      }`}
      role="article"
      aria-label={`${shop.name} 상점 정보`}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg text-gray-900">{shop.name}</h3>
        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">{shop.category}</span>
      </div>

      <div className="text-sm text-gray-600 mb-3">
        영업시간: {shop.open}시 - {shop.close === 24 ? "24시" : `${shop.close}시`}
      </div>

      {shop.age_fit && <div className="text-xs text-blue-600 mb-3">추천 연령대: {shop.age_fit}</div>}

      <button
        onClick={handleMapClick}
        className="w-full px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        aria-label={`${shop.name} 지도에서 보기`}
      >
        지도 보기
      </button>
    </div>
  )
}
