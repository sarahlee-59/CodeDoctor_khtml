"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { Plus, Store, Eye, Trash2, AlertCircle } from "lucide-react"

interface DDMCoupon {
  id: string
  storeName: string // 상호
  category: string // 카테고리
  couponName: string // 쿠폰명
  discountType: "fixed" | "percent" // 타입 (정액/정율)
  discountValue: number // 값
  validUntil: string // 유효기간
  notes: string // 비고
  createdAt: string
  isActive: boolean
}

export function MerchantPortalTab() {
  const [coupons, setCoupons] = useState<DDMCoupon[]>([])

  const [storeName, setStoreName] = useState("")
  const [category, setCategory] = useState("")
  const [couponName, setCouponName] = useState("")
  const [discountType, setDiscountType] = useState<"fixed" | "percent">("fixed")
  const [discountValue, setDiscountValue] = useState("")
  const [validUntil, setValidUntil] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    const savedCoupons = localStorage.getItem("ddm_coupons")
    if (savedCoupons) {
      try {
        const parsedCoupons = JSON.parse(savedCoupons)
        setCoupons(parsedCoupons)
      } catch (error) {
        console.error("Failed to parse saved coupons:", error)
      }
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newCoupon: DDMCoupon = {
      id: Date.now().toString(),
      storeName,
      category,
      couponName,
      discountType,
      discountValue: Number(discountValue),
      validUntil,
      notes,
      createdAt: new Date().toISOString().split("T")[0],
      isActive: true,
    }

    const updatedCoupons = [...coupons, newCoupon]
    setCoupons(updatedCoupons)
    localStorage.setItem("ddm_coupons", JSON.stringify(updatedCoupons))

    // Reset form
    setStoreName("")
    setCategory("")
    setCouponName("")
    setDiscountType("fixed")
    setDiscountValue("")
    setValidUntil("")
    setNotes("")
  }

  const deleteCoupon = (couponId: string) => {
    const updatedCoupons = coupons.filter((coupon) => coupon.id !== couponId)
    setCoupons(updatedCoupons)
    localStorage.setItem("ddm_coupons", JSON.stringify(updatedCoupons))
  }

  const previewCoupon = (coupon: DDMCoupon) => {
    alert(
      `쿠폰 미리보기:\n\n상호: ${coupon.storeName}\n쿠폰명: ${coupon.couponName}\n할인: ${coupon.discountType === "fixed" ? `${coupon.discountValue.toLocaleString()}원` : `${coupon.discountValue}%`}\n유효기간: ${coupon.validUntil}\n비고: ${coupon.notes}`,
    )
  }

  return (
    <div className="space-y-4">
      <Card className="office-card rounded-sm">
        <CardHeader className="office-header border-b border-border">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Store className="w-5 h-5" />
            상인 포털
          </CardTitle>
          <CardDescription className="text-sm">
            상인이 쿠폰/이벤트 등록 → 추천/혜택 화면에서 자동 반영 (데모)
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="office-grid grid-cols-2 gap-0">
        <Card className="office-card rounded-sm">
          <CardHeader className="office-header border-b border-border">
            <CardTitle className="text-sm font-medium">쿠폰 등록</CardTitle>
            <CardDescription className="text-xs">
              새로운 할인 쿠폰을 등록하여 고객에게 혜택을 제공하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="office-grid grid-cols-2 gap-0">
                <div className="office-header px-3 py-2">
                  <Label htmlFor="store-name" className="text-xs font-medium">
                    상호 *
                  </Label>
                </div>
                <div className="px-3 py-2 border-l border-border">
                  <Input
                    id="store-name"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="예: 동대문 신선채소"
                    className="office-input rounded-sm h-7 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="office-grid grid-cols-2 gap-0">
                <div className="office-header px-3 py-2">
                  <Label htmlFor="category" className="text-xs font-medium">
                    카테고리 *
                  </Label>
                </div>
                <div className="px-3 py-2 border-l border-border">
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger className="office-input rounded-sm h-7 text-xs">
                      <SelectValue placeholder="카테고리 선택" />
                    </SelectTrigger>
                    <SelectContent className="rounded-sm">
                      <SelectItem value="채소">채소</SelectItem>
                      <SelectItem value="정육">정육</SelectItem>
                      <SelectItem value="반찬">반찬</SelectItem>
                      <SelectItem value="간식">간식</SelectItem>
                      <SelectItem value="의류">의류</SelectItem>
                      <SelectItem value="기타">기타</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="office-grid grid-cols-2 gap-0">
                <div className="office-header px-3 py-2">
                  <Label htmlFor="coupon-name" className="text-xs font-medium">
                    쿠폰명 *
                  </Label>
                </div>
                <div className="px-3 py-2 border-l border-border">
                  <Input
                    id="coupon-name"
                    value={couponName}
                    onChange={(e) => setCouponName(e.target.value)}
                    placeholder="예: 신선 채소 특가 할인"
                    className="office-input rounded-sm h-7 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="office-grid grid-cols-4 gap-0">
                <div className="office-header px-3 py-2">
                  <Label className="text-xs font-medium">타입 *</Label>
                </div>
                <div className="px-3 py-2 border-l border-border">
                  <Select value={discountType} onValueChange={(value: "fixed" | "percent") => setDiscountType(value)}>
                    <SelectTrigger className="office-input rounded-sm h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-sm">
                      <SelectItem value="fixed">정액</SelectItem>
                      <SelectItem value="percent">정율</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="office-header px-3 py-2">
                  <Label htmlFor="discount-value" className="text-xs font-medium">
                    값 *
                  </Label>
                </div>
                <div className="px-3 py-2 border-l border-border">
                  <Input
                    id="discount-value"
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={discountType === "fixed" ? "원" : "%"}
                    className="office-input rounded-sm h-7 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="office-grid grid-cols-2 gap-0">
                <div className="office-header px-3 py-2">
                  <Label htmlFor="valid-until" className="text-xs font-medium">
                    유효기간 *
                  </Label>
                </div>
                <div className="px-3 py-2 border-l border-border">
                  <Input
                    id="valid-until"
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="office-input rounded-sm h-7 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="office-grid grid-cols-1 gap-0">
                <div className="office-header px-3 py-2">
                  <Label htmlFor="notes" className="text-xs font-medium">
                    비고
                  </Label>
                </div>
                <div className="px-3 py-2 border-t border-border">
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="쿠폰 사용 조건이나 추가 정보를 입력하세요"
                    className="office-input rounded-sm text-xs"
                    rows={2}
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" className="office-button rounded-sm w-full h-8 text-xs" size="sm">
                  <Plus className="w-3 h-3 mr-2" />
                  쿠폰 등록하기
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="office-card rounded-sm">
          <CardHeader className="office-header border-b border-border">
            <CardTitle className="text-sm font-medium">등록된 쿠폰</CardTitle>
            <CardDescription className="text-xs">현재 등록된 쿠폰 목록 (localStorage 저장)</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {coupons.length > 0 ? (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {coupons.map((coupon) => (
                  <div key={coupon.id} className="office-card rounded-sm p-3 hover:bg-accent/30">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{coupon.couponName}</h4>
                        <p className="text-xs text-muted-foreground">{coupon.storeName}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => previewCoupon(coupon)} className="h-6 w-6 p-0">
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCoupon(coupon.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="rounded-sm text-xs">
                        {coupon.category}
                      </Badge>
                      <Badge variant="secondary" className="rounded-sm text-xs">
                        {coupon.discountType === "fixed"
                          ? `${coupon.discountValue.toLocaleString()}원`
                          : `${coupon.discountValue}%`}
                      </Badge>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>유효기간: {coupon.validUntil}</div>
                      <div>등록일: {coupon.createdAt}</div>
                      {coupon.notes && <div>비고: {coupon.notes}</div>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Store className="w-8 h-8 mx-auto mb-3 opacity-50" />
                <p className="text-sm">등록된 쿠폰이 없습니다.</p>
                <p className="text-xs">첫 번째 쿠폰을 등록해보세요.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="office-card rounded-sm border-orange-300 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-orange-900 mb-1 text-sm">결제 및 정산 안내</h3>
              <p className="text-xs text-orange-700 mb-1">현재는 쿠폰 등록 데모 기능만 제공됩니다.</p>
              <p className="text-xs text-orange-700">
                <strong>운영 시 PG/정산 연동 예정</strong> - 실제 서비스에서는 온누리상품권 결제 시스템과 연동하여 자동
                정산이 이루어집니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="office-grid grid-cols-3 gap-0">
        <Card className="office-card rounded-sm">
          <CardContent className="office-header text-center px-4 py-4">
            <div className="text-xl font-bold text-primary">{coupons.length}</div>
            <div className="text-xs text-muted-foreground mt-1">등록된 쿠폰</div>
          </CardContent>
        </Card>

        <Card className="office-card rounded-sm">
          <CardContent className="office-header text-center px-4 py-4">
            <div className="text-xl font-bold text-green-600">{coupons.filter((c) => c.isActive).length}</div>
            <div className="text-xs text-muted-foreground mt-1">활성 쿠폰</div>
          </CardContent>
        </Card>

        <Card className="office-card rounded-sm">
          <CardContent className="office-header text-center px-4 py-4">
            <div className="text-xl font-bold text-blue-600">{new Set(coupons.map((c) => c.category)).size}</div>
            <div className="text-xs text-muted-foreground mt-1">카테고리 수</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
