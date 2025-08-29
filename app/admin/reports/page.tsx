"use client"

import { readFile } from "fs/promises"
import { existsSync } from "fs"
import Link from "next/link"
import type { ReportRecord } from "@/lib/types"

async function getReports(): Promise<ReportRecord[]> {
  const filePath = "/tmp/reports.jsonl"

  if (!existsSync(filePath)) {
    return []
  }

  try {
    const fileContent = await readFile(filePath, "utf-8")
    const lines = fileContent.trim().split("\n").filter(Boolean)

    return lines
      .map((line) => {
        try {
          return JSON.parse(line) as ReportRecord
        } catch {
          // Skip invalid JSON lines
          return null
        }
      })
      .filter((report): report is ReportRecord => report !== null)
      .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
  } catch (error) {
    console.error("Failed to read reports file:", error)
    return []
  }
}

function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString)
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  } catch {
    return isoString
  }
}

function getReasonBadgeColor(reason: ReportRecord["reason"]): string {
  switch (reason) {
    case "폐업":
      return "bg-red-100 text-red-800"
    case "이전":
      return "bg-yellow-100 text-yellow-800"
    case "정보오류":
      return "bg-blue-100 text-blue-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default async function AdminReportsPage() {
  const reports = await getReports()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
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
                <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
                <p className="text-gray-600 text-sm mt-1">상점 정보 제보 관리</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">총 {reports.length}건의 제보</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {reports.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">제보 없음</h2>
            <p className="text-gray-500 mb-6">아직 접수된 제보가 없습니다.</p>
            <Link
              href="/report"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              제보하기
            </Link>
          </div>
        ) : (
          /* Reports Table */
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">제보 목록</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      접수일시
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상호명
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      제보 사유
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상세 내용
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.map((report, index) => (
                    <tr key={`${report.ts}-${index}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(report.ts)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{report.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getReasonBadgeColor(
                            report.reason,
                          )}`}
                        >
                          {report.reason}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {report.memo ? (
                          <div className="max-w-xs truncate" title={report.memo}>
                            {report.memo}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">내용 없음</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  총 <span className="font-medium">{reports.length}</span>건의 제보
                </div>
                <div className="text-xs text-gray-500">
                  최근 제보: {reports.length > 0 ? formatDate(reports[0].ts) : "없음"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <Link
            href="/report"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            새 제보 작성
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            새로고침
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-medium text-yellow-900 mb-2">관리자 안내</h3>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• 제보된 내용은 실시간으로 업데이트됩니다</li>
            <li>• 제보 처리 후 해당 상점 정보를 수정해주세요</li>
            <li>• 허위 신고나 스팸성 제보는 별도 관리가 필요합니다</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
