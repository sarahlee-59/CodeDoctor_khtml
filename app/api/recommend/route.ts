import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region");
  const industry = searchParams.get("industry");
  const time = searchParams.get("time");

  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "0409",
      database: "seoyeon_db",
    });

    // ✅ 시간대 조건 (컬럼명은 반드시 백틱 처리)
    let timeCondition = "`당월_매출_금액`"; // 기본값
    if (time === "오전") timeCondition = "`시간대_06~11_매출_금액`";
    else if (time === "점심") timeCondition = "`시간대_11~14_매출_금액`";
    else if (time === "저녁") timeCondition = "`시간대_17~21_매출_금액`";
    // 추가 시간대 필요하면 else if 추가

    // ✅ SQL 쿼리
    const [rows] = await connection.execute(
      `
      SELECT 상권_코드_명, 서비스_업종_코드_명, 당월_매출_금액, ${timeCondition} AS 선택시간대_매출
      FROM cold_spots
      WHERE (? = '전체' OR 시군구명 = ?)
        AND (? = '전체' OR 서비스_업종_코드_명 LIKE ?)
        AND ColdSpot = 1
      ORDER BY ${timeCondition} ASC
      LIMIT 5
      `,
      [
        region || "전체",
        region || "전체",
        industry || "전체",
        industry ? `%${industry}%` : "전체",
      ]
    );

    connection.end();
    return NextResponse.json(rows);
  } catch (err) {
    console.error("❌ SQL 실행 오류:", err);
    return NextResponse.json(
      { error: "추천 쿼리 실행 중 오류 발생" },
      { status: 500 }
    );
  }
}


