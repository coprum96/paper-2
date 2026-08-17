# 🎮 Buratino Research Backend

Backend API для автоматического сбора и анализа данных игры "Золотой Детектор".

## ⚡ Быстрый старт

### 1. Установка

```bash
npm install
```

### 2. Настройка БД

Создайте `.env` файл:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/buratino_research?schema=public"
PORT=3001
NODE_ENV=development
API_KEY=your_secret_key_123456
ALLOWED_ORIGINS=http://localhost:5173
```

### 3. Миграции

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Запуск

```bash
# Development
npm run dev

# Production
npm run build
npm start

# Database UI
npm run prisma:studio
```

## 📡 API

### POST /api/sessions

Сохраняет игровую сессию.

**Headers:**
```
Content-Type: application/json
X-API-KEY: your_secret_key_123456
```

**Body:**
```json
{
  "sessionId": "session_123",
  "startTime": "2024-12-25T10:00:00Z",
  "endTime": "2024-12-25T10:45:00Z",
  "finalCoins": 15,
  "finalWisdom": 75,
  "completedLevels": [0, 1, 2],
  "achievements": ["achievement1"],
  "timePerLevel": {"0": 120, "1": 180},
  "totalPlayTime": 2700,
  "quizAnswers": [...],
  "dialogueChoices": [...],
  "testResults": [...],
  "materialViews": [...]
}
```

**Response:**
```json
{
  "status": "ok",
  "sessionId": "session_123",
  "id": "uuid..."
}
```

## 📊 База данных

5 основных таблиц:
- `sessions` - игровые сессии
- `quiz_answers` - ответы на викторины
- `dialogue_choices` - выборы в диалогах
- `test_results` - результаты тестов
- `material_views` - просмотры материалов

Полная документация: [../RESEARCH_BACKEND_README.md](../RESEARCH_BACKEND_README.md)

## 🔧 Scripts

- `npm run dev` - запуск с hot reload
- `npm run build` - сборка TypeScript
- `npm start` - запуск продакшен версии
- `npm run prisma:generate` - генерация Prisma клиента
- `npm run prisma:migrate` - применить миграции
- `npm run prisma:studio` - открыть GUI для БД

## 🔒 Безопасность

- API защищён ключом (`X-API-KEY` header)
- CORS настроен на разрешённые домены
- Helmet.js для security headers
- Prisma для защиты от SQL инъекций

## 📦 Tech Stack

- Node.js + TypeScript
- Express.js
- Prisma ORM
- PostgreSQL
- Helmet, CORS, Morgan

---

**СПбГУ** | 2024


