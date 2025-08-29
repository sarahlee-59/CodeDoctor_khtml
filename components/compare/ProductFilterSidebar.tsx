"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"

interface FilterOption {
  id: string
  name: string
  count: number
  min?: number
  max?: number
}

interface FilterData {
  categories: FilterOption[]
  origins: FilterOption[]
  vendors: FilterOption[]
  benefits: FilterOption[]
  priceRanges: FilterOption[]
}

interface ProductFilterSidebarProps {
  filters: FilterData
  selectedFilters: {
    categories: string[]
    origins: string[]
    vendors: string[]
    benefits: string[]
    priceRange: [number, number]
  }
  onFilterChange: (filterType: string, value: any) => void
  onClearFilters: () => void
}

const ProductFilterSidebar = ({
  filters,
  selectedFilters,
  onFilterChange,
  onClearFilters,
}: ProductFilterSidebarProps) => {
  const [priceRange, setPriceRange] = useState<[number, number]>(selectedFilters.priceRange)

  const handleCheckboxChange = (filterType: string, optionId: string, checked: boolean) => {
    const currentValues = selectedFilters[filterType as keyof typeof selectedFilters] as string[]
    if (checked) {
      onFilterChange(filterType, [...currentValues, optionId])
    } else {
      onFilterChange(
        filterType,
        currentValues.filter((id) => id !== optionId),
      )
    }
  }

  const handlePriceRangeChange = (value: number[]) => {
    const newRange: [number, number] = [value[0], value[1]]
    setPriceRange(newRange)
    onFilterChange("priceRange", newRange)
  }

  const FilterSection = ({
    title,
    options,
    filterType,
    selectedValues,
  }: {
    title: string
    options: FilterOption[]
    filterType: string
    selectedValues: string[]
  }) => (
    <div className="office-section">
      <h3 className="office-section-title">{title}</h3>
      <div className="space-y-3">
        {options.map((option) => (
          <div key={option.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`${filterType}-${option.id}`}
                checked={selectedValues.includes(option.id)}
                onCheckedChange={(checked) => handleCheckboxChange(filterType, option.id, checked as boolean)}
                className="office-checkbox"
              />
              <label htmlFor={`${filterType}-${option.id}`} className="text-sm font-medium cursor-pointer">
                {option.name}
              </label>
            </div>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 office-badge">{option.count}</span>
          </div>
        ))}
      </div>
    </div>
  )

  const activeFilterCount =
    selectedFilters.categories.length +
    selectedFilters.origins.length +
    selectedFilters.vendors.length +
    selectedFilters.benefits.length +
    (priceRange[0] > 0 || priceRange[1] < 100000 ? 1 : 0)

  return (
    <div className="w-80 bg-background border-r office-border h-full overflow-y-auto">
      {/* Header */}
      <div className="office-header p-4 border-b office-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">필터</h2>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-xs office-button-ghost">
              <X className="w-3 h-3 mr-1" />
              초기화 ({activeFilterCount})
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Search */}
        <div className="office-section">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="상품명 검색..." className="pl-10 office-input" />
          </div>
        </div>

        {/* Category Filter */}
        <FilterSection
          title="카테고리"
          options={filters.categories}
          filterType="categories"
          selectedValues={selectedFilters.categories}
        />

        {/* Origin Filter */}
        <FilterSection
          title="원산지"
          options={filters.origins}
          filterType="origins"
          selectedValues={selectedFilters.origins}
        />

        {/* Vendor Filter */}
        <FilterSection
          title="판매처"
          options={filters.vendors}
          filterType="vendors"
          selectedValues={selectedFilters.vendors}
        />

        {/* Benefits Filter */}
        <FilterSection
          title="혜택 유형"
          options={filters.benefits}
          filterType="benefits"
          selectedValues={selectedFilters.benefits}
        />

        {/* Price Range Filter */}
        <div className="office-section">
          <h3 className="office-section-title">가격대</h3>
          <div className="space-y-4">
            <Slider
              value={priceRange}
              onValueChange={handlePriceRangeChange}
              max={100000}
              min={0}
              step={1000}
              className="office-slider"
            />
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={priceRange[0]}
                onChange={(e) => handlePriceRangeChange([Number.parseInt(e.target.value) || 0, priceRange[1]])}
                className="office-input text-xs"
                placeholder="최소"
              />
              <span className="text-xs text-muted-foreground">~</span>
              <Input
                type="number"
                value={priceRange[1]}
                onChange={(e) => handlePriceRangeChange([priceRange[0], Number.parseInt(e.target.value) || 100000])}
                className="office-input text-xs"
                placeholder="최대"
              />
              <span className="text-xs text-muted-foreground">원</span>
            </div>
          </div>
        </div>

        {/* Quick Price Filters */}
        <div className="office-section">
          <h3 className="office-section-title">빠른 가격 선택</h3>
          <div className="grid grid-cols-2 gap-2">
            {filters.priceRanges.map((range) => (
              <Button
                key={range.id}
                variant="outline"
                size="sm"
                onClick={() => handlePriceRangeChange([range.min || 0, range.max || 100000])}
                className="text-xs office-button-outline"
              >
                {range.name}
                <span className="ml-1 text-xs text-muted-foreground">({range.count})</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export { ProductFilterSidebar }
export default ProductFilterSidebar
