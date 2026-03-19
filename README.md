# Moda App (E-commerce + CMS + Builder)

Monorepo scaffold theo `IMPLEMENTATION_PLAN.md` với kiến trúc tách `frontend` và `backend`.

## Cấu trúc

- `frontend/`: React + TypeScript + Vite
- `backend/`: NestJS + Prisma + MySQL
- `docker-compose.yml`: MySQL + Redis local
- `Design.pen`: nguồn tham chiếu UI

## Chạy local

1. Copy env:
   - `cp .env.example .env`
   - `cp backend/.env.example backend/.env`
   - `cp frontend/.env.example frontend/.env`
2. Start infra:
   - `docker compose up -d`
3. Cài dependencies:
   - `cd backend && npm install`
   - `cd frontend && npm install`
4. Generate Prisma client + migrate:
   - `cd backend && npm run prisma:generate && npm run prisma:migrate`
5. Run app:
   - `cd backend && npm run start:dev`
   - `cd frontend && npm run dev`

## API docs

- Swagger UI: `http://localhost:3000/docs`
- OpenAPI JSON: `http://localhost:3000/docs-json`

## API prefixes

Tất cả endpoint backend dùng prefix: `/api/v1/*`

## Trạng thái

Dự án đang ở mức scaffold Phase 1 (MVP foundation).
