# 🔷 Настройка с Supabase

## 1️⃣ Получение Connection String

### Вариант A: Через Supabase Dashboard

1. Откройте https://app.supabase.com/
2. Выберите ваш проект: `qnbfecocgvlxuwczzqgk`
3. Перейдите в **Settings** (⚙️) → **Database**
4. Найдите секцию **Connection string**
5. Выберите **URI** (или **Connection string**)
6. Скопируйте строку, она выглядит так:

```
postgresql://postgres:[YOUR-PASSWORD]@db.qnbfecocgvlxuwczzqgk.supabase.co:5432/postgres
```

⚠️ **Замените `[YOUR-PASSWORD]`** на ваш database password!

### Вариант B: Если не знаете пароль

Если вы забыли database password:

1. В Supabase Dashboard → **Settings** → **Database**
2. Найдите **Database Password**
3. Нажмите **Reset Database Password**
4. Сохраните новый пароль в надёжном месте!

---

## 2️⃣ Настройка Backend

Создайте файл `backend/.env`:

```env
# Supabase PostgreSQL Connection
# Замените [YOUR-PASSWORD] на ваш реальный пароль!
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.qnbfecocgvlxuwczzqgk.supabase.co:5432/postgres?pgbouncer=true"

# Для миграций используйте прямое подключение
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.qnbfecocgvlxuwczzqgk.supabase.co:5432/postgres"

# Server
PORT=3001
NODE_ENV=development

# Security - сгенерируйте новый ключ!
API_KEY=your_secret_api_key_change_me_123456

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## 3️⃣ Обновление Prisma Schema

Обновите `backend/prisma/schema.prisma`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

---

## 4️⃣ Настройка Frontend

Создайте файл `.env` в корне проекта:

```env
# Supabase (для будущих возможностей)
VITE_SUPABASE_URL=https://qnbfecocgvlxuwczzqgk.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_UDBVaZF7cnoeyO178m5GhQ_txXBuK_f

# Backend API
VITE_API_URL=http://localhost:3001
VITE_API_KEY=your_secret_api_key_change_me_123456

# Dev panel
VITE_SHOW_DEV_PANEL=true
```

⚠️ **ВАЖНО:** `VITE_API_KEY` должен совпадать с `API_KEY` из `backend/.env`!

---

## 5️⃣ Применение миграций

```bash
cd backend

# Установка зависимостей
npm install

# Генерация Prisma Client
npx prisma generate

# Применение миграций к Supabase
npx prisma migrate deploy

# Или для dev:
npx prisma migrate dev --name init
```

---

## 6️⃣ Запуск

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd ..
npm run dev
```

---

## ✅ Проверка подключения

### Тест подключения к Supabase:

```bash
cd backend

# Открыть Prisma Studio
npx prisma studio
```

Если откроется http://localhost:5555 - подключение работает! ✅

---

## 🎯 Преимущества Supabase

1. ✅ **Управляемый PostgreSQL** - не нужно настраивать сервер
2. ✅ **Автоматические бэкапы**
3. ✅ **Встроенный мониторинг**
4. ✅ **Бесплатный план** для разработки
5. ✅ **Realtime subscriptions** (если понадобится в будущем)

---

## 🔧 Troubleshooting

### Ошибка: "Connection timeout"

**Решение:** Проверьте что ваш IP разрешён в Supabase:
1. Dashboard → **Settings** → **Database**
2. Scroll down → **Connection Pooling**
3. Убедитесь что **Connection pooling** включён

### Ошибка: "Password authentication failed"

**Решение:** Сбросьте database password:
1. Dashboard → **Settings** → **Database**
2. **Reset Database Password**
3. Обновите `DATABASE_URL` в `backend/.env`

### Ошибка: "Too many connections"

**Решение:** Используйте connection pooling:
```env
DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres?pgbouncer=true"
```

---

## 📊 Просмотр данных

### В Prisma Studio:
```bash
cd backend
npm run prisma:studio
```

### В Supabase Dashboard:
1. Откройте https://app.supabase.com/
2. Ваш проект → **Table Editor**
3. Увидите все созданные таблицы

---

## 🚀 Готово!

Теперь ваш backend работает с Supabase PostgreSQL!

**Следующий шаг:** Пройдите игру и проверьте что данные сохраняются в Supabase.


