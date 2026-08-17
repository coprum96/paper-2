/**
 * Session Analytics - Сбор данных для исследования
 * Собирает все действия пользователя во время игровой сессии
 */

export interface SessionData {
  sessionId: string;
  startTime: string;
  endTime?: string;
  userId?: string; // Опционально, если хотите идентифицировать пользователей
  
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
  timePerLevel: Record<number, number>; // Время в секундах на каждый уровень
  totalPlayTime: number; // Общее время игры в секундах
  
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
  viewDuration: number; // В секундах
  timestamp: string;
}

class SessionAnalytics {
  private currentSession: SessionData | null = null;
  private levelStartTimes: Record<number, number> = {};
  private materialStartTimes: Record<number, number> = {};
  private syncTimer: ReturnType<typeof setTimeout> | null = null;
  private isSyncInFlight = false;
  private syncQueuedWhileSending = false;
  private readonly SYNC_DEBOUNCE_MS = 1500;
  
  /**
   * Начинает новую сессию
   */
  startSession(userId?: string): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.currentSession = {
      sessionId,
      startTime: new Date().toISOString(),
      userId,
      completedLevels: [],
      finalCoins: 5,
      finalWisdom: 0,
      achievements: [],
      quizAnswers: [],
      testResults: [],
      dialogueChoices: [],
      timePerLevel: {},
      totalPlayTime: 0,
      materialViews: []
    };

    this.saveSession();
    
