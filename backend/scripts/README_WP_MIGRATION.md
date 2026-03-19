# WordPress Migration Script

Script: `npm run migrate:wp`

## Required env

Target DB (current app DB):
- `DATABASE_URL=mysql://.../ecommerce_cms`

Source WordPress DB:
- `WP_DB_HOST` (default: `127.0.0.1`)
- `WP_DB_PORT` (default: `3306`)
- `WP_DB_USER` (default: `root`)
- `WP_DB_PASS` (default: empty)
- `WP_DB_NAME` (required if `WP_DATABASE_URL` is not set)
- `WP_TABLE_PREFIX` (default: `wp_`)

Alternative source URL:
- `WP_DATABASE_URL=mysql://user:pass@host:port/wp_db`

Optional:
- `WP_DUMP_FILE` (used only for import run tracking metadata)

## What it migrates

- `wp_posts` (`post_type='post'`) -> `posts` (`title`, `slug`, `excerpt`, `content`, `status`, `published_at`)
- taxonomy terms (`category`, `post_tag`) -> `post_categories`, `post_tags`
- `wp_posts` attachments (`post_type='attachment'`, image mime) -> `media`
- tracking report -> `wp_import_runs`

## Idempotency

- Uses `INSERT ... ON DUPLICATE KEY UPDATE` on unique keys (`slug`, `public_id`), so rerun will update instead of duplicating.

## Run

```bash
cd backend
npm run migrate:wp
```
