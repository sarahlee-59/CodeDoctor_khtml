import { NextResponse } from "next/server"
import mysql from "mysql2/promise"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const region = searchParams.get("region") || ""
  const industry = searchParams.get("industry") || ""
  const time = searchParams.get("time") || ""

  console.log("🔍 추천 API 호출:", { region, industry, time })

  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "wogus!204",
      database: "seoyeon_db",
    })

    // 시간대별 조건 설정
    let timeCondition = ""
    if (time === "오전") {
      timeCondition = "`시간대_06~12_매출_금액`"
    } else if (time === "오후") {
      timeCondition = "`시간대_12~18_매출_금액`"
    } else if (time === "저녁") {
      timeCondition = "`시간대_18~21_매출_금액`"
    } else if (time === "심야") {
      timeCondition = "`시간대_21~24_매출_금액`"
    }

    // 지역명 처리 (서울특별시 추가)
    let processedRegion = region
    if (!region.includes("서울특별시")) {
      processedRegion = `서울특별시 ${region}`
    }

    console.log("🔍 처리된 지역명:", processedRegion)
    console.log("🔍 시간대 조건:", timeCondition)

    const query = `
      SELECT 
        상권명,
        업종명,
        ${timeCondition} as 매출금액,
        유동인구_총합계,
        ColdSpot
      FROM cold_spots 
      WHERE 상권명 LIKE ? 
        AND 업종명 = ? 
        AND ColdSpot = 1
      ORDER BY ${timeCondition} DESC
      LIMIT 10
    `

    const [rows] = await connection.execute(query, [`%${processedRegion}%`, industry])
    
    console.log("🔍 쿼리 결과:", rows)

    connection.end()

    return NextResponse.json({
      recommendations: rows,
      region: processedRegion,
      industry,
      time,
      count: (rows as any[]).length
    })

  } catch (error) {
    console.error("❌ 추천 API 오류:", error)
    return NextResponse.json(
      { error: "추천 데이터 조회 중 오류 발생", details: error },
      { status: 500 }
    )
  }
}