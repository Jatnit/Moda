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

## Output report for rollback

After each import run, script creates:

- `backend/scripts/reports/wp-import-run-<runId>.json`

This report stores keys that were:

- newly created (`created`)
- already existing but updated (`updated`)

Use this report to run safe rollback for created records only.

## Rollback import run

```bash
cd backend
npm run rollback:wp -- --report=/absolute/path/to/backend/scripts/reports/wp-import-run-123.json
```

or set env:

```bash
export WP_ROLLBACK_FILE=/absolute/path/to/backend/scripts/reports/wp-import-run-123.json
npm run rollback:wp
```

Rollback behavior:

- remove created `posts`
- remove created `media` by `public_id`
- remove created `post_categories` and `post_tags` only if they are not referenced anymore
- does not revert rows that were only updated (for safety)
