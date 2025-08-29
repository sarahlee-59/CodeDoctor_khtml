"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { HeatmapTab } from "@/components/heatmap-tab"
import { CompareListingClient } from "@/app/compare/CompareListingClient"
import { CompareView } from "@/components/compare/CompareView"
import { RecommendationTab } from "@/components/recommendation-tab"
import { BenefitSimulatorTab } from "@/components/benefit-simulator-tab"
import { MerchantPortalTab } from "@/components/merchant-portal-tab"
import RecommendForm from "@/components/RecommendForm"
import { ArrowLeft } from "lucide-react"

export default function HomePage() {
  const [currentView, setCurrentView] = useState<"list" | "detail">("list")
  const [selectedItem, setSelectedItem] = useState<string>("")

  const handleProductClick = (item: string) => {
    setSelectedItem(item)
    setCurrentView("detail")
  }

  const handleBackToList = () => {
    setCurrentView("list")
    setSelectedItem("")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl">
        <header className="office-header bg-secondary/30 border-b-2 border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">동대문 전통시장 상권 분석</h1>
              <p className="text-sm text-muted-foreground mt-1">세대별 소비 흐름과 상권 활성화 정보를 한눈에</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-xs text-muted-foreground bg-muted px-3 py-1 border border-border">실시간 데이터</div>
            </div>
          </div>
        </header>

        <div className="bg-card border-b border-border">
          <Tabs defaultValue="heatmap" className="w-full">
            <TabsList className="w-full h-auto p-0 bg-transparent border-0 rounded-none grid grid-cols-6">
              <TabsTrigger
                value="heatmap"
                className="rounded-none border-r border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3 px-4 text-sm font-medium"
              >
                세대별 유동인구
              </TabsTrigger>
              <TabsTrigger
                value="price-index"
                className="rounded-none border-r border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3 px-4 text-sm font-medium"
              >
                가격지수 비교
              </TabsTrigger>
              <TabsTrigger
                value="recommendation"
                className="rounded-none border-r border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3 px-4 text-sm font-medium"
              >
                추천 코스
              </TabsTrigger>
              <TabsTrigger
                value="benefit-simulator"
                className="rounded-none border-r border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3 px-4 text-sm font-medium"
              >
                온누리 혜택
              </TabsTrigger>
              <TabsTrigger
                value="merchant-portal"
                className="rounded-none border-r border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3 px-4 text-sm font-medium"
              >
                상인 포털
              </TabsTrigger>
              <TabsTrigger
                value="cold-spot"
                className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3 px-4 text-sm font-medium"
              >
                ColdSpot 분석
              </TabsTrigger>
            </TabsList>

            <div className="bg-background">
              <TabsContent value="heatmap" className="mt-0 p-6 border-0">
                <HeatmapTab />
              </TabsContent>

              <TabsContent value="price-index" className="mt-0 p-0 border-0">
                {currentView === "list" ? (
                  <CompareListingClient onProductClick={handleProductClick} />
                ) : (
                  <div>
                    <div className="p-4 border-b border-border bg-card">
                      <Button variant="ghost" onClick={handleBackToList} className="flex items-center gap-2 text-sm">
                        <ArrowLeft className="h-4 w-4" />
                        목록으로 돌아가기
                      </Button>
                    </div>
                    <CompareView initialItem={selectedItem} />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="recommendation" className="mt-0 p-6 border-0">
                <RecommendationTab />
              </TabsContent>

              <TabsContent value="benefit-simulator" className="mt-0 p-6 border-0">
                <BenefitSimulatorTab />
              </TabsContent>

              <TabsContent value="merchant-portal" className="mt-0 p-6 border-0">
                <MerchantPortalTab />
              </TabsContent>

              <TabsContent value="cold-spot" className="mt-0 p-6 border-0">
                <RecommendForm />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
