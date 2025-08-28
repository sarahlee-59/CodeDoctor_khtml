import React from 'react';

type StoreCardProps = {
  name: string;
  category: string;
  open_now?: boolean;
  crowd_level?: number;
  distance?: number;
  onClick?: () => void;
};

export default function StoreCard({ 
  name, 
  category, 
  open_now = true, 
  crowd_level = 0.5,
  distance,
  onClick 
}: StoreCardProps) {
  const getCrowdLevelColor = (level: number) => {
    if (level < 0.4) return 'bg-blue-100 text-blue-800';
    if (level > 0.7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getCrowdLevelText = (level: number) => {
    if (level < 0.4) return '한산';
    if (level > 0.7) return '혼잡';
    return '보통';
  };

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      '카페': 'bg-orange-100 text-orange-800',
      '마트': 'bg-blue-100 text-blue-800',
      '과일가게': 'bg-green-100 text-green-800',
      '디저트': 'bg-pink-100 text-pink-800',
    };
    return colors[cat] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div 
      className="card cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-neutral-text text-lg leading-tight">
          {name}
        </h3>
        {distance && (
          <span className="text-sm text-gray-500">
            {distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`}
          </span>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(category)}`}>
          {category}
        </span>
        
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          open_now ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {open_now ? '영업중' : '영업종료'}
        </span>
        
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCrowdLevelColor(crowd_level)}`}>
          {getCrowdLevelText(crowd_level)}
        </span>
      </div>
      
      <div className="flex items-center text-sm text-gray-600">
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
        <span>동대문구 전통시장</span>
      </div>
    </div>
  );
}
