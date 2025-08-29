import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const product = searchParams.get("product") || "cabbage";
  const period = searchParams.get("period") || "1month";

  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "0409",
      database: "seoyeon_db",
    });

    // 기간별 데이터 개수 설정
    let limitCount = 30;
    
    switch (period) {
      case "1week":
        limitCount = 7;
        break;
      case "1month":
        limitCount = 30;
        break;
      case "3months":
        limitCount = 90;
        break;
      case "6months":
        limitCount = 150;
        break;
      default:
        limitCount = 30;
    }

    console.log("🔍 가격지수 API 호출:", { product, period, limitCount });

    // 쿼리 실행 - LIMIT을 직접 쿼리에 포함
    const query = `SELECT prod_name, pub_date, j_avg_price, m_avg_price FROM market_prices WHERE prod_name = ? ORDER BY pub_date DESC LIMIT ${limitCount}`;
    const [rows] = await connection.execute(query, [product]);

    console.log("🔍 쿼리 결과 개수:", (rows as any[]).length);

    // 데이터 형식 변환
    const formattedData = (rows as any[]).map(row => ({
      date: row.pub_date.toISOString().split('T')[0],
      traditionalMarket: row.j_avg_price,    // 전통시장 가격
      largeRetail: row.m_avg_price           // 대형유통사 가격
    })).reverse(); // 차트를 위해 날짜순으로 정렬

    const result = {
      products: [
        {
          product: product,
          data: formattedData
        }
      ],
      lastUpdated: new Date().toISOString(),
      count: formattedData.length,
      dataRange: {
        startDate: formattedData[0]?.date,
        endDate: formattedData[formattedData.length - 1]?.date
      }
    };

    connection.end();
    return NextResponse.json(result);

  } catch (err) {
    console.error("❌ 가격지수 API 오류:", err);
    console.error("❌ 오류 상세:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { 
        error: "가격지수 데이터 조회 중 오류 발생", 
        details: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
