import { useState } from 'react';

interface MicroscopeViewProps {
  title: string;
  smallPrintText: string;
  dangerousTerms?: { term: string; explanation: string }[];
  onClose: () => void;
}

export function MicroscopeView({ title, smallPrintText, dangerousTerms = [], onClose }: MicroscopeViewProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<number | null>(null);
  
  // Подсветка опасных терминов в тексте
  const highlightDangerousTerms = (text: string) => {
    if (dangerousTerms.length === 0) return text;
    
    let highlightedText = text;
    dangerousTerms.forEach((item, index) => {
      const regex = new RegExp(`(${item.term})`, 'gi');
      highlightedText = highlightedText.replace(
        regex,
        `<span class="dangerous-term" data-term="${index}">$1</span>`
      );
    });
    
    return highlightedText;
  };
  
  const handleTermClick = (index: number) => {
    setSelectedTerm(selectedTerm === index ? null : index);
  };
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
      <div className="container max-w-4xl mx-auto">
        <div className="glass-card animate-scale-in relative max-h-[90vh] overflow-y-auto">
          {/* Кнопка закрытия */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white/20 hover:bg-danger/40 rounded-full transition-all hover:scale-110 active:scale-95 z-10"
            aria-label="Закрыть"
          >
            <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Заголовок */}
          <div className="text-center mb-6 pr-12">
            <div className="text-5xl sm:text-7xl mb-4 animate-pulse">🔬</div>
            <h2 className="text-xl sm:text-3xl font-bold text-shadow break-words mb-2">
              {title}
            </h2>
            <p className="text-xs sm:text-sm opacity-70">
              Изучите документ внимательно. Кликайте на выделенные термины для пояснений.
            </p>
          </div>
          
          {/* Кнопка увеличения */}
          <div className="flex justify-center mb-6">
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-semibold rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              {isZoomed ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                  </svg>
                  Уменьшить
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                  Увеличить
                </>
              )}
            </button>
          </div>
          
          {/* Документ с мелким шрифтом */}
          <div className="bg-white/5 rounded-xl p-4 sm:p-6 mb-6 border-2 border-white/10 relative overflow-hidden">
            {/* Эффект старой бумаги */}
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-100/5 to-orange-100/5 pointer-events-none" />
            
            <div
              className={`relative transition-all duration-500 ${
                isZoomed ? 'text-base sm:text-xl' : 'text-[8px] sm:text-[10px]'
              } leading-relaxed break-words word-wrap`}
              style={{
                fontFamily: 'monospace',
                letterSpacing: isZoomed ? 'normal' : '-0.5px'
              }}
              dangerouslySetInnerHTML={{ __html: highlightDangerousTerms(smallPrintText) }}
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.classList.contains('dangerous-term')) {
                  const termIndex = parseInt(target.dataset.term || '0');
                  handleTermClick(termIndex);
                }
              }}
            />
          </div>
          
          {/* Объяснение выбранного термина */}
          {selectedTerm !== null && dangerousTerms[selectedTerm] && (
            <div className="mb-6 p-4 sm:p-5 bg-danger/20 border-2 border-danger/40 rounded-xl animate-slide-in-bottom">
              <div className="text-lg sm:text-xl font-bold mb-2 text-danger-light">
                ⚠️ "{dangerousTerms[selectedTerm].term}"
              </div>
              <p className="text-sm sm:text-base break-words word-wrap leading-relaxed">
                {dangerousTerms[selectedTerm].explanation}
              </p>
            </div>
          )}
          
          {/* Совет */}
          <div className="p-4 sm:p-5 bg-primary/20 border-2 border-primary/40 rounded-xl">
            <div className="text-base sm:text-lg font-bold mb-2">💡 Совет:</div>
            <p className="text-xs sm:text-base break-words word-wrap leading-relaxed">
              Всегда читайте мелкий шрифт ПОЛНОСТЬЮ перед подписанием любого документа. 
              Если что-то непонятно — спрашивайте. Если не дают времени прочитать — это красный флаг! 🚩
            </p>
          </div>
          
          {/* Кнопка закрытия */}
          <div className="flex justify-center mt-6">
            <button
              onClick={onClose}
              className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl bg-gradient-to-r from-primary to-purple-700 hover:scale-105 active:scale-95 transition-all"
            >
              Понятно, закрыть
            </button>
          </div>
        </div>
      </div>
      
      <style>{`
        .dangerous-term {
          background-color: rgba(239, 68, 68, 0.3);
          border-bottom: 2px dashed #ef4444;
          cursor: pointer;
          padding: 2px 4px;
          border-radius: 2px;
          transition: all 0.2s;
        }
        
        .dangerous-term:hover {
          background-color: rgba(239, 68, 68, 0.5);
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}

