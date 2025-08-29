"use client"

import type { Shop } from "@/lib/types"

interface MapPlaceholderProps {
  selected?: Shop | null
}

export default function MapPlaceholder({ selected }: MapPlaceholderProps) {
  return (
    <div className="w-full h-80 md:h-96 lg:h-[500px] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center p-6">
        <div className="text-gray-500 mb-4">
          <svg
            className="w-16 h-16 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
        </div>
        <p className="text-gray-600 font-medium mb-2">지도 준비 중</p>
        <p className="text-sm text-gray-500">(Kakao Maps 연결 예정)</p>

        {selected && (
          <div className="mt-4 p-3 bg-blue-100 rounded-md">
            <p className="text-sm font-medium text-blue-800">선택: {selected.name}</p>
            <p className="text-xs text-blue-600">
              {selected.category} • {selected.open}시-{selected.close === 24 ? "24시" : `${selected.close}시`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
