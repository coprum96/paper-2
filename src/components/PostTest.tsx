import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { postTest } from '../data/gameData';
import { FaGraduationCap, FaTrophy, FaBullseye, FaBook, FaCheckCircle, FaTimesCircle, FaArrowRight } from 'react-icons/fa';
import { sessionAnalytics } from '../utils/sessionAnalytics';

export function PostTest() {
  const { setPostTestScore, setPhase } = useGameStore();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Array<{questionIndex: number; selectedAnswer: number; correctAnswer: number; isCorrect: boolean}>>([]);
  
  const question = postTest[currentQuestion];
  
  // ПОЛНЫЙ СБРОС состояния при смене вопроса
  useEffect(() => {
    setSelectedAnswer(null);
  }, [currentQuestion]);
  
  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === question.correct;
    
    // Сохраняем ответ для последующей отправки в аналитику
    setAnswers([...answers, {
      questionIndex: currentQuestion,
      selectedAnswer: answerIndex,
      correctAnswer: question.correct,
      isCorrect
    }]);
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
    // Увеличено время с 1500 до 4000ms (4 секунды)
    setTimeout(() => {
      if (currentQuestion < postTest.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setShowResult(true);
      }
    }, 4000);
  };
  
  const handleComplete = () => {
    setPostTestScore(score);
    setPhase('ending');
  };
  
  if (showResult) {
    const percentage = Math.round((score / postTest.length) * 100);
    
    // Отправляем результаты теста в аналитику
    sessionAnalytics.trackTestResult(
      'post',
      score,
      postTest.length,
      answers
    );
    
    return (
      <div className="min-h-screen pt-28 pb-10 flex items-center justify-center">
        <div className="container max-w-2xl mx-auto px-5">
          <div className="glass-card text-center animate-scale-in">
            <h2 className="text-4xl font-bold mb-6">Финальный тест завершён!</h2>
            <div className="text-7xl mb-6 flex justify-center">
              <FaGraduationCap className="text-primary" />
            </div>
            <p className="text-3xl mb-4">
              Правильных ответов: {score} из {postTest.length}
            </p>
            <p className="text-2xl mb-6">{percentage}%</p>
            
            <div className="text-2xl p-4 bg-primary/30 rounded-xl mb-8 flex items-center justify-center gap-3">
              {percentage >= 80 ? <><FaTrophy className="text-yellow-400" /> Отлично! Ты настоящий эксперт!</> : 
               percentage >= 60 ? <><FaBullseye className="text-blue-400" /> Хорошо! Продолжай учиться!</> : 
               <><FaBook className="text-purple-400" /> Неплохо! Повтори материалы!</>}
            </div>
            
            <button 
              className="btn btn-primary flex items-center gap-2 mx-auto"
              onClick={handleComplete}
            >
              <FaArrowRight />
              Завершить игру
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pt-24 pb-10 flex items-center justify-center">
      <div className="container max-w-3xl mx-auto px-4 sm:px-5">
        <div key={currentQuestion} className="glass-card animate-scale-in">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-5 break-words">Финальный тест</h2>
          <p className="text-base sm:text-lg mb-4 sm:mb-6 opacity-80">
            Вопрос {currentQuestion + 1} из {postTest.length}
          </p>
          
          <h3 className="text-lg sm:text-2xl mb-6 sm:mb-8 leading-relaxed break-words word-wrap">
            {question.text}
          </h3>
          
          <div className="space-y-3 sm:space-y-4">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === question.correct;
              const showStatus = selectedAnswer !== null;
              
              let bgColor = 'bg-white/15';
              if (showStatus) {
                if (isSelected && isCorrect) {
                  bgColor = 'bg-success/30 border-success';
                } else if (isSelected && !isCorrect) {
                  bgColor = 'bg-danger/30 border-danger';
                } else if (isCorrect) {
                  bgColor = 'bg-success/20 border-success';
                }
              }
              
              return (
                <button
                  key={`${currentQuestion}-${index}`}
                  className={`w-full p-4 sm:p-5 text-base sm:text-lg text-left flex items-center gap-2 sm:gap-3 backdrop-blur-lg border-2 border-white/30 rounded-xl transition-all ${bgColor} ${
                    selectedAnswer === null ? 'hover:bg-white/25 hover:scale-105 cursor-pointer' : 'cursor-default'
                  } break-words word-wrap`}
                  onClick={() => handleAnswer(index)}
                  disabled={selectedAnswer !== null}
                >
                  <span className="text-xl sm:text-2xl flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-white/20 rounded-lg">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1 break-words word-wrap leading-relaxed">{option}</span>
                  {showStatus && isCorrect && <FaCheckCircle className="text-2xl sm:text-3xl flex-shrink-0 text-success" />}
                  {showStatus && isSelected && !isCorrect && <FaTimesCircle className="text-2xl sm:text-3xl flex-shrink-0 text-danger" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

