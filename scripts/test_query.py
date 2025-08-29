import pandas as pd
from sqlalchemy import create_engine, text

print("🔍 API 쿼리 테스트 시작...")

try:
    # MySQL 연결
    engine = create_engine('mysql+pymysql://root:Muxchk%4001033@localhost:3306/seoyeon_db?charset=utf8mb4')
    conn = engine.connect()
    
    # 테스트 쿼리 실행
    query = """
    SELECT 상권_코드_명, 서비스_업종_코드_명, 당월_매출_금액, 
           `시간대_17~21_매출_금액` AS 선택시간대_매출 
    FROM cold_spots 
    WHERE 시군구명 = '동대문구' 
      AND 서비스_업종_코드_명 LIKE '%반찬%' 
      AND ColdSpot = 1 
    ORDER BY `시간대_17~21_매출_금액` ASC 
    LIMIT 5
    """
    
    print("📝 실행할 쿼리:")
    print(query)
    print("\n" + "="*50)
    
    result = conn.execute(text(query))
    rows = result.fetchall()
    
    print(f"✅ 쿼리 실행 성공! 결과: {len(rows)}개 행")
    for i, row in enumerate(rows, 1):
        print(f"  {i}. {row}")
    
    conn.close()
    
except Exception as e:
    print(f"❌ 오류 발생: {e}")
    import traceback
    traceback.print_exc()
