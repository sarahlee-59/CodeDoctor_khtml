// pages/api/recommend.ts
import { NextApiRequest, NextApiResponse } from "next";
import mysql from "mysql2/promise";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { region, industry, time } = req.query;

  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Muxchk@01033",
    database: "seoyeon_db",
  });

  // 기본 SQL
  let sql = `
    SELECT 상권_코드_명, 서비스_업종_코드_명, Conversion, QualityScore, TimeRatio
    FROM cold_spots
    WHERE ColdSpot = 1
      AND QualityScore > 0.6
  `;
  const params: any[] = [];

  // 조건 동적 추가
  if (region && region !== "전체") {
    sql += " AND 시군구명 = ? ";
    params.push(region);
  }

  if (industry && industry !== "전체") {
    sql += " AND 서비스_업종_코드_명 LIKE ? ";
    params.push(`%${industry}%`);
  }

  if (time && time === "저녁") {
    sql += " AND TimeRatio > 3 "; // 저녁 시간대 기준
  }

  sql += " ORDER BY Conversion ASC LIMIT 5";

  const [rows] = await connection.execute(sql, params);
  connection.end();

  res.status(200).json(rows);
}
