import pandas as pd
from sqlalchemy import create_engine
import os
import sys

# 프로젝트 루트 경로 추가
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_root)

print("🚀 Cold Spot 지표 계산 및 DB 적재 시작...")

try:
    # CSV 불러오기
    print("📁 CSV 파일 로드 중...")
    sales_df = pd.read_csv(os.path.join(project_root, "data/추정매출-상권_2024년.csv"), encoding="cp949")
    info_df = pd.read_csv(os.path.join(project_root, "data/상권정보_20221212.csv"), encoding="cp949")
    change_df = pd.read_csv(os.path.join(project_root, "data/상권변화지표-상권.csv"), encoding="cp949")
    print(f"✅ CSV 로드 완료: 매출({len(sales_df)}), 상권정보({len(info_df)}), 변화지표({len(change_df)})")
    
except FileNotFoundError as e:
    print(f"❌ CSV 파일을 찾을 수 없습니다: {e}")
    print("📁 data/ 폴더에 다음 파일들이 있는지 확인하세요:")
    print("  - 추정매출-상권_2024년.csv")
    print("  - 상권정보_20221212.csv") 
    print("  - 상권변화지표-상권.csv")
    sys.exit(1)

# 데이터 병합
print("🔗 데이터 병합 중...")
merged_df = sales_df.merge(info_df, left_on="상권_코드_명", right_on="상권명", how="inner")
merged_df = merged_df.merge(change_df, on=["상권_코드", "기준_년분기_코드"], how="left")
print(f"✅ 병합 완료: {len(merged_df)}개 행")

# 지표 계산
print("🧮 지표 계산 중...")

# Conversion (매출 ÷ 매출건수)
merged_df["Conversion"] = merged_df["당월_매출_금액"] / merged_df["당월_매출_건수"]
print("  ✅ Conversion 계산 완료")

# RelSales (업종 평균 대비 매출)
industry_avg = merged_df.groupby("서비스_업종_코드")["당월_매출_금액"].transform("mean")
merged_df["RelSales"] = merged_df["당월_매출_금액"] / industry_avg
print("  ✅ RelSales 계산 완료")

# TimeRatio (시간대별 매출 편차)
time_cols = [
    "시간대_00~06_매출_금액", "시간대_06~11_매출_금액", "시간대_11~14_매출_금액",
    "시간대_14~17_매출_금액", "시간대_17~21_매출_금액", "시간대_21~24_매출_금액"
]
merged_df["최소유동"] = merged_df[time_cols].min(axis=1).replace(0, 1)
merged_df["최대유동"] = merged_df[time_cols].max(axis=1)
merged_df["TimeRatio"] = merged_df["최대유동"] / merged_df["최소유동"]
print("  ✅ TimeRatio 계산 완료")

# QualityScore (운영기간 / (운영+폐업기간))
merged_df["QualityScore"] = merged_df["운영_영업_개월_평균"] / (
    merged_df["운영_영업_개월_평균"] + merged_df["폐업_영업_개월_평균"].replace(0, 1)
)
print("  ✅ QualityScore 계산 완료")

# ColdSpot 판별
merged_df["ColdSpot"] = (
    ((merged_df["Conversion"] < 5000) | (merged_df["RelSales"] < 0.8))
    & (merged_df["QualityScore"] > 0.6)
) | (merged_df["TimeRatio"] > 3)
print("  ✅ ColdSpot 판별 완료")

# 결과 요약
cold_spot_count = merged_df["ColdSpot"].sum()
total_count = len(merged_df)
print(f"\n📊 계산 결과 요약:")
print(f"  - 총 상권 수: {total_count:,}개")
print(f"  - ColdSpot 수: {cold_spot_count:,}개")
print(f"  - ColdSpot 비율: {(cold_spot_count/total_count*100):.1f}%")

# MySQL 연결 및 저장
print("\n💾 MySQL에 저장 중...")
try:
    engine = create_engine(
        "mysql+pymysql://root:Muxchk%4001033@localhost:3306/seoyeon_db?charset=utf8mb4"
    )
    
    # DB 저장 (기존 테이블 덮어쓰기)
    merged_df.to_sql("cold_spots", engine, if_exists="replace", index=False)
    print("✅ cold_spots 테이블 업데이트 완료!")
    
    # 저장된 데이터 확인
    with engine.connect() as conn:
        result = conn.execute("SELECT COUNT(*) FROM cold_spots")
        saved_count = result.fetchone()[0]
        print(f"✅ DB에 저장된 행 수: {saved_count:,}개")
    
    engine.dispose()
    
except Exception as e:
    print(f"❌ MySQL 저장 실패: {e}")
    print("🔧 다음을 확인하세요:")
    print("  1. MySQL 서버가 실행 중인지")
    print("  2. 데이터베이스 'seoyeon_db'가 존재하는지")
    print("  3. 사용자 권한이 올바른지")
    sys.exit(1)

# JSON 파일로도 저장 (API에서 사용)
print("\n📄 JSON 파일 저장 중...")
try:
    output_path = os.path.join(project_root, "public/api/cold-spots.json")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # ColdSpot만 필터링하여 저장
    cold_spots_df = merged_df[merged_df["ColdSpot"] == True]
    cold_spots_df.to_json(output_path, orient="records", force_ascii=False, indent=2)
    print(f"✅ JSON 파일 저장 완료: {output_path}")
    print(f"  - 저장된 ColdSpot 수: {len(cold_spots_df):,}개")
    
except Exception as e:
    print(f"⚠️ JSON 저장 실패: {e}")

print("\n🎉 모든 작업이 완료되었습니다!")
print("📋 다음 단계:")
print("  1. MySQL에서 'DESCRIBE cold_spots;' 실행하여 테이블 구조 확인")
print("  2. 'SELECT * FROM cold_spots LIMIT 5;' 실행하여 데이터 확인")
print("  3. 웹 애플리케이션에서 Cold Spot 추천 기능 테스트")
