import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import type { ReportData, ReportRecord } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const body: ReportData = await request.json()

    // Validate required fields
    if (!body.name || !body.reason) {
      return NextResponse.json({ error: "상호명과 제보 사유는 필수입니다." }, { status: 400 })
    }

    // Validate reason
    if (!["폐업", "이전", "정보오류"].includes(body.reason)) {
      return NextResponse.json({ error: "올바르지 않은 제보 사유입니다." }, { status: 400 })
    }

    // Create report record with timestamp
    const reportRecord: ReportRecord = {
      ts: new Date().toISOString(),
      name: body.name.trim(),
      reason: body.reason,
      memo: body.memo?.trim() || "",
    }

    // Ensure /tmp directory exists
    const tmpDir = "/tmp"
    if (!existsSync(tmpDir)) {
      await mkdir(tmpDir, { recursive: true })
    }

    const filePath = path.join(tmpDir, "reports.jsonl")
    const jsonLine = JSON.stringify(reportRecord) + "\n"

    // Append to file
    try {
      await writeFile(filePath, jsonLine, { flag: "a" })
    } catch (error) {
      console.error("Failed to write to reports file:", error)
      return NextResponse.json({ error: "제보 저장에 실패했습니다." }, { status: 500 })
    }

    return NextResponse.json({ message: "제보가 성공적으로 접수되었습니다.", id: reportRecord.ts }, { status: 200 })
  } catch (error) {
    console.error("Report API error:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}

// Only allow POST method
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}
