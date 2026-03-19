import 'dotenv/config';
import * as mysql from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';

function env(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

async function main() {
  const dbUrl = env('DATABASE_URL');
  const conn = await mysql.createConnection(dbUrl);

  try {
    await conn.beginTransaction();

    await conn.execute(
      `INSERT INTO users (email, full_name, password_hash, status, email_verified_at)
       VALUES ('seed-admin@example.com', 'Seed Admin', '$argon2id$seed$replace$replace', 'ACTIVE', NOW())
       ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), status = VALUES(status)`
    );

    await conn.execute(
      `INSERT INTO post_categories (name, slug, description)
       VALUES
        ('News', 'news', 'Internal seed category'),
        ('Campaign', 'campaign', 'Internal seed category')
       ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description)`
    );

    await conn.execute(
      `INSERT INTO post_tags (name, slug)
       VALUES
        ('fashion', 'fashion'),
        ('trend', 'trend'),
        ('sale', 'sale')
       ON DUPLICATE KEY UPDATE name = VALUES(name)`
    );

    await conn.execute(
      `INSERT INTO posts (author_id, title, slug, excerpt, content, status, seo_title, seo_description, published_at)
       SELECT u.id, 'Spring Collection Launch', 'spring-collection-launch',
              'Discover the new Spring collection with lightweight materials and bright colors.',
              'Our spring collection focuses on breathable fabrics, minimal cuts, and versatile looks.',
              'PUBLISHED',
              'Spring Collection Launch | Moda',
              'New spring arrivals are now available in Moda.',
              NOW()
       FROM users u
       WHERE u.email='seed-admin@example.com'
       ON DUPLICATE KEY UPDATE
         title = VALUES(title),
         excerpt = VALUES(excerpt),
         content = VALUES(content),
         status = VALUES(status),
         seo_title = VALUES(seo_title),
         seo_description = VALUES(seo_description),
         published_at = VALUES(published_at)`
    );

    await conn.execute(
      `INSERT INTO posts (author_id, title, slug, excerpt, content, status, seo_title, seo_description, published_at)
       SELECT u.id, 'How To Build A Capsule Wardrobe', 'how-to-build-capsule-wardrobe',
              'A practical guide to build a simple and flexible everyday wardrobe.',
              'Start with core neutral items, then expand with 1-2 accent pieces for seasonal style.',
              'PUBLISHED',
              'Build A Capsule Wardrobe | Moda Blog',
              'Step-by-step capsule wardrobe guide for modern lifestyle.',
              NOW()
       FROM users u
       WHERE u.email='seed-admin@example.com'
       ON DUPLICATE KEY UPDATE
         title = VALUES(title),
         excerpt = VALUES(excerpt),
         content = VALUES(content),
         status = VALUES(status),
         seo_title = VALUES(seo_title),
         seo_description = VALUES(seo_description),
         published_at = VALUES(published_at)`
    );

    await conn.execute(
      `INSERT IGNORE INTO products (sku, name, slug, short_description, description, status, price, stock_qty, published_at)
       VALUES
        ('SEED-001', 'Classic Linen Shirt', 'classic-linen-shirt', 'Premium linen shirt for daily wear.', 'Soft, breathable and easy to style.', 'ACTIVE', 499000, 120, NOW()),
        ('SEED-002', 'Urban Relaxed Pants', 'urban-relaxed-pants', 'Comfortable fit with modern silhouette.', 'Daily essential with clean tailoring.', 'ACTIVE', 599000, 80, NOW())`
    );

    await conn.execute(
      `INSERT INTO media (public_id, secure_url, resource_type, format, width, height, bytes, folder, alt_text)
       VALUES
        ('posts/spring-collection-launch-cover', 'https://res.cloudinary.com/demo/image/upload/v1/posts/spring-collection-launch-cover.jpg', 'image', 'jpg', 1600, 900, 245000, 'posts', 'Spring Collection Launch'),
        ('posts/capsule-wardrobe-cover', 'https://res.cloudinary.com/demo/image/upload/v1/posts/capsule-wardrobe-cover.jpg', 'image', 'jpg', 1400, 900, 210000, 'posts', 'How To Build A Capsule Wardrobe')
       ON DUPLICATE KEY UPDATE
         secure_url = VALUES(secure_url),
         format = VALUES(format),
         width = VALUES(width),
         height = VALUES(height),
         bytes = VALUES(bytes),
         folder = VALUES(folder),
         alt_text = VALUES(alt_text)`
    );

    await conn.commit();

    const [counts] = await conn.query<
      Array<RowDataPacket & { posts: number; categories: number; tags: number; media: number; products: number }>
    >(
      `SELECT
         (SELECT COUNT(*) FROM posts) AS posts,
         (SELECT COUNT(*) FROM post_categories) AS categories,
         (SELECT COUNT(*) FROM post_tags) AS tags,
         (SELECT COUNT(*) FROM media) AS media,
         (SELECT COUNT(*) FROM products) AS products`
    );

    console.log(
      JSON.stringify(
        {
          seeded: counts[0]
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
  console.error('Seed internal data failed:', error);
  process.exit(1);
});
