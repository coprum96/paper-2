# 🚀 Публикация на GitHub

## Шаг 1: Инициализация репозитория

```bash
git init
git add .
git commit -m "Initial commit: Buratino Educational Game"
```

## Шаг 2: Создание репозитория на GitHub

1. Перейдите на https://github.com
2. Нажмите "New repository"
3. Название: `buratino-game` (или любое другое)
4. Описание: "Educational game about financial literacy"
5. Публичный или приватный (на выбор)
6. **НЕ добавляйте** README, .gitignore, license (они уже есть)
7. Нажмите "Create repository"

## Шаг 3: Подключение к GitHub

Скопируйте команды из GitHub (они будут примерно такие):

```bash
git remote add origin https://github.com/ВАШ_USERNAME/buratino-game.git
git branch -M main
git push -u origin main
```

## Шаг 4: Обновление в будущем

Когда вносите изменения:

```bash
# 1. Добавить изменения
git add .

# 2. Сделать коммит
git commit -m "Описание изменений"

# 3. Отправить на GitHub
git push
```

## 🌐 Развертывание (опционально)

### Vercel (рекомендуется):

1. Зайдите на https://vercel.com
2. "New Project" → выберите ваш GitHub репозиторий
3. Vercel автоматически определит Vite
4. Нажмите "Deploy"
5. Готово! Получите ссылку типа: https://buratino-game.vercel.app

### Netlify:

1. Зайдите на https://netlify.com
2. "Add new site" → "Import from Git"
3. Выберите репозиторий
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Deploy!

### GitHub Pages:

```bash
npm install --save-dev gh-pages
```

Добавьте в `package.json`:

```json
"homepage": "https://USERNAME.github.io/buratino-game",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

В `vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  base: '/buratino-game/'
})
```

Затем:

```bash
npm run deploy
```

## 📝 Полезные команды Git

```bash
# Проверить статус
git status

# Посмотреть историю
git log --oneline

# Откатить изменения
git checkout -- filename

# Создать ветку
git checkout -b new-feature

# Переключиться на main
git checkout main

# Слить ветку
git merge new-feature
```

## 🔧 Troubleshooting

### Ошибка: "fatal: not a git repository"

```bash
git init
```

### Ошибка: "remote origin already exists"

```bash
git remote remove origin
git remote add origin URL
```

### Большие файлы

Если файлы слишком большие (>100MB):

```bash
# Добавьте в .gitignore
echo "large-file.png" >> .gitignore
```

---

**Готово! Ваш проект на GitHub! 🎉**
