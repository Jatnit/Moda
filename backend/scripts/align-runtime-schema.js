#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

function parseDatabaseUrl(url) {
  const normalized = url.startsWith('mysql://') ? url : `mysql://${url}`;
  const u = new URL(normalized);
  return {
    host: u.hostname || 'localhost',
    port: Number(u.port || 3306),
    user: decodeURIComponent(u.username || 'root'),
    password: decodeURIComponent(u.password || ''),
    database: decodeURIComponent((u.pathname || '').replace(/^\//, ''))
  };
}

function extractStatements(schemaSql) {
  const withoutLineComments = schemaSql
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n');

  return withoutLineComments
    .split(/;\s*\n/g)
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((stmt) => {
      const upper = stmt.toUpperCase();
      return (
        upper.startsWith('SET FOREIGN_KEY_CHECKS') ||
        upper.startsWith('CREATE TABLE IF NOT EXISTS') ||
        upper.startsWith('CREATE OR REPLACE VIEW')
      );
    });
}

function extractTargetTables(schemaSql) {
  const matches = [...schemaSql.matchAll(/CREATE TABLE IF NOT EXISTS\s+([a-zA-Z0-9_]+)/g)];
  return [...new Set(matches.map((m) => m[1]))].sort();
}

async function main() {
  const envPath = path.resolve(__dirname, '../.env');
  const schemaPath = path.resolve(__dirname, '../../schemaSQL.sql');
  const env = fs.readFileSync(envPath, 'utf8');
  const dbUrlMatch = env.match(/^DATABASE_URL=(.*)$/m);
  if (!dbUrlMatch) {
    throw new Error('DATABASE_URL not found in backend/.env');
  }

  const dbConfig = parseDatabaseUrl(dbUrlMatch[1].trim());
  if (!dbConfig.database) {
    throw new Error('DATABASE_URL does not include database name');
  }

  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  const targetTables = extractTargetTables(schemaSql);
  const statements = extractStatements(schemaSql);

  const conn = await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    multipleStatements: false
  });

  try {
    const [mediaAssetsRows] = await conn.query("SHOW TABLES LIKE 'media_assets'");
    const [legacyMediaRows] = await conn.query("SHOW TABLES LIKE 'Media'");

    if (legacyMediaRows.length > 0 && mediaAssetsRows.length === 0) {
      await conn.query('RENAME TABLE `Media` TO `media_assets`');
      console.log('Renamed table Media -> media_assets');
    }

    for (const stmt of statements) {
      await conn.query(stmt);
    }

    const [rows] = await conn.query(
      'SELECT table_name FROM information_schema.tables WHERE table_schema = ? ORDER BY table_name',
      [dbConfig.database]
    );
    const existingSet = new Set(rows.map((r) => r.table_name));
    const missing = targetTables.filter((t) => !existingSet.has(t));

    console.log(`Database: ${dbConfig.database}`);
    console.log(`Target tables from schemaSQL.sql: ${targetTables.length}`);
    console.log(`Existing tables after sync: ${rows.length}`);
    console.log(`Missing target tables after sync: ${missing.length}`);
    if (missing.length) {
      console.log(missing.join('\n'));
    }
  } finally {
    await conn.end();
  }
}

main().catch((error) => {
  console.error('align-runtime-schema failed:', error.message);
  process.exit(1);
});
