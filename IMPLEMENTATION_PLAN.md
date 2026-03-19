

# IMPLEMENTATION_PLAN.md

**Dự án:** E-commerce + CMS + Builder 3 mức (React + Node tách backend)  
**Trạng thái tổng:** 🟡 In Progress  
**Cập nhật lần cuối:** 2026-03-18

---

## 0) Mục tiêu dự án

Xây dựng hệ thống web bán hàng production-ready, có:

- Shop + Cart + Checkout + Thanh toán SEPAY
- Admin quản lý users/products/orders/posts/settings
- Seed dữ liệu nội bộ (không bắt buộc WordPress migration trong scope hiện tại)
- Builder 3 mức: Basic, Pro, Advanced
- Bảo mật chuẩn cao, dễ mở rộng, dễ bảo trì
- Frontend/Backend tách biệt, chạy độc lập
- Tích hợp Cloudinary để lưu trữ và tối ưu ảnh

---

## 1) Phạm vi công nghệ (không được tự ý đổi nếu chưa ghi quyết định)

- Frontend: ReactJS + TypeScript (Vite)
- Backend: NestJS (Node.js + TypeScript)
- DB: MySQL
- ORM: Prisma (hoặc Knex, phải thống nhất 1)
- Cache/Queue: Redis + BullMQ (nếu dùng job)
- Deploy: Docker + docker-compose
- Auth: JWT access/refresh
- Password hash: Argon2id (ưu tiên) hoặc bcrypt >= 12
- API Docs: Swagger/OpenAPI (`/docs`, `/docs-json`)
- Media storage: Cloudinary

### Cấu trúc thư mục chạy độc lập

```text
project-root/
├── frontend/
├── backend/
├── docker-compose.yml
├── .env.example
└── README.md
```

### Biến môi trường tối thiểu

**Frontend `.env`**
- `VITE_API_BASE_URL=http://localhost:3000/api/v1`

**Backend `.env`**
- `PORT=3000`
- `DATABASE_URL=...`
- `JWT_ACCESS_SECRET=...`
- `JWT_REFRESH_SECRET=...`
- `FRONTEND_ORIGIN=http://localhost:5173`
- `SEPAY_API_KEY=...`
- `SEPAY_WEBHOOK_SECRET=...`
- `CLOUDINARY_CLOUD_NAME=...`
- `CLOUDINARY_API_KEY=...`
- `CLOUDINARY_API_SECRET=...`

---

## 2) Quy tắc bắt buộc (Definition of Done toàn cục)

1. Không hardcode secret, dùng `.env.*`.
2. Không query SQL kiểu nối chuỗi thủ công.
3. Validate 2 lớp:
- Frontend (JS/TS)
- Backend (Node) bắt buộc
4. Chống CSRF/XSS/SQLi/Brute force.
5. Có audit log cho thao tác nhạy cảm.
6. API có version `/api/v1`.
7. Có test tối thiểu cho auth, order, payment callback, builder publish.
8. Mỗi phase xong phải cập nhật file này: trạng thái + bằng chứng hoàn thành.
9. Frontend chỉ gọi API, không truy cập DB trực tiếp.
10. Webhook SEPAY chỉ xử lý ở backend.
11. Không lưu binary ảnh trong DB; chỉ lưu metadata + URL.
12. Cloudinary secret chỉ tồn tại ở backend.
13. `schemaSQL.md` là nguồn chuẩn duy nhất cho database schema, phải luôn tuân thủ.
14. Không tự ý đổi bảng/cột/quan hệ/ràng buộc khác `schemaSQL.md` nếu chưa có yêu cầu mới từ người dùng.
15. Nếu có xung đột giữa code/migration và `schemaSQL.md`, phải dừng, báo xung đột, đề xuất hướng sửa theo `schemaSQL.md`, rồi chờ người dùng xác nhận trước khi tiếp tục.

---

## 3) Kế hoạch triển khai theo Phase

## Phase 1 — MVP (Bắt buộc xong trước)

**Mục tiêu:** Chạy được hệ thống bán hàng + admin cơ bản + builder mức 1.

### 3.1 Backend modules

- [x] auth (scaffold)
- [x] users + RBAC (SuperAdmin/Admin/Editor/Customer) (scaffold)
- [x] products (scaffold)
- [x] posts (scaffold)
- [x] cart (scaffold)
- [x] orders (scaffold)
- [x] payments (SEPAY init + webhook) (scaffold)
- [x] settings (contact info, site info) (scaffold)
- [x] audit-log (scaffold)
- [x] docs (Swagger UI `/docs`, OpenAPI JSON `/docs-json`) (scaffold)
- [x] media (Cloudinary upload/delete/metadata) (scaffold)

### 3.2 Frontend pages

