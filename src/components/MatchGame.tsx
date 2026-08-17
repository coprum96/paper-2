import { useState } from 'react';

interface MatchPair {
  id: number;
  legitimate: string;
  scam: string;
  explanation: string;
  redFlags: string[];
}

const defaultPairs: MatchPair[] = [
  {
    id: 1,
    legitimate: 'Банковский вклад: до 8% годовых, застрахован государством до 1.4 млн ₽',
    scam: 'Инвестиции: гарантированно 50% в месяц, без рисков!',
    explanation: 'Никто не может гарантировать такую доходность без рисков. Это физически невозможно!',
    redFlags: ['Нереальная доходность', 'Слово "гарантированно"', 'Отсутствие рисков']
  },
  {
    id: 2,
    legitimate: 'Покупка акций: возможна прибыль 10-15% в год, есть риски потерь',
    scam: 'Уникальная возможность: вложи 10 тыс. — получи 100 тыс. за неделю!',
    explanation: 'Быстрое обогащение — главный признак мошенничества. Реальные инвестиции требуют времени.',
    redFlags: ['Обещание быстрых денег', 'Отсутствие механизма', 'Эмоциональное давление']
  },
  {
    id: 3,
    legitimate: 'ПИФ: доходность зависит от рынка, есть комиссия управляющей компании ~1-2%',
    scam: 'Инвестфонд: минимальный взнос 50 тыс., вывод через год, комиссия 15% ежемесячно',
    explanation: 'Комиссия 15% в месяц = 180% в год! Это кабальные условия.',
    redFlags: ['Огромная комиссия', 'Блокировка вывода', 'Высокий порог входа']
  },
  {
    id: 4,
    legitimate: 'Легальная компания: юр. адрес, ОГРН, лицензия ЦБ, договор с печатью',
    scam: 'Компания: офис за границей, анонимные управляющие, регистрация на островах',
    explanation: 'Отсутствие регистрации в РФ = невозможность привлечь к ответственности.',
    redFlags: ['Офшорная регистрация', 'Анонимность', 'Отсутствие лицензий']
  }
];

interface MatchGameProps {
  pairs?: MatchPair[];
  onComplete?: (score: number) => void;
}

