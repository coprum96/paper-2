import { useGameStore } from '../store/gameStore';
import { FaSearch, FaPlay, FaUniversity } from 'react-icons/fa';
import { sessionAnalytics } from '../utils/sessionAnalytics';

export function StartScreen() {
  const { setPhase, incrementCitizensCount } = useGameStore();
  
  const handleStart = () => {
    // Начинаем новую сессию для исследования
    sessionAnalytics.startSession();
    incrementCitizensCount();
    setPhase('chapterMap');
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:px-6">
      <div className="container max-w-5xl mx-auto text-center">
        {/* SPbGU Support Badge */}
        <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-blue-500/20 backdrop-blur-lg rounded-2xl border-2 border-blue-400/50 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base md:text-lg">
            <FaUniversity className="text-blue-300 text-xl sm:text-2xl" />
            <span className="font-semibold text-blue-100">
              BehaviourTech разработан при поддержке СПбГУ
            </span>
          </div>
        </div>
        
        {/* Character Image - ОГРОМНЫЙ! 🔥 */}
        <div className="mb-10 sm:mb-12 relative">
          {/* Свечение вокруг персонажа */}
          <div className="absolute inset-0 blur-[100px] bg-gradient-to-r from-yellow-400/40 via-orange-400/40 to-purple-400/40 rounded-full animate-pulse"></div>
          
          {/* Само изображение */}
          <img 
            src="/img/character_buratino_happy.png" 
            alt="Buratino" 
            className="w-64 h-auto sm:w-72 md:w-80 lg:w-96 xl:w-[28rem] 2xl:w-[32rem] mx-auto rounded-3xl shadow-2xl animate-float relative z-10 hover:scale-105 transition-transform duration-500"
            style={{
              filter: 'drop-shadow(0 0 40px rgba(251, 191, 36, 0.6))',
            }}
            onError={(e) => e.currentTarget.style.display = 'none'}
          />
        </div>
        
        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-3 sm:mb-4 text-shadow-glow animate-float px-2 flex items-center justify-center gap-3 sm:gap-4">
          <FaSearch className="text-yellow-400" />
          Золотой Детектор
        </h1>
        
        {/* Subtitle */}
        <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 md:mb-12 opacity-90 px-4">
          Защита от финансового мошенничества
        </p>
        
        {/* Description */}
        <p className="text-sm sm:text-base md:text-lg mb-8 sm:mb-10 opacity-90 max-w-2xl mx-auto px-4 leading-relaxed">
          Присоединяйся к приключению Буратино! Научись распознавать финансовое мошенничество 
          и защищать свои деньги от хитрых мошенников.
        </p>
        
        {/* Start Button - Bigger size */}
        <button 
          className="btn btn-primary text-xl sm:text-2xl md:text-3xl px-10 sm:px-12 md:px-16 py-4 sm:py-5 md:py-6 flex items-center gap-3 sm:gap-4 mx-auto shadow-2xl hover:scale-110 transition-all duration-300"
          onClick={handleStart}
        >
          <FaPlay className="text-2xl sm:text-3xl" />
          Начать приключение
        </button>
      </div>
    </div>
  );
}

