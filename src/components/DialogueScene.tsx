import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { levels, characters, type RedFlagDetail } from '../data/gameData';
import { createParticleBurst } from '../utils/particles';
import { PresentationViewer } from './PresentationViewer';
import { MicroscopeView } from './MicroscopeView';
import { RedFlagModal } from './RedFlagModal';
import { PressureTimer } from './PressureTimer';
import { LossCalculator } from './LossCalculator';
import { MatchGame } from './MatchGame';
import { LieDetector } from './LieDetector';
import { sessionAnalytics } from '../utils/sessionAnalytics';

export function DialogueScene() {
  const { currentLevel, currentDialogue, addWisdom, addCoins, setCurrentDialogue, setPhase, completeLevel, checkLevelAccess, setPendingLevel } = useGameStore();
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showChoices, setShowChoices] = useState(false);
  const [showPresentation, setShowPresentation] = useState(false);
  const [showMicroscope, setShowMicroscope] = useState(false);
  const [selectedRedFlag, setSelectedRedFlag] = useState<RedFlagDetail | null>(null);
  const [showTimer, setShowTimer] = useState(true);
  const [timerCompleted, setTimerCompleted] = useState(false);
  
  const level = levels[currentLevel];
  const dialogue = level?.dialogues[currentDialogue];
  
  // Отслеживаем начало уровня
  useEffect(() => {
    if (currentDialogue === 0 && level) {
      sessionAnalytics.startLevel(currentLevel);
    }
  }, [currentLevel, currentDialogue, level]);
  
  useEffect(() => {
    if (!dialogue) return;
    
    // Typewriter effect
    setIsTyping(true);
    setShowChoices(false);
    setDisplayedText('');
    
    let currentIndex = 0;
    const text = dialogue.text;
    const speed = 30;
    
    const timer = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        setShowChoices(true);
        clearInterval(timer);
      }
    }, speed);
    
    return () => clearInterval(timer);
  }, [dialogue]);
  
  if (!level || !dialogue) {
    return <div className="min-h-screen flex items-center justify-center">
      <p className="text-2xl">Загрузка...</p>
    </div>;
  }
  
  const character = characters[dialogue.character];
  
  const handleChoice = (choice: any) => {
    // Отслеживаем выбор в диалоге для исследования
    sessionAnalytics.trackDialogueChoice(
      currentLevel,
      currentDialogue,
      dialogue.character,
      choice.text,
      choice.wisdom || 0,
      choice.coins || 0
    );
    
    if (choice.wisdom) {
      addWisdom(choice.wisdom);
      if (choice.wisdom > 0) {
        createParticleBurst('✨', 5);
      }
    }
    
    if (choice.coins) {
      addCoins(choice.coins);
      if (choice.coins < 0) {
        createParticleBurst('💔', 5);
      }
    }
    
    setTimeout(() => {
      if (choice.nextLevel) {
        completeLevel(currentLevel);
        setPhase('quiz');
      } else if (choice.nextPhase === 'posttest') {
        setPhase('postTest');
      } else if (choice.next !== undefined) {
        setCurrentDialogue(choice.next);
      } else {
        const nextDialogueIndex = currentDialogue + 1;
        if (nextDialogueIndex < level.dialogues.length) {
          setCurrentDialogue(nextDialogueIndex);
        } else {
          if (level.quiz.length > 0) {
            setPhase('quiz');
          } else {
            completeLevel(currentLevel);
            
            // Проверка доступа к следующему уровню (монетизация)
            const nextLevelId = currentLevel + 1;
            
            if (!checkLevelAccess(nextLevelId)) {
              // Следующий уровень заблокирован - показываем paywall
              setPendingLevel(nextLevelId);
              setPhase('paywall');
            } else {
              // Доступ есть - переходим к следующему уровню
              useGameStore.getState().nextLevel();
            }
          }
        }
      }
    }, 500);
  };
  
  return (
    <div className="min-h-screen pt-24 pb-10">
      <div className="container max-w-4xl mx-auto px-4 sm:px-5">
        {/* Character Display */}
        <div className="text-center mb-4 sm:mb-6 animate-slide-in-top">
          {character.image ? (
            <img 
              src={`/img/${character.image}`}
              alt={character.name}
              className="w-full max-w-[200px] sm:max-w-xs mx-auto rounded-xl shadow-2xl mb-3 sm:mb-4"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const emoji = document.createElement('div');
                emoji.textContent = character.emoji;
                emoji.className = 'text-6xl sm:text-8xl animate-float';
                e.currentTarget.parentElement?.insertBefore(emoji, e.currentTarget);
              }}
            />
          ) : (
            <div className="text-6xl sm:text-8xl mb-3 sm:mb-4 animate-float filter drop-shadow-lg">
              {character.emoji}
            </div>
          )}
          <div className="text-2xl sm:text-3xl font-bold text-shadow break-words px-2">
            {character.name}
          </div>
        </div>
        
        {/* Dialogue Box */}
        <div className="glass-card mb-6 sm:mb-8 animate-slide-in-bottom">
          <div className="text-base sm:text-xl leading-relaxed min-h-[80px] sm:min-h-[100px] whitespace-pre-line break-words word-wrap">
            {displayedText}
            {isTyping && <span className="animate-pulse">▋</span>}
          </div>
          
          {/* Red Flags - Кликабельные */}
          {dialogue.redFlagsData && !isTyping && (
            <div className="mt-4 sm:mt-6 p-4 sm:p-5 bg-danger/20 border-2 border-danger/40 rounded-xl">
              <div className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center gap-2 break-words">
                🚩 Красные флажки:
              </div>
              <div className="space-y-2">
                {dialogue.redFlagsData.map((flag, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedRedFlag(flag)}
                    className="w-full p-3 bg-white/10 rounded-lg hover:bg-danger/30 hover:scale-102 transition-all cursor-pointer text-sm sm:text-base break-words word-wrap leading-relaxed text-left flex items-center gap-2"
                    style={{ animationDelay: `${index * 200}ms` }}
                  >
                    <span className="text-2xl flex-shrink-0">🚩</span>
                    <span className="flex-1">{flag.title}</span>
                    <span className="text-xl flex-shrink-0 opacity-50">ℹ️</span>
                  </button>
                ))}
              </div>
              <p className="text-xs sm:text-sm mt-3 opacity-70 text-center">
                Кликните на флажок, чтобы узнать подробности
              </p>
            </div>
          )}
          
          {/* Старые красные флажки (обратная совместимость) */}
          {dialogue.redFlags && !dialogue.redFlagsData && !isTyping && (
            <div className="mt-4 sm:mt-6 p-4 sm:p-5 bg-danger/20 border-2 border-danger/40 rounded-xl">
              <div className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center gap-2 break-words">
                🚩 Красные флажки:
              </div>
              <div className="space-y-2">
                {dialogue.redFlags.map((flag, index) => (
                  <div 
                    key={index}
                    className="p-3 bg-white/10 rounded-lg text-sm sm:text-base break-words word-wrap leading-relaxed"
                    style={{ animationDelay: `${index * 200}ms` }}
                  >
                    🚩 {flag}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Таймер давления */}
        {dialogue.pressureTimer && showTimer && !timerCompleted && !isTyping && (
          <div className="mb-6 sm:mb-8">
            <PressureTimer
              initialSeconds={dialogue.pressureTimer}
              onSuccess={() => {
                addWisdom(50);
                setTimerCompleted(true);
                setShowTimer(false);
                createParticleBurst('🛡️', 8);
              }}
              onTimeout={() => {
                addWisdom(-20);
                setTimerCompleted(true);
                createParticleBurst('💔', 5);
              }}
            />
          </div>
        )}
        
        {/* Калькулятор потерь */}
        {dialogue.calculator && !isTyping && (
          <div className="mb-6 sm:mb-8">
            <LossCalculator />
          </div>
        )}
        
        {/* Игра сопоставления */}
        {dialogue.matchGame && !isTyping && (
          <div className="mb-6 sm:mb-8">
            <MatchGame onComplete={(score) => {
              addWisdom(score * 2);
              createParticleBurst('🎯', 10);
            }} />
          </div>
        )}
        
        {/* Детектор лжи */}
        {dialogue.lieDetector && !isTyping && (
          <div className="mb-6 sm:mb-8">
            <LieDetector
              character={dialogue.lieDetector.character}
              lies={dialogue.lieDetector.segments}
              onComplete={(score) => {
                addWisdom(score);
                if (score >= 80) {
                  createParticleBurst('🏆', 15);
                }
              }}
            />
          </div>
        )}
        
        {/* Interactive Elements Buttons */}
        {!isTyping && (dialogue.presentation || dialogue.microscope) && (
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 animate-slide-in-bottom">
            {dialogue.presentation && (
              <button
                onClick={() => setShowPresentation(true)}
                className="flex-1 px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl bg-gradient-to-r from-yellow-500 to-orange-600 hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <span className="text-2xl">📊</span>
                <span>Посмотреть презентацию</span>
              </button>
            )}
            {dialogue.microscope && (
              <button
                onClick={() => setShowMicroscope(true)}
                className="flex-1 px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <span className="text-2xl">🔬</span>
                <span>Изучить микроскопом</span>
              </button>
            )}
          </div>
        )}
        
        {/* Choices */}
        {showChoices && (
          <div className="space-y-3 sm:space-y-4 animate-slide-in-bottom">
            {dialogue.choices.map((choice, index) => (
              <button
                key={index}
                className="w-full p-4 sm:p-5 text-base sm:text-lg text-left flex items-center gap-2 sm:gap-3 bg-white/15 backdrop-blur-lg border-2 border-white/30 rounded-xl hover:bg-white/25 hover:translate-x-2 hover:scale-105 transition-all shadow-lg break-words word-wrap"
                onClick={() => handleChoice(choice)}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <span className="text-2xl sm:text-3xl flex-shrink-0">{choice.icon}</span>
                <span className="break-words word-wrap leading-relaxed">{choice.text}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Presentation Modal */}
      {showPresentation && dialogue.presentation && (
        <PresentationViewer 
          slides={dialogue.presentation}
          onClose={() => setShowPresentation(false)}
        />
      )}
      
      {/* Microscope Modal */}
      {showMicroscope && dialogue.microscope && (
        <MicroscopeView
          title={dialogue.microscope.title}
          smallPrintText={dialogue.microscope.smallPrintText}
          dangerousTerms={dialogue.microscope.dangerousTerms}
          onClose={() => setShowMicroscope(false)}
        />
      )}
      
      {/* Red Flag Modal */}
      {selectedRedFlag && (
        <RedFlagModal
          flag={selectedRedFlag}
          onClose={() => setSelectedRedFlag(null)}
        />
      )}
    </div>
  );
}

