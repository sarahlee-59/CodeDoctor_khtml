import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET() {
  try {
    console.log("🧪 테스트 API 호출 시작");
    
    // MySQL 연결 테스트
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "0409",
      database: "seoyeon_db",
    });
    console.log("✅ MySQL 연결 성공");
    
    // 테이블 존재 확인
    const [tables] = await connection.execute("SHOW TABLES LIKE 'cold_spots'");
    console.log("📋 테이블 확인:", tables);
    
    // 테이블 구조 확인
    const [columns] = await connection.execute("DESCRIBE cold_spots");
    console.log("🏗️ 테이블 구조:", columns);
    
    // 데이터 개수 확인
    const [countResult] = await connection.execute("SELECT COUNT(*) as total FROM cold_spots");
    const totalCount = countResult[0].total;
    console.log("📊 총 데이터 수:", totalCount);
    
    // ColdSpot 개수 확인
    const [coldSpotResult] = await connection.execute("SELECT COUNT(*) as cold_spot_count FROM cold_spots WHERE ColdSpot = 1");
    const coldSpotCount = coldSpotResult[0].cold_spot_count;
    console.log("❄️ ColdSpot 개수:", coldSpotCount);
    
    // 샘플 데이터 확인
    const [sampleData] = await connection.execute("SELECT * FROM cold_spots LIMIT 3");
    console.log("🔍 샘플 데이터:", sampleData);
    
    connection.end();
    
    return NextResponse.json({
      success: true,
      message: "테스트 성공",
      data: {
        tableExists: tables.length > 0,
        totalCount,
        coldSpotCount,
        columns: columns.map((col: any) => col.Field),
        sampleData
      }
    });
    
  } catch (error) {
    console.error("❌ 테스트 API 오류:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}


