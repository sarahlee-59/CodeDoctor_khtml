"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Calendar, Package, MapPin } from "lucide-react"
import Image from "next/image"

interface CompareItem {
  item: string
  images: string[]
  spec: Record<string, string>
  updatedAt: string
}

interface ItemSpecProps {
  item: CompareItem | null
  loading: boolean
}

export function ItemSpec({ item, loading }: ItemSpecProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, "0")}.${date.getDate().toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-48 w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!item) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>상품 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">상품 정보를 불러올 수 없습니다</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {item.item}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Product Gallery */}
          <div className="space-y-2">
            <div className="aspect-square relative rounded-lg overflow-hidden bg-muted">
              <Image
                src={item.images[0] || "/placeholder.svg?height=300&width=300"}
                alt={`${item.item} 상품 이미지`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">이미지는 예시입니다.</p>
          </div>

          <Separator />

          {/* Product Specifications */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              상품 정보
            </h4>
            <div className="space-y-2">
              {Object.entries(item.spec).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{key}</span>
                  <Badge variant="outline" className="text-xs">
                    {value}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Update Info */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>업데이트: {formatDate(item.updatedAt)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Additional Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">구매 가이드</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <div>
                <div className="font-medium">전통시장 구매 팁</div>
                <div className="text-muted-foreground text-xs">
                  오전 시간대에 방문하면 더 신선한 상품을 구매할 수 있습니다.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
              <div>
                <div className="font-medium">온누리상품권 활용</div>
                <div className="text-muted-foreground text-xs">전통시장에서 10% 할인 혜택을 받을 수 있습니다.</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <div>
                <div className="font-medium">품질 확인</div>
                <div className="text-muted-foreground text-xs">구매 전 상품 상태를 직접 확인하고 구매하세요.</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
