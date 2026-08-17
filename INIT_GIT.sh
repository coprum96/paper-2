#!/bin/bash

echo "🚀 Инициализация Git репозитория..."

# Инициализация
git init

# Добавление всех файлов
git add .

# Первый коммит
git commit -m "Initial commit: Buratino Educational Game

- React + TypeScript + Vite
- Zustand state management
- Tailwind CSS
- 8 educational chapters
- Quiz system
- Educational materials
- Complete game data in single file"

echo "✅ Репозиторий готов!"
echo ""
echo "📝 Следующие шаги:"
echo "1. Создайте репозиторий на GitHub"
echo "2. Выполните:"
echo "   git remote add origin https://github.com/USERNAME/REPO.git"
echo "   git branch -M main"
echo "   git push -u origin main"
