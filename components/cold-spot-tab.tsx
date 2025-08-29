"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, RefreshCw, TrendingDown, MapPin, DollarSign, Clock } from "lucide-react";

interface ColdSpot {
  상권_코드: string;
  상권_코드_명: string;
  서비스_업종_코드: string;
  서비스_업종_코드_명: string;
  당월_매출_금액: number;
  당월_매출_건수: number;
  Conversion: number;
  RelSales: number;
  QualityScore: number;
  TimeRatio: number;
  ColdSpot: boolean;
}

export default function ColdSpotTab() {
  const [coldSpots, setColdSpots] = useState<ColdSpot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    coldSpotCount: 0,
    avgConversion: 0,
    avgQualityScore: 0
  });

  const fetchColdSpots = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/cold-spots');
      const result = await response.json();
      
      if (result.success) {
        setColdSpots(result.data);
        calculateStats(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('데이터를 불러오는 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/cold-spots', { method: 'POST' });
      const result = await response.json();
      
      if (result.success) {
        // 분석 완료 후 데이터 다시 불러오기
        await fetchColdSpots();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('분석 실행 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: ColdSpot[]) => {
    if (data.length === 0) return;
    
    const avgConversion = data.reduce((sum, item) => sum + item.Conversion, 0) / data.length;
    const avgQualityScore = data.reduce((sum, item) => sum + item.QualityScore, 0) / data.length;
    
    setStats({
      total: data.length,
      coldSpotCount: data.filter(item => item.ColdSpot).length,
      avgConversion: Math.round(avgConversion),
      avgQualityScore: Math.round(avgQualityScore * 100) / 100
    });
  };

  useEffect(() => {
    fetchColdSpots();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const getRiskLevel = (conversion: number, relSales: number) => {
    if (conversion < 3000 || relSales < 0.5) return "high";
    if (conversion < 5000 || relSales < 0.8) return "medium";
    return "low";
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">ColdSpot 분석</h2>
          <p className="text-muted-foreground">
            매출 효율성이 낮은 상권을 식별하고 분석합니다
          </p>
        </div>
        <Button onClick={runAnalysis} disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          분석 실행
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 상권 수</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ColdSpot 수</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.coldSpotCount.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 Conversion</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.avgConversion)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 품질점수</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgQualityScore}</div>
          </CardContent>
        </Card>
      </div>

      {/* 오류 메시지 */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 데이터 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>ColdSpot 상권 목록</CardTitle>
          <CardDescription>
            매출 효율성이 낮은 상권들의 상세 정보
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">데이터를 불러오는 중...</span>
            </div>
          ) : coldSpots.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>상권명</TableHead>
                    <TableHead>업종</TableHead>
                    <TableHead>매출금액</TableHead>
                    <TableHead>Conversion</TableHead>
                    <TableHead>상대매출</TableHead>
                    <TableHead>품질점수</TableHead>
                    <TableHead>시간편차</TableHead>
                    <TableHead>위험도</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coldSpots.map((spot, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{spot.상권_코드_명}</TableCell>
                      <TableCell>{spot.서비스_업종_코드_명}</TableCell>
                      <TableCell>{formatCurrency(spot.당월_매출_금액)}</TableCell>
                      <TableCell>{formatCurrency(Math.round(spot.Conversion))}</TableCell>
                      <TableCell>{(spot.RelSales * 100).toFixed(1)}%</TableCell>
                      <TableCell>{(spot.QualityScore * 100).toFixed(1)}%</TableCell>
                      <TableCell>{spot.TimeRatio.toFixed(1)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            getRiskLevel(spot.Conversion, spot.RelSales) === 'high' ? 'destructive' :
                            getRiskLevel(spot.Conversion, spot.RelSales) === 'medium' ? 'secondary' : 'default'
                          }
                        >
                          {getRiskLevel(spot.Conversion, spot.RelSales) === 'high' ? '높음' :
                           getRiskLevel(spot.Conversion, spot.RelSales) === 'medium' ? '보통' : '낮음'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              ColdSpot 데이터가 없습니다. 분석을 실행해주세요.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
