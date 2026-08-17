# ⚡ Быстрая настройка с Supabase

## 🔴 ВАМ НУЖЕН DATABASE PASSWORD!

### Получите пароль:

1. **Откройте:** https://app.supabase.com/project/qnbfecocgvlxuwczzqgk/settings/database
2. **Найдите:** "Connection string" или "Database Password"
3. **Если не знаете пароль:** Нажмите "Reset Database Password" и сохраните его!

---

## 📝 Шаг 1: Backend .env

Создайте файл `backend/.env` со следующим содержимым:

```env
# Замените [YOUR-PASSWORD] на ваш database password!
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.qnbfecocgvlxuwczzqgk.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"

DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.qnbfecocgvlxuwczzqgk.supabase.co:5432/postgres"

PORT=3001
NODE_ENV=development

# Сгенерируйте: openssl rand -hex 32
API_KEY=supabase_secret_$(openssl rand -hex 16)

ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Команда для создания с автогенерацией ключа:

```bash
cd backend

# Генерируем случайный API ключ
API_KEY=$(openssl rand -hex 32)
echo "Ваш API_KEY: $API_KEY"
echo "СОХРАНИТЕ ЕГО! Понадобится для фронтенда."

# Создаём .env (НЕ ЗАБУДЬТЕ ЗАМЕНИТЬ [YOUR-PASSWORD]!)
cat > .env << EOF
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.qnbfecocgvlxuwczzqgk.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.qnbfecocgvlxuwczzqgk.supabase.co:5432/postgres"
PORT=3001
NODE_ENV=development
API_KEY=$API_KEY
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
EOF

echo "✅ backend/.env создан!"
```

---

## 📝 Шаг 2: Frontend .env

Создайте файл `.env` в корне проекта:

```env
VITE_SUPABASE_URL=https://qnbfecocgvlxuwczzqgk.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_UDBVaZF7cnoeyO178m5GhQ_txXBuK_f

VITE_API_URL=http://localhost:3001

# СКОПИРУЙТЕ API_KEY из backend/.env!
VITE_API_KEY=<ВАШ_API_KEY_ИЗ_ПРЕДЫДУЩЕГО_ШАГА>

VITE_SHOW_DEV_PANEL=true
```

### Команда для создания:

```bash
# В корне проекта
# ЗАМЕНИТЕ <API_KEY> на ключ из backend/.env!

cat > .env << 'EOF'
VITE_SUPABASE_URL=https://qnbfecocgvlxuwczzqgk.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_UDBVaZF7cnoeyO178m5GhQ_txXBuK_f
VITE_API_URL=http://localhost:3001
VITE_API_KEY=<ВСТАВЬТЕ_API_KEY_СЮДА>
VITE_SHOW_DEV_PANEL=true
EOF

echo "✅ .env создан!"
```

---

## 🚀 Шаг 3: Установка и запуск

```bash
# 1. Backend setup
cd backend
npm install
npx prisma generate
npx prisma migrate deploy  # или migrate dev --name init

# 2. Запуск backend
npm run dev
# Должно показать: 🚀 Backend API запущен на порту 3001

# 3. Frontend setup (в новом терминале)
cd ..
npm install  # если ещё не установлено
npm run dev
# Должно показать: Local: http://localhost:5173
```

---

## ✅ Проверка

### 1. Проверьте подключение к БД:

```bash
cd backend
npx prisma studio
```

Если откроется http://localhost:5555 - всё работает! ✅

### 2. Проверьте таблицы в Supabase:

1. Откройте: https://app.supabase.com/project/qnbfecocgvlxuwczzqgk/editor
2. Вы должны увидеть таблицы:
   - `sessions`
   - `quiz_answers`
   - `dialogue_choices`
   - `test_results`
   - `material_views`

### 3. Протестируйте игру:

1. Откройте http://localhost:5173
2. Пройдите 1-2 уровня
3. Завершите игру
4. Проверьте в Prisma Studio или Supabase Dashboard - данные должны сохраниться!

---

## 🐛 Troubleshooting

### "Connection timeout"

**Решение:** Включите Connection Pooling в Supabase:
- Dashboard → Settings → Database → Connection Pooling → Enable

### "Password authentication failed"

**Решение:** Сбросьте пароль БД:
1. https://app.supabase.com/project/qnbfecocgvlxuwczzqgk/settings/database
2. Reset Database Password
3. Обновите `[YOUR-PASSWORD]` в `backend/.env`

### "API_KEY не совпадает"

**Решение:**
```bash
# Проверьте ключи
echo "Backend:" && grep API_KEY backend/.env
echo "Frontend:" && grep VITE_API_KEY .env
```

Они должны быть одинаковыми!

---

## 📊 Просмотр данных

### Вариант 1: Prisma Studio
```bash
cd backend
npm run prisma:studio
```

### Вариант 2: Supabase Dashboard
https://app.supabase.com/project/qnbfecocgvlxuwczzqgk/editor

### Вариант 3: SQL запросы
```sql
-- В Supabase SQL Editor
SELECT COUNT(*) FROM sessions;
SELECT * FROM quiz_answers ORDER BY timestamp DESC LIMIT 10;
```

---

## ✨ Готово!

Теперь игра работает с Supabase PostgreSQL! 🎉

**Все данные автоматически сохраняются** при прохождении игры.

---

## 📚 Полная документация

- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Подробная документация
- [RESEARCH_BACKEND_README.md](./RESEARCH_BACKEND_README.md) - SQL запросы для анализа
- [SETUP_FULL_STACK.md](./SETUP_FULL_STACK.md) - Полный гайд