export function MatchGame({ pairs = defaultPairs, onComplete }: MatchGameProps) {
  const [selectedLegit, setSelectedLegit] = useState<number | null>(null);
  const [selectedScam, setSelectedScam] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [showExplanation, setShowExplanation] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  
  const handleLegitClick = (id: number) => {
    if (matched.has(id)) return;
    setSelectedLegit(id);
    if (selectedScam !== null) {
      checkMatch(id, selectedScam);
    }
  };
  
  const handleScamClick = (id: number) => {
    if (matched.has(id)) return;
    setSelectedScam(id);
    if (selectedLegit !== null) {
      checkMatch(selectedLegit, id);
    }
  };
  
  const checkMatch = (legitId: number, scamId: number) => {
    setAttempts(attempts + 1);
    
    if (legitId === scamId) {
      // Правильно!
      setMatched(new Set([...matched, legitId]));
      setScore(score + 1);
      setShowExplanation(legitId);
      setTimeout(() => {
        setSelectedLegit(null);
        setSelectedScam(null);
        
        // Проверка завершения
        if (matched.size + 1 === pairs.length) {
          setTimeout(() => {
            if (onComplete) {
              onComplete(score + 1);
            }
          }, 2000);
        }
      }, 3000);
    } else {
      // Неправильно
      setTimeout(() => {
        setSelectedLegit(null);
        setSelectedScam(null);
      }, 1000);
    }
  };
  
  const getButtonClass = (id: number, type: 'legit' | 'scam') => {
    const isMatched = matched.has(id);
    const isSelected = type === 'legit' ? selectedLegit === id : selectedScam === id;
    
    if (isMatched) {
      return 'bg-success/30 border-success cursor-default';
    }
    if (isSelected) {
      return 'bg-primary/40 border-primary scale-105';
    }
    return 'bg-white/15 border-white/30 hover:bg-white/25 hover:scale-102';
  };
  
  return (
    <div className="glass-card max-w-6xl mx-auto">
      <div className="text-center mb-6">
        <div className="text-5xl sm:text-6xl mb-3">🎯</div>
        <h3 className="text-2xl sm:text-3xl font-bold mb-2 break-words">
          Сравни и найди подвох
        </h3>
        <p className="text-sm sm:text-base opacity-90 break-words word-wrap">
          Соедини легальное предложение с его мошеннической версией
        </p>
        
        {/* Счет */}
        <div className="flex justify-center gap-4 mt-4">
          <div className="px-4 py-2 bg-success/20 rounded-lg border border-success/40">
            <span className="font-bold">{score}</span> / {pairs.length}
          </div>
          <div className="px-4 py-2 bg-white/20 rounded-lg border border-white/30">
            Попыток: <span className="font-bold">{attempts}</span>
          </div>
        </div>
      </div>
      
      {/* Игровое поле */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Легальные */}
        <div>
          <h4 className="text-lg sm:text-xl font-bold mb-4 text-success flex items-center gap-2">
            <span>✅</span>
            <span>Легальное</span>
          </h4>
          <div className="space-y-3">
            {pairs.map((pair) => (
              <button
                key={`legit-${pair.id}`}
                onClick={() => handleLegitClick(pair.id)}
                disabled={matched.has(pair.id)}
                className={`w-full p-4 text-sm sm:text-base text-left rounded-xl border-2 transition-all ${getButtonClass(pair.id, 'legit')} break-words word-wrap leading-relaxed`}
              >
                {matched.has(pair.id) && <span className="text-2xl mr-2">✓</span>}
                {pair.legitimate}
              </button>
            ))}
          </div>
        </div>
        
        {/* Мошеннические */}
        <div>
          <h4 className="text-lg sm:text-xl font-bold mb-4 text-danger flex items-center gap-2">
            <span>🚩</span>
            <span>Мошенническое</span>
          </h4>
          <div className="space-y-3">
            {pairs.map((pair) => (
              <button
                key={`scam-${pair.id}`}
                onClick={() => handleScamClick(pair.id)}
                disabled={matched.has(pair.id)}
                className={`w-full p-4 text-sm sm:text-base text-left rounded-xl border-2 transition-all ${getButtonClass(pair.id, 'scam')} break-words word-wrap leading-relaxed`}
              >
                {matched.has(pair.id) && <span className="text-2xl mr-2">✓</span>}
                {pair.scam}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Объяснение */}
      {showExplanation !== null && (
        <div className="bg-primary/20 border-2 border-primary/40 rounded-xl p-4 sm:p-5 animate-slide-in-bottom">
          <div className="text-lg sm:text-xl font-bold mb-3 text-success">
            ✅ Правильно!
          </div>
          
          <div className="mb-4">
            <div className="font-semibold mb-2">💡 Объяснение:</div>
            <p className="text-sm sm:text-base break-words word-wrap leading-relaxed">
              {pairs.find(p => p.id === showExplanation)?.explanation}
            </p>
          </div>
          
          <div>
            <div className="font-semibold mb-2">🚩 Красные флажки:</div>
            <ul className="space-y-1">
              {pairs.find(p => p.id === showExplanation)?.redFlags.map((flag, index) => (
                <li key={index} className="text-sm sm:text-base break-words">
                  • {flag}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* Завершение */}
      {matched.size === pairs.length && (
        <div className="bg-success/20 border-2 border-success rounded-xl p-4 sm:p-6 text-center animate-scale-in mt-6">
          <div className="text-6xl mb-3">🎉</div>
          <h4 className="text-2xl sm:text-3xl font-bold mb-3">Отлично!</h4>
          <p className="text-base sm:text-lg mb-4">
            Вы правильно определили все мошеннические предложения!
          </p>
          <div className="text-lg sm:text-xl font-bold">
            Счет: {score} / {pairs.length} за {attempts} попыток
          </div>
        </div>
      )}
    </div>
  );
}

