#!/usr/bin/env python3
"""
SQLite 데이터베이스를 MySQL로 변환하는 스크립트
market_prices.db → MySQL seoyeon_db.market_prices
"""

import sqlite3
import mysql.connector
import pandas as pd
from datetime import datetime
import sys
import os

def main():
    print("🚀 SQLite → MySQL 변환 시작...")
    
    # 1. SQLite 파일 경로
    sqlite_file = "market_prices(5).db"
    if not os.path.exists(sqlite_file):
        print(f"❌ SQLite 파일을 찾을 수 없습니다: {sqlite_file}")
        sys.exit(1)
    
    try:
        # 2. SQLite 연결 및 데이터 읽기
        print("📁 SQLite 데이터 읽는 중...")
        sqlite_conn = sqlite3.connect(sqlite_file)
        
        # 테이블 구조 확인
        cursor = sqlite_conn.cursor()
        cursor.execute("PRAGMA table_info(prices)")
        columns = cursor.fetchall()
        print(f"✅ 테이블 구조: {len(columns)}개 컬럼")
        
        # 데이터 읽기
        df = pd.read_sql_query("SELECT * FROM prices", sqlite_conn)
        print(f"✅ 데이터 로드 완료: {len(df)}개 행")
        
        # 데이터 타입 변환
        df['pub_date'] = pd.to_datetime(df['pub_date'])
        df['j_avg_price'] = pd.to_numeric(df['j_avg_price'], errors='coerce')
        df['m_avg_price'] = pd.to_numeric(df['m_avg_price'], errors='coerce')
        
        # NaN 값 처리
        df = df.dropna()
        print(f"✅ 데이터 정리 완료: {len(df)}개 행")
        
        sqlite_conn.close()
        
        # 3. MySQL 연결
        print("🔌 MySQL 연결 중...")
        mysql_conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="wogus!204",
            database="seoyeon_db"
        )
        
        cursor = mysql_conn.cursor()
        
        # 4. 테이블 생성
        print("🏗️ MySQL 테이블 생성 중...")
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS market_prices (
            id INT AUTO_INCREMENT PRIMARY KEY,
            prod_name VARCHAR(100) NOT NULL,
            pub_date DATE NOT NULL,
            j_avg_price INT,
            m_avg_price INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_prod_name (prod_name),
            INDEX idx_pub_date (pub_date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
        
        cursor.execute(create_table_sql)
        print("✅ market_prices 테이블 생성 완료")
        
        # 5. 기존 데이터 삭제 (선택사항)
        cursor.execute("DELETE FROM market_prices")
        print("✅ 기존 데이터 삭제 완료")
        
        # 6. 데이터 삽입
        print("💾 데이터 삽입 중...")
        
        insert_sql = """
        INSERT INTO market_prices (prod_name, pub_date, j_avg_price, m_avg_price)
        VALUES (%s, %s, %s, %s)
        """
        
        # 배치 삽입으로 성능 향상
        batch_size = 100
        for i in range(0, len(df), batch_size):
            batch = df.iloc[i:i+batch_size]
            values = [
                (row['prod_name'], row['pub_date'].date(), row['j_avg_price'], row['m_avg_price'])
                for _, row in batch.iterrows()
            ]
            cursor.executemany(insert_sql, values)
            mysql_conn.commit()
            print(f"  📊 {i+len(batch)}/{len(df)} 행 삽입 완료")
        
        # 7. 결과 확인
        cursor.execute("SELECT COUNT(*) FROM market_prices")
        count = cursor.fetchone()[0]
        print(f"✅ MySQL에 저장된 데이터: {count:,}개 행")
        
        # 샘플 데이터 확인
        cursor.execute("SELECT * FROM market_prices LIMIT 5")
        sample_data = cursor.fetchall()
        print("🔍 샘플 데이터:")
        for row in sample_data:
            print(f"  {row}")
        
        # 8. 정리
        cursor.close()
        mysql_conn.close()
        
        print("\n🎉 SQLite → MySQL 변환 완료!")
        print(f"📋 저장된 데이터: {count:,}개 행")
        print("📋 테이블명: market_prices")
        print("📋 데이터베이스: seoyeon_db")
        
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
