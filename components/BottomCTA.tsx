"use client"

interface BottomCTAProps {
  onRoute: () => void
  disabled?: boolean
}

export default function BottomCTA({ onRoute, disabled = false }: BottomCTAProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg md:relative md:border-t-0 md:shadow-none md:bg-transparent md:p-0">
      <button
        onClick={onRoute}
        disabled={disabled}
        className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-colors ${
          disabled
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        }`}
        aria-label="경로 생성하기"
      >
        경로 생성
      </button>
    </div>
  )
}
