# מערכת ניהול משימות

מערכת פנימית לניהול משימות לפי עובדים — Next.js, MongoDB Atlas, Socket.io, RTL מלא בעברית.

## טכנולוגיות

- **Next.js 15** (App Router)
- **React 19**
- **MongoDB Atlas**
- **Socket.io** — עדכונים בזמן אמת
- **SCSS Modules** (ללא Tailwind)
- **@dnd-kit** — גרירה ושינוי סדר

## התקנה

```bash
npm install
cp .env.example .env.local
```

ערוך `.env.local`:

```env
MONGODB_URI=mongodb+srv://...
NEXT_PUBLIC_APP_URL=http://localhost:3000
PORT=3000
```

## הרצה

```bash
npm run dev
```

השרת רץ על `http://localhost:3000` עם custom server שמפעיל גם Socket.io.

> **חשוב:** השתמש ב-`npm run dev` / `npm start` — לא ב-`next dev` בלבד, כי Socket.io דורש את `server.ts`.

## מבנה תיקיות

```
config/employees.ts     # עובדים קשיחים (לא ב-DB)
src/
  app/                # דפים ו-API routes
  components/         # UI
  hooks/              # useTasks, useSocket
  lib/                # MongoDB, validation, io
  services/           # taskService, apiClient
  sockets/            # Socket handlers
  styles/             # משתנים גלובליים + globals
  types/              # TypeScript types
server.ts             # Next.js + Socket.io
```

## ניתוב

| נתיב | תיאור |
|------|--------|
| `/` | מסך ראשי |
| `/task/[id]` | מסך עם משימה נבחרת |

## עובדים

ערוך `config/employees.ts` — העובדים לא נשמרים במסד הנתונים.

טאב **"לא משויך"** מציג משימות ללא `assignedEmployees`.

## API

| Method | Endpoint | תיאור |
|--------|----------|--------|
| GET | `/api/tasks?employeeId=` | רשימת משימות |
| POST | `/api/tasks` | יצירת משימה |
| GET | `/api/tasks/[id]` | משימה בודדת |
| PATCH | `/api/tasks/[id]` | עדכון |
| DELETE | `/api/tasks/[id]` | מחיקה |
| PATCH | `/api/tasks/reorder` | שינוי סדר |

## Realtime (Socket.io)

אירועים: `task:created`, `task:updated`, `task:deleted`, `tasks:reordered`

Path: `/api/socketio`

## פריסה

להרצה ב-production:

```bash
npm run build
npm start
```

ודא ש-`MONGODB_URI` ו-`NEXT_PUBLIC_APP_URL` מוגדרים בסביבת הפריסה.
