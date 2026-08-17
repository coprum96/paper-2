import { useState, useEffect } from 'react';

interface PressureTimerProps {
  initialSeconds: number;
  onTimeout?: () => void;
  onSuccess?: () => void;
  warningText?: string;
}

export function PressureTimer({ 
  initialSeconds, 
  onTimeout, 
  onSuccess,
  warningText = 'Осталось времени:' 
}: PressureTimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  
  useEffect(() => {
    if (!isActive || seconds <= 0) {
      if (seconds <= 0 && isActive) {
        setIsActive(false);
        if (onTimeout) {
          onTimeout();
        }
      }
      return;
    }
    
    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          return 0;
        }
        
        // Показываем предупреждение когда осталось 30 секунд
        if (prev === 30) {
          setShowWarning(true);
        }
        
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isActive, seconds, onTimeout]);
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  const getColor = () => {
    if (seconds <= 30) return 'text-danger';
    if (seconds <= 60) return 'text-yellow-300';
    return 'text-white';
  };
  
  const getProgressColor = () => {
    if (seconds <= 30) return 'bg-danger';
    if (seconds <= 60) return 'bg-yellow-400';
    return 'bg-primary';
  };
  
  const progressPercentage = (seconds / initialSeconds) * 100;
  
  const handleStop = () => {
    setIsActive(false);
    if (onSuccess) {
      onSuccess();
    }
  };
  
  if (seconds <= 0) {
    return (
      <div className="glass-card bg-danger/20 border-2 border-danger animate-pulse">
        <div className="text-center">
          <div className="text-5xl mb-3">⏰</div>
          <div className="text-xl sm:text-2xl font-bold text-danger mb-3">
            Время истекло!
          </div>
          <p className="text-sm sm:text-base opacity-90">
            ⚠️ Это пример манипуляции временем — типичная тактика мошенников!
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className={`glass-card ${seconds <= 30 ? 'bg-danger/20 border-2 border-danger animate-pulse' : 'bg-white/10'}`}>
        <div className="text-center mb-4">
          <div className="text-3xl sm:text-4xl mb-2">⏰</div>
          <p className="text-sm sm:text-base font-semibold mb-3 opacity-90">
            {warningText}
          </p>
          
          {/* Таймер */}
          <div className={`text-5xl sm:text-7xl font-bold ${getColor()} mb-4 font-mono`}>
            {String(minutes).padStart(2, '0')}:{String(remainingSeconds).padStart(2, '0')}
          </div>
          
          {/* Прогресс-бар */}
          <div className="w-full h-3 sm:h-4 bg-black/40 rounded-full overflow-hidden mb-4">
            <div 
              className={`h-full ${getProgressColor()} transition-all duration-1000 ease-linear`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          {/* Кнопка остановки */}
          <button
            onClick={handleStop}
            className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-semibold rounded-lg bg-gradient-to-r from-success to-green-700 hover:scale-105 active:scale-95 transition-all"
          >
            🛡️ Я не поддаюсь на давление!
          </button>
        </div>
      </div>
      
      {/* Предупреждение о манипуляции */}
      {showWarning && (
        <div className="glass-card bg-primary/20 border-2 border-primary animate-slide-in-bottom">
          <div className="text-sm sm:text-base break-words word-wrap leading-relaxed">
            <div className="font-bold mb-2">💡 Обратите внимание:</div>
            <p className="opacity-90">
              Создание искусственного дефицита времени — это классическая манипуляция! 
              Мошенники хотят, чтобы вы приняли решение эмоционально, не включая логику. 
              <strong> Настоящие возможности подождут!</strong>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

