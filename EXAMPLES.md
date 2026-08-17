# 📚 Примеры использования и модификации

## Добавление нового уровня

### Шаг 1: Определите уровень в gameData.ts

```typescript
// src/data/gameData.ts
export const levels: Level[] = [
  // ... существующие уровни
  {
    id: 8,
    title: 'Защита личных данных',
    subtitle: 'Как не стать жертвой фишинга',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    dialogues: [
      {
        character: 'cricket',
        emotion: 'teaching',
        text: 'Буратино, сегодня поговорим о защите личных данных!',
        choices: [
          { 
            text: 'Интересно! Расскажи!', 
            icon: '🎓', 
            wisdom: 10, 
            next: 1 
          }
        ]
      },
      {
        character: 'stranger',
        emotion: 'sneaky',
        text: 'Привет! Я из банка. Подтверди свой номер карты...',
        redFlags: [
          'Незапрошенный звонок',
          'Запрос личных данных',
          'Давление и срочность'
        ],
        choices: [
          { 
            text: 'Вот мои данные...', 
            icon: '😰', 
            wisdom: -20, 
            coins: -3, 
            next: 2 
          },
          { 
            text: 'Это фишинг! Вешаю трубку', 
            icon: '🛡️', 
            wisdom: 50, 
            next: 2 
          }
        ]
      },
      {
        character: 'cricket',
        emotion: 'wise',
        text: 'Никогда не давай личные данные по телефону!',
        choices: [
          { 
            text: 'Понял! Буду осторожен!', 
            icon: '💡', 
            wisdom: 20, 
            nextLevel: true 
          }
        ]
      }
    ],
    quiz: [
      {
        text: 'Что такое фишинг?',
        options: [
          'Вид рыбалки',
          'Мошенничество для кражи данных',
          'Интернет-покупки'
        ],
        correct: 1,
        explanation: 'Фишинг - это попытка получить личные данные обманным путём',
        reward: 20
      }
    ]
  }
];
```

### Шаг 2: Обновите иконки в ChapterMap

```typescript
// src/components/ChapterMap.tsx
const icons = ['🪙', '🎭', '🧮', '🧺', '📊', '🎯', '📋', '🏆', '🔐']; // добавили 🔐
```

## Добавление нового персонажа

```typescript
// src/data/gameData.ts
export const characters: Record<string, Character> = {
  // ... существующие персонажи
  malvina: {
    name: "Мальвина",
    emoji: "👧",
    image: "character_malvina.png",
    emotions: { 
      kind: "😊", 
      teaching: "📚", 
      worried: "😟" 
    }
  }
};
```

Использование:
```typescript
{
  character: 'malvina',
  emotion: 'teaching',
  text: 'Привет, Буратино!',
  choices: [...]
}
```

## Добавление образовательного материала

```typescript
// src/data/gameData.ts
export const educationalMaterials: EducationalMaterial[] = [
  // ... существующие материалы
  {
    id: 7,
    title: '📖 Материал 7: Защита в интернете',
    sections: [
      {
        name: '🔐 Безопасные пароли',
        content: 'Используй сложные пароли:\n\n✅ Минимум 12 символов\n✅ Цифры, буквы, символы\n✅ Уникальный для каждого сайта\n\n❌ Не используй:\n❌ Дату рождения\n❌ Простые слова\n❌ 123456'
      },
      {
        name: '🌐 Безопасный интернет',
        content: 'Правила безопасности:\n\n1️⃣ Проверяй HTTPS\n2️⃣ Не переходи по подозрительным ссылкам\n3️⃣ Используй антивирус\n4️⃣ Обновляй программы'
      }
    ]
  }
];
```

## Кастомизация внешнего вида

### Изменение цветовой схемы

```typescript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',    // Синий вместо фиолетового
        secondary: '#EF4444',  // Красный вместо оранжевого
        success: '#22C55E',    // Светло-зелёный
        danger: '#F59E0B',     // Оранжевый
      }
    }
  }
}
```

### Изменение анимаций

```typescript
// tailwind.config.js
export default {
  theme: {
    extend: {
      animation: {
        'float': 'float 4s ease-in-out infinite', // медленнее
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        }
      }
    }
  }
}
```

Использование:
```tsx
<div className="animate-wiggle">Покачивающийся элемент</div>
```

### Изменение градиента фона

```css
/* src/index.css */
.gradient-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  /* Замените на свой градиент: */
  background: linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%);
}
```

## Добавление звуков

### Шаг 1: Создайте хелпер

```typescript
// src/utils/sounds.ts
export const playSound = (soundName: string) => {
  const audio = new Audio(`/sounds/${soundName}.mp3`);
  audio.volume = 0.5;
  audio.play().catch(() => {
    // Игнорируем ошибки автовоспроизведения
  });
};
```

### Шаг 2: Используйте в компонентах

```typescript
// src/components/DialogueScene.tsx
import { playSound } from '../utils/sounds';

const handleChoice = (choice: any) => {
  if (choice.wisdom > 0) {
    playSound('success');
  } else if (choice.wisdom < 0) {
    playSound('error');
  }
  // ... остальной код
};
```

## Добавление достижений

### В store

```typescript
// src/store/gameStore.ts
interface GameState {
  // ... существующие поля
  unlockedAchievements: Achievement[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

// Action
checkAchievements: () => set((state) => {
  const newAchievements = [];
  
  if (state.wisdom >= 100) {
    newAchievements.push({
      id: 'wise_master',
      title: '🧠 Мастер мудрости',
      description: 'Достиг 100% мудрости',
      icon: '🧠'
    });
  }
  
  if (state.coins >= 10) {
    newAchievements.push({
      id: 'rich_buratino',
      title: '💰 Богатый Буратино',
      description: 'Накопил 10+ монет',
      icon: '💰'
    });
  }
  
  return {
    unlockedAchievements: [...state.unlockedAchievements, ...newAchievements]
  };
})
```

