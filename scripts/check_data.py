import pandas as pd
from sqlalchemy import create_engine, text

print("🔍 데이터베이스 내용 확인...")

try:
    engine = create_engine('mysql+pymysql://root:Muxchk%4001033@localhost:3306/seoyeon_db?charset=utf8mb4')
    conn = engine.connect()
    
    # 1. 시군구명 컬럼의 고유값 확인
    print("\n1️⃣ 시군구명 컬럼의 고유값:")
    result = conn.execute(text("SELECT DISTINCT 시군구명 FROM cold_spots LIMIT 10"))
    regions = result.fetchall()
    for row in regions:
        print(f"  - {row[0]}")
    
    # 2. 서비스_업종_코드_명 컬럼의 고유값 확인
    print("\n2️⃣ 서비스_업종_코드_명 컬럼의 고유값:")
    result = conn.execute(text("SELECT DISTINCT 서비스_업종_코드_명 FROM cold_spots LIMIT 10"))
    industries = result.fetchall()
    for row in industries:
        print(f"  - {row[0]}")
    
    # 3. 전체 데이터 샘플 확인
    print("\n3️⃣ 전체 데이터 샘플 (첫 3행):")
    result = conn.execute(text("SELECT * FROM cold_spots LIMIT 3"))
    rows = result.fetchall()
    for i, row in enumerate(rows, 1):
        print(f"  {i}. {row}")
    
    conn.close()
    
except Exception as e:
    print(f"❌ 오류 발생: {e}")
    import traceback
    traceback.print_exc()
