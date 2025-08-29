import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET(request: Request) {
  // 🔍 1. 요청 내용 로깅
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region");
  const industry = searchParams.get("industry");
  const time = searchParams.get("time");
  
  console.log("=".repeat(60));
  console.log("🚀 RECOMMEND API 호출 시작");
  console.log("📋 요청 파라미터:");
  console.log("   - region:", region);
  console.log("   - industry:", industry);
  console.log("   - time:", time);
  console.log("=".repeat(60));

  try {
    // 🔍 2. DB 연결 과정 로깅
    console.log("🔌 DB 연결 시도 중...");
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "Muxchk@01033",
      database: "seoyeon_db",
    });
    console.log("✅ DB 연결 성공!");

    // 🔍 3. 테이블 구조 확인 (쿼리 전)
    console.log("📊 테이블 구조 확인 중...");
    const [columns] = await connection.execute("DESCRIBE cold_spots");
    console.log("📋 cold_spots 테이블 컬럼:");
    if (Array.isArray(columns)) {
      columns.forEach((col: any, idx: number) => {
        console.log(`   ${idx + 1}. ${col.Field} (${col.Type})`);
      });
    }

    // 🔍 4. 전체 데이터 개수 확인 (쿼리 전)
    const [countResult] = await connection.execute("SELECT COUNT(*) as total FROM cold_spots");
    const totalCount = Array.isArray(countResult) && countResult[0] ? (countResult[0] as any).total : 0;
    console.log(`📊 전체 데이터 개수: ${totalCount}개`);

    // 🔍 5. ColdSpot = 1인 데이터 개수 확인 (쿼리 전)
    const [coldSpotResult] = await connection.execute("SELECT COUNT(*) as cold_spot_count FROM cold_spots WHERE ColdSpot = 1");
    const coldSpotCount = Array.isArray(coldSpotResult) && coldSpotResult[0] ? (coldSpotResult[0] as any).cold_spot_count : 0;
    console.log(`❄️ ColdSpot = 1인 데이터 개수: ${coldSpotCount}개`);

    // 🔍 6. 시간대 조건 설정 로깅
    let timeCondition = "`당월_매출_금액`"; // 기본값
    if (time === "오전") timeCondition = "`시간대_06~11_매출_금액`";
    else if (time === "점심") timeCondition = "`시간대_11~14_매출_금액`";
    else if (time === "저녁") timeCondition = "`시간대_17~21_매출_금액`";
    else if (time === "심야") timeCondition = "`시간대_21~24_매출_금액`";
    
    console.log("⏰ 시간대 조건 설정:");
    console.log(`   - 선택된 시간: ${time}`);
    console.log(`   - 매핑된 컬럼: ${timeCondition}`);

    // 🔍 7. 필터링 조건 확인
    console.log("🔍 필터링 조건 확인:");
    console.log(`   - region 조건: ${region} -> ${region || "전체"}`);
    console.log(`   - industry 조건: ${industry} -> ${industry ? `%${industry}%` : "전체"}`);

    // 🔍 8. 실제 쿼리 실행
    console.log("🔍 실제 쿼리 실행 중...");
    const query = `
      SELECT \`상권_코드_명\`, \`서비스_업종_코드_명\`, \`당월_매출_금액\`, ${timeCondition} AS 선택시간대_매출
      FROM cold_spots
      WHERE (? = '전체' OR \`시군구명\` = ?)
        AND (? = '전체' OR \`서비스_업종_코드_명\` LIKE ?)
        AND ColdSpot = 1
      ORDER BY ${timeCondition} ASC
      LIMIT 5
    `;
    
    console.log("📝 실행할 SQL 쿼리:");
    console.log(query);
    console.log("📝 쿼리 파라미터:", [
      region || "전체",
      region || "전체", 
      industry || "전체",
      industry ? `%${industry}%` : "전체"
    ]);

    const [rows] = await connection.execute(query, [
      region || "전체",
      region || "전체",
      industry || "전체", 
      industry ? `%${industry}%` : "전체"
    ]);

    // 🔍 9. 쿼리 결과 로깅
    console.log("🎯 쿼리 실행 결과:");
    console.log(`   - 결과 개수: ${Array.isArray(rows) ? rows.length : 'N/A'}개`);
    console.log(`   - 결과 데이터:`, rows);

    // 🔍 10. 응답 데이터 구조 분석
    if (Array.isArray(rows) && rows.length > 0) {
      console.log("🔍 첫 번째 결과 데이터 구조:");
      const firstRow = rows[0] as any;
      Object.keys(firstRow).forEach(key => {
        console.log(`   - ${key}: ${firstRow[key]} (타입: ${typeof firstRow[key]})`);
      });
    } else {
      console.log("⚠️ 쿼리 결과가 비어있습니다!");
    }

    connection.end();
    console.log("🔌 DB 연결 종료");
    
    console.log("=".repeat(60));
    console.log("✅ API 처리 완료 - 성공!");
    console.log("=".repeat(60));

    return NextResponse.json(rows);

  } catch (err: any) {
    // 🔍 11. 에러 발생 시 상세 로깅
    console.log("=".repeat(60));
    console.log("❌ API 처리 실패 - 에러 발생!");
    console.log("🔍 에러 상세 정보:");
    console.log("   - 에러 타입:", err.constructor.name);
    console.log("   - 에러 메시지:", err.message);
    console.log("   - SQL 에러 메시지:", err.sqlMessage);
    console.log("   - 에러 스택:", err.stack);
    console.log("=".repeat(60));

    return NextResponse.json(
      { 
        error: err.sqlMessage || err.message || "추천 쿼리 실행 중 오류 발생",
        details: {
          type: err.constructor.name,
          message: err.message,
          sqlMessage: err.sqlMessage
        }
      },
      { status: 500 }
    );
  }
}


