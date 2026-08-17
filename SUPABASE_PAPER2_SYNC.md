# Paper 2 → данные ко мне (Supabase)

Приложение на **Vite + React**, не Next.js. Инструкции Supabase для Next (`@supabase/ssr`, `page.tsx`, middleware) **не используются**.

## Схема

```text
Респондент проходит исследование
        │
        ▼
localStorage (запасная копия)
        │
        ▼  автомат при экране «Готово»
Supabase table: paper2_sessions
        │
        ▼
Вы (владелец проекта) → Table Editor → Export CSV / JSON
```

## Что сделать один раз

### 1. SQL в Supabase

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard) → проект `dgzaxadxoegluktfnzhu`
2. **SQL Editor** → New query
3. Вставьте содержимое файла `supabase/paper2_sessions.sql`
4. Run

### 2. Env (уже в `.env`, файл в `.gitignore`)

```bash
VITE_SUPABASE_URL=https://dgzaxadxoegluktfnzhu.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

Для Vercel: те же переменные в Project Settings → Environment Variables, затем redeploy.

### 3. Перезапуск dev

```bash
npm run dev
```

Откройте `/?research=1&study=2&pilot=1`, пройдите до конца. На экране «Готово» должно быть: **«Данные сохранены на сервере…»**.

## Как забрать все ответы

1. Supabase → **Table Editor** → `paper2_sessions`
2. Фильтр `completed = true` при необходимости
3. **Export** → CSV  
   Или откройте колонку `payload` (полный person JSON, как в локальном экспорте)

## Безопасность

- В браузере только **publishable/anon** ключ.
- RLS: anon может INSERT/UPDATE, **не может SELECT** чужие строки.
- Смотреть таблицу можете только вы (логин владельца проекта).
- Не кладите `service_role` / secret key во фронтенд.

## Если ошибка отправки

Чаще всего: таблица не создана → выполните SQL.  
Кнопка **«Повторить отправку»** на финальном экране.  
Локальный download JSON/CSV всё равно работает.
