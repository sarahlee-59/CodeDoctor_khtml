import os
import sys

print("🚀 실제 데이터로 ColdSpot 파이프라인 실행...")

# 프로젝트 루트 경로
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 필요한 CSV 파일들 확인
required_files = [
    "data/추정매출-상권_2024년.csv",
    "data/상권정보_20221212.csv", 
    "data/상권변화지표-상권.csv"
]

print("📁 필요한 CSV 파일 확인:")
missing_files = []
for file_path in required_files:
    full_path = os.path.join(project_root, file_path)
    if os.path.exists(full_path):
        file_size = os.path.getsize(full_path)
        print(f"   ✅ {file_path} ({file_size:,} bytes)")
    else:
        print(f"   ❌ {file_path} (파일 없음)")
        missing_files.append(file_path)

if missing_files:
    print(f"\n❌ {len(missing_files)}개 파일이 누락되었습니다.")
    print("🔧 해결 방법:")
    print("   1. CSV 파일들을 data/ 폴더에 넣어주세요")
    print("   2. 또는 기존 MySQL 데이터를 사용하세요")
    
    # 기존 데이터 사용 옵션
    print("\n💡 기존 MySQL 데이터 사용하기:")
    print("   - 현재 cold_spots 테이블에 더미 데이터가 있습니다")
    print("   - 이 데이터로 웹 애플리케이션을 테스트할 수 있습니다")
    
else:
    print("\n✅ 모든 CSV 파일이 준비되었습니다!")
    print("🚀 coldspot_pipeline.py 실행 중...")
    
    try:
        # coldspot_pipeline.py 실행
        pipeline_path = os.path.join(project_root, "scripts/coldspot_pipeline.py")
        exec(open(pipeline_path).read())
        print("\n🎉 실제 데이터로 파이프라인 실행 완료!")
        
    except Exception as e:
        print(f"❌ 파이프라인 실행 실패: {e}")

print("\n📋 다음 단계:")
print("   1. 웹에서 ColdSpot 추천 기능 테스트")
print("   2. MySQL에서 'SELECT * FROM cold_spots LIMIT 5;' 실행하여 데이터 확인")

