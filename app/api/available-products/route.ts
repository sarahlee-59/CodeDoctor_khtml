import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET() {
  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "0409",
      database: "seoyeon_db",
    });

    // 사용 가능한 제품 목록 조회
    const [rows] = await connection.execute(
      "SELECT DISTINCT prod_name FROM market_prices ORDER BY prod_name"
    );

    // 제품명을 한글로 매핑
    const productMapping: { [key: string]: string } = {
      "apple_aori": "사과(아오리)",
      "apple_fuji": "사과(후지)",
      "cabbage": "배추",
      "enoki_mushroom": "팽이버섯",
      "garlic": "마늘",
      "ggetip": "깻잎",
      "peanut": "땅콩",
      "pear": "배",
      "potato": "감자",
      "shigumchi": "시금치",
      "walnut": "호두",
      "whitebean": "흰콩"
    };

    const products = (rows as any[]).map(row => ({
      value: row.prod_name,
      label: productMapping[row.prod_name] || row.prod_name,
      category: getProductCategory(row.prod_name)
    }));

    console.log("🔍 사용 가능한 제품 목록:", products);

    connection.end();
    return NextResponse.json({ products });

  } catch (err) {
    console.error("❌ 제품 목록 API 오류:", err);
    return NextResponse.json(
      { error: "제품 목록 조회 중 오류 발생" },
      { status: 500 }
    );
  }
}

// 제품 카테고리 분류
function getProductCategory(prodName: string): string {
  if (["apple_aori", "apple_fuji", "pear"].includes(prodName)) return "과일";
  if (["cabbage", "garlic", "potato", "enoki_mushroom", "shigumchi"].includes(prodName)) return "채소";
  if (["peanut", "walnut"].includes(prodName)) return "견과류";
  if (["ggetip", "whitebean"].includes(prodName)) return "기타";
  return "기타";
}
