#!/bin/bash

# ============================================
# Автоматическая настройка Supabase Backend
# ============================================

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║   🔷 Настройка Buratino Premium с Supabase              ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Цвета
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================
# Шаг 1: Получение database password
# ============================================

echo -e "${YELLOW}Шаг 1: Database Password${NC}"
echo ""
echo "Откройте в браузере:"
echo -e "${BLUE}https://app.supabase.com/project/qnbfecocgvlxuwczzqgk/settings/database${NC}"
echo ""
echo "Найдите секцию 'Connection string' или 'Database Password'"
echo ""
echo -e "${RED}ВАЖНО:${NC} Если не знаете пароль - нажмите 'Reset database password'"
echo ""
read -p "Введите ваш Database Password: " DB_PASSWORD
echo ""

if [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}❌ Пароль не может быть пустым!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Пароль получен!${NC}"
echo ""

# ============================================
# Шаг 2: Генерация API ключа
# ============================================

echo -e "${YELLOW}Шаг 2: Генерация API ключа${NC}"
API_KEY=$(openssl rand -hex 32)
echo -e "${GREEN}✅ API ключ сгенерирован: $API_KEY${NC}"
echo ""
echo -e "${RED}⚠️  СОХРАНИТЕ ЭТОТ КЛЮЧ!${NC}"
echo ""

# ============================================
# Шаг 3: Создание backend/.env
# ============================================

echo -e "${YELLOW}Шаг 3: Создание backend/.env${NC}"

mkdir -p backend

cat > backend/.env << EOF
# ============================================
# SUPABASE POSTGRESQL CONNECTION
# ============================================
DATABASE_URL="postgresql://postgres:${DB_PASSWORD}@db.qnbfecocgvlxuwczzqgk.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:${DB_PASSWORD}@db.qnbfecocgvlxuwczzqgk.supabase.co:5432/postgres"

# ============================================
# SERVER CONFIGURATION
# ============================================
PORT=3001
NODE_ENV=development

# ============================================
# SECURITY
# ============================================
API_KEY=${API_KEY}

# ============================================
# CORS
# ============================================
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
EOF

echo -e "${GREEN}✅ backend/.env создан!${NC}"
echo ""

# ============================================
# Шаг 4: Создание frontend .env
# ============================================

echo -e "${YELLOW}Шаг 4: Создание frontend .env${NC}"

cat > .env << EOF
# ============================================
# SUPABASE CONFIGURATION
# ============================================
VITE_SUPABASE_URL=https://qnbfecocgvlxuwczzqgk.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_UDBVaZF7cnoeyO178m5GhQ_txXBuK_f

# ============================================
# BACKEND API CONFIGURATION
# ============================================
VITE_API_URL=http://localhost:3001
VITE_API_KEY=${API_KEY}

# ============================================
# DEVELOPMENT FEATURES
# ============================================
VITE_SHOW_DEV_PANEL=true
EOF

echo -e "${GREEN}✅ .env создан!${NC}"
echo ""

# ============================================
# Шаг 5: Установка и миграции
# ============================================

echo -e "${YELLOW}Шаг 5: Установка зависимостей и миграции${NC}"
echo ""

cd backend

echo "📦 Установка npm пакетов..."
npm install

echo ""
echo "🔧 Генерация Prisma Client..."
npx prisma generate

echo ""
echo "🗄️  Применение миграций к Supabase..."
npx prisma migrate deploy

echo ""
echo -e "${GREEN}✅ Backend настроен!${NC}"

cd ..

# ============================================
# Готово!
# ============================================

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                  ✅ НАСТРОЙКА ЗАВЕРШЕНА!                 ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}Что дальше:${NC}"
echo ""
echo "1️⃣  Запустите backend:"
echo "   cd backend && npm run dev"
echo ""
echo "2️⃣  Запустите frontend (в новом терминале):"
echo "   npm run dev"
echo ""
echo "3️⃣  Откройте игру:"
echo "   http://localhost:5173"
echo ""
echo "4️⃣  Проверьте данные:"
echo "   cd backend && npx prisma studio"
echo ""
echo -e "${BLUE}📊 Данные будут сохраняться в Supabase автоматически!${NC}"
echo ""
echo -e "${YELLOW}⚠️  API_KEY (сохраните!):"
echo -e "${API_KEY}${NC}"
echo ""


