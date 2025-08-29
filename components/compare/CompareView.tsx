"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Share, AlertTriangle, Printer, Truck } from "lucide-react"
import { fetcher } from "@/lib/fetcher"
import Image from "next/image"

interface CompareItem {
  item: string
  images: string[]
  spec: Record<string, string>
  updatedAt: string
}

interface PriceSeries {
  series: Array<{
    date: string
    traditionalMarket: number
    largeRetail: number
  }>
}

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

export function CompareView({ initialItem = "배추" }: { initialItem?: string }) {
  const [selectedItem, setSelectedItem] = useState(initialItem)
  const [itemData, setItemData] = useState<CompareItem | null>(null)
  const [priceData, setPriceData] = useState<PriceSeries | null>(null)
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)

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

  const getLowestOffer = () => {
    if (!offers.length) return null
    const offersWithBenefits = offers.map((offer) => ({
      ...offer,
      benefits: calculateBenefits(offer),
    }))
    return offersWithBenefits.reduce((lowest, current) =>
      current.benefits.finalPay < lowest.benefits.finalPay ? current : lowest,
    )
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // 실제 가격 데이터 API 사용
        const priceResponse = await fetch(`/api/price-index-real?product=${selectedItem}&period=1month`)
        let priceData: PriceSeries | null = null
        
        if (priceResponse.ok) {
          const data = await priceResponse.json()
          if (data.products && data.products.length > 0) {
            // API 응답을 PriceSeries 형태로 변환
            priceData = {
              series: data.products[0].data.map((item: any) => ({
                date: item.date,
                traditionalMarket: item.traditionalMarket,
                largeRetail: item.largeRetail
              }))
            }
          }
        }

        // 더미 데이터는 일단 기본값으로 설정
        const itemData: CompareItem = {
          name: `${selectedItem} 1포기 특급`,
          category: "채소류",
          origin: "국산",
          grade: "특급",
          unit: "1포기",
          images: ["/fresh-cabbage.png"]
        }

        const offers: Offer[] = [
          {
            shop: "동대문종합시장",
            channel: "전통시장",
            price: priceData?.series[priceData.series.length - 1]?.traditionalMarket || 3000,
            ship: 0,
            onnuriRate: 0.1,
            distanceKm: 2.5
          },
          {
            shop: "이마트",
            channel: "대형마트",
            price: priceData?.series[priceData.series.length - 1]?.largeRetail || 3500,
            ship: 0,
            onnuriRate: 0,
            card: { name: "신세계카드", cashback: 0.02 }
          }
        ]

        setItemData(itemData)
        setPriceData(priceData)
        setOffers(offers)
      } catch (error) {
        console.error("Failed to load data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [selectedItem])

  const formatter = new Intl.NumberFormat("ko-KR")
  const lowestOffer = getLowestOffer()

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">로딩 중...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4 text-sm">
            <Button
              variant="ghost"
              size="sm"
              className="bg-green-500 text-white hover:bg-green-600 px-3 py-1 h-auto text-xs"
            >
              전체 카테고리
            </Button>
            <Select defaultValue="home">
              <SelectTrigger className="w-40 h-8 text-xs border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="home">컴퓨터/노트북/조립PC</SelectItem>
                <SelectItem value="vegetables">채소류</SelectItem>
                <SelectItem value="meat">정육류</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="cabbage">
              <SelectTrigger className="w-32 h-8 text-xs border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cabbage">배추</SelectItem>
                <SelectItem value="radish">무</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="grade">
              <SelectTrigger className="w-32 h-8 text-xs border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grade">등급별</SelectItem>
                <SelectItem value="premium">특급</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="detail">
              <SelectTrigger className="w-32 h-8 text-xs border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="detail">선택하세요</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">동대문 전통시장 {selectedItem} 1포기 특급</h1>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs px-2 py-1 mr-2">
                VS컴퓨터
              </Badge>
              <div className="text-sm text-gray-600 mt-2 leading-relaxed">
                {selectedItem} 특급 | 원산지: 국산 | 중량: 2-3kg | 등급: 특급 | 포장: 개별포장 | 보관방법: 냉장보관 |
                유통기한: 수확 후 7일 | 농약: 무농약 | 인증: 친환경인증 | 배송: 당일배송 | 판매자: 동대문종합시장 |
                연락처: 02-123-4567 | 영업시간: 06:00-18:00 | 휴무: 일요일 | 주차: 가능 | 카드결제: 가능 | 온누리상품권:
                사용가능 | A/S: 교환/환불 가능
              </div>
            </div>
            <div className="flex items-center gap-3 ml-6">
              <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-2 px-3">
                <Heart className="h-4 w-4" />
                <span className="text-xs">관심</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-2 px-3">
                <Share className="h-4 w-4" />
                <span className="text-xs">공유</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-2 px-3">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-xs">신고</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-2 px-3">
                <Printer className="h-4 w-4" />
                <span className="text-xs">인쇄</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left: Product Images */}
          <div className="col-span-4">
            <div className="space-y-4">
              <div className="aspect-square bg-white border rounded-lg overflow-hidden">
                <Image
                  src="/fresh-cabbage.png"
                  alt={selectedItem}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4].map((index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-16 h-16 border rounded overflow-hidden ${
                      selectedImage === index ? "border-blue-500" : "border-gray-300"
                    }`}
                  >
                    <Image
                      src={`/abstract-geometric-shapes.png?height=64&width=64&query=${selectedItem} ${index + 1}`}
                      alt={`${selectedItem} ${index + 1}`}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
                <button className="w-16 h-16 border border-gray-300 rounded flex items-center justify-center bg-gray-50 text-xs font-medium">
                  광고상품
                </button>
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <p>등록월: 2025.01.</p>
                <p>제조사: 동대문시장</p>
                <p>이미지출처: 제조사제공</p>
              </div>
              <Button variant="outline" size="sm" className="w-full text-xs bg-transparent">
                📊 EMTEK 브랜드로그
              </Button>
            </div>
          </div>

          {/* Center: Price Comparison */}
          <div className="col-span-5">
            <div className="space-y-4">
              {/* Price Header */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">최저가</div>
                  <div className="text-3xl font-bold text-blue-600">
                    {lowestOffer ? `${formatter.format(lowestOffer.benefits.finalPay)}원` : "로딩 중..."}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="bg-black text-white hover:bg-gray-800 px-4 py-2 text-sm">최저가 구매하기</Button>
                  <Button variant="outline" className="px-4 py-2 text-sm bg-transparent">
                    딜러 가격
                  </Button>
                </div>
              </div>

              {/* Vendor Comparison */}
              <div className="bg-white border rounded-lg">
                <div className="border-b px-4 py-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">멤버십/카드결제 최대 혜택가</h3>
                    <Button variant="ghost" size="sm" className="text-blue-600 text-sm">
                      다나와 최저가보다 낮아요! ▼
                    </Button>
                  </div>
                </div>

                <div className="divide-y">
                  {offers.slice(0, 8).map((offer, index) => {
                    const benefits = calculateBenefits(offer)
                    return (
                      <div key={index} className="px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-8 bg-gray-100 rounded flex items-center justify-center">
                            <span className="text-xs font-medium text-red-600">{offer.shop}</span>
                          </div>
                          <div className="text-sm font-medium">{formatter.format(benefits.finalPay)}원</div>
                          {offer.card && <span className="text-xs text-gray-500">{offer.card.name} 결제 시</span>}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          {offer.ship > 0 ? (
                            <div className="flex items-center gap-1">
                              <Truck className="h-3 w-3" />
                              <span>{formatter.format(offer.ship)}원</span>
                            </div>
                          ) : (
                            <span className="text-blue-600">무료배송</span>
                          )}
                          <span>최대 {Math.floor(Math.random() * 30) + 1}일</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Shopping Mall List */}
              <div className="bg-white border rounded-lg">
                <div className="border-b px-4 py-3">
                  <h3 className="font-medium">쇼핑몰별 최저가</h3>
                  <div className="text-sm text-gray-500 mt-1">배송비 포함</div>
                </div>

                <div className="divide-y">
                  {offers.slice(0, 10).map((offer, index) => {
                    const benefits = calculateBenefits(offer)
                    return (
                      <div key={index} className="px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-20 h-6 bg-gray-100 rounded flex items-center justify-center">
                            <span className="text-xs font-medium">{offer.shop}</span>
                          </div>
                          {offer.coupon && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                              쿠폰
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-medium">{formatter.format(benefits.finalPay)}원</div>
                            {offer.ship > 0 && (
                              <div className="text-xs text-gray-500">+배송비 {formatter.format(offer.ship)}원</div>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 w-16 text-right">
                            최대 {Math.floor(Math.random() * 30) + 1}일
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Price Chart & Related Products */}
          <div className="col-span-3">
            <div className="space-y-4">
              {/* Price Chart */}
              <Card className="bg-white">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-sm">최저가 추이</h3>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                      👤
                    </Button>
                  </div>
                  <div className="text-right mb-2">
                    <div className="text-lg font-bold text-red-600">
                      {lowestOffer ? `${formatter.format(lowestOffer.benefits.finalPay)}원` : "로딩 중..."}
                    </div>
                    <div className="text-xs text-gray-500">239몰 📊</div>
                  </div>

                  {/* Simple price trend visualization */}
                  <div className="h-32 bg-gray-50 rounded mb-3 flex items-end justify-center p-2">
                    <div className="text-xs text-gray-500">가격 추이 차트</div>
                  </div>

                  <div className="flex justify-center gap-4 text-xs">
                    <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded">1개월</button>
                    <button className="px-3 py-1 text-gray-500">3개월</button>
                    <button className="px-3 py-1 text-gray-500">6개월</button>
                    <button className="px-3 py-1 text-gray-500">12개월</button>
                    <button className="px-3 py-1 text-gray-500">24개월</button>
                  </div>
                </div>
              </Card>

              {/* Related Products */}
              <Card className="bg-white">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-sm">상품의견 137건</h3>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        ‹
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        ›
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs text-gray-600">
                    <p>• 리얼리 Vector V100 게이스에 장착 가능한가요?</p>
                    <p>• GIGABYTE B860M DS3H 제이씨현 마이크론 186378 마이크론 Crucial P510 M.2 N...</p>
                  </div>
                </div>
              </Card>

              <Card className="bg-white">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-sm">다른 고객이 함께 본 상품</h3>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        ‹
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        ›
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="aspect-square bg-gray-100 rounded overflow-hidden">
                        <Image
                          src={`/related-products-display.png?height=80&width=80&query=related product ${i}`}
                          alt={`관련 상품 ${i}`}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
