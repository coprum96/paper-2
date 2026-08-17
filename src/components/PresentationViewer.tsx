import { useState } from 'react';

interface Slide {
  title: string;
  content: string;
  image?: string;
  redFlags?: string[];
}

interface PresentationViewerProps {
  slides: Slide[];
  onClose: () => void;
}

export function PresentationViewer({ slides, onClose }: PresentationViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };
  
  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };
  
  const slide = slides[currentSlide];
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="container max-w-5xl mx-auto px-4 sm:px-5 py-6">
        <div className="glass-card animate-scale-in relative">
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
          
          {/* Заголовок презентации */}
          <div className="text-center mb-6 sm:mb-8 pr-12">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4 animate-bounce">📊</div>
            <h2 className="text-xl sm:text-3xl font-bold text-shadow break-words">
              Бизнес-презентация Карабаса-Барабаса
            </h2>
          </div>
          
          {/* Слайд */}
          <div key={currentSlide} className="bg-white/5 rounded-xl p-4 sm:p-8 mb-6 min-h-[300px] sm:min-h-[400px] animate-slide-in-right">
            {/* Заголовок слайда */}
            <h3 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-6 text-center break-words word-wrap bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              {slide.title}
            </h3>
            
            {/* Изображение */}
            {slide.image && (
              <div className="mb-4 sm:mb-6 flex justify-center">
                <img 
                  src={`/img/${slide.image}`}
                  alt={slide.title}
                  className="max-w-full h-auto rounded-lg shadow-2xl max-h-[200px] sm:max-h-[300px] object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            
            {/* Контент */}
            <div className="text-base sm:text-xl leading-relaxed break-words word-wrap mb-4 sm:mb-6 text-center">
              {slide.content}
            </div>
            
            {/* Красные флажки */}
            {slide.redFlags && slide.redFlags.length > 0 && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-danger/20 border-2 border-danger/40 rounded-lg">
                <div className="text-sm sm:text-base font-bold mb-2 text-danger-light">
                  🚩 Что здесь подозрительно?
                </div>
                <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                  {slide.redFlags.map((flag, index) => (
                    <li key={index} className="break-words word-wrap leading-relaxed">• {flag}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Навигация */}
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-semibold rounded-lg transition-all ${
                currentSlide === 0
                  ? 'bg-white/10 text-white/30 cursor-not-allowed'
                  : 'bg-white/20 hover:bg-white/30 hover:scale-105 active:scale-95'
              }`}
            >
              ← Назад
            </button>
            
            <div className="text-sm sm:text-lg font-semibold">
              Слайд {currentSlide + 1} / {slides.length}
            </div>
            
            <button
              onClick={currentSlide === slides.length - 1 ? onClose : nextSlide}
              className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-semibold rounded-lg bg-gradient-to-r from-primary to-purple-700 hover:scale-105 active:scale-95 transition-all"
            >
              {currentSlide === slides.length - 1 ? 'Закрыть' : 'Далее →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

