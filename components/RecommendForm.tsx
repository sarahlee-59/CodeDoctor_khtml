"use client";
import { useState } from "react";
import { Search, MapPin, Clock, Building2, TrendingUp, Sparkles } from "lucide-react";

export default function RecommendForm() {
  const [region, setRegion] = useState("동대문구");
  const [industry, setIndustry] = useState("의류점");  // 실제 DB에 있는 업종으로 변경
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

  // 시간대별 아이콘과 라벨
  const getTimeIcon = (time: string) => {
    switch (time) {
      case "오전": return "🌅";
      case "점심": return "🍽️";
      case "오후": return "☀️";
      case "저녁": return "🌆";
      case "심야": return "🌙";
      case "새벽": return "🌃";
      default: return "⏰";
    }
  };

  // 업종별 아이콘
  const getIndustryIcon = (industry: string) => {
    switch (industry) {
      case "음식점": return "🍜";
      case "카페": return "☕";
      case "편의점": return "🏪";
      case "슈퍼마켓": return "🛒";
      case "의류점": return "👕";
      case "화장품점": return "💄";
      case "약국": return "💊";
      case "서점": return "📚";
      case "문구점": return "✏️";
      case "전자제품점": return "📱";
      case "가구점": return "🪑";
      case "화장실": return "🚽";
      case "미용실": return "💆‍♀️";
      case "세탁소": return "👔";
      case "정육점": return "🥩";
      case "반찬점": return "🍱";
      case "과일점": return "🍎";
      case "꽃집": return "🌸";
      case "애완동물점": return "🐕";
      case "스포츠용품점": return "⚽";
      default: return "🏪";
    }
  };

  // 사용자 친화적 용어 변환
  const getFriendlyLabel = (key: string) => {
    const labels: { [key: string]: string } = {
      '상권_코드_명': '상권명',
      '서비스_업종_코드_명': '업종',
      '당월_매출_금액': '월 총 매출',
      '시간대_06~11_매출_금액': '오전 매출',
      '시간대_11~14_매출_금액': '점심 매출',
      '시간대_14~17_매출_금액': '오후 매출',
      '시간대_17~21_매출_금액': '저녁 매출',
      '시간대_21~24_매출_금액': '심야 매출',
      '시간대_00~06_매출_금액': '새벽 매출',
      'Conversion': '건당 매출',
      'RelSales': '업종 대비 매출',
      'TimeRatio': '시간대 편차',
      'QualityScore': '품질 점수',
      'ColdSpot': 'ColdSpot 여부'
    };
    return labels[key] || key;
  };

  // 금액 포맷팅 (천 단위 구분)
  const formatCurrency = (amount: number) => {
    if (!amount) return '0원';
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
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
                <option value="동대문구">🏢 동대문구</option>
                <option value="종로구">🏛️ 종로구</option>
                <option value="강남구">💎 강남구</option>
                <option value="서초구">🌳 서초구</option>
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
                  <option value="수제화점">👞 수제화점</option>
                  <option value="의류점">👕 의류점</option>
                  <option value="세탁소">👔 세탁소</option>
                  <option value="도매상">📦 도매상</option>
                  <option value="패션잡화점">👜 패션잡화점</option>
                  <option value="액세서리점">💍 액세서리점</option>
                  <option value="신발점">👟 신발점</option>
                  <option value="화장품점">💄 화장품점</option>
                  <option value="한복점">👘 한복점</option>
                  <option value="가죽제품점">👜 가죽제품점</option>
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
                <option value="점심">🍽️ 점심 (11~14시)</option>
                <option value="오후">☀️ 오후 (14~17시)</option>
                <option value="저녁">🌆 저녁 (17~21시)</option>
                <option value="심야">🌙 심야 (21~24시)</option>
                <option value="새벽">🌃 새벽 (00~06시)</option>
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

        {/* Cold Spot 정의 설명 */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-2xl">💡</div>
            <h3 className="text-lg font-semibold text-blue-900">Cold Spot이란?</h3>
          </div>
          <p className="text-blue-800 leading-relaxed">
            매출 효율성은 낮지만 품질은 높고, 특정 시간대에 한산하여 
            <span className="font-semibold">'줄 서지 않고 좋은 상품을 구매할 수 있는 숨은 상권'</span>을 의미합니다.
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white rounded p-3">
              <div className="font-semibold text-blue-700 mb-1">📊 건당 매출</div>
              <div className="text-blue-600">거래 1건당 평균 매출액</div>
            </div>
            <div className="bg-white rounded p-3">
              <div className="font-semibold text-blue-700 mb-1">⭐ 품질 점수</div>
              <div className="text-blue-600">운영 기간 대비 생존율</div>
            </div>
            <div className="bg-white rounded p-3">
              <div className="font-semibold text-blue-700 mb-1">⏰ 시간대 편차</div>
              <div className="text-blue-600">최고/최저 매출 시간대 비율</div>
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
              {results.map((spot, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  {/* 헤더 */}
                  <div className="bg-gradient-to-r from-purple-500 to-blue-600 p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold">{spot.상권_코드_명}</h3>
                        <p className="text-purple-100 flex items-center gap-2">
                          {getIndustryIcon(spot.서비스_업종_코드_명)} {spot.서비스_업종_코드_명}
                        </p>
                      </div>
                      <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">
                        ColdSpot 상권
                      </div>
                    </div>
                  </div>

                  {/* 매출 정보 */}
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-sm text-gray-600 mb-1">💰 월 총 매출</div>
                        <div className="text-lg font-bold text-gray-900">
                          {formatCurrency(spot.당월_매출_금액)}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-sm text-gray-600 mb-1">
                          {getTimeIcon(time)} {time} 매출
                        </div>
                        <div className="text-lg font-bold text-blue-600">
                          {formatCurrency(spot.선택시간대_매출)}
                        </div>
                      </div>
                    </div>

                    {/* 지표 정보 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">건당 매출</div>
                        <div className="font-semibold text-gray-700">
                          {formatCurrency(Math.round(spot.Conversion || 0))}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">품질 점수</div>
                        <div className="font-semibold text-gray-700">
                          {(spot.QualityScore || 0).toFixed(2)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">시간대 편차</div>
                        <div className="font-semibold text-gray-700">
                          {(spot.TimeRatio || 0).toFixed(1)}
                        </div>
                      </div>
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
