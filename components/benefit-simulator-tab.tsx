"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { fetcher } from "@/lib/fetcher"
import {
  Calculator,
  CreditCard,
  Gift,
  Percent,
  TrendingDown,
  Wallet,
  Plus,
  History,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react"
import { toast } from "sonner"
import { useVoucher } from "@/hooks/use-voucher"

interface BenefitInput {
  originalPrice: number
  quantity: number
  onnuriRate: number // 온누리상품권 할인율 (기본 10%)
  cardCashback: number // 카드 캐시백 (%)
  couponType: "fixed" | "percent" // 쿠폰 타입 (정액/정율)
  couponValue: number // 쿠폰 값
}

interface BaselineData {
  products: {
    [key: string]: {
      marketPrice: number
      martPrice: number
    }
  }
  lastUpdated: string
}

interface DiscountStep {
  name: string
  type: "원가" | "온누리" | "카드" | "쿠폰"
  amount: number
  rate?: number
  runningTotal: number
  icon: React.ReactNode
}

export function BenefitSimulatorTab() {
  const {
    balance: voucherBalance,
    loading: voucherLoading,
    addVoucher,
    deductVoucher,
    getRecentTransactions,
    clearData,
  } = useVoucher()

  const [input, setInput] = useState<BenefitInput>({
    originalPrice: 0,
    quantity: 1,
    onnuriRate: 10,
    cardCashback: 0,
    couponType: "fixed",
    couponValue: 0,
  })

  const [baselineData, setBaselineData] = useState<BaselineData | null>(null)
  const [discountSteps, setDiscountSteps] = useState<DiscountStep[]>([])
  const [finalPrice, setFinalPrice] = useState(0)
  const [martComparison, setMartComparison] = useState(0)
  const [loading, setLoading] = useState(true)

  const [addAmount, setAddAmount] = useState<number>(0)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [useVoucherInCalculation, setUseVoucherInCalculation] = useState(false)

  const handleAddVoucher = () => {
    if (addAmount <= 0) {
      toast.error("충전 금액을 입력해주세요")
      return
    }

    try {
      addVoucher(addAmount, `온누리상품권 ${addAmount.toLocaleString()}원 충전`)
      toast.success(`${addAmount.toLocaleString()}원이 충전되었습니다`)
      setAddAmount(0)
      setAddDialogOpen(false)
    } catch (error) {
      toast.error("충전에 실패했습니다")
    }
  }

  const handleVoucherPayment = () => {
    if (finalPrice <= 0) {
      toast.error("결제할 금액이 없습니다")
      return
    }

    if (finalPrice > voucherBalance) {
      toast.error("온누리상품권 잔액이 부족합니다")
      return
    }

    try {
      deductVoucher(finalPrice, `상품 구매 (${input.originalPrice.toLocaleString()}원 x ${input.quantity}개)`)
      toast.success(`${finalPrice.toLocaleString()}원이 결제되었습니다`)
    } catch (error) {
      toast.error("결제에 실패했습니다")
    }
  }

  const handleClearHistory = () => {
    clearData()
    toast.success("거래 내역이 초기화되었습니다")
    setHistoryDialogOpen(false)
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetcher<BaselineData>("/api/benefit-baseline.json")
        setBaselineData(data)
      } catch (error) {
        console.error("Failed to load baseline data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const calculateBenefits = () => {
    const totalOriginal = input.originalPrice * input.quantity
    const steps: DiscountStep[] = []
    let runningTotal = totalOriginal

    // Step 1: 원가
    steps.push({
      name: "원가",
      type: "원가",
      amount: totalOriginal,
      runningTotal: runningTotal,
      icon: <Calculator className="w-4 h-4" />,
    })

    // Step 2: 온누리상품권 할인
    const onnuriDiscount = Math.round(totalOriginal * (input.onnuriRate / 100))
    runningTotal -= onnuriDiscount
    steps.push({
      name: `온누리상품권 ${input.onnuriRate}% 할인`,
      type: "온누리",
      amount: -onnuriDiscount,
      rate: input.onnuriRate,
      runningTotal: runningTotal,
      icon: <Gift className="w-4 h-4" />,
    })

    // Step 3: 카드 캐시백
    let cardDiscount = 0
    if (input.cardCashback > 0) {
      cardDiscount = Math.round(runningTotal * (input.cardCashback / 100))
      runningTotal -= cardDiscount
      steps.push({
        name: `카드 캐시백 ${input.cardCashback}%`,
        type: "카드",
        amount: -cardDiscount,
        rate: input.cardCashback,
        runningTotal: runningTotal,
        icon: <CreditCard className="w-4 h-4" />,
      })
    }

    // Step 4: 앱 쿠폰
    let couponDiscount = 0
    if (input.couponValue > 0) {
      if (input.couponType === "fixed") {
        couponDiscount = Math.min(input.couponValue, runningTotal)
      } else {
        couponDiscount = Math.round(runningTotal * (input.couponValue / 100))
      }
      runningTotal -= couponDiscount
      steps.push({
        name: `앱 쿠폰 ${input.couponType === "fixed" ? `${input.couponValue.toLocaleString()}원` : `${input.couponValue}%`}`,
        type: "쿠폰",
        amount: -couponDiscount,
        rate: input.couponType === "percent" ? input.couponValue : undefined,
        runningTotal: runningTotal,
        icon: <Percent className="w-4 h-4" />,
      })
    }

    setDiscountSteps(steps)
    setFinalPrice(Math.max(0, runningTotal))

    // 마트 평균 대비 계산 (예시로 20% 높다고 가정)
    const estimatedMartPrice = totalOriginal * 1.2
    const martSavings = Math.round(((estimatedMartPrice - runningTotal) / estimatedMartPrice) * 100)
    setMartComparison(martSavings)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>혜택 시뮬레이터</CardTitle>
            <CardDescription>온누리상품권 + 카드 캐시백 + 앱 쿠폰 합산 후 최종 체감가 계산</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-muted rounded-xl flex items-center justify-center">
              <p className="text-muted-foreground">혜택 데이터 로딩 중...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="office-card bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">온누리상품권 잔액</h3>
                <p className="text-sm text-gray-600">사용 가능한 상품권 금액</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                {voucherLoading ? (
                  <div className="text-2xl font-bold text-gray-400">로딩중...</div>
                ) : (
                  <div className="text-3xl font-bold text-green-600">{voucherBalance.toLocaleString()}원</div>
                )}
                <div className="text-sm text-gray-500">보유 잔액</div>
              </div>
              <div className="flex flex-col gap-2">
                <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4 mr-1" />
                      충전
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>온누리상품권 충전</DialogTitle>
                      <DialogDescription>충전할 금액을 입력해주세요</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="add-amount">충전 금액 (원)</Label>
                        <Input
                          id="add-amount"
                          type="number"
                          placeholder="예: 50000"
                          value={addAmount || ""}
                          onChange={(e) => setAddAmount(Number(e.target.value))}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <Button variant="outline" onClick={() => setAddAmount(10000)}>
                          1만원
                        </Button>
                        <Button variant="outline" onClick={() => setAddAmount(30000)}>
                          3만원
                        </Button>
                        <Button variant="outline" onClick={() => setAddAmount(50000)}>
                          5만원
                        </Button>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                        취소
                      </Button>
                      <Button onClick={handleAddVoucher}>충전하기</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <History className="w-4 h-4 mr-1" />
                      내역
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                      <DialogTitle>온누리상품권 거래 내역</DialogTitle>
                      <DialogDescription>최근 거래 내역을 확인할 수 있습니다</DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto">
                      {getRecentTransactions(20).length > 0 ? (
                        <div className="space-y-3">
                          {getRecentTransactions(20).map((transaction) => (
                            <div
                              key={transaction.id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    transaction.type === "add"
                                      ? "bg-green-100 text-green-600"
                                      : "bg-red-100 text-red-600"
                                  }`}
                                >
                                  {transaction.type === "add" ? (
                                    <ArrowUpCircle className="w-4 h-4" />
                                  ) : (
                                    <ArrowDownCircle className="w-4 h-4" />
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium">{transaction.description}</div>
                                  <div className="text-xs text-gray-500">
                                    {transaction.timestamp.toLocaleString("ko-KR")}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div
                                  className={`font-bold ${
                                    transaction.type === "add" ? "text-green-600" : "text-red-600"
                                  }`}
                                >
                                  {transaction.type === "add" ? "+" : "-"}
                                  {transaction.amount.toLocaleString()}원
                                </div>
                                <div className="text-xs text-gray-500">
                                  잔액: {transaction.balance.toLocaleString()}원
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>거래 내역이 없습니다</p>
                        </div>
                      )}
                    </div>
                    <DialogFooter className="flex justify-between">
                      <Button variant="outline" onClick={handleClearHistory} className="text-red-600 bg-transparent">
                        내역 초기화
                      </Button>
                      <Button onClick={() => setHistoryDialogOpen(false)}>닫기</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>구매 정보 입력</CardTitle>
            <CardDescription>상품 정보와 할인 혜택을 입력하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="original-price">원가 (원)</Label>
                <Input
                  id="original-price"
                  type="number"
                  placeholder="예: 5000"
                  value={input.originalPrice || ""}
                  onChange={(e) => setInput({ ...input, originalPrice: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">수량</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="예: 2"
                  min="1"
                  value={input.quantity || ""}
                  onChange={(e) => setInput({ ...input, quantity: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="onnuri-rate">온누리상품권 할인율 (%)</Label>
              <Input
                id="onnuri-rate"
                type="number"
                placeholder="기본 10%"
                value={input.onnuriRate || ""}
                onChange={(e) => setInput({ ...input, onnuriRate: Number(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">기본 10%, 특별 행사 시 최대 20%</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="card-cashback">카드 캐시백 (%)</Label>
              <Input
                id="card-cashback"
                type="number"
                placeholder="예: 2"
                value={input.cardCashback || ""}
                onChange={(e) => setInput({ ...input, cardCashback: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>앱 쿠폰</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={input.couponType}
                  onValueChange={(value: "fixed" | "percent") => setInput({ ...input, couponType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">정액</SelectItem>
                    <SelectItem value="percent">정율</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder={input.couponType === "fixed" ? "원" : "%"}
                  value={input.couponValue || ""}
                  onChange={(e) => setInput({ ...input, couponValue: Number(e.target.value) })}
                />
              </div>
            </div>

            <Button onClick={calculateBenefits} className="w-full" size="lg">
              <Calculator className="w-4 h-4 mr-2" />
              체감가 계산하기
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>할인 내역</CardTitle>
            <CardDescription>단계별 할인 적용 결과</CardDescription>
          </CardHeader>
          <CardContent>
            {discountSteps.length > 0 ? (
              <div className="space-y-4">
                {discountSteps.map((step, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      step.type === "원가" ? "bg-gray-50" : "bg-green-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {step.icon}
                      <div>
                        <div className="font-medium">{step.name}</div>
                        {step.rate && <div className="text-xs text-muted-foreground">{step.rate}% 할인 적용</div>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${step.type === "원가" ? "text-gray-900" : "text-green-600"}`}>
                        {step.amount.toLocaleString()}원
                      </div>
                      <div className="text-sm text-muted-foreground">잔액: {step.runningTotal.toLocaleString()}원</div>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-lg font-semibold">최종 체감가</div>
                    <div className="text-2xl font-bold text-primary">{finalPrice.toLocaleString()}원</div>
                  </div>

                  {martComparison > 0 && (
                    <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                      <TrendingDown className="w-3 h-3 mr-1" />
                      마트 평균 대비 -{martComparison}%
                    </Badge>
                  )}

                  {finalPrice > 0 && (
                    <div className="mt-4">
                      <Button
                        onClick={handleVoucherPayment}
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={finalPrice > voucherBalance}
                      >
                        <Wallet className="w-4 h-4 mr-2" />
                        온누리상품권으로 결제하기
                      </Button>
                      {finalPrice > voucherBalance && (
                        <p className="text-xs text-red-500 mt-2 text-center">
                          잔액이 부족합니다 (부족: {(finalPrice - voucherBalance).toLocaleString()}원)
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>구매 정보를 입력하고</p>
                  <p>계산 버튼을 눌러주세요</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {discountSteps.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="rounded-2xl">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {(input.originalPrice * input.quantity).toLocaleString()}원
              </div>
              <div className="text-sm text-muted-foreground">원가 총액</div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {(input.originalPrice * input.quantity - finalPrice).toLocaleString()}원
              </div>
              <div className="text-sm text-muted-foreground">총 절약액</div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {input.originalPrice * input.quantity > 0
                  ? Math.round(
                      ((input.originalPrice * input.quantity - finalPrice) / (input.originalPrice * input.quantity)) *
                        100,
                    )
                  : 0}
                %
              </div>
              <div className="text-sm text-muted-foreground">총 할인율</div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{finalPrice.toLocaleString()}원</div>
              <div className="text-sm text-muted-foreground">최종 체감가</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
