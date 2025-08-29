# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 가입하고 로그인
2. "New Project" 클릭
3. 프로젝트 이름과 데이터베이스 비밀번호 설정
4. 지역 선택 (한국 사용자라면 `ap-northeast-1` 추천)

## 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 환경 변수 찾는 방법:
1. Supabase 대시보드 → Settings → API
2. `Project URL`과 `anon public` 키를 복사
3. `.env.local` 파일에 붙여넣기

## 3. 데이터베이스 테이블 생성

### 예시: profiles 테이블

```sql
-- profiles 테이블 생성
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 정책 설정 (모든 사용자가 읽기/쓰기 가능)
CREATE POLICY "Allow all operations for all users" ON profiles
  FOR ALL USING (true);
```

## 4. 사용법

### 기본 사용법

```typescript
import { supabase } from '@/lib/supabase'

// 데이터 조회
const { data, error } = await supabase
  .from('profiles')
  .select('*')

// 데이터 추가
const { error } = await supabase
  .from('profiles')
  .insert([{ email: 'test@example.com', full_name: 'Test User' }])

// 데이터 수정
const { error } = await supabase
  .from('profiles')
  .update({ full_name: 'Updated Name' })
  .eq('id', 'user-id')

// 데이터 삭제
const { error } = await supabase
  .from('profiles')
  .delete()
  .eq('id', 'user-id')
```

### 인증 사용법

```typescript
// 회원가입
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
})

// 로그인
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})

// 로그아웃
const { error } = await supabase.auth.signOut()

// 현재 사용자 정보
const { data: { user } } = await supabase.auth.getUser()
```

## 5. 실시간 구독

```typescript
// 실시간으로 데이터 변경 감지
const subscription = supabase
  .channel('profiles')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'profiles' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()

// 구독 해제
subscription.unsubscribe()
```

## 6. 파일 업로드

```typescript
// 파일 업로드
const { data, error } = await supabase.storage
  .from('avatars')
  .upload('public/avatar1.png', file)

// 파일 다운로드
const { data } = supabase.storage
  .from('avatars')
  .download('public/avatar1.png')
```

## 7. 주의사항

- `NEXT_PUBLIC_` 접두사가 붙은 환경 변수는 클라이언트 사이드에서 접근 가능
- 민감한 정보는 서버 사이드에서만 사용
- RLS 정책을 적절히 설정하여 보안 강화
- 프로덕션에서는 적절한 에러 핸들링 구현

## 8. 유용한 링크

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase JavaScript 클라이언트](https://supabase.com/docs/reference/javascript)
- [Supabase Auth 가이드](https://supabase.com/docs/guides/auth)
- [Supabase 실시간 기능](https://supabase.com/docs/guides/realtime)
