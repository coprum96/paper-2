# 🔬 Backend для исследовательского сбора данных

## Обзор

Этот бэкенд автоматически собирает и сохраняет все игровые сессии в PostgreSQL базу данных для последующего анализа. Данные отправляются автоматически при завершении каждой игровой сессии.

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
cd backend
npm install
```

### 2. Настройка базы данных

#### Создайте PostgreSQL базу данных

```bash
# Войдите в PostgreSQL
psql -U postgres

# Создайте базу данных
CREATE DATABASE buratino_research;

# Создайте пользователя (опционально)
CREATE USER buratino_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE buratino_research TO buratino_user;
```

#### Настройте переменные окружения

Создайте файл `backend/.env`:

```env
# Database
DATABASE_URL="postgresql://buratino_user:your_password@localhost:5432/buratino_research?schema=public"

# Server
PORT=3001
NODE_ENV=development

# Security
API_KEY=your_secret_api_key_123456

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 3. Запуск миграций

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Запуск сервера

```bash
# Development режим с hot reload
npm run dev

# Production режим
npm run build
npm start

# Открыть Prisma Studio (GUI для БД)
npm run prisma:studio
```

Сервер запустится на http://localhost:3001

### 5. Настройка фронтенда

Создайте файл `.env` в корне проекта (рядом с `package.json`):

```env
# Backend API
VITE_API_URL=http://localhost:3001
VITE_API_KEY=your_secret_api_key_123456

# Dev panel (опционально, для локальной разработки)
VITE_SHOW_DEV_PANEL=true
```

**⚠️ Важно:** `API_KEY` должен совпадать в обоих `.env` файлах (фронтенд и бэкенд).

### 6. Запуск полного стека

```bash
# Терминал 1: Backend
cd backend
npm run dev

# Терминал 2: Frontend
cd ..
npm run dev
```

## 📊 Структура базы данных

### Таблицы

#### `sessions` - Основная таблица сессий
- `id` (UUID) - Первичный ключ
- `session_id` (String, unique) - ID сессии с фронтенда
- `user_id` (String, nullable) - ID пользователя (если есть)
- `start_time`, `end_time` - Временные метки
- `total_play_time` (Int) - Общее время игры в секундах
- `final_coins`, `final_wisdom` - Финальные результаты
- `completed_levels` (JSON) - Массив пройденных уровней
- `achievements` (JSON) - Массив достижений
- `time_per_level` (JSON) - Объект {levelId: seconds}
- `raw_json` (JSON) - Полный дамп SessionData

#### `quiz_answers` - Ответы на викторины
- `session_id` (FK) - Связь с сессией
- `level_id` - Номер уровня
- `question_index` - Номер вопроса
- `question_text` - Текст вопроса
- `selected_answer` - Выбранный ответ
- `is_correct` - Правильность ответа
- `timestamp` - Время ответа

#### `dialogue_choices` - Выборы в диалогах
- `session_id` (FK)
- `level_id`, `dialogue_index`
- `character_name` - Имя персонажа
- `choice_text` - Текст выбора
- `wisdom_change`, `coin_change` - Изменения статов
- `timestamp`

#### `test_results` - Результаты тестов
- `session_id` (FK)
- `test_type` - 'scenario' | 'complex' | 'post'
- `score`, `total_questions`
- `raw_answers` (JSON) - Детальные ответы
- `timestamp`

#### `material_views` - Просмотры материалов
- `session_id` (FK)
- `material_id`, `material_title`
- `view_duration` - Длительность в секундах
- `timestamp`

## 🔍 SQL запросы для анализа

### Базовая статистика

```sql
-- Общее количество сессий
SELECT COUNT(*) as total_sessions FROM sessions;

-- Средняя длительность игры
SELECT AVG(total_play_time) as avg_play_time_seconds,
       AVG(total_play_time) / 60.0 as avg_play_time_minutes
FROM sessions
WHERE end_time IS NOT NULL;

-- Средние финальные показатели
SELECT 
  AVG(final_coins) as avg_coins,
  AVG(final_wisdom) as avg_wisdom,
  AVG(jsonb_array_length(completed_levels::jsonb)) as avg_completed_levels
FROM sessions;

-- Распределение сессий по датам
SELECT 
  DATE(start_time) as date,
  COUNT(*) as sessions_count
FROM sessions
GROUP BY DATE(start_time)
ORDER BY date DESC;
```

