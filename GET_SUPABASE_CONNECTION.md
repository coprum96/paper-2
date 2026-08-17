# 🔐 Как получить Database Connection String из Supabase

## 📺 Видео-инструкция

Следуйте этим шагам **точно**:

---

## Шаг 1: Откройте Supabase Dashboard

### Ссылка (кликните):
👉 **https://app.supabase.com/project/qnbfecocgvlxuwczzqgk/settings/database**

Должна открыться страница **Database Settings** вашего проекта.

---

## Шаг 2: Найдите Connection String

На странице ищите секцию:
- **"Connection string"** 
- или **"Connection Pooling"**
- или **"Database Settings"**

### Вы увидите примерно такое:

```
Connection string
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

URI
postgresql://postgres:[YOUR-PASSWORD]@db.qnbfecocgvlxuwczzqgk.supabase.co:5432/postgres

Transaction
postgresql://postgres.qnbfecocgvlxuwczzqgk:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres

Session
postgresql://postgres.qnbfecocgvlxuwczzqgk:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
```

---

## Шаг 3: Скопируйте **Session** или **URI** строку

**Нам нужна строка типа:**
```
postgresql://postgres:ВАШЕ_НАСТОЯЩИЙ_ПАРОЛЬ@db.qnbfecocgvlxuwczzqgk.supabase.co:5432/postgres
```

### ⚠️ Если вместо пароля написано `[YOUR-PASSWORD]`:

**Это значит вы еще не задали/не видите пароль!**

---

## Шаг 4A: Если НЕ ЗНАЕТЕ пароль - сбросьте его

### На той же странице найдите:

```
Database Password
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Reset database password  [Кнопка]
```

1. **Нажмите "Reset database password"**
2. **Появится новый пароль - СКОПИРУЙТЕ И СОХРАНИТЕ!**
3. Пример пароля: `kY8nR2mP9xQ4vB7zL3sT6wH1cN5jF0eU`

⚠️ **ВАЖНО:** Сохраните этот пароль в надёжном месте! Он больше не появится.

---

## Шаг 4B: Если ЗНАЕТЕ пароль

Просто замените `[YOUR-PASSWORD]` в connection string на ваш пароль.

---

## Шаг 5: Соберите финальную строку

### У вас должна получиться строка вида:

```
postgresql://postgres:kY8nR2mP9xQ4vB7zL3sT6wH1cN5jF0eU@db.qnbfecocgvlxuwczzqgk.supabase.co:5432/postgres
```

Где `kY8nR2mP9xQ4vB7zL3sT6wH1cN5jF0eU` - это ваш реальный database password.

---

## ✅ Что делать дальше?

### Вариант 1: Дайте мне connection string

Пришлите мне строку целиком, я создам `.env` файлы автоматически:

```
postgresql://postgres:YOUR_PASSWORD@db.qnbfecocgvlxuwczzqgk.supabase.co:5432/postgres
```

### Вариант 2: Создайте файлы вручную

Используйте команды из [QUICK_SUPABASE_SETUP.md](./QUICK_SUPABASE_SETUP.md)

---

## 🎯 Альтернатива: Скриншот

Если сложно - сделайте **скриншот** страницы:
https://app.supabase.com/project/qnbfecocgvlxuwczzqgk/settings/database

И покажите мне! (закройте/замажьте пароль если он виден)

---

## ❓ FAQ

### Q: Где взять пароль если я его потерял?
**A:** Сбросьте его (Reset database password) - старый пароль узнать невозможно.

### Q: Это опасно, показывать connection string?
**A:** Да, НЕ делитесь им публично! Отправьте мне в приватном сообщении, или замените пароль на `***` перед отправкой, а настоящий пароль скажите отдельно.

### Q: У меня нет доступа к Supabase Dashboard
**A:** Попросите коллегу/владельца проекта дать вам access или создать database password.

---

## 🆘 Нужна помощь?

Напишите мне одно из:

1. ✅ **Connection string полностью** (с настоящим паролем)
2. ✅ **Database password** (я соберу строку сам)  
3. ✅ **Скриншот** страницы Database Settings (закройте пароль)

И я помогу настроить всё за 2 минуты! 🚀


