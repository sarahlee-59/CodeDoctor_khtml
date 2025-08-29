interface FetcherOptions {
  cache?: boolean
  fallback?: any
}

const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function fetcher<T>(url: string, options: FetcherOptions = {}): Promise<T> {
  const { cache: useCache = true, fallback = null } = options

  // Check cache first
  if (useCache && cache.has(url)) {
    const cached = cache.get(url)!
    if (Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data
    }
  }

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // Cache the result
    if (useCache) {
      cache.set(url, { data, timestamp: Date.now() })
    }

    return data
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error)
    return fallback
  }
}

export function clearCache(url?: string) {
  if (url) {
    cache.delete(url)
  } else {
    cache.clear()
  }
}

export function formatKRW(amount: number): string {
  return (
    new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace("₩", "") + "원"
  )
}

export interface Offer {
  shop: string
  channel: string
  price: number
  ship: number
  card?: { name: string; cashback: number } | null
  coupon?: { type: "flat" | "percent"; value: number } | null
  onnuriRate: number
  distanceKm?: number | null
}

export function calculateBenefits(offer: Offer) {
  const base = offer.price + offer.ship

  // 온누리상품권 적용 (10% 할인)
  const onnuri = Math.floor(base * offer.onnuriRate)
  const afterOnnuri = base - onnuri

  // 카드 캐시백
  const card = Math.floor(afterOnnuri * (offer.card?.cashback ?? 0))
  const afterCard = afterOnnuri - card

  // 쿠폰 할인
  const coupon = offer.coupon
    ? offer.coupon.type === "flat"
      ? offer.coupon.value
      : Math.floor(afterCard * offer.coupon.value)
    : 0

  const finalPay = Math.max(0, afterCard - coupon)

  return {
    base,
    onnuri,
    afterOnnuri,
    card,
    afterCard,
    coupon,
    finalPay,
    totalSavings: base - finalPay,
  }
}

export function detectBuySignal(series: Array<{ date: string; seoulAvg: number; martAvg: number; ddmMarket: number }>) {
  if (series.length < 3) return false

  const recent3 = series.slice(-3)
  const prices = recent3.map((s) => s.ddmMarket)

  // 3일 이동평균 기울기 계산
  const slope = (prices[2] - prices[0]) / 2

  const latest = series[series.length - 1]

  return slope < 0 && latest.ddmMarket < latest.seoulAvg && latest.ddmMarket < latest.martAvg
}