### Анализ викторин

```sql
-- Общая точность ответов
SELECT 
  ROUND(AVG(CASE WHEN is_correct THEN 1.0 ELSE 0.0 END) * 100, 2) as accuracy_percent,
  COUNT(*) as total_answers
FROM quiz_answers;

-- Точность по уровням
SELECT 
  level_id,
  COUNT(*) as answers_count,
  SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_count,
  ROUND(AVG(CASE WHEN is_correct THEN 1.0 ELSE 0.0 END) * 100, 2) as accuracy_percent
FROM quiz_answers
GROUP BY level_id
ORDER BY level_id;

-- Самые сложные вопросы (с наименьшей точностью)
SELECT 
  level_id,
  question_index,
  question_text,
  COUNT(*) as attempts,
  SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_count,
  ROUND(AVG(CASE WHEN is_correct THEN 1.0 ELSE 0.0 END) * 100, 2) as accuracy_percent
FROM quiz_answers
GROUP BY level_id, question_index, question_text
HAVING COUNT(*) >= 10  -- минимум 10 попыток
ORDER BY accuracy_percent ASC
LIMIT 10;
```

### Анализ уровней

```sql
-- Среднее время на каждый уровень
WITH level_times AS (
  SELECT 
    session_id,
    jsonb_each(time_per_level::jsonb) as level_data
  FROM sessions
  WHERE time_per_level::text != '{}'
)
SELECT 
  (level_data).key::int as level_id,
  ROUND(AVG((level_data).value::text::int), 2) as avg_time_seconds,
  COUNT(*) as completions
FROM level_times
GROUP BY (level_data).key::int
ORDER BY (level_data).key::int;

-- Процент прохождения уровней
WITH level_attempts AS (
  SELECT 
    session_id,
    jsonb_array_elements(completed_levels::jsonb)::int as level_id
  FROM sessions
)
SELECT 
  level_id,
  COUNT(*) as completed_count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM sessions), 2) as completion_percent
FROM level_attempts
GROUP BY level_id
ORDER BY level_id;
```

### Анализ выборов в диалогах

```sql
-- Популярность выборов по персонажам
SELECT 
  character_name,
  choice_text,
  COUNT(*) as times_selected,
  AVG(wisdom_change) as avg_wisdom_change,
  AVG(coin_change) as avg_coin_change
FROM dialogue_choices
GROUP BY character_name, choice_text
ORDER BY times_selected DESC
LIMIT 20;

-- Корреляция выборов с финальной мудростью
SELECT 
  dc.character_name,
  dc.choice_text,
  COUNT(*) as selections,
  ROUND(AVG(s.final_wisdom), 2) as avg_final_wisdom
FROM dialogue_choices dc
JOIN sessions s ON dc.session_id = s.session_id
GROUP BY dc.character_name, dc.choice_text
HAVING COUNT(*) >= 5
ORDER BY avg_final_wisdom DESC;
```

### Анализ тестов

```sql
-- Результаты финального теста
SELECT 
  test_type,
  COUNT(*) as attempts,
  ROUND(AVG(score::float / total_questions * 100), 2) as avg_score_percent,
  MIN(score) as min_score,
  MAX(score) as max_score
FROM test_results
GROUP BY test_type;

-- Распределение результатов финального теста
SELECT 
  CASE 
    WHEN score::float / total_questions >= 0.8 THEN '80-100%'
    WHEN score::float / total_questions >= 0.6 THEN '60-79%'
    WHEN score::float / total_questions >= 0.4 THEN '40-59%'
    ELSE '0-39%'
  END as score_range,
  COUNT(*) as count
FROM test_results
WHERE test_type = 'post'
GROUP BY score_range
ORDER BY score_range DESC;
```

