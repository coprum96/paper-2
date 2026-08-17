import { useGameStore } from '../store/gameStore';
import { useEffect, useState } from 'react';

export function StatsBar() {
  const { coins, wisdom, completedLevels } = useGameStore();
  const [prevCoins, setPrevCoins] = useState(coins);
  const [coinAnimation, setCoinAnimation] = useState(false);
  
  // Coin change animation
  useEffect(() => {
    if (coins !== prevCoins) {
      setCoinAnimation(true);
      setTimeout(() => setCoinAnimation(false), 600);
      setPrevCoins(coins);
    }
  }, [coins, prevCoins]);
  
  const totalLevels = 14; // Общее количество уровней в игре (0-13)
  const progressPercent = Math.round((completedLevels.length / totalLevels) * 100);
  
  return (
    <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50 flex items-center gap-2 sm:gap-3">
      {/* Coins - iOS Style */}
      <div 
        id="coinStat" 
        className={`bg-white/10 backdrop-blur-md px-2 sm:px-3 py-1.5 sm:py-2 rounded-full border border-yellow-400/20 flex items-center gap-1.5 sm:gap-2 shadow-lg hover:scale-105 transition-all duration-300 ${coinAnimation ? 'animate-bounce' : ''}`}
      >
        {/* Coin SVG Icon */}
        <svg 
          className={`w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 ${coinAnimation ? 'animate-spin' : ''}`} 
          viewBox="0 0 24 24" 
          fill="none"
        >
          <circle cx="12" cy="12" r="10" fill="url(#goldGradient)" stroke="#F59E0B" strokeWidth="2"/>
          <circle cx="12" cy="12" r="7" fill="#FBBF24" opacity="0.6"/>
          <path d="M12 7v10M9 9.5l3-2 3 2M9 14.5l3 2 3-2" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round"/>
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FCD34D"/>
              <stop offset="50%" stopColor="#F59E0B"/>
              <stop offset="100%" stopColor="#D97706"/>
            </linearGradient>
          </defs>
        </svg>
        <span className="text-yellow-100 text-sm sm:text-base font-bold min-w-[20px] text-center">{coins}</span>
      </div>
      
      {/* Wisdom Progress - iOS Battery Style */}
      <div className="bg-white/10 backdrop-blur-md px-2 sm:px-3 py-1.5 sm:py-2 rounded-full border border-purple-400/20 flex items-center gap-1.5 sm:gap-2 shadow-lg min-w-[80px] sm:min-w-[100px]">
        {/* Lightbulb Icon */}
        <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-purple-300" fill="currentColor" viewBox="0 0 20 20">
          <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z"/>
        </svg>
        <div className="flex-1 flex items-center gap-1 sm:gap-1.5">
          <div className="flex-1 h-1.5 sm:h-2 bg-black/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-400 rounded-full transition-all duration-700 ease-out"
              style={{ 
                width: `${wisdom}%`,
                boxShadow: '0 0 8px rgba(168, 85, 247, 0.6)'
              }}
            />
          </div>
          <span className="text-purple-200 text-xs sm:text-sm font-semibold min-w-[24px] sm:min-w-[28px] text-right">{wisdom}%</span>
        </div>
      </div>
      
      {/* Chapter Progress - iOS Battery Style */}
      <div className="bg-white/10 backdrop-blur-md px-2 sm:px-3 py-1.5 sm:py-2 rounded-full border border-blue-400/20 flex items-center gap-1.5 sm:gap-2 shadow-lg min-w-[80px] sm:min-w-[100px]">
        {/* Book Icon */}
        <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
        </svg>
        <div className="flex-1 flex items-center gap-1 sm:gap-1.5">
          <div className="flex-1 h-1.5 sm:h-2 bg-black/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-teal-400 rounded-full transition-all duration-700 ease-out"
              style={{ 
                width: `${progressPercent}%`,
                boxShadow: '0 0 8px rgba(59, 130, 246, 0.6)'
              }}
            />
          </div>
          <span className="text-blue-200 text-xs sm:text-sm font-semibold min-w-[24px] sm:min-w-[28px] text-right">{completedLevels.length}/{totalLevels}</span>
        </div>
      </div>
    </div>
  );
}

