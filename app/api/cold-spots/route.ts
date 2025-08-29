import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Python 스크립트 실행
    const { stdout, stderr } = await execAsync('python scripts/coldspot_pipeline.py');
    
    if (stderr) {
      console.error('Python 스크립트 실행 중 오류:', stderr);
    }
    
    console.log('Python 스크립트 실행 결과:', stdout);
    
    // JSON 파일에서 결과 읽기
    const fs = require('fs');
    const path = require('path');
    
    const jsonPath = path.join(process.cwd(), 'public/api/cold-spots.json');
    
    if (fs.existsSync(jsonPath)) {
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      return NextResponse.json({
        success: true,
        message: 'ColdSpot 분석 완료',
        data: data,
        count: data.length
      });
    } else {
      return NextResponse.json({
        success: false,
        message: '결과 파일을 찾을 수 없습니다'
      }, { status: 404 });
    }
    
  } catch (error) {
    console.error('API 실행 오류:', error);
    return NextResponse.json({
      success: false,
      message: 'ColdSpot 분석 실행 중 오류가 발생했습니다',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // POST 요청으로 Python 스크립트 실행
    const { stdout, stderr } = await execAsync('python scripts/coldspot_pipeline.py');
    
    if (stderr) {
      console.error('Python 스크립트 실행 중 오류:', stderr);
    }
    
    console.log('Python 스크립트 실행 결과:', stdout);
    
    return NextResponse.json({
      success: true,
      message: 'ColdSpot 분석이 성공적으로 실행되었습니다',
      output: stdout
    });
    
  } catch (error) {
    console.error('POST 요청 실행 오류:', error);
    return NextResponse.json({
      success: false,
      message: 'ColdSpot 분석 실행 중 오류가 발생했습니다',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
