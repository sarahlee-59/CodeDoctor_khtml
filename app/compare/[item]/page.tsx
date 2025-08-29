import { Suspense } from "react"
import { CompareView } from "@/components/compare/CompareView"
import { Skeleton } from "@/components/ui/skeleton"

interface PageProps {
  params: { item: string }
}

function ComparePageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-48 flex-1" />
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <Skeleton className="h-96 w-full" />
          </div>
          <div className="lg:col-span-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="lg:col-span-3">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CompareItemPage({ params }: PageProps) {
  const initialItem = decodeURIComponent(params.item)

  return (
    <Suspense fallback={<ComparePageSkeleton />}>
      <CompareView initialItem={initialItem} />
    </Suspense>
  )
}

export function generateMetadata({ params }: PageProps) {
  const item = decodeURIComponent(params.item)

  return {
    title: `${item} 가격 비교 - 동대문 전통시장`,
    description: `${item}의 서울 평균가·대형마트 대비 동대문 전통시장 가격을 비교하고 온누리상품권, 카드 혜택을 포함한 최저가를 확인하세요.`,
    keywords: `${item}, 가격비교, 전통시장, 동대문시장, 온누리상품권, 최저가`,
  }
}