- [x] home (scaffold)
- [x] product list (scaffold)
- [x] product detail (scaffold)
- [x] cart (scaffold)
- [x] checkout (scaffold)
- [x] login/register (scaffold)
- [x] admin dashboard (minimum) (scaffold)
- [x] media picker/uploader (product, post, builder)

### 3.3 Builder Level 1 (Basic)

- [x] Theme settings (color/font/radius/spacing)
- [x] Header/Footer/Banner config từ admin
- [x] Block cơ bản: Hero/Text/Image/Button/ProductGrid
- [x] Lưu page dạng JSON schema
- [x] Preview trước publish

### 3.4 Bảo mật MVP

- [x] Argon2id/bcrypt
- [x] JWT access/refresh + revoke logout
- [x] Rate limit login
- [x] CORS whitelist
- [x] Input validation backend
- [x] Sanitization dữ liệu đầu vào cơ bản
- [x] Cookie/token strategy an toàn (HttpOnly/Secure/SameSite phù hợp)

### 3.5 Media MVP (Cloudinary)

- [x] Upload ảnh qua signed flow
- [x] Lưu metadata ảnh vào DB (bao gồm `public_id`)
- [x] Validate MIME/type/size trước upload
- [x] Transform URL cơ bản (`f_auto,q_auto`)
- [x] Xóa ảnh theo `public_id`

### 3.6 DoD Phase 1

- [x] Đăng ký/đăng nhập thành công
- [x] Tạo sản phẩm, thêm giỏ, tạo đơn
- [x] Gọi SEPAY và nhận webhook cập nhật trạng thái đơn
- [x] Admin sửa thông tin liên hệ hiển thị ngoài site
- [x] Builder mức 1 chỉnh trang và publish thành công
- [x] Docs API test được endpoint bằng Swagger UI
- [x] Upload ảnh Cloudinary thành công và hiển thị đúng trên frontend

**Trạng thái Phase 1:** ⬜ Not Started / 🟡 In Progress / ✅ Done  
**Bằng chứng:** (link API docs, ảnh màn hình, commit hash)

### Cập nhật tiến độ gần nhất (2026-03-18)

- Đã tạo monorepo scaffold:
  - `frontend/` (React + TypeScript + Vite + routes MVP)
  - `backend/` (NestJS + Prisma + modules API `/api/v1/*`)
  - `docker-compose.yml` (MySQL + Redis)
- Đã thiết lập:
  - Swagger `/docs`, `/docs-json`
  - JWT access/refresh flow (scaffold)
  - SEPAY init/webhook endpoint (scaffold)
  - Cloudinary signed upload + metadata endpoint (scaffold)
  - Builder draft/preview/publish schema endpoint (scaffold)
- Đã thêm test khung:
  - auth service
  - order service
  - payment service
  - builder service
- Đã test:
  - `frontend`: `npm run build` ✅
  - `backend`: `npm run prisma:generate` ✅, `npm run build` ✅, `npm test -- --runInBand` ✅ (5 suites / 6 tests pass)
- Chưa có commit hash vì chưa commit theo Commit Gate.

### Cập nhật tiến độ gần nhất (2026-03-18, lượt 2)

- Hoàn thành media flow MVP:
  - `POST /api/v1/media/signed-upload` (owner-aware folder + MIME/size validation)
  - `POST /api/v1/media/attach` (lưu metadata vào DB)
  - `GET /api/v1/media/transform` (chuẩn hóa `f_auto,q_auto`)
  - `DELETE /api/v1/media` (xóa theo `public_id`)
- Hoàn thành frontend media manager/picker:
  - Route `/admin/media`
  - Upload trực tiếp Cloudinary theo signed flow từ backend
  - Chọn ảnh từ media list và xóa ảnh đã chọn
- Đã test lại:
  - `backend`: build ✅, test ✅
  - `frontend`: build ✅

### Cập nhật tiến độ gần nhất (2026-03-19, lượt 5)

- Hoàn thành script migration WordPress:
  - `backend/scripts/wp-migrate.ts`
  - lệnh chạy: `npm run migrate:wp`
  - log kết quả vào `wp_import_runs` (`SUCCESS/PARTIAL/FAILED`)
- Mapping đã xử lý:
  - `wp_posts` -> `posts` (`title`, `slug`, `excerpt`, `content`, `status`, `published_at`)
  - taxonomy (`category`, `post_tag`) -> `post_categories`, `post_tags`
  - attachments image -> `media`
- Tài liệu chạy script:
  - `backend/scripts/README_WP_MIGRATION.md`
- Đã test:
  - `backend`: `npm run build` ✅, `npm test -- --runInBand` ✅

### Cập nhật tiến độ gần nhất (2026-03-19, lượt 6)

