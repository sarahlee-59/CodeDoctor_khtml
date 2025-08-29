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

    // 시간대 조건 매핑
    let timeCondition = "";
    if (time === "오전") timeCondition = "`시간대_06~11_매출_금액`";
    else if (time === "점심") timeCondition = "`시간대_11~14_매출_금액`";
    else if (time === "저녁") timeCondition = "`시간대_17~21_매출_금액`";
    else if (time === "심야") timeCondition = "`시간대_21~24_매출_금액`";
    else timeCondition = "`당월_매출_금액`"; // 기본값

    const [rows] = await connection.execute(
      `
      SELECT 상권_코드_명, 서비스_업종_코드_명, 당월_매출_금액, ${timeCondition} AS 선택시간대_매출
      FROM cold_spots
      WHERE (? IS NULL OR 시군구명 = ?)
        AND (? IS NULL OR 서비스_업종_코드_명 LIKE ?)
      ORDER BY ${timeCondition} ASC
      LIMIT 5
      `,
      [
        region || null,
        region || null,
        industry || null,
        industry ? `%${industry}%` : null,
      ]
    );

    connection.end();
    return NextResponse.json(rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "추천 쿼리 실행 중 오류 발생" },
      { status: 500 }
    );
  }
}
