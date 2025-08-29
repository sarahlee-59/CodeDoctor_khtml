"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowDown, CreditCard, Gift, Minus } from "lucide-react"

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

interface BenefitBreakdownProps {
  offer: Offer
}

export function BenefitBreakdown({ offer }: BenefitBreakdownProps) {
  const formatter = new Intl.NumberFormat("ko-KR")

  const calculateSteps = () => {
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

    return {
      base,
      onnuri,
      afterOnnuri,
      card,
      afterCard,
      coupon,
      finalPay,
    }
  }

  const steps = calculateSteps()
  const totalSavings = steps.base - steps.finalPay
  const savingsRate = ((totalSavings / steps.base) * 100).toFixed(1)

  const StepCard = ({
    title,
    amount,
    isReduction = false,
    icon,
    description,
  }: {
    title: string
    amount: number
    isReduction?: boolean
    icon?: React.ReactNode
    description?: string
  }) => (
    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
      <div className="flex items-center gap-2">
        {icon}
        <div>
          <div className="font-medium text-sm">{title}</div>
          {description && <div className="text-xs text-muted-foreground">{description}</div>}
        </div>
      </div>
      <div className={`font-bold ${isReduction ? "text-green-600" : "text-foreground"}`}>
        {isReduction && <Minus className="inline h-3 w-3 mr-1" />}
        {formatter.format(amount)}원
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Gift className="h-5 w-5" />
            혜택 계산 과정
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <StepCard
            title="기본 금액"
            amount={steps.base}
            description={
              offer.ship > 0
                ? `상품가 ${formatter.format(offer.price)}원 + 배송비 ${formatter.format(offer.ship)}원`
                : `상품가 ${formatter.format(offer.price)}원`
            }
          />

          {steps.onnuri > 0 && (
            <>
              <div className="flex justify-center">
                <ArrowDown className="h-4 w-4 text-muted-foreground" />
              </div>
              <StepCard
                title="온누리상품권 할인"
                amount={steps.onnuri}
                isReduction
                icon={<Gift className="h-4 w-4 text-green-600" />}
                description={`${(offer.onnuriRate * 100).toFixed(0)}% 할인`}
              />
            </>
          )}

          {steps.card > 0 && (
            <>
              <div className="flex justify-center">
                <ArrowDown className="h-4 w-4 text-muted-foreground" />
              </div>
              <StepCard
                title={`${offer.card?.name} 카드 캐시백`}
                amount={steps.card}
                isReduction
                icon={<CreditCard className="h-4 w-4 text-blue-600" />}
                description={`${((offer.card?.cashback ?? 0) * 100).toFixed(1)}% 캐시백`}
              />
            </>
          )}

          {steps.coupon > 0 && (
            <>
              <div className="flex justify-center">
                <ArrowDown className="h-4 w-4 text-muted-foreground" />
              </div>
              <StepCard
                title="쿠폰 할인"
                amount={steps.coupon}
                isReduction
                icon={<Gift className="h-4 w-4 text-purple-600" />}
                description={
                  offer.coupon?.type === "flat" ? "정액 할인" : `${((offer.coupon?.value ?? 0) * 100).toFixed(0)}% 할인`
                }
              />
            </>
          )}

          <Separator />

          <div className="bg-primary/5 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-lg">최종 체감가</span>
              <span className="text-2xl font-bold text-primary">{formatter.format(steps.finalPay)}원</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">총 절약 금액</span>
              <span className="font-medium text-green-600">
                <Minus className="inline h-3 w-3 mr-1" />
                {formatter.format(totalSavings)}원 ({savingsRate}%)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">상점 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">상점명</span>
            <span className="font-medium">{offer.shop}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">채널</span>
            <Badge variant="outline">{offer.channel}</Badge>
          </div>
          {offer.distanceKm && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">거리</span>
              <span>{offer.distanceKm}km</span>
            </div>
          )}
          <Separator />
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• 온누리상품권: 전통시장에서 사용 가능한 정부 지원 상품권</p>
            <p>• 카드 캐시백: 결제 후 다음 달 청구서에서 차감</p>
            <p>• 쿠폰 할인: 즉시 할인 적용 (중복 적용 불가할 수 있음)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
