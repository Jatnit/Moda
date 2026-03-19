import 'dotenv/config';
import * as fs from 'node:fs/promises';
import mysql from 'mysql2/promise';

type RollbackReport = {
  runId: number;
  created: {
    posts: string[];
    categories: string[];
    tags: string[];
    mediaPublicIds: string[];
  };
};

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

function getArg(name: string): string | undefined {
  const arg = process.argv.find((item) => item.startsWith(`${name}=`));
  if (!arg) return undefined;
  return arg.slice(name.length + 1);
}

async function readReport(filePath: string): Promise<RollbackReport> {
  const raw = await fs.readFile(filePath, 'utf8');
  const parsed = JSON.parse(raw) as RollbackReport;

  if (!parsed?.created) throw new Error('Invalid rollback report: missing "created" block');
  return parsed;
}

async function removeBySlugs(
  conn: mysql.Connection,
  table: string,
  slugField: string,
  slugs: string[]
): Promise<number> {
  if (slugs.length === 0) return 0;
  const placeholders = slugs.map(() => '?').join(', ');
  const [result] = await conn.execute<mysql.ResultSetHeader>(
    `DELETE FROM ${table} WHERE ${slugField} IN (${placeholders})`,
    slugs
  );
  return result.affectedRows;
}

async function removeMediaByPublicIds(conn: mysql.Connection, publicIds: string[]): Promise<number> {
  if (publicIds.length === 0) return 0;
  const placeholders = publicIds.map(() => '?').join(', ');
  const [result] = await conn.execute<mysql.ResultSetHeader>(
    `DELETE FROM media WHERE public_id IN (${placeholders})`,
    publicIds
  );
  return result.affectedRows;
}

async function main() {
  const reportPath = getArg('--report') ?? process.env.WP_ROLLBACK_FILE;
  if (!reportPath) {
    throw new Error('Missing report path. Use --report=/abs/path/to/wp-import-run-*.json or set WP_ROLLBACK_FILE');
  }

  const databaseUrl = env('DATABASE_URL');
  const report = await readReport(reportPath);
  const conn = await mysql.createConnection(databaseUrl);

  try {
    await conn.beginTransaction();

    const removedPosts = await removeBySlugs(conn, 'posts', 'slug', report.created.posts);
    const removedMedia = await removeMediaByPublicIds(conn, report.created.mediaPublicIds);

    let removedCategories = 0;
    if (report.created.categories.length > 0) {
      const placeholders = report.created.categories.map(() => '?').join(', ');
      const [result] = await conn.execute<mysql.ResultSetHeader>(
        `DELETE c
         FROM post_categories c
         LEFT JOIN post_category_map m ON m.category_id = c.id
         WHERE c.slug IN (${placeholders}) AND m.category_id IS NULL`,
        report.created.categories
      );
      removedCategories = result.affectedRows;
    }

    let removedTags = 0;
    if (report.created.tags.length > 0) {
      const placeholders = report.created.tags.map(() => '?').join(', ');
      const [result] = await conn.execute<mysql.ResultSetHeader>(
        `DELETE t
         FROM post_tags t
         LEFT JOIN post_tag_map m ON m.tag_id = t.id
         WHERE t.slug IN (${placeholders}) AND m.tag_id IS NULL`,
        report.created.tags
      );
      removedTags = result.affectedRows;
    }

    await conn.commit();

    console.log(
      JSON.stringify(
        {
          runId: report.runId,
          removed: {
            posts: removedPosts,
            categories: removedCategories,
            tags: removedTags,
            media: removedMedia
          },
          note: 'Rollback only removes records created by the import run report.'
        },
        null,
        2
      )
    );
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    await conn.end();
  }
}

main().catch((error) => {
  console.error('WordPress rollback failed:', error);
  process.exit(1);
});
