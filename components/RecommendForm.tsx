"use client";
import { useState } from "react";
import { Search, MapPin, Clock, Building2, TrendingUp, Sparkles } from "lucide-react";

export default function RecommendForm() {
  const [region, setRegion] = useState("서울특별시 동대문구");
  const [industry, setIndustry] = useState("한식음식점");
  const [time, setTime] = useState("저녁");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeIcon = (timeValue: string) => {
    switch (timeValue) {
      case "오전": return "🌅";
      case "점심": return "☀️";
      case "저녁": return "🌆";
      case "심야": return "🌙";
      default: return "⏰";
    }
  };

  const getIndustryIcon = (industryValue: string) => {
    switch (industryValue) {
      case "한식음식점": return "🍽️";
      case "중식음식점": return "🥢";
      case "일식음식점": return "🍣";
      case "양식음식점": return "🍝";
      case "제과점": return "🍰";
      case "패스트푸드점": return "🍔";
      case "치킨전문점": return "🍗";
      case "분식전문점": return "🍜";
      case "호프-간이주점": return "🍺";
      case "커피-음료": return "☕";
      default: return "🏪";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* 헤더 섹션 */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ColdSpot 추천 시스템
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            매출 효율성이 낮지만 특정 시간대에 혼잡이 적고, 품질이 상대적으로 좋은 
            <span className="font-semibold text-blue-600"> ColdSpot 상권</span>을 
            AI가 분석하여 추천해드립니다.
          </p>
        </div>

        {/* 검색 필터 섹션 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Search className="w-6 h-6 mr-3 text-blue-500" />
            검색 조건 설정
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* 지역 선택 */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <MapPin className="w-4 h-4 mr-2 text-red-500" />
                지역 선택
              </label>
              <select 
                value={region} 
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              >
                <option value="전체">🌍 전체 지역</option>
                <option value="서울특별시 동대문구">🏢 동대문구</option>
              </select>
            </div>

            {/* 업종 선택 */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Building2 className="w-4 h-4 mr-2 text-green-500" />
                업종 선택
              </label>
              <select 
                value={industry} 
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              >
                <option value="전체">🏪 전체 업종</option>
                <option value="한식음식점">🍽️ 한식음식점</option>
                <option value="중식음식점">🥢 중식음식점</option>
                <option value="일식음식점">🍣 일식음식점</option>
                <option value="양식음식점">🍝 양식음식점</option>
                <option value="제과점">🍰 제과점</option>
                <option value="패스트푸드점">🍔 패스트푸드점</option>
                <option value="치킨전문점">🍗 치킨전문점</option>
                <option value="분식전문점">🍜 분식전문점</option>
                <option value="호프-간이주점">🍺 호프/간이주점</option>
                <option value="커피-음료">☕ 커피/음료</option>
              </select>
            </div>

            {/* 시간대 선택 */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Clock className="w-4 h-4 mr-2 text-orange-500" />
                시간대 선택
              </label>
              <select 
                value={time} 
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              >
                <option value="전체">⏰ 전체 시간</option>
                <option value="오전">🌅 오전 (06~11시)</option>
                <option value="점심">☀️ 점심 (11~14시)</option>
                <option value="저녁">🌆 저녁 (17~21시)</option>
                <option value="심야">🌙 심야 (21~24시)</option>
              </select>
            </div>

            {/* 검색 버튼 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 opacity-0">검색</label>
              <button
                onClick={fetchData}
                disabled={isLoading}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>검색 중...</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5" />
                    <span>추천받기</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 결과 섹션 */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Sparkles className="w-6 h-6 mr-3 text-purple-500" />
            추천 결과
            {results.length > 0 && (
              <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {results.length}개 상권
              </span>
            )}
          </h2>



          {results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((r, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group">
                  {/* 카드 헤더 */}
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg truncate">{r.상권_코드_명}</h3>
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                        {getIndustryIcon(r.서비스_업종_코드_명)} {r.서비스_업종_코드_명}
                      </span>
                    </div>
                  </div>
                  
                  {/* 카드 바디 */}
                  <div className="p-6 space-y-4">
                    {/* 매출 정보 */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">당월 매출</span>
                        <span className="font-bold text-blue-600">
                          {r.당월_매출_금액?.toLocaleString() || 'N/A'} 원
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600 flex items-center">
                          {getTimeIcon(time)} {time} 매출
                        </span>
                        <span className="font-bold text-purple-600">
                          {r.선택시간대_매출?.toLocaleString() || 'N/A'} 원
                        </span>
                      </div>
                    </div>

                    {/* ColdSpot 배지 */}
                    <div className="flex items-center justify-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200">
                        ❄️ ColdSpot 상권
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <Search className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                추천 결과가 없습니다
              </h3>
              <p className="text-gray-500 mb-6">
                검색 조건을 조정하여 다시 시도해보세요
              </p>
              <button
                onClick={fetchData}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
              >
                다시 검색하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
