"use client"

import { useState, useEffect, useCallback } from "react"

export interface VoucherTransaction {
  id: string
  type: "add" | "use"
  amount: number
  description: string
  timestamp: Date
  balance: number
}

export interface VoucherData {
  balance: number
  transactions: VoucherTransaction[]
}

const STORAGE_KEY = "onnuri_voucher_data"

export function useVoucher() {
  const [data, setData] = useState<VoucherData>({
    balance: 0,
    transactions: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Convert timestamp strings back to Date objects
        const transactions = parsed.transactions.map((t: any) => ({
          ...t,
          timestamp: new Date(t.timestamp),
        }))
        setData({ ...parsed, transactions })
      }
    } catch (error) {
      console.error("Failed to load voucher data:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const saveData = useCallback((newData: VoucherData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData))
      setData(newData)
    } catch (error) {
      console.error("Failed to save voucher data:", error)
    }
  }, [])

  const addVoucher = useCallback(
    (amount: number, description = "온누리상품권 충전") => {
      const transaction: VoucherTransaction = {
        id: Date.now().toString(),
        type: "add",
        amount,
        description,
        timestamp: new Date(),
        balance: data.balance + amount,
      }

      const newData: VoucherData = {
        balance: data.balance + amount,
        transactions: [transaction, ...data.transactions],
      }

      saveData(newData)
      return transaction
    },
    [data, saveData],
  )

  const deductVoucher = useCallback(
    (amount: number, description = "온누리상품권 사용") => {
      if (amount > data.balance) {
        throw new Error("잔액이 부족합니다")
      }

      const transaction: VoucherTransaction = {
        id: Date.now().toString(),
        type: "use",
        amount,
        description,
        timestamp: new Date(),
        balance: data.balance - amount,
      }

      const newData: VoucherData = {
        balance: data.balance - amount,
        transactions: [transaction, ...data.transactions],
      }

      saveData(newData)
      return transaction
    },
    [data, saveData],
  )

  const getRecentTransactions = useCallback(
    (limit = 10) => {
      return data.transactions.slice(0, limit)
    },
    [data.transactions],
  )

  const getTransactionsByType = useCallback(
    (type: "add" | "use") => {
      return data.transactions.filter((t) => t.type === type)
    },
    [data.transactions],
  )

  const clearData = useCallback(() => {
    const newData: VoucherData = {
      balance: 0,
      transactions: [],
    }
    saveData(newData)
  }, [saveData])

  return {
    balance: data.balance,
    transactions: data.transactions,
    loading,
    addVoucher,
    deductVoucher,
    getRecentTransactions,
    getTransactionsByType,
    clearData,
  }
}
