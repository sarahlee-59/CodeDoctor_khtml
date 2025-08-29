import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET() {
  try {
    console.log("🧪 간단한 테스트 시작");
    
    // 1. MySQL 연결
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "wogus!204",
      database: "seoyeon_db",
    });
    console.log("✅ 연결 성공");
    
    // 2. 가장 간단한 쿼리
    const [rows] = await connection.execute("SELECT COUNT(*) as count FROM cold_spots");
    console.log("✅ 카운트 쿼리 성공:", rows);
    
    // 3. 연결 종료
    connection.end();
    console.log("✅ 연결 종료");
    
    return NextResponse.json({
      success: true,
      count: rows[0].count,
      message: "간단한 테스트 성공"
    });
    
  } catch (error) {
    console.error("❌ 오류 발생:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      details: error
    }, { status: 500 });
  }
}