### Анализ просмотров материалов

```sql
-- Самые просматриваемые материалы
SELECT 
  material_id,
  material_title,
  COUNT(*) as views,
  ROUND(AVG(view_duration), 2) as avg_duration_seconds
FROM material_views
GROUP BY material_id, material_title
ORDER BY views DESC;

-- Корреляция просмотра материалов с результатами
SELECT 
  COUNT(DISTINCT mv.session_id) as sessions_with_views,
  ROUND(AVG(s.final_wisdom), 2) as avg_wisdom_with_views,
  (SELECT ROUND(AVG(final_wisdom), 2) FROM sessions WHERE session_id NOT IN (SELECT DISTINCT session_id FROM material_views)) as avg_wisdom_without_views
FROM material_views mv
JOIN sessions s ON mv.session_id = s.session_id;
```

### Продвинутые запросы

```sql
-- Прогрессия игрока: как меняется точность ответов во времени
WITH ordered_answers AS (
  SELECT 
    session_id,
    level_id,
    is_correct,
    timestamp,
    ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY timestamp) as answer_number
  FROM quiz_answers
)
SELECT 
  CASE 
    WHEN answer_number <= 5 THEN 'Первые 5'
    WHEN answer_number <= 10 THEN '6-10'
    WHEN answer_number <= 15 THEN '11-15'
    ELSE '16+'
  END as answer_group,
  ROUND(AVG(CASE WHEN is_correct THEN 1.0 ELSE 0.0 END) * 100, 2) as accuracy_percent
FROM ordered_answers
GROUP BY answer_group
ORDER BY MIN(answer_number);

-- Полный профиль сессии
SELECT 
  s.session_id,
  s.start_time,
  s.total_play_time,
  s.final_coins,
  s.final_wisdom,
  jsonb_array_length(s.completed_levels::jsonb) as levels_completed,
  COUNT(DISTINCT qa.id) as quiz_answers,
  COUNT(DISTINCT dc.id) as dialogue_choices,
  COUNT(DISTINCT tr.id) as tests_taken,
  COUNT(DISTINCT mv.id) as materials_viewed
FROM sessions s
LEFT JOIN quiz_answers qa ON s.session_id = qa.session_id
LEFT JOIN dialogue_choices dc ON s.session_id = dc.session_id
LEFT JOIN test_results tr ON s.session_id = tr.session_id
LEFT JOIN material_views mv ON s.session_id = mv.session_id
GROUP BY s.session_id, s.start_time, s.total_play_time, s.final_coins, s.final_wisdom, s.completed_levels
ORDER BY s.start_time DESC
LIMIT 20;
```

## 🔧 Экспорт данных для анализа

### Экспорт в CSV

```sql
-- Экспорт сессий
COPY (
  SELECT * FROM sessions
) TO '/path/to/sessions.csv' WITH CSV HEADER;

-- Экспорт ответов на викторины
COPY (
  SELECT * FROM quiz_answers
) TO '/path/to/quiz_answers.csv' WITH CSV HEADER;
```

### Экспорт в JSON

```sql
-- Полный дамп сессии с всеми связанными данными
SELECT jsonb_build_object(
  'session', row_to_json(s.*),
  'quiz_answers', (SELECT jsonb_agg(row_to_json(qa.*)) FROM quiz_answers qa WHERE qa.session_id = s.session_id),
  'dialogue_choices', (SELECT jsonb_agg(row_to_json(dc.*)) FROM dialogue_choices dc WHERE dc.session_id = s.session_id),
  'test_results', (SELECT jsonb_agg(row_to_json(tr.*)) FROM test_results tr WHERE tr.session_id = s.session_id),
  'material_views', (SELECT jsonb_agg(row_to_json(mv.*)) FROM material_views mv WHERE mv.session_id = s.session_id)
) as full_session_data
FROM sessions s
WHERE s.session_id = 'YOUR_SESSION_ID';
```

## 🐍 Подключение к БД из Python

