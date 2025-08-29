"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import type { ReportData } from "@/lib/types"

export default function ReportPage() {
  const [formData, setFormData] = useState<ReportData>({
    name: "",
    reason: "폐업",
    memo: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      setError("상호명을 입력해주세요.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("제보 전송에 실패했습니다.")
      }

      // Success
      setShowSuccess(true)
      setFormData({ name: "", reason: "폐업", memo: "" })

      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof ReportData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (error) setError(null) // Clear error when user starts typing
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              aria-label="홈으로 돌아가기"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">상점 정보 제보</h1>
              <p className="text-gray-600 text-sm mt-1">잘못된 정보를 신고해주세요</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Success Toast */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              제보가 성공적으로 전송되었습니다. 감사합니다!
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Shop Name */}
            <div>
              <label htmlFor="shop-name" className="block text-sm font-medium text-gray-700 mb-2">
                상호명 <span className="text-red-500">*</span>
              </label>
              <input
                id="shop-name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="예: 청량리 할머니 순대국"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                aria-describedby={error ? "error-message" : undefined}
              />
            </div>

            {/* Reason */}
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                제보 사유
              </label>
              <select
                id="reason"
                value={formData.reason}
                onChange={(e) => handleInputChange("reason", e.target.value as ReportData["reason"])}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="폐업">폐업</option>
                <option value="이전">이전</option>
                <option value="정보오류">정보오류</option>
              </select>
            </div>

            {/* Memo */}
            <div>
              <label htmlFor="memo" className="block text-sm font-medium text-gray-700 mb-2">
                상세 내용
              </label>
              <textarea
                id="memo"
                value={formData.memo}
                onChange={(e) => handleInputChange("memo", e.target.value)}
                placeholder="추가로 알려주실 내용이 있다면 작성해주세요..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div id="error-message" className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                  isSubmitting
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                }`}
              >
                {isSubmitting ? "전송 중..." : "제보하기"}
              </button>

              <Link
                href="/"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-center"
              >
                취소
              </Link>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">제보 안내</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 정확한 정보 제공을 위해 상호명을 정확히 입력해주세요</li>
            <li>• 제보해주신 내용은 검토 후 반영됩니다</li>
            <li>• 허위 신고는 서비스 이용에 제한이 있을 수 있습니다</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
