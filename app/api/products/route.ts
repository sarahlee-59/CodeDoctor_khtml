import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET() {
  try {
    // 임시로 JSON 파일에서 데이터를 읽어옵니다
    const jsonDirectory = path.join(process.cwd(), 'public/data')
    const fileContents = await fs.readFile(jsonDirectory + '/mockDB.json', 'utf8')
    const data = JSON.parse(fileContents)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
