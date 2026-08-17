# 📊 Сводка реализации Backend для исследований

## ✅ Что было сделано

Полная реализация бэкенда для автоматического сбора и хранения игровых данных в PostgreSQL.

---

## 📁 Созданные файлы

### Backend структура

```
backend/
├── src/
│   ├── index.ts                    # Главный сервер Express
│   ├── lib/
│   │   └── prisma.ts              # Prisma Client singleton
│   ├── middleware/
│   │   ├── auth.ts                # API Key authentication
│   │   └── errorHandler.ts       # Глобальный error handler
│   ├── routes/
│   │   └── sessions.ts            # POST /api/sessions route
│   ├── controllers/
│   │   └── sessionController.ts   # Бизнес-логика сохранения
│   └── types/
│       └── session.ts             # TypeScript типы
│
├── prisma/
│   └── schema.prisma              # Database schema (5 таблиц)
│
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
├── .gitignore                      # Git ignore правила
└── README.md                       # Backend документация
```

### Frontend изменения

```
src/
├── utils/
│   └── sessionAnalytics.ts        # ✏️ Добавлен sendToServer()
└── App.tsx                         # ✏️ Dev-only панель исследователя
```

### Документация

```
├── RESEARCH_BACKEND_README.md      # 📖 Полная документация (SQL запросы, анализ)
├── SETUP_FULL_STACK.md            # 🚀 Пошаговая инструкция установки
├── ENV_SETUP_INSTRUCTIONS.md       # ⚙️ Настройка .env файлов
├── BACKEND_IMPLEMENTATION_SUMMARY.md  # 📊 Этот файл
└── README.md                       # ✏️ Обновлён с секцией про backend
```

---

## 🗄️ Структура базы данных

### 5 таблиц в PostgreSQL:

#### 1. `sessions` - Основная таблица
- `id` (UUID Primary Key)
- `session_id` (String, unique) - ID с фронтенда
- `user_id` (String, nullable)
- `start_time`, `end_time` (Timestamp)
- `total_play_time` (Int) - секунды
- `final_coins`, `final_wisdom` (Int)
- `completed_levels` (JSONB) - массив уровней
- `achievements` (JSONB) - массив достижений
- `time_per_level` (JSONB) - {levelId: seconds}
- `raw_json` (JSONB) - полный dump SessionData

#### 2. `quiz_answers` - Ответы на викторины
- `session_id` (FK → sessions)
- `level_id`, `question_index`
- `question_text`, `selected_answer`
- `is_correct` (Boolean)
- `timestamp`

#### 3. `dialogue_choices` - Выборы в диалогах
- `session_id` (FK)
- `level_id`, `dialogue_index`
- `character_name`, `choice_text`
- `wisdom_change`, `coin_change`
- `timestamp`

#### 4. `test_results` - Результаты тестов
- `session_id` (FK)
- `test_type` ('scenario' | 'complex' | 'post')
- `score`, `total_questions`
- `raw_answers` (JSONB)
- `timestamp`

#### 5. `material_views` - Просмотры материалов
- `session_id` (FK)
- `material_id`, `material_title`
- `view_duration` (секунды)
- `timestamp`

**Индексы:** На всех FK, session_id, level_id, test_type для быстрых запросов.

---

## 🔌 API Endpoint

### POST /api/sessions

Автоматически вызывается при завершении игровой сессии.

**URL:** `http://localhost:3001/api/sessions`

**Headers:**
```
Content-Type: application/json
X-API-KEY: <your_api_key>
```

**Request Body:** Объект `SessionData` (типы в `src/utils/sessionAnalytics.ts`)

**Response:**
```json
{
  "status": "ok",
  "sessionId": "session_123...",
  "id": "uuid-..."
}
```

**Что происходит:**
1. Валидация входных данных
2. Проверка дубликата по `sessionId`
3. **Транзакция БД:**
   - Создание записи в `sessions`
   - Массовая вставка в `quiz_answers`
   - Массовая вставка в `dialogue_choices`
   - Массовая вставка в `test_results`
   - Массовая вставка в `material_views`
4. Возврат успешного ответа

---

## 🔐 Безопасность

### Реализовано:

1. **API Key Authentication**
   - Middleware проверяет `X-API-KEY` header
   - Ключ хранится в `.env` (backend и frontend)
   - Reject неавторизованных запросов

2. **CORS**
   - Настраиваемый whitelist origins
   - По умолчанию только `localhost:5173`

3. **Helmet.js**
   - Автоматические security headers
   - XSS protection, no-sniff и т.д.

4. **Prisma ORM**
   - Защита от SQL injection
   - Типобезопасные запросы

5. **Rate limiting** (опционально, не реализовано)
   - Можно добавить `express-rate-limit` при необходимости

