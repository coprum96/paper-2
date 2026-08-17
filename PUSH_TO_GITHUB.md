# 🚀 Загрузка на GitHub

## ✅ Git уже инициализирован!

Репозиторий готов, остался только push!

---

## 📤 Команды для push:

```bash
cd "/Users/stas/Workspace/buratino premium"

# Remote уже добавлен, просто выполните:
git push -u origin main
```

---

## 🔐 Если просит авторизацию:

### Вариант 1: Personal Access Token (рекомендуется)

1. Откройте: https://github.com/settings/tokens
2. "Generate new token" → "Generate new token (classic)"
3. Название: "Buratino Game"
4. Срок: 90 days
5. Отметьте: `repo` (все галочки)
6. "Generate token"
7. **СКОПИРУЙТЕ токен** (больше не покажут!)

Затем при push:
```
Username: coprum96
Password: [ВСТАВЬТЕ ТОКЕН]
```

### Вариант 2: SSH ключ

```bash
# Генерация SSH ключа
ssh-keygen -t ed25519 -C "your_email@example.com"

# Копируем в буфер обмена
pbcopy < ~/.ssh/id_ed25519.pub

# Добавляем на GitHub:
# https://github.com/settings/keys → New SSH key
```

Затем меняем remote на SSH:
```bash
git remote set-url origin git@github.com:coprum96/buratino-premium.git
git push -u origin main
```

---

## ✅ После успешного push:

Ваш проект будет доступен по адресу:
**https://github.com/coprum96/buratino-premium**

---

## 🌐 Развертывание на Vercel (опционально):

1. Зайдите на https://vercel.com
2. "New Project"
3. Import из GitHub: `coprum96/buratino-premium`
4. Настройки по умолчанию (Vite определится автоматически)
5. Deploy!

Через 2 минуты игра будет онлайн! 🎉

---

## 📝 Обновления в будущем:

```bash
# После изменений:
git add .
git commit -m "Описание изменений"
git push
```

---

**Удачи!** 🚀
