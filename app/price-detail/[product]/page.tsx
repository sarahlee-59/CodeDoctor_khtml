"use client"

import { PriceIndexTab } from "@/components/price-index-tab"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function PriceDetailPage() {
  const params = useParams()
  const product = params.product as string

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl">
        {/* 헤더 */}
        <header className="office-header bg-secondary/30 border-b-2 border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  목록으로 돌아가기
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-semibold text-foreground tracking-tight">가격지수 상세 분석</h1>
                <p className="text-sm text-muted-foreground mt-1">선택된 제품의 상세 가격 비교</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-xs text-muted-foreground bg-muted px-3 py-1 border border-border">
                제품: {product}
              </div>
            </div>
          </div>
        </header>

        {/* 메인 컨텐츠 */}
        <div className="p-6">
          <PriceIndexTab />
        </div>
      </div>
    </div>
  )
}

