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
