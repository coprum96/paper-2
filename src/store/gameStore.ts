import { create } from 'zustand';
import { AccessStatus, validatePromoCode } from '../utils/accessControl';
import { sessionAnalytics } from '../utils/sessionAnalytics';

export type GamePhase = 'landing' | 'chapterMap' | 'dialogue' | 'quiz' | 'scenarioTest' | 'complexTest' | 'postTest' | 'ending' | 'paywall';

interface GameState {
  // Access Control (Monetization)
  accessStatus: AccessStatus;
  pendingLevel: number | null; // Уровень, куда игрок пытался попасть до paywall
  
  // Game Stats
  coins: number;
  wisdom: number;
  
  // Progress
  currentLevel: number;
  currentDialogue: number;
  completedLevels: number[];
  achievements: string[];
  
  // Test Scores
  preTestScore: number;
  postTestScore: number;
  
  // UI State
  phase: GamePhase;
  showMaterialsPanel: boolean;
  
  // Counters
  globalCitizensCount: number;
  victimCount: number;
  
  // Actions
  setPhase: (phase: GamePhase) => void;
  addCoins: (amount: number) => void;
  addWisdom: (amount: number) => void;
  nextLevel: () => void;
  setCurrentDialogue: (index: number) => void;
  completeLevel: (levelId: number) => void;
  addAchievement: (achievement: string) => void;
  toggleMaterialsPanel: () => void;
  setPostTestScore: (score: number) => void;
  resetGame: () => void;
  incrementCitizensCount: () => void;
  
  // Access Control Actions
  setAccessStatus: (status: AccessStatus) => void;
  setPendingLevel: (level: number | null) => void;
  activatePromoCode: (code: string) => { success: boolean; error?: string };
  checkLevelAccess: (levelId: number) => boolean;
  continueFromPaywall: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial State
  coins: 5,
  wisdom: 0,
  currentLevel: 0,
  currentDialogue: 0,
  completedLevels: [],
  achievements: [],
  preTestScore: 0,
  postTestScore: 0,
  phase: 'landing',
  showMaterialsPanel: false,
  globalCitizensCount: 0,
  victimCount: 13495302,
  
  // Access Control State
  accessStatus: 'free',
  pendingLevel: null,
  
  // Actions
  setPhase: (phase) => set({ phase }),
  
  addCoins: (amount) => set((state) => ({ 
    coins: Math.max(0, state.coins + amount) 
  })),
  
  addWisdom: (amount) => set((state) => ({ 
    wisdom: Math.max(0, Math.min(100, state.wisdom + amount)) 
  })),
  
  nextLevel: () => set((state) => ({
    currentLevel: state.currentLevel + 1,
    currentDialogue: 0,
    phase: 'chapterMap'
  })),
  
  setCurrentDialogue: (index) => set({ currentDialogue: index }),
  
  completeLevel: (levelId) => {
    // Отслеживаем завершение уровня
    sessionAnalytics.completeLevel(levelId);
    
    set((state) => ({
      completedLevels: [...state.completedLevels, levelId]
    }));
  },
  
  addAchievement: (achievement) => set((state) => ({
    achievements: [...state.achievements, achievement]
  })),
  
  toggleMaterialsPanel: () => set((state) => ({
    showMaterialsPanel: !state.showMaterialsPanel
  })),
  
  setPostTestScore: (score) => {
    set({ postTestScore: score });
    
    // Обновляем финальные статы в аналитике
    const state = get();
    sessionAnalytics.updateFinalStats(state.coins, state.wisdom, state.achievements);
  },
  
  incrementCitizensCount: () => set((state) => ({
    globalCitizensCount: state.globalCitizensCount + 1
  })),
  
  resetGame: () => {
    // Завершаем текущую сессию перед сбросом
    sessionAnalytics.endSession();
    
    set({
      coins: 5,
      wisdom: 0,
      currentLevel: 0,
      currentDialogue: 0,
      completedLevels: [],
      achievements: [],
      preTestScore: 0,
      postTestScore: 0,
      phase: 'landing',
      showMaterialsPanel: false,
      accessStatus: 'free',
      pendingLevel: null
    });
  },
  
  // Access Control Actions
  setAccessStatus: (status) => set({ accessStatus: status }),
  
  setPendingLevel: (level) => set({ pendingLevel: level }),
  
  /**
   * Активирует промокод
   * @param code - введённый промокод
   * @returns объект с результатом активации
   */
  activatePromoCode: (code) => {
    const validatedStatus = validatePromoCode(code);
    
    if (validatedStatus) {
      set({ accessStatus: validatedStatus });
      return { success: true };
    }
    
    return { 
      success: false, 
      error: 'Неверный промокод. Попробуйте ещё раз.' 
    };
  },
  
  /**
   * Проверяет доступ к уровню
   * @param levelId - ID уровня для проверки
   * @returns true если доступ разрешён
   */
  checkLevelAccess: (levelId) => {
    const state = get();
    
    // Главы 0, 1, 2 всегда доступны
    if (levelId <= 2) return true;
    
    // Главы 3+ требуют promo или paid
    return state.accessStatus === 'promo' || state.accessStatus === 'paid';
  },
  
  /**
   * Продолжает игру после успешной активации доступа
   * Переходит к запомненному уровню
   */
  continueFromPaywall: () => {
    const state = get();
    
    if (state.pendingLevel !== null) {
      set({
        currentLevel: state.pendingLevel,
        currentDialogue: 0,
        phase: 'chapterMap',
        pendingLevel: null
      });
    } else {
      // Fallback: просто вернуться к карте глав
      set({ phase: 'chapterMap' });
    }
  }
}));

