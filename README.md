# 동대문 전통시장 상권 분석 시스템

## 🚀 프로젝트 개요

동대문 전통시장의 상권 데이터를 분석하여 세대별 유동인구, 가격지수, 추천 코스, ColdSpot 분석 등을 제공하는 웹 애플리케이션입니다.

## 🛠️ 기술 스택

- **Frontend**: Next.js 15, React 18, TypeScript
- **UI**: Tailwind CSS, Radix UI
- **Data Analysis**: Python, Pandas, SQLAlchemy
- **Database**: MySQL
- **Charts**: Recharts, Leaflet

## 📋 주요 기능

1. **세대별 유동인구 분석** - 히트맵으로 시각화
2. **가격지수 비교** - 상품별 가격 트렌드 분석
3. **추천 코스** - 데이터 기반 상권 추천
4. **온누리 혜택 시뮬레이터** - 할인 혜택 계산
5. **상인 포털** - 상인 전용 정보 제공
6. **ColdSpot 분석** - 매출 효율성이 낮은 상권 식별

## 🚀 설치 및 실행

### 1. 의존성 설치

```bash
# Node.js 의존성
npm install

# Python 의존성
pip install -r requirements.txt
```

### 2. 환경 설정

MySQL 데이터베이스가 필요합니다:
- 데이터베이스명: `seoyeon_db`
- 사용자: `root`
- 비밀번호: `Muxchk@01033`
- 포트: `3306`

### 3. 데이터 파일 준비

`data/` 폴더에 다음 CSV 파일들을 준비하세요:
- `추정매출-상권_2024년.csv`
- `상권정보_20221212.csv`
- `상권변화지표-상권.csv`

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속하세요.

## 📊 ColdSpot 분석

### 분석 지표

1. **Conversion**: 매출 ÷ 매출건수
2. **RelSales**: 업종 평균 대비 매출
3. **QualityScore**: 운영 평균 ÷ (운영+폐업 평균)
4. **TimeRatio**: 시간대별 매출 편차

### ColdSpot 판정 기준

```python
ColdSpot = (
    (Conversion < 5000 OR RelSales < 0.8) AND QualityScore > 0.6
) OR TimeRatio > 3
```

### API 엔드포인트

- `GET /api/cold-spots`: ColdSpot 데이터 조회
- `POST /api/cold-spots`: 새로운 분석 실행

## 🏗️ 프로젝트 구조

```
├── app/                    # Next.js 앱 라우터
│   ├── api/               # API 엔드포인트
│   └── compare/           # 상품 비교 페이지
├── components/             # React 컴포넌트
│   ├── ui/                # UI 기본 컴포넌트
│   └── *.tsx              # 기능별 컴포넌트
├── data/                   # CSV 데이터 파일
├── lib/                    # 유틸리티 함수
├── public/                 # 정적 파일
├── scripts/                # Python 분석 스크립트
└── styles/                 # 전역 스타일
```

## 🔧 개발 가이드

### 새로운 탭 추가

1. `components/` 폴더에 새 컴포넌트 생성
2. `app/page.tsx`에 탭 추가
3. 필요한 API 엔드포인트 생성

### Python 스크립트 실행

```bash
# 직접 실행
python scripts/coldspot_pipeline.py

# API를 통한 실행
curl -X POST http://localhost:3000/api/cold-spots
```

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
