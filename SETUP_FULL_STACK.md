# 🚀 Инструкция по запуску полного стека (Frontend + Backend)

Пошаговая инструкция для запуска игры с автоматическим сбором данных в БД.

---

## 📋 Требования

- **Node.js** 18+ (проверьте: `node --version`)
- **PostgreSQL** 14+ (проверьте: `psql --version`)
- **npm** или **yarn**

---

## 🗄️ Часть 1: Настройка базы данных

### 1.1 Установка PostgreSQL

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Скачайте установщик: https://www.postgresql.org/download/windows/

### 1.2 Создание базы данных

```bash
# Войдите в PostgreSQL
psql -U postgres

# В psql консоли:
CREATE DATABASE buratino_research;
CREATE USER buratino_user WITH PASSWORD 'change_me_in_production';
GRANT ALL PRIVILEGES ON DATABASE buratino_research TO buratino_user;
\q
```

---

## 🔧 Часть 2: Настройка Backend

### 2.1 Установка зависимостей

```bash
cd backend
npm install
```

### 2.2 Создание .env файла

Создайте `backend/.env`:

```env
# Database Connection
DATABASE_URL="postgresql://buratino_user:change_me_in_production@localhost:5432/buratino_research?schema=public"

# Server Configuration
PORT=3001
NODE_ENV=development

# Security (используйте сложный ключ в продакшене!)
API_KEY=dev_api_key_change_in_production_12345678

# CORS - добавьте все нужные origins
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 2.3 Применение миграций БД

```bash
# Создаёт таблицы в БД
npx prisma migrate dev --name init

# Генерирует Prisma Client
npx prisma generate
```

### 2.4 Запуск backend сервера

```bash
npm run dev
```

Вы должны увидеть:
```
🚀 Backend API запущен на порту 3001
📊 Environment: development
🔗 Health check: http://localhost:3001/health
📡 API endpoint: http://localhost:3001/api/sessions
```

**Тест:** Откройте http://localhost:3001/health - должен вернуть `{"status":"ok"}`

---

## 🎨 Часть 3: Настройка Frontend

### 3.1 Установка зависимостей (если ещё не установлены)

```bash
cd ..  # вернитесь в корень проекта
npm install
```

### 3.2 Создание .env файла

Создайте `.env` в корне проекта (рядом с `package.json`):

```env
# Backend API Configuration
VITE_API_URL=http://localhost:3001
VITE_API_KEY=dev_api_key_change_in_production_12345678

# Development features
VITE_SHOW_DEV_PANEL=true
```

**⚠️ ВАЖНО:** `VITE_API_KEY` должен совпадать с `API_KEY` из `backend/.env`

### 3.3 Запуск frontend

```bash
npm run dev
```

Откройте http://localhost:5173

---

## ✅ Часть 4: Проверка работы

### 4.1 Полный тест сбора данных

1. **Откройте игру** в браузере: http://localhost:5173
2. **Пройдите хотя бы один уровень:**
   - Начните игру
   - Пройдите первый диалог
   - Ответьте на вопросы викторины
3. **Завершите игру** (или дойдите до финального экрана)
4. **Откройте Prisma Studio:**
   ```bash
   cd backend
   npm run prisma:studio
   ```
5. **Проверьте данные:**
   - В таблице `sessions` должна быть ваша сессия
   - В `quiz_answers` - ваши ответы
   - В `dialogue_choices` - ваши выборы

### 4.2 Проверка логов

**Backend логи** должны показывать:
```
📊 Получена сессия: session_1234567890_xyz
  ✓ Сохранено 5 ответов на викторины
  ✓ Сохранено 3 выборов в диалогах
✅ Сессия session_1234567890_xyz успешно сохранена
```

**Frontend консоль** (F12 в браузере):
```
📤 Отправка сессии на сервер: session_1234567890_xyz
✅ Сессия успешно отправлена на сервер
```

### 4.3 SQL запрос для проверки

```sql
-- В Prisma Studio или psql
SELECT 
  session_id,
  start_time,
  final_coins,
  final_wisdom,
  jsonb_array_length(completed_levels::jsonb) as levels