- Hoàn thành Admin nâng cao (Phase 2 - 3.8) ở mức API backend:
  - Orders: danh sách admin + cập nhật trạng thái + lịch sử trạng thái
  - Users: lock/unlock + reset role
  - Posts: category/tag + upsert post có SEO meta
  - Access control logs: ghi log IP/device/route/time + endpoint đọc log
- File chính:
  - `backend/src/modules/admin/admin.controller.ts`
  - `backend/src/modules/admin/admin.service.ts`
  - `backend/prisma/schema.prisma`
- Đã test:
  - `backend`: `npm run prisma:generate` ✅, `npm run build` ✅, `npm test -- --runInBand` ✅

### Cập nhật tiến độ gần nhất (2026-03-19, lượt 7)

- Hoàn thành Builder Level 2 (Pro):
  - API builder bổ sung:
    - template sections (`GET /api/v1/builder/templates`)
    - reusable blocks (`GET/POST /api/v1/builder/reusable-blocks`)
    - version list + rollback (`GET /api/v1/builder/pages/:id/versions`, `POST /api/v1/builder/pages/:id/rollback`)
  - UI Admin Builder Pro:
    - kéo-thả reorder top-level blocks
    - row/column layout block
    - style per block (margin/padding + responsive cols)
    - insert template sections
    - save/insert reusable blocks
    - version history + rollback
    - preview responsive desktop/tablet/mobile
- File chính:
  - `backend/src/modules/builder/builder.service.ts`
  - `backend/src/modules/builder/builder.controller.ts`
  - `frontend/src/pages/admin/AdminBuilderPage.tsx`
  - `frontend/src/components/builder/PageRenderer.tsx`
- Đã test:
  - `backend`: `npm run prisma:generate` ✅, `npm run build` ✅, `npm test -- --runInBand` ✅
  - `frontend`: `npm run build` ✅

### Cập nhật tiến độ gần nhất (2026-03-19, lượt 8)

- Hoàn thành Media nâng cao (Phase 2 - 3.10):
  - Folder chuẩn theo owner type đã áp dụng ở signed-upload
  - Bổ sung API variants 3 size chuẩn:
    - `GET /api/v1/media/variants?url=...` -> `thumb/medium/large`
  - Bổ sung cleanup orphan media:
    - API: `POST /api/v1/media/cleanup-orphans`
    - script định kỳ: `npm run media:cleanup-orphans`
  - Bổ sung replace policy:
    - `attach` hỗ trợ `replaceExisting=true` để xóa metadata ảnh cũ cùng owner
- File chính:
  - `backend/src/modules/media/media.service.ts`
  - `backend/src/modules/media/media.controller.ts`
  - `backend/src/modules/media/dto/attach-media.dto.ts`
  - `backend/scripts/media-cleanup-orphans.ts`
- Đã test:
  - `backend`: `npm run prisma:generate` ✅, `npm run build` ✅, `npm test -- --runInBand` ✅ (5 suites, 8 tests)
  - `frontend`: `npm run build` ✅
  - Ghi chú: các bước external e2e cần credential thật (SEPAY/Cloudinary) chưa chạy trên môi trường hiện tại.

### Cập nhật tiến độ gần nhất (2026-03-19, lượt 9)

- Hoàn thiện phần còn thiếu của DoD 3.11:
  - Admin CRUD đầy đủ cho nhóm posts/category/tag:
    - categories: `GET/POST/PATCH/DELETE /api/v1/admin/posts/categories*`
    - tags: `GET/POST/PATCH/DELETE /api/v1/admin/posts/tags*`
    - posts: `GET/POST/GET:id/PATCH:id/DELETE:id /api/v1/admin/posts*`
  - Chuẩn hóa request validation bằng DTO cho admin advanced endpoints (order status, lock user, post/category/tag, access log)
  - Bổ sung migration rollback data:
    - script rollback: `npm run rollback:wp`
    - migration script sinh report rollback ở `backend/scripts/reports/wp-import-run-<id>.json`
    - tài liệu rollback cập nhật tại `backend/scripts/README_WP_MIGRATION.md`
  - Cập nhật docs vận hành ở `README.md` (luồng chạy local không Docker + rollback command)
- Đã test:
  - `backend`: `npm run build` ✅, `npm test -- --runInBand` ✅ (5 suites, 8 tests)
  - `frontend`: `npm run build` ✅
- Ghi chú:
  - Hiện DB chỉ có `ecommerce_cms.wp_import_runs`, chưa có bảng nguồn WP (`wp_posts`, `wp_terms`, ...), nên mục "Import dữ liệu WordPress thật" chưa thể tick.

### Cập nhật tiến độ gần nhất (2026-03-19, lượt 10)

- Theo xác nhận mới của người dùng: không dùng WordPress import trong scope hiện tại.
- Đã chuyển hướng 3.7 sang seed nội bộ:
  - thêm script `backend/scripts/seed-internal.ts`
  - thêm lệnh `npm run seed:internal`
  - seed idempotent cho `posts`, `post_categories`, `post_tags`, `media`, `products`
