import { useState } from 'react';

interface LieSegment {
  text: string;
  isLie: boolean;
  explanation?: string;
}

interface LieDetectorProps {
  character: string;
  lies: LieSegment[];
  onComplete?: (score: number) => void;
}

export function LieDetector({ character, lies, onComplete }: LieDetectorProps) {
  const [selectedSegments, setSelectedSegments] = useState<Set<number>>(new Set());
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  
  const handleCheck = () => {
    let correctCount = 0;
    
    lies.forEach((lie, index) => {
      if (lie.isLie && selectedSegments.has(index)) {
        correctCount++;
      }
    });
    
    const totalLies = lies.filter(l => l.isLie).length;
    const finalScore = Math.round((correctCount / totalLies) * 100);
    setScore(finalScore);
    setRevealed(true);
    
    if (onComplete) {
      onComplete(finalScore);
    }
  };
  
  const toggleSegment = (index: number) => {
    if (revealed) return;
    
    const newSelected = new Set(selectedSegments);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedSegments(newSelected);
  };
  
  const getSegmentClass = (index: number, isLie: boolean) => {
    if (!revealed) {
      return selectedSegments.has(index)
        ? 'bg-yellow-500/40 border-b-2 border-yellow-500 cursor-pointer hover:bg-yellow-500/60'
        : 'cursor-pointer hover:bg-white/10';
    }
    
    // После проверки
    if (isLie) {
      return selectedSegments.has(index)
        ? 'bg-success/40 border-b-2 border-success' // Правильно нашли ложь
        : 'bg-danger/40 border-b-2 border-danger'; // Пропустили ложь
    }
    
    return selectedSegments.has(index)
      ? 'bg-danger/30 border-b-2 border-danger' // Неправильно отметили правду как ложь
      : 'bg-white/10'; // Правильно не отметили правду
  };
  
  const getLiesFound = () => {
    const totalLies = lies.filter(l => l.isLie).length;
    const foundLies = lies.filter((l, i) => l.isLie && selectedSegments.has(i)).length;
    return { found: foundLies, total: totalLies };
  };
  
  const liesStats = getLiesFound();
  
  return (
    <div className="glass-card max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <div className="text-5xl sm:text-6xl mb-3">🔍</div>
        <h3 className="text-2xl sm:text-3xl font-bold mb-2 break-words">
          Детектор лжи
        </h3>
        <p className="text-sm sm:text-base opacity-90 break-words word-wrap mb-4">
          Выделите подозрительные фразы {character}
        </p>
        
        {/* Статистика */}
        {!revealed && (
          <div className="flex justify-center gap-4">
            <div className="px-4 py-2 bg-white/20 rounded-lg border border-white/30">
              Выделено: <span className="font-bold">{liesStats.found}</span> / {liesStats.total}
            </div>
          </div>
        )}
        
        {revealed && (
          <div className="flex justify-center gap-4">
            <div className={`px-4 py-2 rounded-lg border-2 ${
              score >= 80 ? 'bg-success/20 border-success text-white' : 
              score >= 50 ? 'bg-yellow-500/30 border-yellow-500 text-gray-900 font-semibold' : 
              'bg-danger/20 border-danger text-white'
            }`}>
              Точность: <span className="font-bold">{score}%</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Текст для анализа */}
      <div className="bg-white/5 rounded-xl p-4 sm:p-6 mb-6">
        <div className="text-base sm:text-lg leading-relaxed break-words word-wrap">
          {lies.map((segment, index) => (
            <span
              key={index}
              onClick={() => toggleSegment(index)}
              className={`inline-block px-1 py-0.5 rounded transition-all ${getSegmentClass(index, segment.isLie)}`}
              style={{ marginRight: '0.25rem' }}
            >
              {segment.text}
              {revealed && segment.isLie && (
                <span className="ml-1 text-danger">
                  {selectedSegments.has(index) ? '✓' : '✗'}
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
      
      {/* Кнопка проверки */}
      {!revealed && (
        <div className="flex justify-center mb-6">
          <button
            onClick={handleCheck}
            disabled={selectedSegments.size === 0}
            className={`px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl transition-all ${
              selectedSegments.size === 0
                ? 'bg-white/20 cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-primary to-purple-700 hover:scale-105 active:scale-95'
            }`}
          >
            🔍 Проверить
          </button>
        </div>
      )}
      
      {/* Объяснения */}
      {revealed && (
        <div className="space-y-4">
          <div className="bg-primary/20 border-2 border-primary/40 rounded-xl p-4 sm:p-5">
            <div className="text-lg sm:text-xl font-bold mb-3">
              📊 Результаты анализа
            </div>
            
            <div className="space-y-3">
              {lies.filter(l => l.isLie).map((lie) => {
                const originalIndex = lies.findIndex(l => l === lie);
                const wasFound = selectedSegments.has(originalIndex);
                
                return (
                  <div key={originalIndex} className={`p-3 rounded-lg border-2 ${
                    wasFound ? 'bg-success/10 border-success' : 'bg-danger/10 border-danger'
                  }`}>
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-2xl flex-shrink-0">
                        {wasFound ? '✅' : '❌'}
                      </span>
                      <div className="flex-1">
                        <div className="font-semibold mb-1 break-words">
                          {wasFound ? 'Вы правильно определили:' : 'Вы пропустили:'}
                        </div>
                        <div className="text-sm sm:text-base italic break-words word-wrap mb-2">
                          "{lie.text}"
                        </div>
                        {lie.explanation && (
                          <div className="text-sm break-words word-wrap opacity-90">
                            💡 {lie.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Награда */}
          {score >= 80 && (
            <div className="bg-success/20 border-2 border-success rounded-xl p-4 sm:p-6 text-center animate-scale-in">
              <div className="text-6xl mb-3">🏆</div>
              <h4 className="text-2xl sm:text-3xl font-bold mb-2">
                Бейдж "Детектор лжи" получен!
              </h4>
              <p className="text-base sm:text-lg break-words">
                Вы отлично распознаёте ложь и манипуляции!
              </p>
            </div>
          )}
          
          {score < 80 && (
            <div className="bg-primary/20 border-2 border-primary/40 rounded-xl p-4 sm:p-5 text-center">
              <div className="text-4xl mb-2">📚</div>
              <p className="text-base sm:text-lg break-words word-wrap">
                Продолжайте учиться распознавать манипуляции! 
                Чем больше практики, тем лучше результат.
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Легенда */}
      {!revealed && (
        <div className="bg-white/5 rounded-xl p-4 text-sm sm:text-base">
          <div className="font-bold mb-2">💡 Подсказка:</div>
          <div className="space-y-1 opacity-90">
            <p>• Кликайте на фразы, которые кажутся подозрительными</p>
            <p>• Ищите нереальные обещания, давление, отсутствие конкретики</p>
            <p>• После проверки вы увидите объяснение каждой лжи</p>
          </div>
        </div>
      )}
    </div>
  );
}

