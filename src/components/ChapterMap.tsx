import { useGameStore } from '../store/gameStore';
import { levels } from '../data/gameData';
import { FaBook, FaCheckCircle, FaStar, FaLock, FaCoins, FaTheaterMasks, FaCalculator, FaBoxes, FaChartLine, FaBullseye, FaFileAlt, FaTrophy, FaCrown } from 'react-icons/fa';

export function ChapterMap() {
  const { currentLevel, setPhase, completedLevels, checkLevelAccess, setPendingLevel } = useGameStore();
  
  const handleChapterClick = (levelIndex: number) => {
    // Проверка: доступен ли уровень по прогрессу
    if (levelIndex > currentLevel) {
      return; // Ещё не достигнут
    }
    
    // Проверка доступа (монетизация)
    if (!checkLevelAccess(levelIndex)) {
      // Уровень заблокирован - показываем paywall
      setPendingLevel(levelIndex);
      setPhase('paywall');
      return;
    }
    
    // Доступ есть - запускаем уровень
    useGameStore.setState({ currentLevel: levelIndex, currentDialogue: 0 });
    setPhase('dialogue');
  };
  
  return (
    <div className="min-h-screen pt-28 pb-10">
      <div className="container max-w-6xl mx-auto px-5">
        <h1 className="text-5xl font-bold mb-12 text-center text-shadow-glow animate-scale-in flex items-center justify-center gap-3">
          <FaBook className="text-primary" />
          Карта приключений
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {levels.map((level, index) => {
            const isAvailable = index <= currentLevel;
            const isCompleted = completedLevels.includes(level.id);
            const isCurrent = index === currentLevel;
            const isPremium = index > 2; // Главы 3+ - платные
            const hasAccess = checkLevelAccess(index);
            
            return (
              <div
                key={level.id}
                className={`glass-card cursor-pointer relative overflow-hidden ${
                  !isAvailable ? 'opacity-50 cursor-not-allowed' : ''
                } ${isCurrent ? 'ring-4 ring-secondary' : ''}`}
                style={{ 
                  background: isAvailable ? level.gradient : 'rgba(255, 255, 255, 0.1)',
                }}
                onClick={() => handleChapterClick(index)}
              >
                {isCompleted && (
                  <div className="absolute top-4 right-4 text-4xl animate-scale-in text-success">
                    <FaCheckCircle />
                  </div>
                )}
                
                {isCurrent && !isCompleted && (
                  <div className="absolute top-4 right-4 text-4xl animate-float text-yellow-400">
                    <FaStar />
                  </div>
                )}
                
                {/* Premium badge */}
                {isPremium && !hasAccess && (
                  <div className="absolute top-4 left-4 flex items-center gap-1 bg-secondary/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold">
                    <FaCrown className="text-yellow-300" />
                    <span>PRO</span>
                  </div>
                )}
                
                <div className="text-center">
                  <div className="text-6xl mb-4 animate-float">
                    {[
                      <FaCoins key="coin" className="mx-auto text-yellow-400" />,
                      <FaTheaterMasks key="theater" className="mx-auto text-pink-400" />,
                      <FaCalculator key="calc" className="mx-auto text-orange-400" />,
                      <FaBoxes key="boxes" className="mx-auto text-teal-400" />,
                      <FaChartLine key="chart" className="mx-auto text-blue-400" />,
                      <FaBullseye key="target" className="mx-auto text-red-400" />,
                      <FaFileAlt key="file" className="mx-auto text-purple-400" />,
                      <FaTrophy key="trophy" className="mx-auto text-yellow-500" />
                    ][index]}
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2">
                    Глава {index + 1}
                  </h3>
                  
                  <h4 className="text-xl mb-2 opacity-90">
                    {level.title}
                  </h4>
                  
                  <p className="text-base opacity-80">
                    {level.subtitle}
                  </p>
                  
                  {!isAvailable && (
                    <div className="mt-4 text-sm opacity-70 flex items-center justify-center gap-2">
                      <FaLock />
                      Заблокировано
                    </div>
                  )}
                  
                  {isAvailable && isPremium && !hasAccess && (
                    <div className="mt-4">
                      <button className="btn btn-secondary text-sm flex items-center gap-2 mx-auto">
                        <FaCrown className="text-yellow-300" />
                        Открыть доступ
                      </button>
                    </div>
                  )}
                  
                  {isCurrent && hasAccess && (
                    <div className="mt-4">
                      <button className="btn btn-primary text-sm">
                        Начать главу
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-xl opacity-90">
            Пройдено глав: {completedLevels.length} из {levels.length}
          </p>
        </div>
      </div>
    </div>
  );
}