```python
import psycopg2
import pandas as pd
from sqlalchemy import create_engine

# Метод 1: psycopg2
conn = psycopg2.connect(
    host="localhost",
    database="buratino_research",
    user="buratino_user",
    password="your_password"
)

cursor = conn.cursor()
cursor.execute("SELECT * FROM sessions")
sessions = cursor.fetchall()

# Метод 2: pandas + SQLAlchemy
engine = create_engine('postgresql://buratino_user:your_password@localhost:5432/buratino_research')

# Загрузка всех сессий
sessions_df = pd.read_sql("SELECT * FROM sessions", engine)

# Загрузка ответов на викторины
quiz_df = pd.read_sql("SELECT * FROM quiz_answers", engine)

# Базовая статистика
print(f"Всего сессий: {len(sessions_df)}")
print(f"Средняя мудрость: {sessions_df['final_wisdom'].mean():.1f}")

# Точность ответов
accuracy = quiz_df['is_correct'].mean() * 100
print(f"Точность ответов: {accuracy:.1f}%")
```

## 📈 Подключение к БД из R

```r
library(RPostgreSQL)
library(dplyr)
library(ggplot2)

# Подключение
drv <- dbDriver("PostgreSQL")
con <- dbConnect(drv, 
                 dbname = "buratino_research",
                 host = "localhost",
                 port = 5432,
                 user = "buratino_user",
                 password = "your_password")

# Загрузка данных
sessions <- dbGetQuery(con, "SELECT * FROM sessions")
quiz_answers <- dbGetQuery(con, "SELECT * FROM quiz_answers")

# Базовая статистика
summary(sessions$final_wisdom)

# Точность по уровням
level_accuracy <- quiz_answers %>%
  group_by(level_id) %>%
  summarise(
    accuracy = mean(is_correct) * 100,
    n = n()
  )

# Визуализация
ggplot(level_accuracy, aes(x = level_id, y = accuracy)) +
  geom_bar(stat = "identity", fill = "purple") +
  labs(title = "Точность ответов по уровням",
       x = "Уровень", y = "Точность (%)") +
  theme_minimal()
```

## 🔒 Безопасность в продакшене

### 1. Настройте HTTPS

Используйте reverse proxy (nginx):

```nginx
server {
    listen 443 ssl;
    server_name api.yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 2. Смените API ключ

```env
# Используйте сложный рандомный ключ
API_KEY=$(openssl rand -hex 32)
```

### 3. Настройте firewall

```bash
# Разрешите только нужные порты
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 4. Ограничьте CORS

```env
# Только ваш домен
ALLOWED_ORIGINS=https://yourgame.com
```

## 🐛 Troubleshooting

### Проблема: "Connection refused" при запросе к API

**Решение:**
1. Проверьте что бэкенд запущен: `curl http://localhost:3001/health`
2. Проверьте CORS настройки в `backend/.env`
3. Проверьте firewall/антивирус

### Проблема: "Invalid API key"

**Решение:**
1. Убедитесь что `API_KEY` одинаковый в обоих `.env` файлах
2. Проверьте что фронтенд отправляет заголовок `X-API-KEY`

### Проблема: База данных не подключается

**Решение:**
1. Проверьте `DATABASE_URL` в `backend/.env`
2. Убедитесь что PostgreSQL запущен: `pg_isready`
3. Проверьте права доступа: `psql -U buratino_user -d buratino_research`

### Проблема: Данные не отправляются на сервер

**Решение:**
1. Откройте консоль браузера (F12) и проверьте ошибки
2. Убедитесь что `.env` файл в корне фронтенда существует
3. Проверьте что переменные `VITE_API_URL` и `VITE_API_KEY` заданы

## 📞 Поддержка

Для вопросов и проблем:
1. Проверьте логи бэкенда
2. Проверьте консоль браузера
3. Проверьте Prisma Studio: `npm run prisma:studio`

---

**Автор**: СПбГУ  
**Версия**: 1.0.0  
**Дата**: Декабрь 2024