- Đã cập nhật README và checklist DoD Phase 2 theo hướng seed nội bộ cho local dev.
- Đã chạy seed thật trên DB `ecommerce_cms`:
  - `posts=3`, `categories=3`, `tags=3`, `media=4`, `products=4`

### Cập nhật tiến độ gần nhất (2026-03-19, lượt 11)

- Bắt đầu Phase 3 (3.12) với Dynamic Data Binding:
  - Renderer hỗ trợ token binding trong text props: `{{products.0.name}}`, `{{products.0.price}}`, `{{posts.0.title}}`, `{{posts.0.excerpt}}`
  - Block `product-grid` hỗ trợ nguồn dữ liệu `source: 'products' | 'posts'`
  - Admin Builder thêm preset thao tác nhanh:
    - bind hero -> first product
    - bind text -> first post
    - switch grid -> posts
  - Home/Admin Builder đều tải thêm `posts` để preview binding thực tế
- Đã test:
  - `frontend`: `npm run build` ✅
  - `backend`: `npm run build` ✅, `npm test -- --runInBand` ✅

### Cập nhật tiến độ gần nhất (2026-03-19, lượt 12)

- Hoàn thành Rule-based rendering cho Builder (3.12):
  - mỗi block có thể gắn `props.visibility`:
    - `path`: đường dẫn dữ liệu (vd: `products.0.id`, `posts.0.id`)
    - `operator`: `exists | equals | not_equals`
    - `value`: giá trị so sánh (khi dùng `equals/not_equals`)
  - Renderer sẽ bỏ qua block nếu không thỏa rule hiển thị
  - Admin Builder thêm preset thao tác nhanh:
    - show when product exists
    - show when post exists
    - clear visibility rule

### Cập nhật tiến độ gần nhất (2026-03-19, lượt 13)

- Hoàn thành Custom CSS có kiểm soát cho Builder (3.12):
  - schema hỗ trợ `customCss`
  - renderer chỉ inject CSS sau khi sanitize cơ bản:
    - chặn token nguy hiểm: `<`, `</`, `javascript:`, `@import`, `expression(`
    - giới hạn độ dài 4000 ký tự
  - Admin Builder có textarea chỉnh `customCss` và preview trực tiếp

### Cập nhật tiến độ gần nhất (2026-03-19, lượt 14)

- Hoàn thành Permission chi tiết theo vai trò cho Builder API (3.12):
  - `publishedBySlug` vẫn public
  - endpoint quản trị builder yêu cầu JWT + RBAC:
    - `SUPER_ADMIN/ADMIN/EDITOR`: xem/sửa draft, preview, templates, reusable blocks
    - `SUPER_ADMIN/ADMIN`: publish, rollback
  - Swagger bổ sung bearer auth cho các endpoint protected

### Cập nhật tiến độ gần nhất (2026-03-19, lượt 15)

- Hoàn thành Theme builder templates cho product/post/category (3.12):
  - mở rộng `GET /api/v1/builder/templates` với nhóm:
    - `Template: Product Page`
    - `Template: Post Page`
    - `Template: Category Page`
  - template mới dùng data-binding product/post sẵn có để cắm vào builder nhanh

### Cập nhật tiến độ gần nhất (2026-03-19, lượt 16)

- Hoàn thành i18n-ready architecture nền tảng cho frontend (3.12):
  - thêm `I18nProvider` + dictionary `vi/en`
  - thêm hook `useI18n()` và lưu locale vào `localStorage` (`moda_locale`)
  - `AppLayout` dùng key dịch cho menu và có switch ngôn ngữ VI/EN

### Cập nhật tiến độ gần nhất (2026-03-19, lượt 17)

- Triển khai Security hardening (3.13) đợt 1:
  - CSRF double-submit token cho luồng auth dùng cookie:
    - thêm `GET /api/v1/auth/csrf-token`
    - `refresh/logout` bắt buộc `x-csrf-token` khớp cookie `csrf_token`
    - login/register/refresh sẽ rotate `csrf_token`
    - frontend `api client` tự gửi `x-csrf-token` cho request mutate
  - XSS sanitize nâng cao:
    - mở rộng `sanitizeText` (loại script/style, inline handlers, `javascript:`)
    - thêm `sanitizeDeep` cho payload JSON lồng nhau
    - áp dụng sanitize cho builder `saveDraft` và `saveReusableBlock`
  - Brute-force protection mở rộng:
    - lock theo cặp `email+ip` sau 5 lần sai, khóa 15 phút
  - Audit log thao tác nhạy cảm:
    - auth login success/failed + logout
    - builder save draft/publish/rollback/save reusable

