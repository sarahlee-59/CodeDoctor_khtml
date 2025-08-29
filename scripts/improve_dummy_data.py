import pandas as pd
from sqlalchemy import create_engine, text
import numpy as np

print("🚀 더미 데이터를 현실적인 데이터로 개선...")

# 더 현실적인 데이터 생성
np.random.seed(42)

# 실제 상권명과 지역 데이터
real_regions = ['강남구', '서초구', '종로구', '중구', '용산구', '성동구', '광진구', '동대문구', '중랑구', '성북구', '강북구', '도봉구', '노원구', '은평구', '서대문구', '마포구', '양천구', '강서구', '구로구', '금천구', '영등포구', '동작구', '관악구', '송파구', '강동구']

real_industries = ['음식점', '카페', '편의점', '슈퍼마켓', '의류점', '화장품점', '약국', '서점', '문구점', '전자제품점', '가구점', '화장실', '미용실', '세탁소', '정육점', '반찬점', '과일점', '꽃집', '애완동물점', '스포츠용품점']

real_district_names = ['강남대로', '역삼로', '테헤란로', '종로', '명동길', '동대문로', '홍대입구', '합정역', '상수역', '광화문', '시청역', '을지로', '청량리', '동대문역', '신촌역', '홍대역', '합정역', '상수역', '광화문', '시청역']

# 500개의 현실적인 상권 데이터 생성
n_samples = 500

improved_data = {
    '상권_코드': [f'SP{i:04d}' for i in range(1, n_samples + 1)],
    '상권_코드_명': [f'{np.random.choice(real_district_names)}{i}상권' for i in range(1, n_samples + 1)],
    '시군구명': np.random.choice(real_regions, n_samples),
    '서비스_업종_코드_명': np.random.choice(real_industries, n_samples),
    '당월_매출_금액': np.random.randint(500000, 50000000, n_samples),
    '당월_매출_건수': np.random.randint(50, 2000, n_samples),
    '시간대_00~06_매출_금액': np.random.randint(10000, 1000000, n_samples),  # 새벽
    '시간대_06~11_매출_금액': np.random.randint(50000, 5000000, n_samples),  # 오전
    '시간대_11~14_매출_금액': np.random.randint(100000, 8000000, n_samples), # 점심
    '시간대_14~17_매출_금액': np.random.randint(80000, 6000000, n_samples),  # 오후
    '시간대_17~21_매출_금액': np.random.randint(150000, 10000000, n_samples), # 저녁
    '시간대_21~24_매출_금액': np.random.randint(60000, 4000000, n_samples),  # 심야
    '운영_영업_개월_평균': np.random.randint(6, 120, n_samples),
    '폐업_영업_개월_평균': np.random.randint(0, 60, n_samples)
}

# DataFrame 생성
df = pd.DataFrame(improved_data)

# 지표 계산
print("🧮 지표 계산 중...")

# Conversion
df['Conversion'] = df['당월_매출_금액'] / df['당월_매출_건수']

# RelSales (업종별 평균 대비)
industry_avg = df.groupby('서비스_업종_코드_명')['당월_매출_금액'].transform('mean')
df['RelSales'] = df['당월_매출_금액'] / industry_avg

# TimeRatio (모든 시간대 포함)
time_cols = ['시간대_00~06_매출_금액', '시간대_06~11_매출_금액', '시간대_11~14_매출_금액', 
             '시간대_14~17_매출_금액', '시간대_17~21_매출_금액', '시간대_21~24_매출_금액']
df['최소유동'] = df[time_cols].min(axis=1).replace(0, 1)
df['최대유동'] = df[time_cols].max(axis=1)
df['TimeRatio'] = df['최대유동'] / df['최소유동']

# QualityScore
df['QualityScore'] = df['운영_영업_개월_평균'] / (df['운영_영업_개월_평균'] + df['폐업_영업_개월_평균'].replace(0, 1))

# ColdSpot 판별 (더 현실적인 기준)
df['ColdSpot'] = (
    ((df['Conversion'] < 8000) | (df['RelSales'] < 0.7))  # 매출 효율성 낮음
    & (df['QualityScore'] > 0.5)  # 품질 점수 중간 이상
) | (df['TimeRatio'] > 2.5)  # 시간대 편차 적당

print("✅ 지표 계산 완료")

# MySQL 연결 및 저장
print("💾 MySQL에 저장 중...")
try:
    engine = create_engine(
        "mysql+pymysql://root:Muxchk%4001033@localhost:3306/seoyeon_db?charset=utf8mb4"
    )
    
    # DB 저장 (기존 테이블 덮어쓰기)
    df.to_sql("cold_spots", engine, if_exists="replace", index=False)
    print("✅ cold_spots 테이블 개선 완료!")
    
    # 저장된 데이터 확인
    with engine.connect() as conn:
        result = conn.execute(text("SELECT COUNT(*) FROM cold_spots"))
        saved_count = result.fetchone()[0]
        print(f"✅ DB에 저장된 행 수: {saved_count:,}개")
        
        # ColdSpot 수 확인
        result = conn.execute(text("SELECT COUNT(*) FROM cold_spots WHERE ColdSpot = 1"))
        cold_spot_count = result.fetchone()[0]
        print(f"✅ ColdSpot 수: {cold_spot_count:,}개")
        
        # 지역별 분포 확인
        print("\n📊 지역별 분포:")
        result = conn.execute(text("SELECT 시군구명, COUNT(*) as 개수 FROM cold_spots GROUP BY 시군구명 ORDER BY 개수 DESC LIMIT 10"))
        for row in result.fetchall():
            print(f"   {row[0]}: {row[1]:,}개")
        
        # 업종별 분포 확인
        print("\n📊 업종별 분포:")
        result = conn.execute(text("SELECT 서비스_업종_코드_명, COUNT(*) as 개수 FROM cold_spots GROUP BY 서비스_업종_코드_명 ORDER BY 개수 DESC LIMIT 10"))
        for row in result.fetchall():
            print(f"   {row[0]}: {row[1]:,}개")
    
    engine.dispose()
    
except Exception as e:
    print(f"❌ MySQL 저장 실패: {e}")
    print("🔧 다음을 확인하세요:")
    print("  1. MySQL 서버가 실행 중인지")
    print("  2. 데이터베이스 'seoyeon_db'가 존재하는지")
    print("  3. 사용자 권한이 올바른지")
    exit(1)

print("\n🎉 더미 데이터 개선 완료!")
print("📋 다음 단계:")
print("  1. 웹에서 Cold Spot 추천 기능 테스트")
print("  2. 더 다양한 지역과 업종으로 추천 테스트")
print("  3. 실제 CSV 데이터 준비 후 coldspot_pipeline.py 실행")

