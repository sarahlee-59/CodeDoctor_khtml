import pandas as pd
from sqlalchemy import create_engine
import os
import sys

# 프로젝트 루트 경로 추가
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_root)

# -------------------------------
# 1. CSV 불러오기
# -------------------------------
try:
    sales_df = pd.read_csv(os.path.join(project_root, "data/추정매출-상권_2024년.csv"), encoding="cp949")
    info_df = pd.read_csv(os.path.join(project_root, "data/상권정보_20221212.csv"), encoding="cp949")
    change_df = pd.read_csv(os.path.join(project_root, "data/상권변화지표-상권.csv"), encoding="cp949")
    print("✅ CSV 파일 로드 완료")
except FileNotFoundError as e:
    print(f"❌ CSV 파일을 찾을 수 없습니다: {e}")
    sys.exit(1)

# -------------------------------
# 2. 병합 (상권명/상권코드 기준)
# -------------------------------
merged_df = pd.merge(
    sales_df, info_df, left_on="상권_코드_명", right_on="상권명", how="inner"
)

# 상권변화지표는 상권 코드 기준으로 병합
merged_df = pd.merge(
    merged_df, change_df, left_on="상권_코드", right_on="상권_코드", how="left"
)

print(f"✅ 데이터 병합 완료: {len(merged_df)}개 행")

# -------------------------------
# 3. 추가 지표 계산
# -------------------------------

# (A) Conversion: 매출 ÷ 매출건수
merged_df["Conversion"] = merged_df["당월_매출_금액"] / merged_df["당월_매출_건수"]

# (B) RelSales: 업종 평균 대비 매출
industry_avg = merged_df.groupby("서비스_업종_코드")["당월_매출_금액"].transform("mean")
merged_df["RelSales"] = merged_df["당월_매출_금액"] / industry_avg

# (C) 품질/생존율: 운영 평균 ÷ (운영+폐업 평균)
merged_df["QualityScore"] = merged_df["운영_영업_개월_평균"] / (
    merged_df["운영_영업_개월_평균"] + merged_df["폐업_영업_개월_평균"].replace(0, 1)
)

# (D) 시간대 편차 (최대 ÷ 최소)
time_cols = [
    "시간대_00~06_매출_금액", "시간대_06~11_매출_금액", "시간대_11~14_매출_금액",
    "시간대_14~17_매출_금액", "시간대_17~21_매출_금액", "시간대_21~24_매출_금액"
]
merged_df["최소유동"] = merged_df[time_cols].min(axis=1).replace(0, 1)
merged_df["최대유동"] = merged_df[time_cols].max(axis=1)
merged_df["TimeRatio"] = merged_df["최대유동"] / merged_df["최소유동"]

# -------------------------------
# 4. ColdSpot 플래그 정의
# -------------------------------
merged_df["ColdSpot"] = (
    (
        (merged_df["Conversion"] < 5000) |
        (merged_df["RelSales"] < 0.8)
    ) & (merged_df["QualityScore"] > 0.6)    # 생존율이 높은 점포
) | (merged_df["TimeRatio"] > 3)

print(f"✅ ColdSpot 분석 완료: {merged_df['ColdSpot'].sum()}개 ColdSpot 발견")

# -------------------------------
# 5. MySQL 저장
# -------------------------------
try:
    engine = create_engine(
        "mysql+pymysql://root:Muxchk%4001033@localhost:3306/seoyeon_db?charset=utf8mb4"
    )
    
    merged_df.to_sql("cold_spots", engine, if_exists="replace", index=False)
    print("✅ MySQL에 cold_spots 테이블 저장 완료!")
    
    # 결과 요약
    print(f"\n📊 분석 결과 요약:")
    print(f"- 총 상권 수: {len(merged_df)}")
    print(f"- ColdSpot 수: {merged_df['ColdSpot'].sum()}")
    print(f"- ColdSpot 비율: {(merged_df['ColdSpot'].sum() / len(merged_df) * 100):.1f}%")
    
except Exception as e:
    print(f"❌ MySQL 저장 실패: {e}")
    sys.exit(1)

# -------------------------------
# 6. 결과를 JSON으로도 저장 (API에서 사용)
# -------------------------------
output_path = os.path.join(project_root, "public/api/cold-spots.json")
os.makedirs(os.path.dirname(output_path), exist_ok=True)

# ColdSpot만 필터링하여 저장
cold_spots_df = merged_df[merged_df["ColdSpot"] == True]
cold_spots_df.to_json(output_path, orient="records", force_ascii=False, indent=2)
print(f"✅ JSON 파일 저장 완료: {output_path}")
