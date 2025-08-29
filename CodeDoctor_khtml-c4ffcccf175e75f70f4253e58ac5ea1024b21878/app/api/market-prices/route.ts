import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const product = searchParams.get("product");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "wogus!204",
      database: "seoyeon_db",
    });

    // 기본 쿼리
    let sql = `
      SELECT prod_name, pub_date, j_avg_price, m_avg_price
      FROM market_prices
      WHERE 1=1
    `;
    const params: any[] = [];

    // 제품명 필터
    if (product && product !== "전체") {
      sql += " AND prod_name = ?";
      params.push(product);
    }

    // 날짜 범위 필터
    if (startDate) {
      sql += " AND pub_date >= ?";
      params.push(startDate);
    }
    if (endDate) {
      sql += " AND pub_date <= ?";
      params.push(endDate);
    }

    // 정렬 및 제한
    sql += " ORDER BY pub_date DESC LIMIT 100";

    console.log("🔍 Market Prices 쿼리:", sql);
    console.log("🔍 파라미터:", params);

    const [rows] = await connection.execute(sql, params);

    console.log("🔍 쿼리 결과:", rows);

    connection.end();
    return NextResponse.json(rows);
  } catch (err) {
    console.error("❌ Market Prices API 오류:", err);
    return NextResponse.json(
      { error: "시장 가격 데이터 조회 중 오류 발생" },
      { status: 500 }
    );
  }
}
