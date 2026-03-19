# Moda App (E-commerce + CMS + Builder)

Monorepo scaffold theo `IMPLEMENTATION_PLAN.md` với kiến trúc tách `frontend` và `backend`.

## Cấu trúc

- `frontend/`: React + TypeScript + Vite
- `backend/`: NestJS + Prisma + MySQL
- `docker-compose.yml`: MySQL + Redis local
- `Design.pen`: nguồn tham chiếu UI

## Chạy local (không cần Docker)

1. Copy env:
   - `cp .env.example .env`
   - `cp backend/.env.example backend/.env`
   - `cp frontend/.env.example frontend/.env`
2. Cài dependencies:
   - `cd backend && npm install`
   - `cd frontend && npm install`
3. Cấu hình DB MySQL đang chạy local (ví dụ XAMPP) trong `backend/.env`:
   - `DATABASE_URL=mysql://root@127.0.0.1:3306/ecommerce_cms`
4. Generate Prisma client:
   - `cd backend && npm run prisma:generate && npm run prisma:migrate`
5. Run app:
   - `cd backend && npm run start:dev`
   - `cd frontend && npm run dev`

## API docs

- Swagger UI: `http://localhost:3000/docs`
- OpenAPI JSON: `http://localhost:3000/docs-json`

## Utility commands

- Seed dữ liệu nội bộ: `cd backend && npm run seed:internal`
- WordPress migration: `cd backend && npm run migrate:wp`
- WordPress rollback from report: `cd backend && npm run rollback:wp -- --report=/abs/path/wp-import-run-<id>.json`
- Media orphan cleanup: `cd backend && npm run media:cleanup-orphans`

Ghi chú: nếu không dùng WordPress, chỉ cần chạy `seed:internal` để có dữ liệu demo cho admin/shop.

## API prefixes

Tất cả endpoint backend dùng prefix: `/api/v1/*`

## Trạng thái

Dự án đang ở mức Phase 2 (đã hoàn thành 3.7, 3.8, 3.9, 3.10; đang chốt DoD 3.11).
