interface Article {
  title: string
  summary: string
}

interface Review {
  title: string
  content: string
  rating: number
  date: string
}

export interface Product {
  id: string
  name: string
  category: string
  subcategory: string
  origin: string
  region: string
  weight: string
  grade: string
  image: string
  basePrice: number
  discountRate: number
  finalPrice: number
  lowestPrice: number
  lowestPriceVendor: string
  distance: string
  rating: number
  reviewCount: number
  registeredDate: string
  benefits: string[]
  inStock: boolean
  freshness: string
  articles: Article[]
  reviews: Review[]
}

export interface Vendor {
  id: string
  name: string
  count: number
}

export interface Category {
  id: string
  name: string
  count: number
}

export interface Benefit {
  id: string
  name: string
  count: number
}

export interface DB {
  products: Product[]
  vendors: Vendor[]
  categories: Category[]
  benefits: Benefit[]
}

// API를 통해 데이터 가져오기
export async function getProducts(): Promise<Product[]> {
  const response = await fetch('/api/products')
  const data = await response.json()
  return data.products
}

export async function getVendors(): Promise<Vendor[]> {
  const response = await fetch('/api/products')
  const data = await response.json()
  return data.vendors
}

export async function getCategories(): Promise<Category[]> {
  const response = await fetch('/api/products')
  const data = await response.json()
  return data.categories
}

export async function getBenefits(): Promise<Benefit[]> {
  const response = await fetch('/api/products')
  const data = await response.json()
  return data.benefits
}

export async function getDB(): Promise<DB> {
  const response = await fetch('/api/products')
  const data = await response.json()
  return data
}

// 데이터 카운트 계산 유틸리티 함수들
export function countByVendorType(products: Product[], type: string): number {
  return products.filter(p => p.lowestPriceVendor.includes(type)).length
}

export function countByBenefitType(products: Product[], type: string): number {
  return products.filter(p => p.benefits.includes(type)).length
}

export function countByCategory(products: Product[], category: string): number {
  return products.filter(p => p.category === category).length
}