### Cập nhật tiến độ gần nhất (2026-03-19, lượt 18)

- Hoàn thành rà soát OWASP Top Risks (3.13):
  - tạo tài liệu `SECURITY_OWASP_REVIEW.md`
  - map các kiểm soát hiện có theo 10 nhóm OWASP
  - liệt kê residual risks + hành động hardening ưu tiên tiếp theo

### Cập nhật tiến độ gần nhất (2026-03-18, lượt 3)

- Hoàn thành bảo mật MVP core:
  - Refresh token revoke khi logout (lưu `refreshTokenHash` + clear khi logout)
  - Auth cookie strategy: HttpOnly + SameSite + Secure theo `NODE_ENV`
  - Rate limit cho `register/login`
  - CORS whitelist dạng danh sách từ `FRONTEND_ORIGIN`
  - Bổ sung DTO validation + sanitize text ở auth/products/posts/orders/cart/settings/payments/users
- Đã test:
  - `backend`: `npm run prisma:generate` ✅, `npm run build` ✅, `npm test -- --runInBand` ✅
  - `frontend`: `npm run build` ✅

### Cập nhật tiến độ gần nhất (2026-03-18, lượt 4)

- Hoàn thành Builder Level 1:
  - Admin Builder page (`/admin/builder`) cho draft JSON schema + preview + publish
  - Public render theo `slug` (`/api/v1/builder/public/:slug`)
  - Render block cơ bản: Hero/Text/Image/Button/ProductGrid
  - Theme/Header/Footer/Banner config từ admin settings (`/admin/settings`)
- Hoàn thành luồng DoD phase 1 trên UI/API:
  - Auth register/login lưu token local để gọi API protected
  - Quick create product từ admin dashboard
  - Add to cart từ product detail, checkout tạo order + init SEPAY
  - Contact info chỉnh từ admin và hiển thị ngoài site
  - Builder page publish và home render theo bản published
- Đã test lại:
  - `backend`: build ✅, test ✅
  - `frontend`: build ✅

---

## Phase 2 — Hoàn thiện nghiệp vụ

**Mục tiêu:** Nâng admin + seed dữ liệu nội bộ + builder mức 2.

### 3.7 Seed dữ liệu nội bộ (thay cho WordPress migration)

- [x] Script seed idempotent cho posts/category/tag/media/products
- [x] Chạy seed local thành công bằng `npm run seed:internal`
- [x] Có hướng dẫn sử dụng trong README
- [x] Giữ script WordPress migration dạng tùy chọn (không bắt buộc DoD)

### 3.8 Admin nâng cao

- [x] Quản lý đơn hàng đầy đủ trạng thái + lịch sử
- [x] Quản lý user nâng cao (lock/unlock/reset role)
- [x] Quản lý posts/category/tag/SEO meta
- [x] Quản lý truy cập (IP/device/time)

### 3.9 Builder Level 2 (Pro)

- [x] Row/Column drag-drop
- [x] Style per block (margin/padding/border/shadow/bg)
- [x] Section templates
- [x] Reusable blocks
- [x] Version history + rollback
- [x] Responsive control desktop/tablet/mobile

### 3.10 Media nâng cao

- [x] Chuẩn folder Cloudinary theo owner type
- [x] Tạo 3 kích thước chuẩn: thumb/medium/large
- [x] Dọn ảnh mồ côi định kỳ (orphan cleanup)
- [x] Chính sách thay ảnh không tạo rác dữ liệu

### 3.11 DoD Phase 2

- [x] Seed được dữ liệu nội bộ thật cho local dev
- [x] Admin dùng được đầy đủ CRUD cần thiết
- [x] Builder mức 2 hoạt động ổn định
- [x] Có tài liệu migration + rollback data
- [x] Docs API cập nhật endpoint mới đầy đủ
- [x] Quản lý ảnh ổn định

**Trạng thái Phase 2:** ✅ Done  
**Bằng chứng:** (report migrate, screenshot, commit hash)

---

## Phase 3 — Nâng cao & tối ưu

**Mục tiêu:** Builder mức 3 + tối ưu bảo mật, hiệu năng, vận hành.

### 3.12 Builder Level 3 (Advanced)

- [x] Dynamic data binding (product/post)
- [x] Theme builder (template product/post/category)
- [x] Rule-based rendering (điều kiện hiển thị)
- [x] Custom CSS có kiểm soát quyền
- [x] Permission chi tiết theo vai trò
- [x] i18n-ready architecture

### 3.13 Security hardening

- [x] CSRF đầy đủ
- [x] XSS sanitization nâng cao (builder input)
- [x] Brute force protection mở rộng
- [x] Audit log đầy đủ cho thao tác nhạy cảm
- [x] Rà soát theo OWASP Top Risks

### 3.14 Performance & SEO

