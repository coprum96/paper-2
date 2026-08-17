import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { scenarioTest } from '../data/gameData';
import { createParticleBurst } from '../utils/particles';
import { sessionAnalytics } from '../utils/sessionAnalytics';

export function ScenarioTest() {
  const { addWisdom } = useGameStore();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<Array<{questionIndex: number; selectedAnswer: number; correctAnswer: number; isCorrect: boolean}>>([]);
  
  const scenario = scenarioTest[currentQuestion];
  
  const handleAnswer = (answerIndex: number) => {
    const isCorrect = answerIndex === scenario.correct;
    
    // Сохраняем ответ для последующей отправки в аналитику
    setAnswers([...answers, {
      questionIndex: currentQuestion,
      selectedAnswer: answerIndex,
      correctAnswer: scenario.correct,
      isCorrect
    }]);
    
    if (isCorrect) {
      setCorrectAnswers(correctAnswers + 1);
      addWisdom(scenario.reward);
      createParticleBurst('✨', 5);
    }
    
    setTimeout(() => {
      if (currentQuestion < scenarioTest.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setShowResult(true);
      }
    }, 800);
  };
  
  const handleComplete = () => {
    useGameStore.getState().nextLevel();
  };
  
  if (showResult) {
    const percentage = Math.round((correctAnswers / scenarioTest.length) * 100);
    let level = '';
    let wisdom = 0;
    
    if (correctAnswers >= 8) {
      wisdom = 60;
      level = '🏆 Эксперт Детектора';
    } else if (correctAnswers >= 6) {
      wisdom = 40;
      level = '🎯 Опытный детектив';
    } else {
      wisdom = 20;
      level = '📚 Ученик';
    }
    
    addWisdom(wisdom);
    
    // Отправляем результаты теста в аналитику
    sessionAnalytics.trackTestResult(
      'scenario',
      correctAnswers,
      scenarioTest.length,
      answers
    );
    
    return (
      <div className="min-h-screen pt-28 pb-10 flex items-center justify-center">
        <div className="container max-w-2xl mx-auto px-5">
          <div className="glass-card text-center animate-scale-in">
            <h2 className="text-4xl font-bold mb-6">Результаты теста</h2>
            <div className="text-7xl mb-6">📊</div>
            <p className="text-3xl mb-4">
              Правильных ответов: {correctAnswers} из {scenarioTest.length}
            </p>
            <p className="text-2xl mb-6">{percentage}%</p>
            
            <div className="text-2xl p-4 bg-primary/30 rounded-xl mb-8">
              {level}
            </div>
            
            <button 
              className="btn btn-primary"
              onClick={handleComplete}
            >
              Продолжить
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pt-28 pb-10">
      <div className="container max-w-3xl mx-auto px-5">
        <div className="glass-card animate-scale-in">
          <h2 className="text-3xl font-bold mb-5">УРОВЕНЬ 2: Определи ловушку!</h2>
          <p className="text-lg mb-6 opacity-80">
            Ситуация {currentQuestion + 1} из {scenarioTest.length}
          </p>
          
          <p className="text-xl mb-8 leading-relaxed">
            {scenario.text}
          </p>
          
          <div className="space-y-4">
            <button
              className="w-full p-5 text-lg text-left flex items-center gap-3 bg-white/15 backdrop-blur-lg border-2 border-white/30 rounded-xl hover:bg-white/25 hover:scale-105 transition-all"
              onClick={() => handleAnswer(0)}
            >
              <span className="text-3xl">🚩</span>
              <span>Финансовая пирамида/Обман</span>
            </button>
            
            <button
              className="w-full p-5 text-lg text-left flex items-center gap-3 bg-white/15 backdrop-blur-lg border-2 border-white/30 rounded-xl hover:bg-white/25 hover:scale-105 transition-all"
              onClick={() => handleAnswer(1)}
            >
              <span className="text-3xl">✅</span>
              <span>Легальное предложение</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

