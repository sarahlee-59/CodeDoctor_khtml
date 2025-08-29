"use client"

import type { Shop, Query, Segment } from "@/lib/types"

interface FiltersProps {
  categories: Array<Shop["category"]>
  value: Pick<Query, "category" | "time" | "openNow" | "segment">
  onChange: (next: Pick<Query, "category" | "time" | "openNow" | "segment">) => void
}

export default function Filters({ categories, value, onChange }: FiltersProps) {
  const currentHour = new Date().getHours()
  const displayTime = value.time ?? currentHour

  const handleCategoryChange = (category: Shop["category"] | undefined) => {
    onChange({ ...value, category })
  }

  const handleTimeChange = (time: number) => {
    onChange({ ...value, time })
  }

  const handleOpenNowChange = (openNow: boolean) => {
    onChange({ ...value, openNow })
  }

  const handleSegmentChange = (segment: Segment) => {
    onChange({ ...value, segment: value.segment === segment ? undefined : segment })
  }

  return (
    <div className="space-y-6 p-4 bg-gray-50 rounded-lg">
      {/* Category Filter */}
      <div>
        <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-2">
          카테고리
        </label>
        <select
          id="category-select"
          value={value.category || ""}
          onChange={(e) => handleCategoryChange((e.target.value as Shop["category"]) || undefined)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="카테고리 선택"
        >
          <option value="">전체</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Time Filter */}
      <div>
        <label htmlFor="time-slider" className="block text-sm font-medium text-gray-700 mb-2">
          시간: 현재 {displayTime}시
        </label>
        <input
          id="time-slider"
          type="range"
          min="0"
          max="23"
          value={displayTime}
          onChange={(e) => handleTimeChange(Number.parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          aria-label="시간 선택"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0시</span>
          <span>12시</span>
          <span>23시</span>
        </div>
      </div>

      {/* Open Now Toggle */}
      <div className="flex items-center">
        <input
          id="open-now"
          type="checkbox"
          checked={value.openNow || false}
          onChange={(e) => handleOpenNowChange(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="open-now" className="ml-2 text-sm text-gray-700">
          영업중만
        </label>
      </div>

      {/* Segment Tabs */}
      <div>
        <div className="text-sm font-medium text-gray-700 mb-2">연령대</div>
        <div className="flex gap-2">
          {(["Z", "3040", "5060"] as Segment[]).map((segment) => (
            <button
              key={segment}
              onClick={() => handleSegmentChange(segment)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                value.segment === segment
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
              aria-label={`${segment} 연령대 선택`}
              aria-pressed={value.segment === segment}
            >
              {segment}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
