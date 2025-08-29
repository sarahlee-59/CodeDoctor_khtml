"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CreditCard, Gift, MapPin, Truck } from "lucide-react"
import { BenefitBreakdown } from "./BenefitBreakdown"

interface Offer {
  shop: string
  channel: string
  price: number
  ship: number
  card?: { name: string; cashback: number }
  coupon?: { type: "flat" | "percent"; value: number }
  onnuriRate: number
  distanceKm?: number
}

interface OfferListProps {
  offers: Offer[]
  sortBy: "혜택최저" | "기본가" | "배송비" | "가까운순"
  searchQuery: string
  loading: boolean
}

export function OfferList({ offers, sortBy, searchQuery, loading }: OfferListProps) {
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)
  const formatter = new Intl.NumberFormat("ko-KR")

  const calculateBenefits = (offer: Offer) => {
    const base = offer.price + offer.ship
    const onnuri = Math.floor(base * offer.onnuriRate)
    const afterOnnuri = base - onnuri
    const card = Math.floor(afterOnnuri * (offer.card?.cashback ?? 0))
    const afterCard = afterOnnuri - card
    const coupon = offer.coupon
      ? offer.coupon.type === "flat"
        ? offer.coupon.value
        : Math.floor(afterCard * offer.coupon.value)
      : 0
    const finalPay = Math.max(0, afterCard - coupon)

    return { base, onnuri, card, coupon, finalPay }
  }

  const sortedAndFilteredOffers = useMemo(() => {
    const filtered = offers.filter(
      (offer) =>
        offer.shop.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.channel.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    const offersWithBenefits = filtered.map((offer) => ({
      ...offer,
      benefits: calculateBenefits(offer),
    }))

    return offersWithBenefits.sort((a, b) => {
      switch (sortBy) {
        case "혜택최저":
          return a.benefits.finalPay - b.benefits.finalPay
        case "기본가":
          return a.price - b.price
        case "배송비":
          return a.ship - b.ship
        case "가까운순":
          if (!a.distanceKm && !b.distanceKm) return 0
          if (!a.distanceKm) return 1
          if (!b.distanceKm) return -1
          return a.distanceKm - b.distanceKm
        default:
          return 0
      }
    })
  }, [offers, sortBy, searchQuery])

  const getChannelBadgeVariant = (channel: string) => {
    switch (channel) {
      case "전통시장":
        return "default"
      case "대형마트":
        return "secondary"
      case "온라인몰":
        return "outline"
      default:
        return "outline"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>상점별 가격</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!sortedAndFilteredOffers.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>상점별 가격</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? "검색 결과가 없습니다" : "상점 정보를 불러올 수 없습니다"}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          상점별 가격
          <Badge variant="outline" className="text-xs">
            {sortedAndFilteredOffers.length}개 상점
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedAndFilteredOffers.map((offer, index) => (
          <div key={`${offer.shop}-${index}`} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{offer.shop}</h4>
                  <Badge variant={getChannelBadgeVariant(offer.channel)} className="text-xs">
                    {offer.channel}
                  </Badge>
                </div>
                {offer.distanceKm && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {offer.distanceKm}km
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-primary">{formatter.format(offer.benefits.finalPay)}원</div>
                <div className="text-xs text-muted-foreground">혜택최저</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">기본가:</span>
                <span>{formatter.format(offer.price)}원</span>
              </div>
              {offer.ship > 0 && (
                <div className="flex items-center gap-1">
                  <Truck className="h-3 w-3 text-muted-foreground" />
                  <span>{formatter.format(offer.ship)}원</span>
                </div>
              )}
              {offer.onnuriRate > 0 && (
                <div className="flex items-center gap-1 text-green-600">
                  <Gift className="h-3 w-3" />
                  <span>온누리 {(offer.onnuriRate * 100).toFixed(0)}%</span>
                </div>
              )}
              {offer.card && (
                <div className="flex items-center gap-1 text-blue-600">
                  <CreditCard className="h-3 w-3" />
                  <span>
                    {offer.card.name} {(offer.card.cashback * 100).toFixed(1)}%
                  </span>
                </div>
              )}
              {offer.coupon && (
                <div className="flex items-center gap-1 text-purple-600">
                  <Gift className="h-3 w-3" />
                  <span>
                    쿠폰{" "}
                    {offer.coupon.type === "flat"
                      ? `${formatter.format(offer.coupon.value)}원`
                      : `${(offer.coupon.value * 100).toFixed(0)}%`}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                onClick={() => {
                  // Demo action
                  console.log(`구매/방문: ${offer.shop}`)
                }}
              >
                {offer.channel === "온라인몰" ? "구매하기" : "방문하기"}
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => setSelectedOffer(offer)}>
                    상세
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{offer.shop} 혜택 상세</DialogTitle>
                  </DialogHeader>
                  <BenefitBreakdown offer={offer} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
