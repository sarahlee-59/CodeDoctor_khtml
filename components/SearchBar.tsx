"use client"

import { useState, type FormEvent } from "react"

interface SearchBarProps {
  onSubmit: (text: string) => void
}

export default function SearchBar({ onSubmit }: SearchBarProps) {
  const [text, setText] = useState("")

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (text.trim()) {
      onSubmit(text.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="3시 한식 덜 붐비는 코스"
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="상점 검색"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          aria-label="검색"
        >
          검색
        </button>
      </div>
    </form>
  )
}
