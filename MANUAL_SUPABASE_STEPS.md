# 📝 Ручная настройка Supabase (пошагово)

## ❗ Вам нужен Database Password!

### Получите его:
1. Откройте: https://app.supabase.com/project/qnbfecocgvlxuwczzqgk/settings/database
2. Найдите "Connection string" или "Database Password"
3. Если не знаете - нажмите "Reset database password"
4. **Сохраните пароль!** (например: `kY8nR2mP9xQ4vB7z`)

---

## 📂 Шаг 1: Создайте backend/.env

```bash
cd backend

# Генерируем API ключ
API_KEY=$(openssl rand -hex 32)
echo "Ваш API_KEY: $API_KEY"
echo "❗ СОХРАНИТЕ ЕГО!"

# Создаём backend/.env
# ⚠️ ЗАМЕНИТЕ your_db_password_here на ваш РЕАЛЬНЫЙ пароль!
cat > .env << EOF
DATABASE_URL="postgresql://postgres:your_db_password_here@db.qnbfecocgvlxuwczzqgk.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:your_db_password_here@db.qnbfecocgvlxuwczzqgk.supabase.co:5432/postgres"
PORT=3001
NODE_ENV=development
API_KEY=$API_KEY
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
EOF
```

**ВАЖНО:** Откройте файл и замените `your_db_password_here`:

```bash
nano backend/.env
# или
code backend/.env
```

---

## 📂 Шаг 2: Создайте .env в корне

```bash
cd ..

# ⚠️ Вставьте API_KEY из предыдущего шага!
cat > .env << 'EOF'
VITE_SUPABASE_URL=https://qnbfecocgvlxuwczzqgk.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_UDBVaZF7cnoeyO178m5GhQ_txXBuK_f
VITE_API_URL=http://localhost:3001
VITE_API_KEY=ВСТАВЬТЕ_API_KEY_ИЗ_BACKEND_ENV
VITE_SHOW_DEV_PANEL=true
EOF
```

Откройте и вставьте API_KEY:
```bash
nano .env
# или
code .env
```

---

## 🔧 Шаг 3: Установка и миграции

```bash
cd backend

# Установка
npm install

# Генерация Prisma Client
npx prisma generate

# Миграции
npx prisma migrate deploy
```

---

## 🚀 Шаг 4: Запуск

### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend:
```bash
npm run dev
```

---

## ✅ Проверка

### Prisma Studio:
```bash
cd backend
npx prisma studio
```

### Supabase Dashboard:
https://app.supabase.com/project/qnbfecocgvlxuwczzqgk/editor

---

## 🐛 Если что-то не работает

### Проверьте пароль:
```bash
# Попробуйте подключиться
cd backend
npx prisma db push
```

Если ошибка "authentication failed" - неправильный пароль!

### Проверьте API ключи:
```bash
echo "Backend:" && grep API_KEY backend/.env
echo "Frontend:" && grep VITE_API_KEY .env
```

Они должны быть одинаковые!

---

## 📞 Нужна помощь?

Напишите мне database password, я создам `.env` файлы за вас! 🚀


