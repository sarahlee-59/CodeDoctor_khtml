"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingDown } from "lucide-react"

interface PriceData {
  date: string
  traditionalMarket: number
  largeRetail: number
}

interface PriceTrendProps {
  data: { series: PriceData[] } | null
  loading: boolean
}

export function PriceTrend({ data, loading }: PriceTrendProps) {
  const formatter = new Intl.NumberFormat("ko-KR")

  const formatTooltip = (value: number, name: string) => {
    const labels: Record<string, string> = {
      traditionalMarket: "전통시장",
      largeRetail: "대형마트",
    }
    return [`${formatter.format(value)}원`, labels[name] || name]
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  const getBuySignal = () => {
    if (!data?.series || data.series.length < 3) return false

    const recent3 = data.series.slice(-3)
    const avgSlope = (recent3[2].traditionalMarket - recent3[0].traditionalMarket) / 2
    const latest = data.series[data.series.length - 1]

    return avgSlope < 0 && latest.traditionalMarket < latest.largeRetail
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!data?.series?.length) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">데이터를 불러올 수 없습니다</div>
    )
  }

  const chartData = data.series.map((item) => ({
    ...item,
    date: formatDate(item.date),
  }))

  const isBuySignal = getBuySignal()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">최근 가격 변동 추이</div>
        {isBuySignal && (
          <Badge className="bg-green-500 hover:bg-green-600">
            <TrendingDown className="h-3 w-3 mr-1" />
            BUY 신호
          </Badge>
        )}
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: "#e2e8f0" }}
              axisLine={{ stroke: "#e2e8f0" }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: "#e2e8f0" }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickFormatter={(value) => `${formatter.format(value)}원`}
            />
            <Tooltip
              formatter={formatTooltip}
              labelFormatter={(label) => `${label}`}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "12px" }}
              formatter={(value) => {
                const labels: Record<string, string> = {
                  traditionalMarket: "전통시장",
                  largeRetail: "대형마트",
                }
                return labels[value] || value
              }}
            />
            <Line
              type="monotone"
              dataKey="largeRetail"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: "#ef4444", strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: "#ef4444", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="traditionalMarket"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ fill: "#22c55e", strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: "#22c55e", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {isBuySignal && (
        <div className="text-xs text-muted-foreground bg-green-50 p-3 rounded-lg border border-green-200">
          <div className="font-medium text-green-800 mb-1">BUY 신호 조건 충족</div>
          <div className="text-green-700">
            • 전통시장가가 대형유통사보다 낮음
            <br />• 3일 이동평균 하락 추세
          </div>
        </div>
      )}
    </div>
  )
}
