# 카카오맵 API 설정 가이드

## 1. 카카오맵 API 키 발급

1. [Kakao Developers](https://developers.kakao.com/) 사이트에 접속
2. 로그인 후 "내 애플리케이션" 메뉴로 이동
3. "애플리케이션 추가하기" 클릭
4. 앱 이름과 회사명 입력 후 생성
5. 생성된 애플리케이션에서 "플랫폼" 설정
6. "Web" 플랫폼 추가 후 도메인 등록 (개발 시: `http://localhost:3000`)

## 2. JavaScript 키 확인

1. 애플리케이션 상세 페이지에서 "앱 키" 섹션 확인
2. "JavaScript 키" 복사

## 3. 환경변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용 추가:

```bash
VITE_KAKAO_JS_KEY=164e2060bb06268114bcf01942061e6d
VITE_API_BASE_URL=http://localhost:3000/
```

또는 `components/KakaoMap.tsx` 파일에서 직접 API 키를 수정:

```typescript
const apiKey = '164e2060bb06268114bcf01942061e6d'
```

## 4. 사용법

`components/KakaoMap.tsx` 컴포넌트가 자동으로 카카오맵을 로드하고 세대별 유동인구 데이터를 시각화합니다.

## 5. 주요 기능

- 연령대별 유동인구 밀도에 따른 색상 구분
- 상권별 상세 정보 인포윈도우
- 마커 클릭 시 상권 선택 기능
- 자동 지도 범위 조정

## 6. 주의사항

- API 키는 클라이언트 사이드에서 사용되므로 `NEXT_PUBLIC_` 접두사 필수
- 도메인 등록이 완료되어야 정상 작동
- 일일 API 호출 제한 확인 필요
