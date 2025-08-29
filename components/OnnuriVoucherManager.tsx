"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Gift, Plus, Minus, History } from "lucide-react"
import { useVoucher } from "@/hooks/use-voucher"

export default function OnnuriVoucherManager() {
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const { 
    balance, 
    transactions, 
    addVoucher, 
    deductVoucher, 
    getRecentTransactions 
  } = useVoucher()

  const handleAddVoucher = () => {
    const numAmount = parseInt(amount)
    if (numAmount <= 0) {
      alert("올바른 금액을 입력해주세요.")
      return
    }
    
    try {
      addVoucher(numAmount, description || "온누리상품권 충전")
      setAmount("")
      setDescription("")
      alert(`${numAmount.toLocaleString()}원이 충전되었습니다.`)
    } catch (error) {
      alert("충전 중 오류가 발생했습니다.")
    }
  }

  const handleDeductVoucher = () => {
    const numAmount = parseInt(amount)
    if (numAmount <= 0) {
      alert("올바른 금액을 입력해주세요.")
      return
    }
    
    try {
      deductVoucher(numAmount, description || "온누리상품권 사용")
      setAmount("")
      setDescription("")
      alert(`${numAmount.toLocaleString()}원이 사용되었습니다.`)
    } catch (error) {
      alert(error instanceof Error ? error.message : "사용 중 오류가 발생했습니다.")
    }
  }

  const recentTransactions = getRecentTransactions(5)

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">온누리 상품권 관리</h1>
        <p className="text-gray-600">온누리 상품권 잔액을 관리하고 거래 내역을 확인하세요</p>
      </div>

      {/* 잔액 표시 */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Gift className="w-8 h-8 text-green-600" />
            <h2 className="text-2xl font-bold text-green-800">현재 잔액</h2>
          </div>
          <div className="text-4xl font-bold text-green-700 mb-2">
            {balance.toLocaleString()}원
          </div>
          <p className="text-green-600">온누리 상품권으로 사용 가능한 금액입니다</p>
        </CardContent>
      </Card>

      {/* 충전/사용 폼 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 충전 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="w-5 h-5 text-green-600" />
              <span>온누리 상품권 충전</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                충전 금액
              </label>
              <Input
                type="number"
                placeholder="충전할 금액을 입력하세요"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                메모 (선택사항)
              </label>
              <Input
                placeholder="충전 사유를 입력하세요"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full"
              />
            </div>
            <Button 
              onClick={handleAddVoucher}
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={!amount || parseInt(amount) <= 0}
            >
              <Plus className="w-4 h-4 mr-2" />
              충전하기
            </Button>
          </CardContent>
        </Card>

        {/* 사용 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Minus className="w-5 h-5 text-red-600" />
              <span>온누리 상품권 사용</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                사용 금액
              </label>
              <Input
                type="number"
                placeholder="사용할 금액을 입력하세요"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full"
                max={balance}
              />
              <p className="text-xs text-gray-500 mt-1">
                최대 사용 가능: {balance.toLocaleString()}원
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                메모 (선택사항)
              </label>
              <Input
                placeholder="사용 사유를 입력하세요"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full"
              />
            </div>
            <Button 
              onClick={handleDeductVoucher}
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={!amount || parseInt(amount) <= 0 || parseInt(amount) > balance}
            >
              <Minus className="w-4 h-4 mr-2" />
              사용하기
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 최근 거래 내역 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="w-5 h-5 text-blue-600" />
            <span>최근 거래 내역</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">거래 내역이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      transaction.type === "add" ? "bg-green-500" : "bg-red-500"
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        {transaction.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      transaction.type === "add" ? "text-green-600" : "text-red-600"
                    }`}>
                      {transaction.type === "add" ? "+" : "-"}{transaction.amount.toLocaleString()}원
                    </p>
                    <p className="text-sm text-gray-500">
                      잔액: {transaction.balance.toLocaleString()}원
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
