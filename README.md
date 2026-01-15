# Absensi App

Aplikasi absensi WFH karyawan dengan peran EMPLOYEE dan HRD. Karyawan dapat check-in dengan foto, HRD dapat mengelola data karyawan dan memantau absensi.

## Fitur Utama

- Login JWT untuk EMPLOYEE dan HRD.
- Absensi karyawan: check-in + upload foto, status otomatis LATE bila lewat jam 08:00 WIB.
- Riwayat absensi karyawan (paging + filter tanggal).
- HRD: CRUD master karyawan dan monitoring absensi (paging + filter).

## Tech Stack

- Backend: NestJS (TypeScript), Prisma, MySQL
- Frontend: React + Vite

## Struktur Repo

- `apps/backend` - API dan database (NestJS + Prisma)
- `apps/frontend` - UI web (React + Vite)

## Prasyarat

- Node.js (disarankan v18+)
- MySQL

## Setup Backend

Masuk ke folder backend:

```bash
cd apps/backend
npm install
```

Buat file `.env` (contoh minimal):

```bash
DATABASE_URL="mysql://user:password@localhost:3306/absensi_app"
JWT_SECRET="your-secret"
JWT_EXPIRES_IN="1d"
AUTH_PORT="3001"
ATTENDANCE_PORT="3002"
HR_PORT="3003"
```

Generate Prisma client dan migrate:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

Seed data:

```bash
npx prisma db seed
```

Jalankan backend (per service):

```bash
npm run start:auth
npm run start:attendance
npm run start:hr
```

## Setup Frontend

Masuk ke folder frontend:

```bash
cd apps/frontend
npm install
```

(Opsional) set API base URL di `.env` frontend:

```bash
VITE_AUTH_API_BASE_URL=http://localhost:3001
VITE_ATTENDANCE_API_BASE_URL=http://localhost:3002
VITE_HR_API_BASE_URL=http://localhost:3003
```

Jalankan frontend:

```bash
npm run dev
```

## Menjalankan Aplikasi (ringkas)

1. Backend:
   - `npm run start:auth`
   - `npm run start:attendance`
   - `npm run start:hr`
2. Frontend:
   - `npm run dev`

## Akun Seed (default)

- HRD:
  - username: `hrd`
  - password: `Hrd12345!`
- Employee:
  - username: `EMP001`
  - password: `Emp12345!`

## Endpoint Backend

- Auth
  - `POST /auth/login`
- Employee (EMPLOYEE)
  - `POST /attendance/check-in`
  - `GET /attendance/history` (paging + filter)
  - `GET /attendance/:id`
- HRD
  - `POST /hr/employees`
  - `GET /hr/employees`
  - `GET /hr/employees/:id`
  - `PATCH /hr/employees/:id`
  - `DELETE /hr/employees/:id`
  - `GET /hr/attendances`
  - `GET /hr/attendances/:id`