- [ ] sitemap/robots
- [ ] meta SEO
- [ ] image optimize + lazy load
- [ ] cải thiện Core Web Vitals

### 3.15 DoD Phase 3

- [ ] Builder đủ 3 mức theo spec
- [ ] Security checklist đạt
- [ ] Performance/SEO checklist đạt
- [ ] Ready deploy production

**Trạng thái Phase 3:** 🟡 In Progress  
**Bằng chứng:** (test results, metrics, commit hash)

---

## 4) Danh sách API tối thiểu phải có

- `/api/v1/auth/*`
- `/api/v1/users/*`
- `/api/v1/products/*`
- `/api/v1/posts/*`
- `/api/v1/cart/*`
- `/api/v1/orders/*`
- `/api/v1/payments/sepay/*`
- `/api/v1/settings/*`
- `/api/v1/admin/*`
- `/api/v1/builder/*`
- `/api/v1/media/*` (upload, delete, list, attach)

---

## 5) Cấu trúc dữ liệu Builder (chuẩn tối thiểu)

- **Page:** `id`, `slug`, `status(draft/published)`, `theme_id`, `version`
- **PageVersion:** `page_id`, `json_schema`, `created_by`, `created_at`
- **Block:** `id`, `type`, `props`, `style`, `children`
- **Template:** `type(product/post/category)`, `json_schema`
- **ThemeToken:** `colors`, `typography`, `spacing`, `radius`, `shadow`

### 5.1 Cấu trúc dữ liệu Media (Cloudinary)

- **Media:**  
  `id`, `public_id`, `secure_url`, `resource_type`, `format`, `width`, `height`, `bytes`, `folder`, `alt_text`, `owner_type`, `owner_id`, `created_by`, `created_at`, `updated_at`

**Quy ước folder Cloudinary**
- `products/{productId}/...`
- `posts/{postId}/...`
- `users/avatars/{userId}/...`
- `builder/{pageId}/...`

---

## 6) Quy tắc cập nhật tiến độ cho AI (bắt buộc)

Sau mỗi lần hoàn thành task:

1. Tick checklist tương ứng.
2. Ghi commit hash.
3. Ghi “đã test gì, kết quả gì”.
4. Nếu thay đổi scope, cập nhật mục “Decision Log”.
5. Nếu có API mới/sửa API cũ, cập nhật Swagger docs.
6. Nếu task liên quan media, ghi rõ kết quả upload/transform/delete.

---

## 7) Decision Log (ghi quyết định quan trọng)

- [YYYY-MM-DD] Quyết định:
  - Lý do:
  - Ảnh hưởng:
  - Người xác nhận:

- [2026-03-18] Quyết định: Dùng `Prisma` làm ORM chính thức cho phase scaffold và chuẩn hóa JSON fields (`Cart.items`, `Setting.value`, `PageVersion.jsonSchema`, `Product.images`) theo kiểu JSON của MySQL.
  - Lý do: Đảm bảo tương thích MySQL và giữ linh hoạt cho builder/media payload.
  - Ảnh hưởng: API payload cho các trường trên cần validate chặt ở bước hardening phase sau.
  - Người xác nhận: Pending user review

- [2026-03-18] Quyết định: Dùng signed upload flow qua backend cho Cloudinary và frontend upload trực tiếp lên Cloudinary.
  - Lý do: Secret chỉ tồn tại ở backend, frontend không chạm secret.
  - Ảnh hưởng: Frontend cần gọi thêm bước lấy chữ ký trước khi upload file.
  - Người xác nhận: Pending user review

- [2026-03-18] Quyết định: Dùng refresh-token-hash strategy để revoke logout thay vì lưu refresh token dạng rõ.
  - Lý do: Tăng an toàn khi DB lộ dữ liệu và hỗ trợ revoke ngay lập tức.
  - Ảnh hưởng: `User` cần thêm trường `refreshTokenHash`; auth flow dùng cookie refresh token.
  - Người xác nhận: Pending user review

- [2026-03-18] Quyết định: Builder Level 1 dùng JSON schema blocks và renderer phía frontend (public page lấy bản published từ backend theo slug).
  - Lý do: Đáp ứng nhanh requirement preview/publish và dễ mở rộng lên drag-drop ở phase 2.
  - Ảnh hưởng: Cần giữ compatibility schema khi nâng cấp builder.
  - Người xác nhận: Pending user review

- [2026-03-19] Quyết định: Tuân thủ schema chuẩn từ `schemaSQL.sql` để viết migration WordPress (không thêm bảng ngoài schema chuẩn).
  - Lý do: DB thực tế `ecommerce_cms` đang theo schema SQL này.
  - Ảnh hưởng: Script migration ghi tracking vào `wp_import_runs` và upsert dữ liệu vào bảng hiện có.
  - Người xác nhận: Pending user review

