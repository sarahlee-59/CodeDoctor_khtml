"use client"

import { useState, useEffect } from "react"
import type { Shop, Query } from "./types"

export function useShopsData() {
  const [allShops, setAllShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/data/shops.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load shops data")
        return res.json()
      })
      .then((data: Shop[]) => {
        setAllShops(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return { allShops, loading, error }
}

export function applyFilters(shops: Shop[], query: Query): Shop[] {
  let filtered = [...shops]

  // Category filter
  if (query.category) {
    filtered = filtered.filter((shop) => shop.category === query.category)
  }

  // Time and openNow filter
  const currentHour = query.time ?? new Date().getHours()
  if (query.openNow || query.time !== undefined) {
    filtered = filtered.filter((shop) => {
      // Handle shops that close after midnight
      if (shop.close < shop.open) {
        return currentHour >= shop.open || currentHour < shop.close
      }
      return currentHour >= shop.open && currentHour < shop.close
    })
  }

  // Sort by segment preference (if specified)
  if (query.segment) {
    filtered.sort((a, b) => {
      const aMatch = a.age_fit === query.segment
      const bMatch = b.age_fit === query.segment
      if (aMatch && !bMatch) return -1
      if (!aMatch && bMatch) return 1
      return 0
    })
  }

  return filtered
}
