import pandas as pd
from sqlalchemy import create_engine, text
import os

print("🔄 데이터베이스 복원 시작...")

try:
    # MySQL 연결
    engine = create_engine('mysql+pymysql://root:Muxchk%4001033@localhost:3306/seoyeon_db?charset=utf8mb4')
    conn = engine.connect()
    
    # 1. 기존 테이블 삭제
    print("🗑️ 기존 cold_spots 테이블 삭제 중...")
    conn.execute(text("DROP TABLE IF EXISTS cold_spots"))
    print("✅ 기존 테이블 삭제 완료")
    
    # 2. SQL 덤프 파일 읽기
    dump_file = "seoyeon_db_dump.sql"
    if not os.path.exists(dump_file):
        print(f"❌ SQL 덤프 파일을 찾을 수 없습니다: {dump_file}")
        exit(1)
    
    print(f"📖 SQL 덤프 파일 읽기: {dump_file}")
    with open(dump_file, 'r', encoding='utf-8') as f:
        sql_content = f.read()
    
    # 3. SQL 문장들을 분리하여 실행
    print("🚀 SQL 문장들을 실행 중...")
    sql_statements = sql_content.split(';')
    
    for i, statement in enumerate(sql_statements):
        statement = statement.strip()
        if statement and not statement.startswith('--') and not statement.startswith('/*'):
            try:
                conn.execute(text(statement))
                print(f"  ✅ SQL 문장 {i+1} 실행 완료")
            except Exception as e:
                if "cold_spots" in statement.lower():
                    print(f"  ⚠️ SQL 문장 {i+1} 실행 중 경고 (테이블 생성 관련): {e}")
                else:
                    print(f"  ❌ SQL 문장 {i+1} 실행 실패: {e}")
    
    # 4. 복원 결과 확인
    print("\n🔍 복원 결과 확인...")
    result = conn.execute(text("SHOW TABLES"))
    tables = result.fetchall()
    print("📋 데이터베이스의 테이블들:")
    for table in tables:
        print(f"  - {table[0]}")
    
    if tables:
        result = conn.execute(text("SELECT COUNT(*) as total FROM cold_spots"))
        total = result.fetchone()[0]
        print(f"\n📊 cold_spots 테이블 행 수: {total}")
        
        # 샘플 데이터 확인
        result = conn.execute(text("SELECT 상권_코드_명, 시군구명, 서비스_업종_코드_명 FROM cold_spots LIMIT 5"))
        samples = result.fetchall()
        print("\n📝 샘플 데이터:")
        for i, row in enumerate(samples, 1):
            print(f"  {i}. {row[0]} (지역: {row[1]}, 업종: {row[2]})")
    
    conn.close()
    print("\n🎉 데이터베이스 복원 완료!")
    
except Exception as e:
    print(f"❌ 데이터베이스 복원 중 오류 발생: {e}")
    import traceback
    traceback.print_exc()