- [2026-03-19] Quyết định: Ưu tiên triển khai 3.8 ở tầng API backend trước (admin advanced), UI phase 2 sẽ nối tiếp sau.
  - Lý do: unlock nghiệp vụ quản trị sớm để có thể test tích hợp với dữ liệu thật.
  - Ảnh hưởng: cần bổ sung màn hình admin nâng cao ở bước tiếp theo.
  - Người xác nhận: Pending user review

- [2026-03-19] Quyết định: Builder Pro lưu reusable blocks trong `settings` key `builder_reusable_blocks` để tránh thêm bảng mới giai đoạn này.
  - Lý do: triển khai nhanh feature reusable block mà vẫn giữ khả năng mở rộng sang bảng riêng sau.
  - Ảnh hưởng: khi số lượng reusable lớn cần tách model chuyên dụng để query/filter tốt hơn.
  - Người xác nhận: Pending user review

- [2026-03-19] Quyết định: Media replace policy dùng `replaceExisting=true` ở attach API để tự dọn metadata ảnh cũ theo cùng owner.
  - Lý do: tránh tích lũy ảnh rác khi người dùng thay ảnh nhiều lần.
  - Ảnh hưởng: cần đảm bảo frontend gửi đúng ownerType/ownerId khi replace.
  - Người xác nhận: Pending user review

- [2026-03-19] Quyết định: WP migration sinh `rollback report` theo run (`backend/scripts/reports/wp-import-run-<id>.json`) và rollback chỉ xóa bản ghi mới tạo.
  - Lý do: tránh xóa nhầm dữ liệu đã tồn tại trước import khi cần rollback.
  - Ảnh hưởng: để rollback đầy đủ run cũ, cần giữ file report tương ứng.
  - Người xác nhận: Pending user review

- [2026-03-19] Quyết định: Scope hiện tại không bắt buộc WordPress import; dùng seed nội bộ cho local development.
  - Lý do: người dùng xác nhận không dùng import WordPress.
  - Ảnh hưởng: DoD 3.11 chuyển tiêu chí từ "import WP thật" sang "seed dữ liệu nội bộ thật".
  - Người xác nhận: User confirmed

- [2026-03-19] Quyết định: Dynamic data binding dùng cú pháp token `{{path}}` trong builder props để map nhanh product/post data.
  - Lý do: không cần đổi DB/schema, tương thích trực tiếp với JSON schema hiện tại.
  - Ảnh hưởng: renderer cần resolve token runtime; admin có thể bind qua preset hoặc JSON thủ công.
  - Người xác nhận: Pending user review

- [2026-03-19] Quyết định: Rule-based rendering dùng `props.visibility` tại block-level.
  - Lý do: cho phép điều kiện hiển thị mà không phá schema block hiện tại.
  - Ảnh hưởng: JSON schema hỗ trợ rule đơn giản `exists/equals/not_equals` theo data path.
  - Người xác nhận: Pending user review

- [2026-03-19] Quyết định: Custom CSS builder chỉ cho phép qua sanitizer cơ bản và giới hạn độ dài.
  - Lý do: cho phép tùy biến giao diện nhưng giảm rủi ro payload CSS nguy hiểm.
  - Ảnh hưởng: một số kỹ thuật CSS nâng cao (như `@import`) sẽ bị chặn.
  - Người xác nhận: Pending user review

- [2026-03-19] Quyết định: Builder API dùng RBAC chi tiết theo vai trò cho endpoint quản trị.
  - Lý do: tách rõ quyền edit và quyền publish/rollback.
  - Ảnh hưởng: người dùng chưa login hoặc role CUSTOMER sẽ không gọi được endpoint admin builder.
  - Người xác nhận: Pending user review

- [2026-03-19] Quyết định: Theme builder phase đầu triển khai bằng template presets (product/post/category) qua endpoint templates.
  - Lý do: đạt nhanh use-case theme page mà không cần thêm model DB mới.
  - Ảnh hưởng: giai đoạn sau có thể tách template store riêng nếu cần quản trị sâu hơn.
  - Người xác nhận: Pending user review

- [2026-03-19] Quyết định: i18n phase đầu dùng dictionary nội bộ (`vi/en`) + context provider trên frontend.
  - Lý do: tạo nền tảng đa ngôn ngữ nhanh, không thêm dependency nặng.
  - Ảnh hưởng: khi mở rộng ngôn ngữ nhiều cần chuyển sang resource loader/cms translation store.
  - Người xác nhận: Pending user review

- [2026-03-19] Quyết định: CSRF áp dụng mô hình double-submit token cho luồng auth dùng cookie.
  - Lý do: phù hợp kiến trúc hiện tại (refresh token nằm trong cookie) và triển khai nhanh.
  - Ảnh hưởng: client cần gửi `x-csrf-token` cho request mutate liên quan auth.
  - Người xác nhận: Pending user review

