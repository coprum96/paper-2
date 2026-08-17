# ⚙️ Настройка переменных окружения (.env файлы)

## 📍 Где создавать .env файлы

```
buratino-premium/
├── .env              ← FRONTEND .env (создайте здесь)
└── backend/
    └── .env          ← BACKEND .env (создайте здесь)
```

---

## 🎨 FRONTEND .env

**Путь:** `/Users/stas/Workspace/buratino premium/.env`

**Содержимое:**

```env
# Backend API Configuration
# URL бэкенд сервера (БЕЗ trailing slash!)
VITE_API_URL=http://localhost:3001

# API ключ (должен совпадать с backend/.env)
# В продакшене используйте сложный рандомный ключ!
VITE_API_KEY=dev_api_key_change_in_production_12345678

# Development features
# Показывать панель исследователя (Ctrl+Shift+D) в DEV режиме
VITE_SHOW_DEV_PANEL=true
```

### Для продакшена (Vercel/Netlify):

```env
VITE_API_URL=https://your-backend-api.com
VITE_API_KEY=your_production_secret_key_xyz123
VITE_SHOW_DEV_PANEL=false
```

---

## 🔧 BACKEND .env

**Путь:** `/Users/stas/Workspace/buratino premium/backend/.env`

**Содержимое для локальной разработки:**

```env
# ============================================
# DATABASE
# ============================================
# PostgreSQL connection string
# Формат: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
DATABASE_URL="postgresql://buratino_user:change_me_in_production@localhost:5432/buratino_research?schema=public"

# ============================================
# SERVER
# ============================================
# Порт на котором запускается backend
PORT=3001

# Окружение (development | production)
NODE_ENV=development

# ============================================
# SECURITY
# ============================================
# API ключ для защиты эндпоинта
# ДОЛЖЕН СОВПАДАТЬ С VITE_API_KEY на фронтенде!
# Используйте сложный ключ в продакшене:
# Сгенерировать: openssl rand -hex 32
API_KEY=dev_api_key_change_in_production_12345678

# ============================================
# CORS
# ============================================
# Разрешённые origins (через запятую)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:5174
```

### Для продакшена (Railway/Render/Heroku):

```env
# Database (предоставляется хостингом)
DATABASE_URL="postgresql://user:pass@host.railway.app:5432/railway"

# Server
PORT=3001
NODE_ENV=production

# Security
API_KEY=your_production_secret_key_generated_with_openssl_rand

# CORS (только ваш продакшен домен!)
ALLOWED_ORIGINS=https://yourgame.com,https://www.yourgame.com
```

---

## 🔐 Генерация безопасного API ключа

### Для продакшена ОБЯЗАТЕЛЬНО сгенерируйте новый ключ:

```bash
# macOS / Linux
openssl rand -hex 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32|%{Get-Random -Max 256}))

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Пример результата:
```
7a8f3c2e1b9d4f6a8c5e3b7d9f1a4c6e8b2d5f7a9c3e6b8d1f4a7c9e2b5d8f1a
```

Используйте этот ключ **одинаково** в обоих `.env` файлах.

---

## ✅ Проверка настройки

### 1. Проверка Frontend

```bash
# В корне проекта
cat .env

# Должно вывести:
# VITE_API_URL=http://localhost:3001
# VITE_API_KEY=...
# VITE_SHOW_DEV_PANEL=true
```

### 2. Проверка Backend

```bash
# В папке backend
cat backend/.env

# Должно вывести:
# DATABASE_URL=postgresql://...
# API_KEY=...
# и т.д.
```

### 3. Проверка что ключи совпадают

```bash
# Сравните ключи
echo "Frontend:" && grep VITE_API_KEY .env
echo "Backend:" && grep API_KEY backend/.env

# Значения после = должны совпадать!
```

---

## 🚨 ВАЖНО: Безопасность

### ❌ НИКОГДА не коммитьте .env файлы в git!

`.env` файлы уже добавлены в `.gitignore`, но на всякий случай:

```bash
# Проверьте что .env не отслеживается
git status

# Если случайно добавили:
git rm --cached .env
git rm --cached backend/.env
```

### ✅ Вместо .env предоставляйте .env.example:

`.env.example` (уже создан):
```env
VITE_API_URL=http://localhost:3001
VITE_API_KEY=your_secret_key_here
VITE_SHOW_DEV_PANEL=true
```

`backend/.env.example` (уже создан):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"
PORT=3001
NODE_ENV=development
API_KEY=your_secret_key_here
ALLOWED_ORIGINS=http://localhost:5173
```

---

## 🔄 После создания .env файлов

### Перезапустите серверы:

```bash
# Остановите оба сервера (Ctrl+C)

# Backend
cd backend
npm run dev

# Frontend (в другом терминале)
cd ..
npm run dev
```

### Проверьте в консоли браузера:

```javascript
// Откройте DevTools (F12) → Console
console.log(import.meta.env.VITE_API_URL)
// Должно вывести: http://localhost:3001

console.log(import.meta.env.VITE_API_KEY)
// Должно вывести ваш ключ
```

---

## 📝 Шаблоны для копирования

### 👉 Frontend .env (скопируйте это)

```env
VITE_API_URL=http://localhost:3001
VITE_API_KEY=dev_api_key_change_in_production_12345678
VITE_SHOW_DEV_PANEL=true
```

### 👉 Backend .env (скопируйте это)

```env
DATABASE_URL="postgresql://buratino_user:change_me_in_production@localhost:5432/buratino_research?schema=public"
PORT=3001
NODE_ENV=development
API_KEY=dev_api_key_change_in_production_12345678
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## 🎯 Быстрая настройка (copy-paste команды)

```bash
# 1. Создайте frontend .env
cat > .env << 'EOF'
VITE_API_URL=http://localhost:3001
VITE_API_KEY=dev_api_key_change_in_production_12345678
VITE_SHOW_DEV_PANEL=true
EOF

# 2. Создайте backend .env
cat > backend/.env << 'EOF'
DATABASE_URL="postgresql://buratino_user:change_me_in_production@localhost:5432/buratino_research?schema=public"
PORT=3001
NODE_ENV=development
API_KEY=dev_api_key_change_in_production_12345678
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
EOF

# 3. Проверьте
echo "✅ Frontend .env:"
cat .env
echo ""
echo "✅ Backend .env:"
cat backend/.env
```

---

Готово! Теперь переходите к [SETUP_FULL_STACK.md](./SETUP_FULL_STACK.md) для продолжения настройки.

**СПбГУ** | 2024


