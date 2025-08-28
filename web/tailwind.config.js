/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B6B', // 레드 오렌지 - CTA 버튼/포인트
          hover: '#FF5252',
        },
        secondary: {
          DEFAULT: '#4ECDC4', // 민트 - 배경 강조
          hover: '#45B7AF',
        },
        neutral: {
          bg: '#F7F7F7', // 배경
          text: '#333333', // 텍스트
        }
      },
      fontFamily: {
        sans: ['Inter', 'Pretendard', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}