- [2026-03-19] Quyết định: Brute-force login lock theo cặp `email+ip` sau 5 lần sai trong 15 phút.
  - Lý do: giảm rủi ro credential stuffing mà không cần thêm hạ tầng ngoài.
  - Ảnh hưởng: người dùng nhập sai nhiều lần sẽ bị khóa tạm thời theo IP hiện tại.
  - Người xác nhận: Pending user review

---

## 8) Risk Log

- Risk:
- Mức độ: Low / Medium / High
- Ảnh hưởng:
- Cách giảm thiểu:
- Trạng thái:

- Risk: Chưa parse trực tiếp `Design.pen` do chưa kết nối được app Pencil/VSCode bridge.
- Mức độ: Medium
- Ảnh hưởng: UI hiện tại mới ở mức scaffold, chưa bám đủ design token/layout gốc.
- Cách giảm thiểu: Kết nối lại Pencil bridge và map token/layout trong vòng lặp UI kế tiếp.
- Trạng thái: Open

---

## 9) Gợi ý lệnh commit theo phase

- `feat(phase1): complete mvp shop + auth + sepay + builder-basic`
- `feat(phase2): wordpress migration + admin enhance + builder-pro`
- `feat(phase3): advanced builder + security hardening + perf seo`

---

## 10) Commit Gate (bắt buộc hỏi người dùng)

Quy tắc bắt buộc sau khi hoàn thành mỗi mục cấp `##`:

1. AI chỉ được đánh dấu hoàn thành (`✅`) khi:
   - Tất cả checklist con trong mục `##` đã hoàn tất
   - Đã chạy test liên quan và pass
   - Đã cập nhật bằng chứng (log/test/screenshot/ghi chú)

2. Ngay sau khi một mục `##` được đánh dấu `✅`, AI PHẢI dừng lại và hỏi người dùng:  
   **"Mục [tên mục ##] đã hoàn thiện. Bạn có muốn mình commit lên GitHub không?"**

3. Nếu người dùng trả lời:
   - **Có** → AI mới được tạo commit và push
   - **Không** → AI không commit, chuyển sang mục tiếp theo
   - **Commit local thôi** → chỉ commit local, không push

4. AI không được tự ý push GitHub khi chưa có xác nhận rõ ràng từ người dùng.

5. Message commit phải theo format:
   - `feat(phaseX): <tên mục ##>`
   - hoặc `fix(phaseX): <nội dung sửa>`

---

## 11) UI/UX Input bắt buộc từ file `.pen`

### 11.1 Nguồn thiết kế gốc

- AI bắt buộc đọc và bám theo file thiết kế `.pen` do người dùng cung cấp: `[TEN_FILE_PEN]`
- File `.pen` là nguồn tham chiếu chính về:
- Layout
- Màu sắc
- Typography
- Component style
- Spacing / grid / section flow

### 11.2 Quy tắc áp dụng

1. Không được bỏ qua file `.pen` khi dựng giao diện.
2. Chuyển đổi thiết kế `.pen` thành UI React component hóa, tái sử dụng được.
3. Đảm bảo responsive (desktop/tablet/mobile) dựa trên bố cục gốc.
4. Giữ tinh thần thiết kế gốc, không thay đổi tùy tiện.

### 11.3 Cho phép cải tiến có kiểm soát

AI được phép **tự bổ sung một số phần để cải thiện UX/UI**, nhưng phải tuân thủ:

- Không phá vỡ cấu trúc và nhận diện chính từ file `.pen`
- Chỉ cải tiến theo hướng:
- Tăng khả năng chuyển đổi (CTA rõ hơn)
- Dễ đọc hơn (font/spacing/contrast)
- Dễ dùng hơn trên mobile
- Tăng độ tin cậy (badge, feedback trạng thái, loading/skeleton)
- Mọi cải tiến phải ghi vào **Decision Log**:
- Hạng mục cải tiến
- Lý do
- Ảnh hưởng UI/UX
- Ảnh trước/sau (nếu có)

### 11.4 Checklist nghiệm thu phần giao diện

- [ ] Đã parse và áp dụng đầy đủ file `.pen`
- [ ] Mapping design token (color/font/spacing/radius/shadow) vào hệ thống theme
- [ ] UI responsive đúng 3 breakpoint chính
- [ ] Các cải tiến UI/UX được ghi vào Decision Log
- [ ] Người dùng duyệt giao diện trước khi chốt phase liên quan

### 11.5 Commit Gate riêng cho UI

Sau khi hoàn thành phần UI theo `.pen`, AI phải hỏi:

**"Phần giao diện theo file `.pen` đã hoàn thiện (kèm các cải tiến phù hợp). Bạn có muốn mình commit lên GitHub không?"**
