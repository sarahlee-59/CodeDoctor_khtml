"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { fetcher } from "@/lib/fetcher"
import { Download, MapPin } from "lucide-react"

interface MarketZone {
  id: string
  centroid: [number, number]
  scoreZ: number // Z세대 (20대)
  score3040: number // 30-40대
  score5060: number // 50-60대
  shopCount: number // 점포 수
  category: string // 상권 카테고리
}

interface ConsumerFlowData {
  meta: {
    updatedAt: string
    marketName: string
  }
  zones: MarketZone[]
}

interface ProcessedZone extends MarketZone {
  currentFlow: number
  relativeIndex: number
}

export function HeatmapTab() {
  const [data, setData] = useState<ConsumerFlowData | null>(null)
  const [selectedAge, setSelectedAge] = useState<string>("Z")
  const [selectedDay, setSelectedDay] = useState<string>("weekday")
  const [selectedTime, setSelectedTime] = useState<string>("morning")
  const [loading, setLoading] = useState(true)
  const [selectedZone, setSelectedZone] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const flowData = await fetcher<ConsumerFlowData>("/api/heatmap.json")
        setData(flowData)
      } catch (error) {
        console.error("Failed to load consumer flow data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const getProcessedZones = (): ProcessedZone[] => {
    if (!data?.zones) return []

    const zones = data.zones.map((zone) => {
      let baseFlow = 0
      switch (selectedAge) {
        case "Z":
          baseFlow = zone.scoreZ || 0
          break
        case "3040":
          baseFlow = zone.score3040 || 0
          break
        case "5060":
          baseFlow = zone.score5060 || 0
          break
      }

      let modifier = 1
      if (selectedDay === "weekend") modifier *= 1.3
      if (selectedTime === "afternoon") modifier *= 0.8
      if (selectedTime === "evening") modifier *= 1.1

      const currentFlow = Math.min(100, baseFlow * modifier)
      const relativeIndex = Math.round(
        Math.min(
          100,
          (currentFlow /
            Math.max(
              ...data.zones.map((z) => {
                let maxFlow = 0
                switch (selectedAge) {
                  case "Z":
                    maxFlow = z.scoreZ || 0
                    break
                  case "3040":
                    maxFlow = z.score3040 || 0
                    break
                  case "5060":
                    maxFlow = z.score5060 || 0
                    break
                }
                return maxFlow * modifier
              }),
            )) *
            100,
        ),
      )

      return {
        ...zone,
        currentFlow: isNaN(currentFlow) ? 0 : currentFlow,
        relativeIndex: isNaN(relativeIndex) ? 0 : relativeIndex,
      }
    })

    return zones.sort((a, b) => b.currentFlow - a.currentFlow)
  }

  const processedZones = getProcessedZones()
  const topHotZones = processedZones.slice(0, 3)
  const topViewportZones = processedZones.slice(0, 5)

  const getMarkerColor = (flow: number) => {
    if (flow > 80) return "#ef4444" // 매우 높은 유동인구
    if (flow > 60) return "#f97316" // 높은 유동인구
    if (flow > 40) return "#eab308" // 보통 유동인구
    if (flow > 20) return "#22c55e" // 낮은 유동인구
    return "#3b82f6" // 매우 낮은 유동인구
  }

  const getMarkerSize = (flow: number) => {
    return Math.max(8, Math.min(25, (flow / 100) * 20 + 5))
  }

  const handleZoneClick = (zone: ProcessedZone) => {
    setSelectedZone(zone.id)
    // 맵 기능은 나중에 서드파티 API로 구현 예정
  }

  const handleExport = async () => {
    try {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (ctx) {
        canvas.width = 800
        canvas.height = 600
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, 800, 600)
        ctx.fillStyle = "#000000"
        ctx.font = "16px Arial"
        ctx.fillText("동대문 전통시장 - 세대별 유동인구 분석", 20, 30)
        ctx.fillText(`업데이트: ${data?.meta?.updatedAt || "2025-08-20"}`, 20, 60)

        topHotZones.forEach((zone, index) => {
          ctx.fillText(`${index + 1}. ${zone.id}: ${zone.relativeIndex}점 (${zone.category})`, 20, 100 + index * 30)
        })

        const link = document.createElement("a")
        link.download = `market-flow-${Date.now()}.png`
        link.href = canvas.toDataURL()
        link.click()
      }
    } catch (error) {
      console.error("Export failed:", error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="office-card rounded-sm">
          <CardHeader className="office-header">
            <CardTitle>세대별 유동인구 분석</CardTitle>
            <CardDescription>동대문 전통시장 연령대별 소비자 흐름</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96 bg-muted border border-border flex items-center justify-center">
              <p className="text-muted-foreground">상권 데이터 로딩 중...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="office-card rounded-sm">
        <CardHeader className="office-header border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">세대별 유동인구 분석</CardTitle>
              <CardDescription className="text-sm">동대문구 내 연령대별 소비 밀도 핫존 가시화</CardDescription>
            </div>
            <Button onClick={handleExport} className="office-button rounded-sm" size="sm">
              <Download className="w-4 h-4 mr-2" />
              지도 내보내기
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col gap-4">
            <div className="office-grid grid-cols-3 gap-0 p-0">
              <div className="office-header flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium">연령대</span>
                <Select value={selectedAge} onValueChange={setSelectedAge}>
                  <SelectTrigger className="office-input rounded-sm w-24 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-sm">
                    <SelectItem value="Z">20대</SelectItem>
                    <SelectItem value="3040">30-40대</SelectItem>
                    <SelectItem value="5060">50-60대</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="office-header flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium">요일</span>
                <Select value={selectedDay} onValueChange={setSelectedDay}>
                  <SelectTrigger className="office-input rounded-sm w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-sm">
                    <SelectItem value="weekday">평일</SelectItem>
                    <SelectItem value="weekend">주말</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="office-header flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium">시간대</span>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger className="office-input rounded-sm w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-sm">
                    <SelectItem value="morning">오전</SelectItem>
                    <SelectItem value="afternoon">오후</SelectItem>
                    <SelectItem value="evening">저녁</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="office-section">
              <div className="office-header mb-3">
                <span className="text-sm font-medium">선택 조건 Top 3 핫존 (상대지수 0~100)</span>
              </div>
              <div className="office-grid grid-cols-3 gap-0">
                {topHotZones.map((zone, index) => (
                  <div
                    key={zone.id}
                    className="office-header cursor-pointer hover:bg-primary/10 transition-colors px-4 py-3"
                    onClick={() => handleZoneClick(zone)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        <span className="text-sm font-medium">{index + 1}위</span>
                      </div>
                      <Badge variant={index === 0 ? "default" : "secondary"} className="rounded-sm text-xs">
                        {zone.id} ({zone.relativeIndex})
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3">
              <div className="h-96 border-2 border-border overflow-hidden bg-muted/20 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">맵 컴포넌트</p>
                  <p className="text-sm">나중에 서드파티 API로 교체 예정</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="office-header">
                <span className="text-sm font-medium">뷰포트 내 Top 5 상권</span>
              </div>
              {topViewportZones.map((zone, index) => (
                <Card
                  key={zone.id}
                  className={`office-card rounded-sm cursor-pointer transition-all hover:bg-accent/50 ${
                    selectedZone === zone.id ? "ring-2 ring-primary bg-accent/30" : ""
                  }`}
                  onClick={() => handleZoneClick(zone)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{zone.id}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="rounded-sm text-xs">
                          #{index + 1}
                        </Badge>
                        <Badge variant="outline" className="rounded-sm text-xs">
                          {zone.relativeIndex}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>소비 밀도:</span>
                        <span className="font-medium">{Math.round(zone.currentFlow)}점</span>
                      </div>
                      <div className="flex justify-between">
                        <span>점포 수:</span>
                        <span>{zone.shopCount}개</span>
                      </div>
                      <div className="mt-2">
                        <Badge variant="outline" className="rounded-sm text-xs">
                          {zone.category}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="office-section">
            <div className="office-grid grid-cols-4 gap-0">
              <div className="office-header text-center px-4 py-4">
                <div className="text-xl font-bold text-primary">{processedZones.length}</div>
                <div className="text-xs text-muted-foreground mt-1">분석 상권</div>
              </div>
              <div className="office-header text-center px-4 py-4">
                <div className="text-xl font-bold text-primary">
                  {processedZones.length > 0
                    ? Math.round(
                        processedZones.reduce((sum, zone) => sum + zone.currentFlow, 0) / processedZones.length,
                      )
                    : 0}
                </div>
                <div className="text-xs text-muted-foreground mt-1">평균 유동인구</div>
              </div>
              <div className="office-header text-center px-4 py-4">
                <div className="text-xl font-bold text-primary">{topHotZones[0]?.id || "N/A"}</div>
                <div className="text-xs text-muted-foreground mt-1">최고 상권</div>
              </div>
              <div className="office-header text-center px-4 py-4">
                <div className="text-xl font-bold text-primary">
                  {processedZones.reduce((sum, zone) => sum + (zone.shopCount || 0), 0)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">총 점포 수</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
