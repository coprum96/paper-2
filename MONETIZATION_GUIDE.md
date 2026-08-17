# 💰 Руководство по монетизации игры "Золотой Детектор"

## Дата внедрения: 2025

---

## 📋 ОБЗОР

Добавлена система монетизации с платным доступом к главам 3+ и поддержкой промокодов.

### Модель монетизации:
- **Бесплатно:** Главы 0, 1, 2 (первые три главы)
- **Платно:** Главы 3-7 (требуют оплаты или промокода)
- **Промокод:** `buratino` (lowercase) даёт полный доступ

---

## 🏗️ АРХИТЕКТУРА

### Новые файлы:

1. **`src/utils/accessControl.ts`** - Утилиты контроля доступа
   - `validatePromoCode(code)` - проверка промокода
   - `canAccessLevel(levelId, accessStatus)` - проверка доступа к уровню
   - `shouldShowPaywall()` - определение необходимости показа paywall
   - `initiatePurchase()` - заглушка для интеграции оплаты

2. **`src/components/Paywall.tsx`** - Компонент платёжного экрана
   - UI с описанием преимуществ
   - Кнопка покупки (TODO: интеграция платёжной системы)
   - Форма ввода промокода
   - Валидация и активация промокода

### Изменённые файлы:

1. **`src/store/gameStore.ts`**
   - Добавлен `accessStatus: 'free' | 'locked' | 'promo' | 'paid'`
   - Добавлен `pendingLevel: number | null`
   - Новые методы:
     - `setAccessStatus(status)`
     - `setPendingLevel(level)`
     - `activatePromoCode(code)`
     - `checkLevelAccess(levelId)`
     - `continueFromPaywall()`

2. **`src/App.tsx`**
   - Добавлена фаза `'paywall'` в GamePhase
   - Рендеринг компонента Paywall
   - Обработчики `handleAccessGranted` и `handlePaywallClose`

3. **`src/components/ChapterMap.tsx`**
   - Проверка доступа при клике на главу
   - Отображение бейджа "PRO" на платных главах
   - Кнопка "Открыть доступ" вместо "Начать главу" для заблокированных

4. **`src/components/QuizScreen.tsx`**
   - Проверка доступа после завершения теста
   - Показ paywall при переходе к главе 3+

5. **`src/components/DialogueScene.tsx`**
   - Проверка доступа при завершении диалогов без теста
   - Показ paywall при необходимости

---

## 🔄 ЛОГИКА РАБОТЫ

### Новый пользователь (free):

```
1. Запуск игры → accessStatus = 'free'
2. Прохождение главы 0 ✅
3. Прохождение главы 1 ✅
4. Прохождение главы 2 ✅
5. Завершение теста главы 2
6. Попытка перехода к главе 3
   → checkLevelAccess(3) → false (т.к. accessStatus === 'free')
   → setPendingLevel(3)
   → setPhase('paywall')
7. Показывается Paywall компонент
```

### Пользователь с промокодом:

```
1. На экране Paywall вводит "buratino"
2. validatePromoCode("buratino") → 'promo'
3. accessStatus = 'promo'
4. Сообщение об успехе (2 секунды)
5. continueFromPaywall() → переход к главе 3
6. Все главы 3-7 теперь доступны ✅
```

### Пользователь с оплатой (будущее):

```
1. На экране Paywall кликает "Купить доступ"
2. initiatePurchase() → TODO: интеграция платёжной системы
3. После успешной оплаты: accessStatus = 'paid'
4. Все главы разблокированы ✅
```

---

## 🎮 ТОЧКИ ПРОВЕРКИ ДОСТУПА

### 1. ChapterMap (клик на главу)
```typescript
const handleChapterClick = (levelIndex: number) => {
  if (levelIndex > currentLevel) return; // Ещё не достигнут
  
  if (!checkLevelAccess(levelIndex)) {
    setPendingLevel(levelIndex);
    setPhase('paywall');
    return;
  }
  
  // Запуск уровня
  setPhase('dialogue');
};
```

