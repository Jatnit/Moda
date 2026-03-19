import 'dotenv/config';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import mysql from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';

type WpPost = RowDataPacket & {
  ID: number;
  post_title: string;
  post_name: string;
  post_excerpt: string | null;
  post_content: string | null;
  post_status: string;
  post_date: string | null;
};

type WpTerm = RowDataPacket & {
  name: string;
  slug: string;
  taxonomy: 'category' | 'post_tag';
};

type WpAttachment = RowDataPacket & {
  ID: number;
  post_title: string;
  guid: string | null;
  post_mime_type: string | null;
};

type RunRow = RowDataPacket & {
  id: number;
  success_count: number;
  failed_count: number;
};

type RollbackReport = {
  runId: number;
  sourceFile: string;
  generatedAt: string;
  created: {
    posts: string[];
    categories: string[];
    tags: string[];
    mediaPublicIds: string[];
  };
  updated: {
    posts: string[];
    categories: string[];
    tags: string[];
    mediaPublicIds: string[];
  };
};

function env(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

function mapWpStatus(status: string): 'DRAFT' | 'PUBLISHED' | 'PRIVATE' | 'ARCHIVED' {
  if (status === 'publish') return 'PUBLISHED';
  if (status === 'private') return 'PRIVATE';
  if (status === 'draft' || status === 'pending') return 'DRAFT';
  return 'ARCHIVED';
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 180);
}

function derivePublicId(url: string): string {
  const clean = url.split('?')[0];
  const parts = clean.split('/');
  const file = parts[parts.length - 1] ?? 'file';
  const folder = parts.slice(Math.max(parts.length - 3, 0), parts.length - 1).join('/');
  const name = file.includes('.') ? file.slice(0, file.lastIndexOf('.')) : file;
  return folder ? `${folder}/${name}` : name;
}

function deriveFormat(url: string): string | null {
  const clean = url.split('?')[0];
  const file = clean.split('/').pop() ?? '';
  if (!file.includes('.')) return null;
  return file.slice(file.lastIndexOf('.') + 1).toLowerCase();
}