FROM sessions
ORDER BY start_time DESC
LIMIT 5;
```

---

## 🐛 Troubleshooting

### Проблема: Backend не запускается

**Ошибка:** `Error: P1001: Can't reach database server`

**Решение:**
```bash
# Проверьте что PostgreSQL запущен
pg_isready

# Если нет - запустите:
brew services start postgresql@14  # macOS
sudo systemctl start postgresql    # Linux
```

### Проблема: Frontend не отправляет данные

**Симптомы:** В консоли видно `⚠️ API URL или API KEY не настроены`

**Решение:**
1. Убедитесь что `.env` файл существует в корне проекта
2. Перезапустите `npm run dev`
3. Проверьте в консоли: `console.log(import.meta.env.VITE_API_URL)`

### Проблема: CORS ошибка

**Ошибка:** `Access to fetch at ... has been blocked by CORS policy`

**Решение:**
Добавьте origin фронтенда в `backend/.env`:
```env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

### Проблема: Invalid API key

**Решение:**
Убедитесь что ключи совпадают:
```bash
# Backend
grep API_KEY backend/.env

# Frontend
grep VITE_API_KEY .env
```

---

## 📊 Работа с данными

### Просмотр данных через UI

```bash
cd backend
npm run prisma:studio
```

Откроется http://localhost:5555 с графическим интерфейсом.

### SQL запросы

```bash
# Подключитесь к БД
psql -U buratino_user -d buratino_research

# Базовая статистика
SELECT COUNT(*) FROM sessions;
SELECT AVG(final_wisdom) FROM sessions;
```

Больше запросов в [RESEARCH_BACKEND_README.md](./RESEARCH_BACKEND_README.md)

---

## 🚀 Продакшен деплой

### Backend (например, на Railway/Render)

1. Создайте PostgreSQL базу в облаке
2. Установите переменные окружения:
   - `DATABASE_URL` - URL облачной БД
   - `API_KEY` - сложный рандомный ключ
   - `NODE_ENV=production`
   - `ALLOWED_ORIGINS` - ваш фронтенд домен
3. Запустите миграции:
   ```bash
   npx prisma migrate deploy
   ```

### Frontend (например, на Vercel/Netlify)

1. Установите переменные окружения:
   - `VITE_API_URL` - URL вашего бэкенда
   - `VITE_API_KEY` - тот же ключ что и на бэкенде
   - `VITE_SHOW_DEV_PANEL=false` - отключить dev панель
2. Соберите: `npm run build`
3. Задеплойте папку `dist/`

---

## 📂 Структура проекта

```
buratino-premium/
├── backend/                 # Backend сервер
│   ├── src/
│   │   ├── index.ts        # Главный файл
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Business logic
│   │   ├── middleware/     # Auth, errors
│   │   └── lib/            # Prisma client
│   ├── prisma/
│   │   └── schema.prisma   # DB schema
│   ├── package.json
│   └── .env                # ← создайте этот файл
│
├── src/                     # Frontend
│   ├── components/
│   ├── utils/
│   │   └── sessionAnalytics.ts  # Сбор данных
│   └── ...
│
├── .env                     # ← создайте этот файл
├── package.json
└── RESEARCH_BACKEND_README.md  # Полная документация
```

---

## 🆘 Нужна помощь?

1. **Проверьте логи:**
   - Backend: смотрите терминал где запущен `npm run dev`
   - Frontend: откройте DevTools (F12) → Console

2. **Проверьте подключение:**
   ```bash
   # Backend health check
   curl http://localhost:3001/health
   
   # Database connection
   cd backend && npx prisma studio
   ```

3. **Частые проблемы:** См. секцию Troubleshooting выше

---

**Готово!** 🎉 

Теперь все игровые сессии автоматически сохраняются в PostgreSQL для исследования.

**Следующие шаги:**
- Прочитайте [RESEARCH_BACKEND_README.md](./RESEARCH_BACKEND_README.md) для SQL запросов
- Используйте Prisma Studio для просмотра данных
- Экспортируйте данные для анализа в Python/R

---

**СПбГУ** | Декабрь 2024