    return sessionId;
  }
  
  /**
   * Отслеживает ответ на вопрос викторины
   */
  trackQuizAnswer(
    levelId: number,
    questionIndex: number,
    questionText: string,
    selectedAnswer: string,
    isCorrect: boolean
  ) {
    if (!this.currentSession) return;
    
    this.currentSession.quizAnswers.push({
      levelId,
      questionIndex,
      questionText,
      selectedAnswer,
      isCorrect,
      timestamp: new Date().toISOString()
    });
    
    this.saveSession();
  }
  
  /**
   * Отслеживает результаты теста
   */
  trackTestResult(
    testType: 'scenario' | 'complex' | 'post',
    score: number,
    totalQuestions: number,
    answers: TestResult['answers']
  ) {
    if (!this.currentSession) return;
    
    this.currentSession.testResults.push({
      testType,
      score,
      totalQuestions,
      answers,
      timestamp: new Date().toISOString()
    });
    
    this.saveSession();
  }
  
  /**
   * Отслеживает выбор в диалоге
   */
  trackDialogueChoice(
    levelId: number,
    dialogueIndex: number,
    characterName: string,
    choiceText: string,
    wisdomChange: number,
    coinChange: number
  ) {
    if (!this.currentSession) return;
    
    this.currentSession.dialogueChoices.push({
      levelId,
      dialogueIndex,
      characterName,
      choiceText,
      wisdomChange,
      coinChange,
      timestamp: new Date().toISOString()
    });
    
    this.saveSession();
  }
  
  /**
   * Начинает отслеживание времени на уровне
   */
  startLevel(levelId: number) {
    this.levelStartTimes[levelId] = Date.now();
  }
  
  /**
   * Завершает отслеживание времени на уровне
   */
  completeLevel(levelId: number) {
    if (!this.currentSession) return;
    
    const startTime = this.levelStartTimes[levelId];
    if (startTime) {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      this.currentSession.timePerLevel[levelId] = duration;
      delete this.levelStartTimes[levelId];
    }
    
    if (!this.currentSession.completedLevels.includes(levelId)) {
      this.currentSession.completedLevels.push(levelId);
    }
    
    this.saveSession();
  }
  
  /**
   * Начинает отслеживание просмотра материала
   */
  startMaterialView(materialId: number) {
    this.materialStartTimes[materialId] = Date.now();
  }
  
  /**
   * Завершает отслеживание просмотра материала
   */
  endMaterialView(materialId: number, materialTitle: string) {
    if (!this.currentSession) return;
    
    const startTime = this.materialStartTimes[materialId];
    if (startTime) {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      this.currentSession.materialViews.push({
        materialId,
        materialTitle,
        viewDuration: duration,
        timestamp: new Date().toISOString()
      });
      delete this.materialStartTimes[materialId];
    }
    
    this.saveSession();
  }
  
  /**
   * Обновляет финальные статы игрока
   */
  updateFinalStats(coins: number, wisdom: number, achievements: string[]) {
    if (!this.currentSession) return;
    
    this.currentSession.finalCoins = coins;
    this.currentSession.finalWisdom = wisdom;
    this.currentSession.achievements = achievements;
    
    this.saveSession();
  }
  
  /**
   * Завершает текущую сессию
   */
  endSession() {
    if (!this.currentSession) return;
    
    const startTime = new Date(this.currentSession.startTime).getTime();
    this.currentSession.endTime = new Date().toISOString();
    this.currentSession.totalPlayTime = Math.floor((Date.now() - startTime) / 1000);
    
    this.saveSession();
    
    // Копируем данные перед архивацией (т.к. архивация очищает currentSession)
    const sessionToSend = { ...this.currentSession };
    
    // Сохраняем в архив всех сессий
    this.archiveSession();
    
    // Отправляем данные на бэкенд
    void this.sendToServer(sessionToSend);
  }
  
  /**
   * Сохраняет текущую сессию в localStorage
   */
  private saveSession() {
    if (!this.currentSession) return;
    
    try {
      localStorage.setItem('currentSession', JSON.stringify(this.currentSession));
    } catch (error) {
      console.error('Ошибка сохранения сессии:', error);
    }

    this.scheduleServerSync();
  }

  /**
   * Планирует промежуточную синхронизацию с сервером.
   * Используем дебаунс, чтобы не отправлять запросы слишком часто.
   */
  private scheduleServerSync(force = false) {
    if (!this.currentSession) return;

    if (force) {
      if (this.syncTimer) {
        clearTimeout(this.syncTimer);
        this.syncTimer = null;
      }
      void this.flushServerSync();
      return;
    }

    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
    }

    this.syncTimer = setTimeout(() => {
      this.syncTimer = null;
      void this.flushServerSync();
    }, this.SYNC_DEBOUNCE_MS);
  }

  /**
   * Отправляет снимок текущей сессии на сервер.
   */
  private async flushServerSync() {
    if (!this.currentSession) return;

    if (this.isSyncInFlight) {
      this.syncQueuedWhileSending = true;
      return;
    }

    this.isSyncInFlight = true;
    const snapshot: SessionData = JSON.parse(JSON.stringify(this.currentSession));

    try {
      await this.sendToServer(snapshot);
    } finally {
      this.isSyncInFlight = false;
      if (this.syncQueuedWhileSending) {
        this.syncQueuedWhileSending = false;
        this.scheduleServerSync(true);
      }
    }
  }
  
  /**
   * Отправляет сессию на бэкенд для сохранения в БД
   */
  private async sendToServer(sessionData: SessionData) {
    // Проверяем наличие API URL и ключа
    const apiUrl = import.meta.env.VITE_API_URL;
    const apiKey = import.meta.env.VITE_API_KEY;
    
    if (!apiUrl || !apiKey) {
      console.warn('⚠️  API URL или API KEY не настроены. Данные не будут отправлены на сервер.');
      console.warn('Добавьте VITE_API_URL и VITE_API_KEY в .env файл.');
      return;
    }
    
    try {
      console.log(`📤 Отправка сессии на сервер: ${sessionData.sessionId}`);
      
      const response = await fetch(`${apiUrl}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey,
        },
        body: JSON.stringify(sessionData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ Сессия успешно отправлена на сервер:', result);
    } catch (error) {
      console.error('❌ Ошибка отправки данных на сервер:', error);
      console.error('Данные сохранены локально в localStorage.');
      // Не бросаем ошибку - игра продолжает работать даже если сервер недоступен
    }
  }
  
  /**
   * Архивирует завершенную сессию
   */
  private archiveSession() {
    if (!this.currentSession) return;
    
    try {
      // Получаем существующий архив
      const archiveJson = localStorage.getItem('sessionsArchive');
      const archive: SessionData[] = archiveJson ? JSON.parse(archiveJson) : [];
      
      // Добавляем текущую сессию
      archive.push(this.currentSession);
      
      // Сохраняем обновленный архив
      localStorage.setItem('sessionsArchive', JSON.stringify(archive));
      
      // Очищаем текущую сессию
      localStorage.removeItem('currentSession');
      this.currentSession = null;
    } catch (error) {
      console.error('Ошибка архивации сессии:', error);
    }
  }
  
  /**
   * Восстанавливает текущую сессию из localStorage
   */
  restoreSession(): SessionData | null {
    try {
      const sessionJson = localStorage.getItem('currentSession');
      if (sessionJson) {
        this.currentSession = JSON.parse(sessionJson);
        return this.currentSession;
      }
    } catch (error) {
      console.error('Ошибка восстановления сессии:', error);
    }
    return null;
  }
  
  /**
   * Получает все архивированные сессии
   */
  getAllSessions(): SessionData[] {
    try {
      const archiveJson = localStorage.getItem('sessionsArchive');
      return archiveJson ? JSON.parse(archiveJson) : [];
    } catch (error) {
      console.error('Ошибка получения архива сессий:', error);
      return [];
    }
  }
  
  /**
   * Экспортирует все данные в формате JSON для анализа
   */
  exportAllData(): string {
    const allSessions = this.getAllSessions();
    const currentSession = this.currentSession;
    
    const exportData = {
      exportDate: new Date().toISOString(),
      totalSessions: allSessions.length,
      currentSession,
      sessions: allSessions,
      summary: this.generateSummary(allSessions)
    };
    
    return JSON.stringify(exportData, null, 2);
  }
  
  /**
   * Генерирует сводную статистику по всем сессиям
   */
  private generateSummary(sessions: SessionData[]) {
    if (sessions.length === 0) {
      return {
        totalPlayers: 0,
        averagePlayTime: 0,
        averageCompletedLevels: 0,
        averageFinalWisdom: 0,
        mostDifficultLevel: null,
        commonMistakes: []
      };
    }
    
    const totalPlayTime = sessions.reduce((sum, s) => sum + (s.totalPlayTime || 0), 0);
    const totalLevels = sessions.reduce((sum, s) => sum + s.completedLevels.length, 0);
    const totalWisdom = sessions.reduce((sum, s) => sum + s.finalWisdom, 0);
    
    // Находим самый сложный уровень (где больше всего времени проводят)
    const levelTimes: Record<number, number[]> = {};
    sessions.forEach(session => {
      Object.entries(session.timePerLevel).forEach(([levelId, time]) => {
        if (!levelTimes[Number(levelId)]) {
          levelTimes[Number(levelId)] = [];
        }
        levelTimes[Number(levelId)].push(time);
      });
    });
    
    let mostDifficultLevel: { id: number; avgTime: number } | null = null;
    let maxAvgTime = 0;
    Object.entries(levelTimes).forEach(([levelId, times]) => {
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      if (avgTime > maxAvgTime) {
        maxAvgTime = avgTime;
        mostDifficultLevel = { id: Number(levelId), avgTime };
      }
    });
    
    return {
      totalPlayers: sessions.length,
      averagePlayTime: Math.floor(totalPlayTime / sessions.length),
      averageCompletedLevels: Math.floor(totalLevels / sessions.length),
      averageFinalWisdom: Math.floor(totalWisdom / sessions.length),
      mostDifficultLevel,
      totalQuizAnswers: sessions.reduce((sum, s) => sum + s.quizAnswers.length, 0),
      totalDialogueChoices: sessions.reduce((sum, s) => sum + s.dialogueChoices.length, 0)
    };
  }
  
  /**
   * Очищает все данные (для тестирования)
   */
  clearAllData() {
    localStorage.removeItem('currentSession');
    localStorage.removeItem('sessionsArchive');
    this.currentSession = null;
  }
}

// Экспортируем единственный экземпляр
export const sessionAnalytics = new SessionAnalytics();