async function main() {
  const targetUrl = env('DATABASE_URL');
  const wpUrl = process.env.WP_DATABASE_URL;
  const wpHost = process.env.WP_DB_HOST ?? '127.0.0.1';
  const wpPort = Number(process.env.WP_DB_PORT ?? '3306');
  const wpUser = process.env.WP_DB_USER ?? 'root';
  const wpPass = process.env.WP_DB_PASS ?? '';
  const wpName = process.env.WP_DB_NAME ?? 'wordpress';
  const wpPrefix = process.env.WP_TABLE_PREFIX ?? 'wp_';
  const sourceFile = process.env.WP_DUMP_FILE ?? (wpName ? `mysql://${wpHost}:${wpPort}/${wpName}` : 'wordpress-db');

  const target = await mysql.createConnection(targetUrl);
  const source = wpUrl
    ? await mysql.createConnection(wpUrl)
    : await mysql.createConnection({
        host: wpHost,
        port: wpPort,
        user: wpUser,
        password: wpPass,
        database: wpName
      });

  let runId = 0;
  let successCount = 0;
  let failedCount = 0;
  const createdPosts = new Set<string>();
  const updatedPosts = new Set<string>();
  const createdCategories = new Set<string>();
  const updatedCategories = new Set<string>();
  const createdTags = new Set<string>();
  const updatedTags = new Set<string>();
  const createdMedia = new Set<string>();
  const updatedMedia = new Set<string>();

  try {
    const [runResult] = await target.execute<mysql.ResultSetHeader>(
      `INSERT INTO wp_import_runs (source_file, status, started_at) VALUES (?, 'RUNNING', NOW())`,
      [sourceFile]
    );
    runId = runResult.insertId;

    const [posts] = await source.query<WpPost[]>(
      `SELECT ID, post_title, post_name, post_excerpt, post_content, post_status, post_date
       FROM ${wpPrefix}posts
       WHERE post_type = 'post' AND post_status NOT IN ('auto-draft','trash','inherit')`
    );
    const [existingPostRows] = await target.query<Array<RowDataPacket & { slug: string }>>(`SELECT slug FROM posts`);
    const existingPostSlugs = new Set(existingPostRows.map((row) => row.slug));

    for (const row of posts) {
      try {
        const slug = row.post_name?.trim() || slugify(row.post_title || `post-${row.ID}`);
        const status = mapWpStatus(row.post_status);
        const publishedAt = status === 'PUBLISHED' ? row.post_date : null;

        await target.execute(
          `INSERT INTO posts (title, slug, excerpt, content, status, published_at)
           VALUES (?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
             title = VALUES(title),
             excerpt = VALUES(excerpt),
             content = VALUES(content),
             status = VALUES(status),
             published_at = VALUES(published_at)`,
          [row.post_title || `Post ${row.ID}`, slug, row.post_excerpt, row.post_content, status, publishedAt]
        );
        if (existingPostSlugs.has(slug)) {
          updatedPosts.add(slug);
        } else {
          createdPosts.add(slug);
          existingPostSlugs.add(slug);
        }
        successCount += 1;
      } catch (error) {
        failedCount += 1;
      }
    }

    const [terms] = await source.query<WpTerm[]>(
      `SELECT t.name, t.slug, tt.taxonomy
       FROM ${wpPrefix}terms t
       JOIN ${wpPrefix}term_taxonomy tt ON tt.term_id = t.term_id
       WHERE tt.taxonomy IN ('category', 'post_tag')`
    );

    const [existingCategoryRows] = await target.query<Array<RowDataPacket & { slug: string }>>(`SELECT slug FROM post_categories`);
    const [existingTagRows] = await target.query<Array<RowDataPacket & { slug: string }>>(`SELECT slug FROM post_tags`);
    const existingCategorySlugs = new Set(existingCategoryRows.map((row) => row.slug));
    const existingTagSlugs = new Set(existingTagRows.map((row) => row.slug));

    for (const term of terms) {
      try {
        const slug = term.slug || slugify(term.name);
        if (term.taxonomy === 'category') {
          await target.execute(
            `INSERT INTO post_categories (name, slug)
             VALUES (?, ?)
             ON DUPLICATE KEY UPDATE name = VALUES(name)`,
            [term.name, slug]
          );
          if (existingCategorySlugs.has(slug)) {
            updatedCategories.add(slug);
          } else {
            createdCategories.add(slug);
            existingCategorySlugs.add(slug);
          }
        } else {
          await target.execute(
            `INSERT INTO post_tags (name, slug)
             VALUES (?, ?)
             ON DUPLICATE KEY UPDATE name = VALUES(name)`,
            [term.name, slug]
          );
          if (existingTagSlugs.has(slug)) {
            updatedTags.add(slug);
          } else {
            createdTags.add(slug);
            existingTagSlugs.add(slug);
          }
        }
        successCount += 1;
      } catch {
        failedCount += 1;
      }
    }

    const [attachments] = await source.query<WpAttachment[]>(
      `SELECT ID, post_title, guid, post_mime_type
       FROM ${wpPrefix}posts
       WHERE post_type = 'attachment' AND post_mime_type LIKE 'image/%'`
    );

    const [existingMediaRows] = await target.query<Array<RowDataPacket & { public_id: string }>>(`SELECT public_id FROM media`);
    const existingPublicIds = new Set(existingMediaRows.map((row) => row.public_id));

    for (const attachment of attachments) {
      if (!attachment.guid) continue;
      try {
        const publicId = derivePublicId(attachment.guid);
        const format = deriveFormat(attachment.guid);
        await target.execute(
          `INSERT INTO media (public_id, secure_url, resource_type, format, folder, alt_text)
           VALUES (?, ?, 'image', ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             secure_url = VALUES(secure_url),
             format = VALUES(format),
             folder = VALUES(folder),
             alt_text = VALUES(alt_text)`,
          [publicId, attachment.guid, format, publicId.split('/').slice(0, -1).join('/'), attachment.post_title]
        );
        if (existingPublicIds.has(publicId)) {
          updatedMedia.add(publicId);
        } else {
          createdMedia.add(publicId);
          existingPublicIds.add(publicId);
        }
        successCount += 1;
      } catch {
        failedCount += 1;
      }
    }

    await target.execute(
      `UPDATE wp_import_runs
       SET status = ?, finished_at = NOW(), success_count = ?, failed_count = ?
       WHERE id = ?`,
      [failedCount > 0 ? 'PARTIAL' : 'SUCCESS', successCount, failedCount, runId]
    );

    const [rows] = await target.query<RunRow[]>(
      `SELECT id, success_count, failed_count FROM wp_import_runs WHERE id = ?`,
      [runId]
    );
    const run = rows[0];

    const report: RollbackReport = {
      runId: run.id,
      sourceFile,
      generatedAt: new Date().toISOString(),
      created: {
        posts: [...createdPosts],
        categories: [...createdCategories],
        tags: [...createdTags],
        mediaPublicIds: [...createdMedia]
      },
      updated: {
        posts: [...updatedPosts],
        categories: [...updatedCategories],
        tags: [...updatedTags],
        mediaPublicIds: [...updatedMedia]
      }
    };

    const reportDir = path.resolve(__dirname, 'reports');
    await fs.mkdir(reportDir, { recursive: true });
    const reportPath = path.join(reportDir, `wp-import-run-${run.id}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');

    console.log(`WP import run #${run.id} done: success=${run.success_count}, failed=${run.failed_count}`);
    console.log(`Rollback report saved: ${reportPath}`);
  } catch (error) {
    if (runId > 0) {
      await target.execute(
        `UPDATE wp_import_runs
         SET status = 'FAILED', finished_at = NOW(), success_count = ?, failed_count = ?
         WHERE id = ?`,
        [successCount, failedCount + 1, runId]
      );
    }
    throw error;
  } finally {
    await source.end();
    await target.end();
  }
}

main().catch((error) => {
  console.error('WordPress migration failed:', error);
  process.exit(1);
});
