import mysql.connector
from sqlalchemy import create_engine, text
import pandas as pd

print("🔍 MySQL 데이터 확인 시작...")

try:
    # MySQL 연결
    engine = create_engine(
        "mysql+pymysql://root:Muxchk%4001033@localhost:3306/seoyeon_db?charset=utf8mb4"
    )
    
    with engine.connect() as conn:
        print("\n📋 1. 데이터베이스 테이블 목록:")
        result = conn.execute(text("SHOW TABLES"))
        tables = [row[0] for row in result.fetchall()]
        for table in tables:
            print(f"   - {table}")
        
        if 'cold_spots' in tables:
            print("\n📊 2. cold_spots 테이블 정보:")
            
            # 테이블 구조 확인
            result = conn.execute(text("DESCRIBE cold_spots"))
            columns = result.fetchall()
            print("   컬럼 구조:")
            for col in columns:
                print(f"     {col[0]} - {col[1]} ({col[2]})")
            
            # 데이터 개수 확인
            result = conn.execute(text("SELECT COUNT(*) FROM cold_spots"))
            total_count = result.fetchone()[0]
            print(f"\n   총 데이터 수: {total_count:,}개")
            
            # ColdSpot 개수 확인
            result = conn.execute(text("SELECT COUNT(*) FROM cold_spots WHERE ColdSpot = 1"))
            cold_spot_count = result.fetchone()[0]
            print(f"   ColdSpot 수: {cold_spot_count:,}개")
            
            # 샘플 데이터 확인
            print("\n   샘플 데이터 (상위 3개):")
            result = conn.execute(text("SELECT * FROM cold_spots LIMIT 3"))
            sample_data = result.fetchall()
            for i, row in enumerate(sample_data, 1):
                print(f"     {i}. {row}")
                
        else:
            print("\n❌ cold_spots 테이블이 존재하지 않습니다.")
            
        # 다른 테이블들도 확인
        print("\n🔍 3. 다른 테이블들 확인:")
        for table in tables:
            if table != 'cold_spots':
                try:
                    result = conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
                    count = result.fetchone()[0]
                    print(f"   {table}: {count:,}개 행")
                except:
                    print(f"   {table}: 접근 불가")
    
    engine.dispose()
    
except Exception as e:
    print(f"❌ MySQL 연결 실패: {e}")
    print("🔧 다음을 확인하세요:")
    print("  1. MySQL 서버가 실행 중인지")
    print("  2. 데이터베이스 'seoyeon_db'가 존재하는지")
    print("  3. 사용자 권한이 올바른지")

print("\n✅ 데이터 확인 완료!")

