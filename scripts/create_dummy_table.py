import pandas as pd
from sqlalchemy import create_engine
import numpy as np

print("🚀 더미 데이터로 cold_spots 테이블 생성 시작...")

# 더미 데이터 생성
np.random.seed(42)  # 재현 가능한 랜덤 데이터

# 100개의 더미 상권 데이터 생성
n_samples = 100

dummy_data = {
    '상권_코드': [f'SP{i:03d}' for i in range(1, n_samples + 1)],
    '상권_코드_명': [f'더미상권{i}' for i in range(1, n_samples + 1)],
    '시군구명': np.random.choice(['동대문구', '종로구', '강남구'], n_samples),
    '서비스_업종_코드_명': np.random.choice(['반찬', '정육', '식당', '의류'], n_samples),
    '당월_매출_금액': np.random.randint(1000000, 10000000, n_samples),
    '당월_매출_건수': np.random.randint(100, 1000, n_samples),
    '시간대_06~11_매출_금액': np.random.randint(100000, 2000000, n_samples),
    '시간대_11~14_매출_금액': np.random.randint(200000, 3000000, n_samples),
    '시간대_17~21_매출_금액': np.random.randint(300000, 4000000, n_samples),
    '운영_영업_개월_평균': np.random.randint(12, 60, n_samples),
    '폐업_영업_개월_평균': np.random.randint(0, 24, n_samples)
}

# DataFrame 생성
df = pd.DataFrame(dummy_data)

# 지표 계산
print("🧮 지표 계산 중...")

# Conversion
df['Conversion'] = df['당월_매출_금액'] / df['당월_매출_건수']

# RelSales (업종별 평균 대비)
industry_avg = df.groupby('서비스_업종_코드_명')['당월_매출_금액'].transform('mean')
df['RelSales'] = df['당월_매출_금액'] / industry_avg

# TimeRatio
time_cols = ['시간대_06~11_매출_금액', '시간대_11~14_매출_금액', '시간대_17~21_매출_금액']
df['최소유동'] = df[time_cols].min(axis=1).replace(0, 1)
df['최대유동'] = df[time_cols].max(axis=1)
df['TimeRatio'] = df['최대유동'] / df['최소유동']

# QualityScore
df['QualityScore'] = df['운영_영업_개월_평균'] / (df['운영_영업_개월_평균'] + df['폐업_영업_개월_평균'].replace(0, 1))

# ColdSpot 판별
df['ColdSpot'] = (
    ((df['Conversion'] < 5000) | (df['RelSales'] < 0.8))
    & (df['QualityScore'] > 0.6)
) | (df['TimeRatio'] > 3)

print("✅ 지표 계산 완료")

# MySQL 연결 및 저장
print("💾 MySQL에 저장 중...")
try:
    engine = create_engine(
        "mysql+pymysql://root:wogus!204@localhost:3306/seoyeon_db?charset=utf8mb4"
    )
    
    # DB 저장
    df.to_sql("cold_spots", engine, if_exists="replace", index=False)
    print("✅ cold_spots 테이블 생성 완료!")
    
    # 저장된 데이터 확인
    with engine.connect() as conn:
        from sqlalchemy import text
        result = conn.execute(text("SELECT COUNT(*) FROM cold_spots"))
        saved_count = result.fetchone()[0]
        print(f"✅ DB에 저장된 행 수: {saved_count}개")
        
        # ColdSpot 수 확인
        result = conn.execute(text("SELECT COUNT(*) FROM cold_spots WHERE ColdSpot = 1"))
        cold_spot_count = result.fetchone()[0]
        print(f"✅ ColdSpot 수: {cold_spot_count}개")
    
    engine.dispose()
    
except Exception as e:
    print(f"❌ MySQL 저장 실패: {e}")
    print("🔧 다음을 확인하세요:")
    print("  1. MySQL 서버가 실행 중인지")
    print("  2. 데이터베이스 'seoyeon_db'가 존재하는지")
    print("  3. 사용자 권한이 올바른지")
    exit(1)

print("\n🎉 더미 테이블 생성 완료!")
print("📋 다음 단계:")
print("  1. 웹에서 Cold Spot 추천 기능 테스트")
print("  2. 실제 CSV 데이터 준비 후 coldspot_pipeline.py 실행")
