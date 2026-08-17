/**
 * TypeScript типы для игровой сессии
 * Должны совпадать с типами на фронтенде (sessionAnalytics.ts)
 */

export interface SessionData {
  sessionId: string;
  startTime: string;
  endTime?: string;
  userId?: string;
  
  // Игровой прогресс
  completedLevels: number[];
  finalCoins: number;
  finalWisdom: number;
  achievements: string[];
  
  // Ответы на вопросы
  quizAnswers: QuizAnswer[];
  testResults: TestResult[];
  
  // Выборы в диалогах
  dialogueChoices: DialogueChoice[];
  
  // Временные метрики
  timePerLevel: Record<number, number>;
  totalPlayTime: number;
  
  // Использование материалов
  materialViews: MaterialView[];
}

export interface QuizAnswer {
  levelId: number;
  questionIndex: number;
  questionText: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timestamp: string;
}

export interface TestResult {
  testType: 'scenario' | 'complex' | 'post';
  score: number;
  totalQuestions: number;
  answers: {
    questionIndex: number;
    selectedAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
  }[];
  timestamp: string;
}

export interface DialogueChoice {
  levelId: number;
  dialogueIndex: number;
  characterName: string;
  choiceText: string;
  wisdomChange: number;
  coinChange: number;
  timestamp: string;
}

export interface MaterialView {
  materialId: number;
  materialTitle: string;
  viewDuration: number;
  timestamp: string;
}


