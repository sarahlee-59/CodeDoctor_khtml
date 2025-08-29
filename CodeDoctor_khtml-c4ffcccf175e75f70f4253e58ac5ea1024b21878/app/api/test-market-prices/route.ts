import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET() {
  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "wogus!204",
      database: "seoyeon_db",
    });

    // 간단한 쿼리 테스트
    const [rows] = await connection.execute(
      "SELECT prod_name, pub_date, j_avg_price, m_avg_price FROM market_prices WHERE prod_name = 'cabbage' ORDER BY pub_date DESC LIMIT 5"
    );

    console.log("🔍 테스트 쿼리 결과:", rows);

    connection.end();
    return NextResponse.json({
      success: true,
      data: rows,
      count: (rows as any[]).length
    });

  } catch (err) {
    console.error("❌ 테스트 API 오류:", err);
    return NextResponse.json(
      { error: "테스트 중 오류 발생", details: err },
      { status: 500 }
    );
  }
}
