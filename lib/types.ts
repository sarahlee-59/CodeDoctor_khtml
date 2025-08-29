export type Segment = "Z" | "3040" | "5060"

export type Shop = {
  id: string
  name: string
  category: "한식" | "분식" | "전통간식" | "편의" | "기타"
  open: number // 0-23
  close: number // 0-23
  lat: number
  lng: number
  age_fit?: Segment
}

export type Query = {
  text?: string
  category?: Shop["category"]
  time?: number // hour 0-23
  openNow?: boolean
  crowd?: "low" | "mid" | "high"
  segment?: Segment
}

export type ReportData = {
  name: string
  reason: "폐업" | "이전" | "정보오류"
  memo: string
}

export type ReportRecord = ReportData & {
  ts: string
}