### Использование

```typescript
// В любом компоненте
const { checkAchievements } = useGameStore();

useEffect(() => {
  checkAchievements();
}, [wisdom, coins]);
```

## Добавление мини-игр

### Пример: Калькулятор реальности

```typescript
// src/components/CalculatorMiniGame.tsx
export function CalculatorMiniGame() {
  const [investment, setInvestment] = useState(5);
  const [months, setMonths] = useState(1);
  const [returnRate, setReturnRate] = useState(900);
  
  const yearlyRate = (returnRate * 52 / months);
  const isSuspicious = yearlyRate > 100;
  
  return (
    <div className="glass-card">
      <h2>🧮 Калькулятор реальности</h2>
      
      <div>
        <label>Вложение: {investment} монет</label>
        <input 
          type="range" 
          min="1" 
          max="10" 
          value={investment}
          onChange={(e) => setInvestment(Number(e.target.value))}
        />
      </div>
      
      <div>
        <label>Доход через {months} мес: {returnRate}%</label>
        <input 
          type="range" 
          min="10" 
          max="1000" 
          value={returnRate}
          onChange={(e) => setReturnRate(Number(e.target.value))}
        />
      </div>
      
      <div className={`p-4 rounded-xl ${isSuspicious ? 'bg-danger/20' : 'bg-success/20'}`}>
        <p>Годовая доходность: {yearlyRate.toFixed(0)}%</p>
        <p>{isSuspicious ? '🚩 Это подозрительно!' : '✅ Реалистично'}</p>
      </div>
    </div>
  );
}
```

## Интеграция с backend (опционально)

### Сохранение прогресса

```typescript
// src/api/saveProgress.ts
export async function saveProgress(gameState: GameState) {
  try {
    const response = await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gameState)
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to save:', error);
  }
}
```

### Использование в store

```typescript
// src/store/gameStore.ts
import { saveProgress } from '../api/saveProgress';

// После каждого действия
addWisdom: (amount) => {
  set((state) => {
    const newState = { 
      ...state,
      wisdom: Math.max(0, Math.min(100, state.wisdom + amount)) 
    };
    saveProgress(newState); // Сохраняем
    return newState;
  });
}
```

## Экспорт результатов

```typescript
// src/utils/export.ts
export function exportResults(gameState: GameState) {
  const data = {
    wisdom: gameState.wisdom,
    coins: gameState.coins,
    completedLevels: gameState.completedLevels,
    achievements: gameState.achievements,
    date: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'buratino-results.json';
  a.click();
  URL.revokeObjectURL(url);
}
```

Использование:
```typescript
// В EndingScreen
<button onClick={() => exportResults(gameState)}>
  📥 Скачать результаты
</button>
```

## Добавление статистики

```typescript
// src/components/Statistics.tsx
export function Statistics() {
  const { 
    completedLevels, 
    wisdom, 
    coins, 
    achievements 
  } = useGameStore();
  
  const totalTime = 0; // Добавьте трекинг времени
  const correctAnswers = 0; // Добавьте подсчет
  
  return (
    <div className="glass-card">
      <h2>📊 Статистика</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="stat">
          <div className="text-4xl">🏆</div>
          <div className="text-2xl">{completedLevels.length}/8</div>
          <div>Уровней</div>
        </div>
        
        <div className="stat">
          <div className="text-4xl">💡</div>
          <div className="text-2xl">{wisdom}%</div>
          <div>Мудрости</div>
        </div>
        
        <div className="stat">
          <div className="text-4xl">🪙</div>
          <div className="text-2xl">{coins}</div>
          <div>Монет</div>
        </div>
        
        <div className="stat">
          <div className="text-4xl">⏱️</div>
          <div className="text-2xl">{totalTime} мин</div>
          <div>Времени</div>
        </div>
      </div>
    </div>
  );
}
```

## Мультиплеер (концепт)

```typescript
// src/hooks/useMultiplayer.ts
export function useMultiplayer(roomId: string) {
  const [players, setPlayers] = useState<Player[]>([]);
  
  useEffect(() => {
    // WebSocket подключение
    const ws = new WebSocket(`wss://api.example.com/rooms/${roomId}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setPlayers(data.players);
    };
    
    return () => ws.close();
  }, [roomId]);
  
  return { players };
}
```

Использование:
```typescript
const { players } = useMultiplayer('room-123');

// Показываем других игроков на карте
{players.map(player => (
  <div key={player.id}>
    {player.name}: Уровень {player.currentLevel}
  </div>
))}
```

## Тестирование компонентов

```typescript
// src/components/__tests__/StartScreen.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { StartScreen } from '../StartScreen';

test('increments counter on start', () => {
  render(<StartScreen />);
  
  const button = screen.getByText(/начать приключение/i);
  const initialCount = screen.getByText(/\d+/).textContent;
  
  fireEvent.click(button);
  
  // Проверяем что счетчик увеличился
  // (требует настройки моков для Zustand)
});
```

## Локализация

```typescript
// src/i18n/translations.ts
export const translations = {
  ru: {
    start: 'Начать приключение',
    wisdom: 'Мудрость',
    coins: 'Монеты'
  },
  en: {
    start: 'Start Adventure',
    wisdom: 'Wisdom',
    coins: 'Coins'
  }
};

// Использование
import { translations } from './i18n/translations';

const t = translations[language];
<button>{t.start}</button>
```

Это базовые примеры расширения функциональности! 🚀