### Dev Panel скрыт в продакшене:

```typescript
// App.tsx
if (!import.meta.env.DEV && !import.meta.env.VITE_SHOW_DEV_PANEL) {
  return; // Ctrl+Shift+D не работает в production
}
```

---

## 🔄 Поток данных

```
┌─────────────┐
│   Игрок     │
│  проходит   │
│    игру     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│   SessionAnalytics          │
│   (фронтенд)                │
│                             │
│  • trackQuizAnswer()        │
│  • trackDialogueChoice()    │
│  • trackTestResult()        │
│  • startLevel()             │
│  • endSession() ◄────────┐  │
└──────┬──────────────────┬─┘  │
       │                  │    │
       │ localStorage     │    │ При завершении
       │                  │    │
       ▼                  ▼    │
  ┌─────────┐      ┌──────────────┐
  │ Архив   │      │ sendToServer()│
  │ (local) │      │   fetch()     │
  └─────────┘      └──────┬────────┘
                          │
                          │ POST /api/sessions
                          │ X-API-KEY: xxx
                          │
                          ▼
              ┌──────────────────────┐
              │   Backend (Express)  │
              │   Port 3001          │
              │                      │
              │  • Auth middleware   │
              │  • Validation        │
              │  • sessionController │
              └──────────┬───────────┘
                         │
                         │ Prisma Client
                         │
                         ▼
              ┌──────────────────────┐
              │   PostgreSQL         │
              │   Database           │
              │                      │
              │  • sessions          │
              │  • quiz_answers      │
              │  • dialogue_choices  │
              │  • test_results      │
              │  • material_views    │
              └──────────────────────┘
```

---

## 🚀 Быстрый старт (для разработчика)

### 1. Установка PostgreSQL

```bash
# macOS
brew install postgresql@14
brew services start postgresql@14

# Ubuntu
sudo apt install postgresql
```

### 2. Создание БД

```bash
psql -U postgres
CREATE DATABASE buratino_research;
CREATE USER buratino_user WITH PASSWORD 'dev_password';
GRANT ALL PRIVILEGES ON DATABASE buratino_research TO buratino_user;
\q
```

### 3. Backend setup

```bash
cd backend
npm install

# Создайте backend/.env (см. ENV_SETUP_INSTRUCTIONS.md)
# Главное: DATABASE_URL и API_KEY

npx prisma migrate dev --name init
npx prisma generate
npm run dev
```

### 4. Frontend setup

```bash
cd ..

# Создайте .env (см. ENV_SETUP_INSTRUCTIONS.md)
# Главное: VITE_API_URL и VITE_API_KEY (должен совпадать!)

npm run dev
```

### 5. Тест

1. Откройте http://localhost:5173
2. Пройдите один уровень
3. Завершите игру
4. Проверьте БД:
   ```bash
   cd backend
   npm run prisma:studio
   ```
5. В таблице `sessions` должна быть ваша сессия

---

## 📊 Примеры использования

### SQL: Средняя точность ответов по уровню

```sql
SELECT 
  level_id,
  COUNT(*) as total_answers,
  SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct,
  ROUND(AVG(CASE WHEN is_correct THEN 1.0 ELSE 0.0 END) * 100, 2) as accuracy_percent
FROM quiz_answers
GROUP BY level_id
ORDER BY level_id;
```

### Python: Загрузка данных

```python
import pandas as pd
from sqlalchemy import create_engine

engine = create_engine('postgresql://buratino_user:password@localhost/buratino_research')

# Все сессии
sessions = pd.read_sql("SELECT * FROM sessions", engine)

# Ответы на викторины
quiz = pd.read_sql("SELECT * FROM quiz_answers", engine)

print(f"Средняя мудрость: {sessions['final_wisdom'].mean():.1f}%")
print(f"Точность ответов: {quiz['is_correct'].mean() * 100:.1f}%")
```

### R: Визуализация

```r
library(ggplot2)
library(dplyr)

# Точность по уровням
quiz %>%
  group_by(level_id) %>%
  summarise(accuracy = mean(is_correct) * 100) %>%
  ggplot(aes(x = level_id, y = accuracy)) +
  geom_bar(stat = "identity", fill = "purple") +
  labs(title = "Точность ответов по уровням")
```

---

## 🎓 Для исследователей

### Основные метрики доступны сразу:

1. **Образовательная эффективность**
   - Точность ответов до/после обучения
   - Корреляция просмотра материалов с результатами
   - Прогрессия в течение игры

2. **Поведенческие паттерны**
   - Популярность выборов в диалогах
   - Время на уровень
   - Dropout points (где бросают игру)

3. **Когнитивная нагрузка**
   - Сложность уровней (по времени)
   - Сложность вопросов (по точности)
   - Влияние давления времени

