-- 상품 카테고리 테이블
CREATE TABLE categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    count INT DEFAULT 0
);

-- 판매처 테이블
CREATE TABLE vendors (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    count INT DEFAULT 0
);

-- 혜택 유형 테이블
CREATE TABLE benefits (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    count INT DEFAULT 0
);

-- 상품 테이블
CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    subcategory VARCHAR(50) NOT NULL,
    origin VARCHAR(50) NOT NULL,
    region VARCHAR(50) NOT NULL,
    weight VARCHAR(50) NOT NULL,
    grade VARCHAR(20) NOT NULL,
    image VARCHAR(200) NOT NULL,
    base_price INT NOT NULL,
    discount_rate INT NOT NULL,
    final_price INT NOT NULL,
    lowest_price INT NOT NULL,
    lowest_price_vendor VARCHAR(100) NOT NULL,
    distance VARCHAR(20) NOT NULL,
    rating DECIMAL(2,1) NOT NULL,
    review_count INT NOT NULL,
    registered_date DATE NOT NULL,
    in_stock BOOLEAN DEFAULT true,
    freshness VARCHAR(50) NOT NULL,
    FOREIGN KEY (category) REFERENCES categories(id)
);

-- 상품-혜택 연결 테이블
CREATE TABLE product_benefits (
    product_id VARCHAR(50),
    benefit_id VARCHAR(50),
    PRIMARY KEY (product_id, benefit_id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (benefit_id) REFERENCES benefits(id)
);

-- 관련 기사 테이블
CREATE TABLE articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    summary TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 사용 후기 테이블
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    rating INT NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 인덱스 생성
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_registered_date ON products(registered_date);
CREATE INDEX idx_products_rating ON products(rating);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_articles_product_id ON articles(product_id);
