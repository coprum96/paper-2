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
RPC upsert_paper2_session → table paper2_sessions
        │
        ▼
Вы (владелец проекта) → Table Editor → Export CSV / JSON
```

Клиент вызывает **RPC** `upsert_paper2_session` (SECURITY DEFINER), а не прямой `upsert` в таблицу. Так anon может писать без SELECT и без ошибки RLS.

## Что сделать один раз (или заново при ошибке RLS)

### 1. SQL в Supabase

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard) → проект `dgzaxadxoegluktfnzhu`
2. **SQL Editor** → New query
3. Вставьте **всё** содержимое файла `supabase/paper2_sessions.sql` (не путь к файлу, а текст)
4. **Run**

Это создаёт/обновляет таблицу, политики и функцию `upsert_paper2_session`.

### 2. Env (уже в `.env`, файл в `.gitignore`)

```bash
VITE_SUPABASE_URL=https://dgzaxadxoegluktfnzhu.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...   # или классический anon JWT
```

Для Vercel: те же переменные в Project Settings → Environment Variables, затем redeploy.

### 3. Проверка

Откройте `/?research=1&study=2&pilot=1`, пройдите до конца (или нажмите **Повторить отправку**).  
Должно быть: **«Данные сохранены на сервере…»**.

В SQL Editor можно проверить:

```sql
select participant_id, study, pilot, condition_pressure, completed, duration_sec, created_at
from public.paper2_sessions
order by created_at desc
limit 20;
```

## Как забрать все ответы

1. Supabase → **Table Editor** → `paper2_sessions`
2. Фильтр `completed = true` при необходимости
3. **Export** → CSV  
   Или откройте колонку `payload` (полный person JSON)

## Безопасность

- В браузере только **publishable/anon** ключ.
- Anon **не** может SELECT из таблицы; запись только через RPC.
- Смотреть таблицу можете только вы (логин владельца / Dashboard).
- Не кладите `service_role` / secret key во фронтенд.

## Если ошибка отправки

| Сообщение | Что сделать |
| --- | --- |
| `violates row-level security policy` | Заново выполнить весь `paper2_sessions.sql` |
| `function upsert_paper2_session does not exist` / PGRST202 | То же — SQL не прогнан до конца |
| `Supabase не настроен` | Проверить env на Vercel и redeploy |

Кнопка **«Повторить отправку»** на финальном экране.  
Локальный download JSON/CSV всё равно работает — сессию `33153eae-…` можно сохранить так, если облако ещё не починено.