### 2. QuizScreen (после завершения теста)
```typescript
function handleComplete() {
  completeLevel(currentLevel);
  const nextLevelId = currentLevel + 1;
  
  if (!checkLevelAccess(nextLevelId)) {
    setPendingLevel(nextLevelId);
    setPhase('paywall');
    return;
  }
  
  nextLevel();
}
```

### 3. DialogueScene (после последнего диалога)
```typescript
// В конце диалогов, если нет теста
if (!checkLevelAccess(nextLevelId)) {
  setPendingLevel(nextLevelId);
  setPhase('paywall');
} else {
  nextLevel();
}
```

---

## 💳 ИНТЕГРАЦИЯ ПЛАТЁЖНОЙ СИСТЕМЫ

### Текущее состояние:
```typescript
// src/utils/accessControl.ts
export async function initiatePurchase() {
  console.log('🔒 TODO: integrate payment system');
  return { success: false, error: 'Интеграция в разработке' };
}
```

### План интеграции (например, ЮKassa):

```typescript
export async function initiatePurchase(): Promise<{ success: boolean }> {
  try {
    const response = await fetch('/api/payment/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 299, // Цена в рублях
        product: 'full_access',
        description: 'Полный доступ к игре "Золотой Детектор"'
      })
    });
    
    const { paymentUrl } = await response.json();
    
    // Редирект на страницу оплаты
    window.location.href = paymentUrl;
    
    return { success: true };
  } catch (error) {
    console.error('Payment error:', error);
    return { success: false, error: 'Ошибка при создании платежа' };
  }
}
```

### Callback после оплаты:

```typescript
// В App.tsx или отдельном компоненте
useEffect(() => {
  // Проверка параметров URL после возврата с платёжной системы
  const urlParams = new URLSearchParams(window.location.search);
  const paymentSuccess = urlParams.get('payment') === 'success';
  
  if (paymentSuccess) {
    setAccessStatus('paid');
    // Очистка URL
    window.history.replaceState({}, '', window.location.pathname);
  }
}, []);
```

---

## 🎁 УПРАВЛЕНИЕ ПРОМОКОДАМИ

### Текущие промокоды:
```typescript
// src/utils/accessControl.ts
const VALID_PROMO_CODES = {
  buratino: 'promo', // Полный доступ
};
```

### Добавление новых промокодов:
```typescript
const VALID_PROMO_CODES = {
  buratino: 'promo',
  earlybird: 'promo',
  winter2025: 'promo',
  // ... и т.д.
};
```

### API-версия (будущее):
```typescript
export async function validatePromoCode(code: string) {
  const response = await fetch('/api/promo-code/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: code.toLowerCase().trim() })
  });
  
  if (!response.ok) return null;
  
  const { valid, accessStatus } = await response.json();
  return valid ? accessStatus : null;
}
```

---

## 🧪 ТЕСТИРОВАНИЕ

### Сценарий 1: Новый пользователь
1. Запустить игру
2. Пройти главы 0, 1, 2
3. После теста главы 2 → должен появиться Paywall ✅
4. Проверить UI Paywall (кнопки, поля, тексты)

### Сценарий 2: Промокод
1. Дойти до Paywall
2. Ввести "BURATINO" (uppercase) → должен сработать ✅
3. Ввести "buratino" (lowercase) → должен сработать ✅
4. Ввести "  buratino  " (с пробелами) → должен сработать ✅
5. Ввести "wrong" → должна появиться ошибка ✅
6. После активации → переход к главе 3 ✅
7. Главы 4-7 должны быть доступны без повторного ввода ✅

### Сценарий 3: Возврат из Paywall
1. Дойти до Paywall
2. Нажать "← Вернуться к карте глав"
3. Должен вернуться к ChapterMap ✅
4. Глава 3 должна показывать кнопку "Открыть доступ" с иконкой "PRO" ✅

