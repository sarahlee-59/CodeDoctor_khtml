"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Clock, TrendingUp, Star } from "lucide-react";

interface ColdSpot {
  상권_코드_명: string;
  서비스_업종_코드_명: string;
  Conversion: number;
  QualityScore: number;
  TimeRatio: number;
}

export default function RecommendTab() {
  const [region, setRegion] = useState("전체");
  const [industry, setIndustry] = useState("전체");
  const [time, setTime] = useState("전체");
  const [results, setResults] = useState<ColdSpot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        region: region === "전체" ? "" : region,
        industry: industry === "전체" ? "" : industry,
        time: time === "전체" ? "" : time,
      });

      const response = await fetch(`/api/recommend?${params}`);
      
      if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
      }

      const data = await response.json();
      
      if (Array.isArray(data)) {
        setResults(data);
      } else {
        throw new Error("잘못된 데이터 형식");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 0.8) return "bg-green-100 text-green-800";
    if (score >= 0.6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getTimeRatioColor = (ratio: number) => {
    if (ratio >= 5) return "bg-red-100 text-red-800";
    if (ratio >= 3) return "bg-orange-100 text-orange-800";
    return "bg-blue-100 text-blue-800";
  };

  return (
    <div className="space-y-6 p-6">
      {/* Cold Spot 정의 설명 */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Star className="h-5 w-5" />
            💡 Cold Spot이란?
          </CardTitle>
          <CardDescription className="text-blue-700 text-base">
            매출 효율성은 낮지만 품질은 높고, 특정 시간대에 한산하여
            '줄 서지 않고 좋은 상품을 구매할 수 있는 숨은 상권'을 의미합니다.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* 필터 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle>맞춤 Cold Spot 추천</CardTitle>
          <CardDescription>
            지역, 업종, 시간대를 선택하여 최적의 Cold Spot을 찾아보세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">지역</label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="지역 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="전체">전체</SelectItem>
                  <SelectItem value="동대문구">동대문구</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">업종</label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="업종 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="전체">전체</SelectItem>
                  <SelectItem value="반찬">반찬</SelectItem>
                  <SelectItem value="정육">정육</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">시간대</label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger>
                  <SelectValue placeholder="시간대 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="전체">전체</SelectItem>
                  <SelectItem value="아침">아침</SelectItem>
                  <SelectItem value="점심">점심</SelectItem>
                  <SelectItem value="저녁">저녁</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={fetchRecommendations} 
            disabled={loading}
            className="w-full md:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                추천 중...
              </>
            ) : (
              <>
                <TrendingUp className="mr-2 h-4 w-4" />
                Cold Spot 추천받기
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 에러 메시지 */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700 text-center">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* 결과 섹션 */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              추천 결과 ({results.length}개)
            </CardTitle>
            <CardDescription>
              선택한 조건에 맞는 최적의 Cold Spot 상권입니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((spot, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{spot.상권_코드_명}</CardTitle>
                    <CardDescription className="text-sm">
                      {spot.서비스_업종_코드_명}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Conversion</span>
                      <Badge variant="outline" className="font-mono">
                        {spot.Conversion?.toFixed(0) || 'N/A'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">품질점수</span>
                      <Badge className={getQualityColor(spot.QualityScore)}>
                        {(spot.QualityScore * 100).toFixed(1)}%
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">시간편차</span>
                      <Badge className={getTimeRatioColor(spot.TimeRatio)}>
                        {spot.TimeRatio?.toFixed(1) || 'N/A'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 빈 상태 */}
      {!loading && !error && results.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">아직 추천 결과가 없습니다</p>
              <p className="text-sm">위의 조건을 선택하고 추천받기 버튼을 클릭해보세요</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}





