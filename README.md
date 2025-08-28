# CodeDoctor_khtml

## API 계약서 (v1)

### 공통
- Base URL (dev): `http://localhost:3000`
- Content-Type: `application/json`

---

### GET /healthz
- 응답: `"ok"`

**curl**
```bash
curl http://localhost:3000/healthz
```

---

### GET /stores/search
- 쿼리 파라미터:
- lat (필수)
- lng (필수)
- category (선택: 카페/마트/과일가게/디저트)
- k (선택, 기본 20)

- 응답 예시:
```json
{
  "items": [
    {
      "id": 1,
      "name": "청량리커피",
      "category_std": "카페",
      "lat": 37.58,
      "lng": 127.04,
      "open_now": true,
      "crowd_level": 0.2
    }
  ]
}
```

---

### POST /plan
- 입력:
```json
{
  "start": {"lat": 37.58, "lng": 127.04},
  "waypoints": [
    {"category": "카페"},
    {"category": "마트"},
    {"category": "과일가게"},
    {"category": "디저트"}
  ]
}
```

- 응답:
```json
{
  "start": {"lat": 37.58, "lng": 127.04},
  "stops": [
    {"id":1,"name":"청량리커피","category_std":"카페","lat":37.58,"lng":127.04}
  ],
  "path": [
    {"lat":37.58,"lng":127.04},
    {"lat":37.581,"lng":127.042}
  ]
}
```

---

### (옵션) POST /parse
- 입력: { "q": "카페 갔다가 디저트 코스" }
- 응답 예시:
```json
{
  "intent":"route",
  "start":{"lat":37.58,"lng":127.04},
  "area":"동대문구-전통시장",
  "waypoints":[{"category":"카페"},{"category":"디저트"}],
  "constraints":{"crowd":"low","when":"now","max_walk_km":1.2}
}
```

---

### (옵션) POST /feedback - 폐점 제보
- 입력:
```json
{ "id": 123, "type":"closed" }
```

- 응답:
```json
{ "ok": true }
```
```yaml
# 2) `.env.sample` 두 개 추가 (5분)

팀원이 키 없이도 구조를 볼 수 있게 **샘플 파일**을 공유하세요.

**web/.env.sample**
```
- VITE_KAKAO_JS_KEY=YOUR_JS_KEY
- VITE_API_BASE_URL=http://localhost:3000

```bash

**api/.env.sample**

```

- PORT=3000
- CORS_ORIGIN=http://localhost:5173

- KAKAO_REST_API_KEY=YOUR_REST_API_KEY

```yaml

> `.gitignore`에 이미 `*.env`가 있다면 OK. 샘플은 커밋하고, 실제 `.env`는 커밋 금지!

# 3) Kakao coord2addr 키 점검(10건) (10분)

REST 키가 진짜 살아있는지 빠르게 확인합니다. (터미널에서 2~3개만 테스트해도 충분)

```bash
# 1건 테스트 (경도 x, 위도 y)
curl -G "https://dapi.kakao.com/v2/local/geo/coord2address.json" \
  --data-urlencode "x=127.040" \
  --data-urlencode "y=37.580" \
  -H "Authorization: KakaoAK YOUR_REST_API_KEY"
```

- 여러 건 돌리고 싶으면 좌표 배열로 간단 스크립트:
```bash
node -e "const f=async()=>{const arr=[[127.04,37.58],[127.042,37.581],[127.045,37.582]];for(const [x,y] of arr){const r=await fetch(\`https://dapi.kakao.com/v2/local/geo/coord2address.json?x=\${x}&y=\${y}\`,{headers:{Authorization:'KakaoAK YOUR_REST_API_KEY'}});console.log(x,y, r.status);}};f()"
```