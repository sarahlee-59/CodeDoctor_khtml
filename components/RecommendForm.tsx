"use client";
import { useState } from "react";

export default function RecommendForm() {
  const [region, setRegion] = useState("동대문구");
  const [industry, setIndustry] = useState("반찬");
  const [time, setTime] = useState("저녁");
  const [results, setResults] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const res = await fetch(
        `/api/recommend?region=${region}&industry=${industry}&time=${time}`
      );
      const data = await res.json();

      if (Array.isArray(data)) {
        setResults(data);
      } else {
        console.error("API 오류:", data.error || "데이터 오류");
        setResults([]);
      }
    } catch (error) {
      console.error("데이터 가져오기 실패:", error);
      setResults([]);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">맞춤 ColdSpot 추천</h2>
      <p className="text-sm text-gray-500">
        ColdSpot은 매출 효율성이 낮지만 특정 시간대에 혼잡이 적고, 품질이 상대적으로 좋은
        상권을 의미합니다.
      </p>

      {/* 드롭다운 선택 */}
      <div className="flex space-x-4">
        <select value={region} onChange={(e) => setRegion(e.target.value)}>
          <option value="전체">전체</option>
          <option value="동대문구">동대문구</option>
          <option value="종로구">종로구</option>
        </select>

        <select value={industry} onChange={(e) => setIndustry(e.target.value)}>
          <option value="전체">전체</option>
          <option value="반찬">반찬</option>
          <option value="정육">정육</option>
          <option value="음식점">음식점</option>
        </select>

        <select value={time} onChange={(e) => setTime(e.target.value)}>
          <option value="전체">전체</option>
          <option value="오전">오전</option>
          <option value="점심">점심</option>
          <option value="저녁">저녁</option>
          <option value="심야">심야</option>
        </select>

        <button
          onClick={fetchData}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          추천받기 🚀
        </button>
      </div>

      {/* 결과 카드뷰 */}
      <div className="grid grid-cols-1 gap-4">
        {results.length > 0 ? (
          results.map((r, idx) => (
            <div key={idx} className="border rounded p-4 shadow">
              <h3 className="font-semibold">
                {r.상권_코드_명} - {r.서비스_업종_코드_명}
              </h3>
              <p>당월 매출 금액: {r.당월_매출_금액?.toLocaleString()} 원</p>
              <p>선택 시간대 매출: {r.선택시간대_매출?.toLocaleString()} 원</p>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            추천받기 버튼을 클릭하여 ColdSpot 상권을 추천받으세요
          </div>
        )}
      </div>
    </div>
  );
}
