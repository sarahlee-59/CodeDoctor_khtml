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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {results.map((r, idx) => {
                // 매출 비율 계산 (시간대 매출 대비 당월 매출)
                const timeRevenue = r.선택시간대_매출 || 0;
                const monthRevenue = r.당월_매출_금액 || 0;
                const revenueRatio = monthRevenue > 0 ? Math.min((timeRevenue / monthRevenue) * 100, 100) : 0;
                
                // ColdSpot 등급 계산 (매출이 낮을수록 높은 등급)
                const coldSpotGrade = monthRevenue < 1000000 ? 'S' : 
                                     monthRevenue < 2000000 ? 'A' : 
                                     monthRevenue < 3000000 ? 'B' : 'C';
                
                const gradeColors = {
                  'S': 'from-purple-500 to-pink-500',
                  'A': 'from-blue-500 to-cyan-500', 
                  'B': 'from-green-500 to-emerald-500',
                  'C': 'from-yellow-500 to-orange-500'
                };

                return (
                  <div 
                    key={idx} 
                    className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden group hover:-translate-y-2 relative"
                    style={{
                      animation: `fadeInUp 0.6s ease-out ${idx * 0.1}s both`
                    }}
                  >
                    {/* ColdSpot 등급 배지 */}
                    <div className="absolute top-4 right-4 z-10">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${gradeColors[coldSpotGrade]} flex items-center justify-center shadow-lg`}>
                        <span className="text-white font-bold text-lg">{coldSpotGrade}</span>
                      </div>
                    </div>

                    {/* 카드 헤더 */}
                    <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 p-6 text-white relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"></div>
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-xl leading-tight max-w-[70%]">{r.상권_코드_명}</h3>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{getIndustryIcon(r.서비스_업종_코드_명)}</span>
                          <span className="text-sm bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                            {r.서비스_업종_코드_명}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* 카드 바디 */}
                    <div className="p-6 space-y-5">
                      {/* 매출 정보 with 프로그레스 바 */}
                      <div className="space-y-4">
                        {/* 당월 매출 */}
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-2xl border border-blue-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-700 flex items-center">
                              💰 당월 총 매출
                            </span>
                            <span className="font-bold text-blue-700 text-lg">
                              {monthRevenue.toLocaleString()} 원
                            </span>
                          </div>
                          <div className="w-full bg-blue-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full progress-bar"
                              style={{ width: `${Math.min((monthRevenue / 5000000) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        {/* 시간대별 매출 */}
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-2xl border border-purple-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-700 flex items-center">
                              {getTimeIcon(time)} {time} 시간대 매출
                            </span>
                            <span className="text-bold text-purple-700 text-lg">
                              {timeRevenue.toLocaleString()} 원
                            </span>
                          </div>
                          <div className="w-full bg-purple-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full progress-bar"
                              style={{ width: `${revenueRatio}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* 매출 효율성 지표 */}
                      <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-2xl border border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-600 flex items-center">
                            📊 매출 효율성
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">{revenueRatio.toFixed(1)}%</span>
                            <div className={`w-3 h-3 rounded-full ${revenueRatio < 10 ? 'bg-green-400' : revenueRatio < 30 ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                          </div>
                        </div>
                      </div>

                      {/* ColdSpot 특성 배지들 */}
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border border-emerald-200">
                          ❄️ ColdSpot
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border border-orange-200">
                          🎯 진입 기회
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200">
                          💡 잠재력
                        </span>
                      </div>

                      {/* 액션 버튼 */}
                      <div className="pt-2">
                        <button className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                          🔍 상세 분석 보기
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl p-16 text-center border border-gray-200 relative overflow-hidden">
              {/* 배경 장식 */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-cyan-200/30 to-blue-200/30 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative z-10">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl animate-pulse-glow">
                  <Search className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  🔍 ColdSpot을 찾고 있어요!
                </h3>
                <p className="text-gray-600 mb-8 text-lg leading-relaxed max-w-md mx-auto">
                  현재 조건에 맞는 ColdSpot이 없거나<br/>
                  검색 조건을 조정해보세요
                </p>
                
                {/* 추천 팁 */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-200">
                  <h4 className="font-semibold text-gray-700 mb-3">💡 검색 팁</h4>
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>• 지역을 '전체'로 변경해보세요</p>
                    <p>• 다른 업종을 선택해보세요</p>
                    <p>• 다른 시간대를 시도해보세요</p>
                  </div>
                </div>
                
                <button
                  onClick={fetchData}
                  disabled={isLoading}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-2xl hover:from-indigo-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>검색 중...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5" />
                      <span>다시 검색하기</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