### Сценарий 4: Повторный доступ
1. Активировать промокод
2. Пройти несколько глав
3. Перезагрузить страницу
4. ⚠️ **ВНИМАНИЕ:** accessStatus сбросится на 'free'
5. **TODO:** Реализовать сохранение в localStorage

---

## 🔧 УЛУЧШЕНИЯ И TODO

### Высокий приоритет:
- [ ] Интеграция платёжной системы (ЮKassa / Stripe)
- [ ] Сохранение `accessStatus` в localStorage
- [ ] API для проверки промокодов
- [ ] Аналитика (отслеживание конверсии)

### Средний приоритет:
- [ ] A/B тестирование цен
- [ ] Таймер "ограниченного предложения"
- [ ] Реферальная программа
- [ ] Подписка вместо разовой оплаты

### Низкий приоритет:
- [ ] Несколько уровней доступа (Basic/Pro/Premium)
- [ ] In-app покупки дополнительных материалов
- [ ] Подарочные коды

---

## 📊 АНАЛИТИКА

### События для отслеживания:
```typescript
// При показе Paywall
analytics.track('paywall_shown', {
  chapter: pendingLevel,
  accessStatus: 'free'
});

// При активации промокода
analytics.track('promo_code_activated', {
  code: 'buratino', // или хеш
  success: true
});

// При покупке
analytics.track('purchase_completed', {
  amount: 299,
  product: 'full_access'
});

// При закрытии Paywall без действия
analytics.track('paywall_closed', {
  action: 'back_to_map'
});
```

---

## 🎨 UI/UX РЕКОМЕНДАЦИИ

### Paywall экран:
- ✅ Яркий заголовок с иконкой замка
- ✅ Список преимуществ с галочками
- ✅ Большая кнопка "Купить доступ"
- ✅ Альтернатива: поле промокода
- ✅ Кнопка возврата
- ⚠️ TODO: Добавить социальные доказательства (отзывы, количество пользователей)

### ChapterMap:
- ✅ Бейдж "PRO" на платных главах
- ✅ Другая кнопка для заблокированных глав
- ⚠️ TODO: Анимация при наведении на платные главы

---

## 🔐 БЕЗОПАСНОСТЬ

### Текущие меры:
- ✅ Валидация на фронтенде
- ✅ Нормализация промокодов (lowercase, trim)
- ❌ **НЕТ** серверной проверки (легко обойти через DevTools)

### Рекомендации:
1. **Критично:** Переместить проверку промокодов на сервер
2. **Критично:** Хранить `accessStatus` на сервере с привязкой к пользователю
3. Использовать JWT токены для авторизации
4. Шифровать промокоды
5. Ограничить количество попыток активации

---

## 📱 АДАПТИВНОСТЬ

Paywall адаптивен для всех размеров экранов:
- Мобильные (320px+): Одна колонка, крупные кнопки
- Планшеты (768px+): Увеличенные отступы
- Десктоп (1024px+): Центрированный контейнер

---

## 🚀 ЗАПУСК В PRODUCTION

### Чек-лист перед запуском:
- [ ] Интегрирована платёжная система
- [ ] Настроен backend для промокодов
- [ ] Добавлено сохранение в localStorage/DB
- [ ] Подключена аналитика
- [ ] Протестированы все сценарии
- [ ] Юридическая оферта и политика конфиденциальности
- [ ] Настроены webhook'и для обработки платежей

---

## 💡 ПРИМЕРЫ КОДА

### Проверка доступа:
```typescript
const hasAccess = checkLevelAccess(3);
if (!hasAccess) {
  // Показать paywall
}
```

### Активация промокода:
```typescript
const result = activatePromoCode('buratino');
if (result.success) {
  // Промокод активирован
  continueFromPaywall();
} else {
  // Показать ошибку
  alert(result.error);
}
```

### Проверка статуса:
```typescript
const { accessStatus } = useGameStore();

if (accessStatus === 'promo' || accessStatus === 'paid') {
  // Полный доступ
}
```

---

**Конец руководства**

*Дата обновления: 2025*  
*Версия: 1.0*

