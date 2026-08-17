import { useState } from 'react';

export interface RedFlagData {
  title: string;
  description: string;
  example?: string;
  law?: string;
  statistics?: string;
  video?: string;
  tips?: string[];
}

interface RedFlagModalProps {
  flag: RedFlagData;
  onClose: () => void;
}

export function RedFlagModal({ flag, onClose }: RedFlagModalProps) {
  const [activeTab, setActiveTab] = useState<'description' | 'example' | 'law' | 'statistics'>('description');
  
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
      <div className="container max-w-3xl mx-auto">
        <div className="glass-card animate-slide-up relative max-h-[85vh] overflow-y-auto">
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
            <div className="text-5xl sm:text-6xl mb-3 sm:mb-4 animate-pulse">🚩</div>
            <h2 className="text-xl sm:text-3xl font-bold text-danger break-words mb-2">
              Красный флажок
            </h2>
            <h3 className="text-lg sm:text-2xl font-semibold break-words">
              {flag.title}
            </h3>
          </div>
          
          {/* Табы */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setActiveTab('description')}
              className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg transition-all ${
                activeTab === 'description'
                  ? 'bg-danger text-white'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              📖 Объяснение
            </button>
            {flag.example && (
              <button
                onClick={() => setActiveTab('example')}
                className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg transition-all ${
                  activeTab === 'example'
                    ? 'bg-danger text-white'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                💡 Пример
              </button>
            )}
            {flag.law && (
              <button
                onClick={() => setActiveTab('law')}
                className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg transition-all ${
                  activeTab === 'law'
                    ? 'bg-danger text-white'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                ⚖️ Закон
              </button>
            )}
            {flag.statistics && (
              <button
                onClick={() => setActiveTab('statistics')}
                className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg transition-all ${
                  activeTab === 'statistics'
                    ? 'bg-danger text-white'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                📊 Статистика
              </button>
            )}
          </div>
          
          {/* Контент */}
          <div className="bg-white/5 rounded-xl p-4 sm:p-6 mb-6 min-h-[200px]">
            {activeTab === 'description' && (
              <div className="animate-fade-in">
                <p className="text-base sm:text-lg break-words word-wrap leading-relaxed mb-4">
                  {flag.description}
                </p>
                
                {flag.video && (
                  <div className="mb-4">
                    <div className="aspect-video bg-black/30 rounded-lg flex items-center justify-center">
                      <span className="text-4xl">🎥</span>
                      <p className="ml-3 text-sm opacity-70">Видео-объяснение</p>
                    </div>
                  </div>
                )}
                
                {flag.tips && flag.tips.length > 0 && (
                  <div className="mt-4 p-4 bg-primary/20 border-2 border-primary/40 rounded-lg">
                    <div className="text-base sm:text-lg font-bold mb-2">💡 Советы:</div>
                    <ul className="space-y-2">
                      {flag.tips.map((tip, index) => (
                        <li key={index} className="text-sm sm:text-base break-words word-wrap leading-relaxed">
                          • {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'example' && flag.example && (
              <div className="animate-fade-in">
                <div className="text-base sm:text-lg font-bold mb-3">💡 Реальный пример:</div>
                <p className="text-base sm:text-lg break-words word-wrap leading-relaxed whitespace-pre-line">
                  {flag.example}
                </p>
              </div>
            )}
            
            {activeTab === 'law' && flag.law && (
              <div className="animate-fade-in">
                <div className="text-base sm:text-lg font-bold mb-3">⚖️ Правовая информация:</div>
                <p className="text-base sm:text-lg break-words word-wrap leading-relaxed whitespace-pre-line">
                  {flag.law}
                </p>
              </div>
            )}
            
            {activeTab === 'statistics' && flag.statistics && (
              <div className="animate-fade-in">
                <div className="text-base sm:text-lg font-bold mb-3">📊 Статистика и факты:</div>
                <p className="text-base sm:text-lg break-words word-wrap leading-relaxed whitespace-pre-line">
                  {flag.statistics}
                </p>
              </div>
            )}
          </div>
          
          {/* Кнопка закрытия */}
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl bg-gradient-to-r from-danger to-red-700 hover:scale-105 active:scale-95 transition-all"
            >
              Понятно
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

