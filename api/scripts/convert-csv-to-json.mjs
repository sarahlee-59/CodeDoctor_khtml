import fs from "fs";
import path from "path";
import iconv from "iconv-lite";
import { parse } from "csv-parse/sync";

// 👉 CSV 파일 경로(필요시 바꾸세요)
const CSV_PATH = path.join(process.cwd(), "data", "dongdaemun_stores.csv");
// 👉 출력 JSON 경로
const OUT_PATH = path.join(process.cwd(), "data", "stores.seed.json");

// 1) 인코딩 처리 (data.go.kr은 종종 CP949/ EUC-KR)
const buf = fs.readFileSync(CSV_PATH);
let text = iconv.decode(buf, "utf8");
if (/[^\u0000-\u00ff]/.test(text) === false) {
  // 한글이 거의 없으면 CP949로 재시도
  text = iconv.decode(buf, "cp949");
}

// 2) CSV 파싱
const rows = parse(text, { columns: true, skip_empty_lines: true });

// 3) 필드 매핑 (CSV 헤더 이름에 맞게 수정)
// 예시 헤더 가정: 상호명, 업종명, 위도, 경도, 영업시간, 지번주소/도로명주소
let id = 1;
const norm = (s) => (s ?? "").trim();
const data = rows
  .map((r) => {
    const name = norm(r["상호명"] || r["점포명"] || r["상호"]);
    const category = norm(r["업종명"] || r["업종"] || r["카테고리"]);
    const lat = parseFloat(r["위도"] || r["LAT"] || r["lat"]);
    const lng = parseFloat(r["경도"] || r["LON"] || r["lng"]);
    const hours = norm(r["영업시간"] || r["운영시간"] || "");
    if (!name || !category || isNaN(lat) || isNaN(lng)) return null;

    // 간단한 카테고리 표준화
    const category_std =
      /카페|커피/i.test(category) ? "카페" :
      /마트|슈퍼|편의/i.test(category) ? "마트" :
      /과일|청과/i.test(category) ? "과일가게" :
      /디저트|빵|케이크|제과|사탕|쿠키/i.test(category) ? "디저트" :
      category;

    // 영업시간 문자열을 아주 간단히 JSON으로
    const hours_json = hours
      ? { mo: hours.split("~").map((s) => s.trim()).slice(0, 2) }
      : undefined;

    return {
      id: id++,
      name,
      category_std,
      lat,
      lng,
      hours_json,
    };
  })
  .filter(Boolean);

// 4) 저장
fs.writeFileSync(OUT_PATH, JSON.stringify(data, null, 2), "utf8");
console.log(`✅ Wrote ${data.length} items → ${OUT_PATH}`);