### Готовые SQL запросы в:

📖 [RESEARCH_BACKEND_README.md](./RESEARCH_BACKEND_README.md)

Включает 20+ запросов для:
- Базовой статистики
- Анализа викторин
- Анализа уровней
- Анализа выборов
- Продвинутого анализа

---

## 🔧 Tech Stack

### Backend
- **Node.js** 18+ (LTS)
- **Express.js** 4.18 - веб-фреймворк
- **Prisma** 5.8 - ORM для PostgreSQL
- **TypeScript** 5.3 - типобезопасность
- **Helmet** - security headers
- **CORS** - cross-origin управление
- **Morgan** - HTTP логирование

### Database
- **PostgreSQL** 14+ - реляционная БД
- **JSONB** - для гибких полей
- **Индексы** - на всех FK и частых фильтрах

### Frontend изменения
- Добавлен `sendToServer()` в `sessionAnalytics.ts`
- Dev-only режим для `DataExportPanel`

---

## 📈 Масштабируемость

### Текущая реализация:
- ✅ Поддержка тысяч сессий
- ✅ Транзакции для целостности данных
- ✅ Индексы для быстрых запросов
- ✅ Connection pooling (Prisma)

### При больших нагрузках:
1. **Redis для кэширования** агрегированных метрик
2. **Rate limiting** для защиты от спама
3. **Batch inserts** для групповых сохранений
4. **Read replicas** для аналитических запросов
5. **TimescaleDB** для time-series анализа

---

## 🐛 Известные ограничения

1. **Нет retry логики** - если backend недоступен, данные остаются только в localStorage
   - *Решение:* Добавить очередь отложенных отправок

2. **Нет дедупликации запросов** - если пользователь закроет браузер во время отправки
   - *Решение:* Уже реализована проверка дубликатов по `sessionId`

3. **localStorage лимит** - ~5-10 MB на домен
   - *Решение:* Данные отправляются на сервер и очищаются локально

4. **Нет real-time аналитики** - только post-factum анализ
   - *Решение:* Можно добавить WebSocket для live метрик

---

## 🎯 Следующие шаги (опционально)

### Для продакшена:

1. **Docker контейнеризация**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   CMD ["npm", "start"]
   ```

2. **CI/CD pipeline** (GitHub Actions)
   - Автоматические миграции при deploy
   - Тесты перед деплоем
   - Автоматический rollback

3. **Мониторинг**
   - Prometheus + Grafana для метрик
   - Sentry для error tracking
   - Uptime monitoring

4. **Backup автоматизация**
   ```bash
   pg_dump buratino_research > backup_$(date +%Y%m%d).sql
   ```

### Для исследований:

1. **A/B тестирование** разных версий контента
2. **Cohort анализ** по датам регистрации
3. **Funnel анализ** пути игрока
4. **ML модели** для предсказания dropout

---

## 📞 Помощь и поддержка

### Документация:
1. **Установка:** [SETUP_FULL_STACK.md](./SETUP_FULL_STACK.md)
2. **Переменные окружения:** [ENV_SETUP_INSTRUCTIONS.md](./ENV_SETUP_INSTRUCTIONS.md)
3. **SQL запросы:** [RESEARCH_BACKEND_README.md](./RESEARCH_BACKEND_README.md)

### Debugging:
```bash
# Логи backend
cd backend && npm run dev

# Prisma Studio (GUI для БД)
cd backend && npm run prisma:studio

# Консоль браузера
F12 → Console → Ищите "📤 Отправка сессии"
```

### Типичные проблемы:
См. секцию **Troubleshooting** в [SETUP_FULL_STACK.md](./SETUP_FULL_STACK.md)

---

## ✅ Checklist перед использованием

- [ ] PostgreSQL установлен и запущен
- [ ] База данных `buratino_research` создана
- [ ] Backend `.env` настроен (DATABASE_URL, API_KEY)
- [ ] Frontend `.env` настроен (VITE_API_URL, VITE_API_KEY совпадает!)
- [ ] Prisma миграции применены (`npx prisma migrate dev`)
- [ ] Backend запущен (`npm run dev` в `backend/`)
- [ ] Frontend запущен (`npm run dev` в корне)
- [ ] Health check работает: `curl http://localhost:3001/health`
- [ ] Тестовая сессия сохранилась в БД

---

**🎉 Готово к использованию!**

Игра теперь автоматически отправляет все данные в PostgreSQL для вашего исследования.

**Авторы:** СПбГУ  
**Версия backend:** 1.0.0  
**Дата:** Декабрь 2024

---

## 📄 Лицензия

MIT License - свободное использование для исследовательских целей.

При публикации результатов исследования просьба указывать:
- Проект "Золотой Детектор"
- Поддержка СПбГУ
- Ссылку на репозиторий


