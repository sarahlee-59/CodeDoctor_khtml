# 동대문 전통시장 상권 분석 시스템

동대문 전통시장의 세대별 소비 흐름과 상권 활성화 정보를 한눈에 볼 수 있는 웹 애플리케이션입니다.

## 주요 기능

### 🗺️ 세대별 유동인구 히트맵
- Z세대(20대), 30-40대, 50-60대별 유동인구 밀도 시각화
- 평일/주말, 오전/오후/저녁 시간대별 분석
- 카카오맵 기반 인터랙티브 지도

### 💰 가격지수 비교
- 상품별 가격 변동 추이 분석
- 시장 간 가격 비교
- 가격 예측 및 트렌드 분석

### 🛒 추천 코스 (신규 기능)
- **상품별 가게 검색**: 아오리 사과, 배, 마늘 등 특정 상품을 파는 가게를 카카오맵으로 검색
- **인포윈도우**: 마커 클릭 시 가게 정보(주소, 전화번호, 평점 등) 표시
- **품질 보장 집 추천**: 방문 시간, 대상, 바구니 카테고리별 맞춤 추천
- **실시간 검색**: 카카오맵 Places API를 활용한 실시간 가게 검색

### 🎫 온누리 혜택 시뮬레이터
- 온누리 상품권 사용 시 혜택 계산
- 할인율 및 추가 혜택 시뮬레이션

### 🏪 상인 포털
- 상인을 위한 정보 및 서비스 제공
- 시장 동향 및 분석 리포트

### ❄️ ColdSpot 분석
- 상권 활성도가 낮은 지역 분석
- 개선 방안 및 활성화 전략 제시

## 기술 스택

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Maps**: Kakao Maps API
- **State Management**: React Hooks
- **Build Tool**: Vite

## 설치 및 실행

### 1. 의존성 설치
```bash
npm install
# 또는
pnpm install
```

### 2. 환경변수 설정
`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Kakao Maps API Key
NEXT_PUBLIC_KAKAO_JS_KEY=your_kakao_maps_api_key

# API Base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

### 3. 개발 서버 실행
```bash
npm run dev
# 또는
pnpm dev
```

브라우저에서 `http://localhost:3000`으로 접속하세요.

## 추천 코스 기능 사용법

### 상품 선택
1. "추천 코스" 탭으로 이동
2. "구매하고 싶은 상품 선택" 섹션에서 원하는 상품 클릭
3. 지원 상품: 아오리 사과, 배, 마늘, 양파, 감자, 당근, 상추, 배추, 무, 고구마

### 가게 검색 및 지도 표시
- 상품 선택 시 자동으로 카카오맵에서 해당 상품을 파는 가게 검색
- 검색된 가게들이 지도에 마커로 표시
- 마커 클릭 시 인포윈도우로 가게 상세 정보 확인

### 검색 결과
- 가게명, 주소, 전화번호, 카테고리, 평점, 리뷰 수 표시
- 지도 하단에 가게 목록 제공
- 가게 클릭 시 해당 위치로 지도 이동

## 카카오맵 API 설정

1. [Kakao Developers](https://developers.kakao.com/)에서 애플리케이션 생성
2. JavaScript 키 발급
3. `.env.local` 파일에 `NEXT_PUBLIC_KAKAO_JS_KEY` 설정
4. 도메인 등록 (localhost:3000 개발용, 실제 도메인 배포용)

## 프로젝트 구조

```
├── app/                    # Next.js 14 App Router
│   ├── api/               # API 라우트
│   ├── compare/           # 상품 비교 페이지
│   ├── price-detail/      # 가격 상세 페이지
│   └── page.tsx           # 메인 페이지
├── components/             # React 컴포넌트
│   ├── ui/                # shadcn/ui 컴포넌트
│   ├── recommendation-tab.tsx    # 추천 코스 탭
│   ├── product-store-map.tsx     # 상품별 가게 지도
│   └── ...
├── lib/                   # 유틸리티 함수
├── public/                # 정적 파일
└── styles/                # 전역 스타일
```

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 문의사항

프로젝트에 대한 문의사항이나 버그 리포트는 이슈로 등록해 주세요.
