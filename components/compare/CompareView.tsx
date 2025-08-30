"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Share, AlertTriangle, Printer, Truck } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
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
            shop: "전통시장",
            channel: "전통시장",
            price: priceData?.series[priceData.series.length - 1]?.traditionalMarket || 3000,
            ship: 0,
            onnuriRate: 0.1,
            distanceKm: 2.5
          },
          {
            shop: "대형유통사",
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

  // 상품별 이미지 매핑 - public/{상품명}.jpg 형식 사용
  const getProductImage = (productName: string) => {
    // 상품명을 영어로 변환 (예: 호두 -> walnut)
    const productNameMap: Record<string, string> = {
      "배추": "cabbage",
      "무": "radish", 
      "사과": "apple",
      "호두": "walnut"
    }
    
    const englishName = productNameMap[productName] || productName.toLowerCase()
    return `/${englishName}.jpg`
  }

  const getProductThumbnails = (productName: string) => {
    const baseImage = getProductImage(productName)
    return [
      baseImage,
      "/abstract-geometric-shapes.png",
      "/abstract-geometric-shapes.png",
      "/abstract-geometric-shapes.png",
      "/abstract-geometric-shapes.png"
    ]
  }

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">로딩 중...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      

      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-start justify-between">
                         <div className="flex-1">
               <h1 className="text-2xl font-bold mb-2">동대문 전통시장 {selectedItem}</h1>
               <div className="text-sm text-gray-600 mt-2 leading-relaxed">
                {selectedItem} 특급 | 원산지: 국산 | 중량: 2-3kg | 등급: 특급 | 포장: 개별포장 | 보관방법: 냉장보관 |
                유통기한: 수확 후 7일 | 농약: 무농약 | 인증: 친환경인증 | 배송: 당일배송 | 판매자: 전통시장 |
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
                   src={getProductThumbnails(selectedItem)[selectedImage]}
                   alt={selectedItem}
                   width={400}
                   height={400}
                   className="w-full h-full object-cover"
                 />
               </div>
                             <div className="flex gap-2">
                 {getProductThumbnails(selectedItem).map((imageSrc, index) => (
                   <button
                     key={index}
                     onClick={() => setSelectedImage(index)}
                     className={`w-16 h-16 border rounded overflow-hidden ${
                       selectedImage === index ? "border-blue-500" : "border-gray-300"
                     }`}
                   >
                     <Image
                       src={imageSrc}
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
                    <h3 className="font-medium">온누리상품권 결제가</h3>
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

                  {/* Price trend chart */}
                  <div className="h-32 mb-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={priceData?.series || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 10 }}
                          tickFormatter={(value: string) => {
                            const date = new Date(value)
                            return `${date.getMonth() + 1}/${date.getDate()}`
                          }}
                        />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(value: number) => `${value.toLocaleString()}원`} />
                        <Tooltip
                          formatter={(value: number, name: string) => {
                            const labels: Record<string, string> = {
                              largeRetail: "대형유통사",
                              traditionalMarket: "전통시장",
                            }
                            return [`${value.toLocaleString()}원`, labels[name] || name]
                          }}
                          labelFormatter={(label: string) => {
                            const date = new Date(label)
                            return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="largeRetail"
                          stroke="#ef4444"
                          strokeWidth={2}
                          name="대형유통사"
                          dot={{ r: 2 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="traditionalMarket"
                          stroke="#22c55e"
                          strokeWidth={2}
                          name="전통시장"
                          dot={{ r: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
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
