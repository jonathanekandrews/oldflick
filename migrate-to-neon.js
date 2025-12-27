#!/usr/bin/env node

import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'postgresql://postgres:yu9oAaMfhNGh5IRB@db.uwpncgyfdlvbphetfdiw.supabase.co:5432/postgres';
const NEON_URL = 'postgresql://neondb_owner:npg_hbcOI5gWiqAO@ep-still-bread-abslny2n-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require';

async function runMigration() {
  const supabaseClient = new Client({
    connectionString: SUPABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  const neonClient = new Client({
    connectionString: NEON_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔗 Connecting to Supabase...');
    await supabaseClient.connect();
    console.log('✅ Connected to Supabase');

    console.log('\n📊 Fetching schema from Supabase...');

    // Get all table names
    const tablesResult = await supabaseClient.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    const tables = tablesResult.rows.map(r => r.table_name);
    console.log(`📋 Found ${tables.length} tables: ${tables.join(', ')}`);

    // Get full schema DDL
    const ddlResult = await supabaseClient.query(`
      SELECT pg_get_ddl(oid)
      FROM pg_class
      WHERE relkind = 'r' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      ORDER BY relname
    `);

    const schemaDDL = ddlResult.rows.map(r => r.pg_get_ddl).filter(Boolean).join(';\n') + ';';

    // Export all data
    const tableDataMap = {};
    for (const table of tables) {
      const result = await supabaseClient.query(`SELECT * FROM "${table}"`);
      tableDataMap[table] = result.rows;
      console.log(`  └─ ${table}: ${result.rows.length} rows`);
    }

    await supabaseClient.end();
    console.log('✅ Disconnected from Supabase\n');

    // Connect to Neon and import
    console.log('🔗 Connecting to Neon...');
    await neonClient.connect();
    console.log('✅ Connected to Neon');

    console.log('\n📝 Creating schema in Neon...');
    try {
      await neonClient.query(schemaDDL);
      console.log('✅ Schema created');
    } catch (schemaErr) {
      console.warn('⚠️  Schema creation had warnings (may be normal):', schemaErr.message);
    }

    console.log('\n📥 Importing data into Neon...');
    for (const table of tables) {
      const rows = tableDataMap[table];
      if (rows.length === 0) {
        console.log(`  └─ ${table}: skipped (empty)`);
        continue;
      }

      const columns = Object.keys(rows[0]);
      const values = rows.map(row =>
        `(${columns.map(col => {
          const val = row[col];
          if (val === null) return 'NULL';
          if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
          if (typeof val === 'boolean') return val ? 'true' : 'false';
          if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
          return val;
        }).join(', ')})`
      ).join(',\n');

      const insertQuery = `INSERT INTO "${table}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES\n${values}`;

      try {
        await neonClient.query(insertQuery);
        console.log(`  └─ ${table}: ${rows.length} rows imported`);
      } catch (insertErr) {
        console.error(`  ❌ ${table} import failed:`, insertErr.message);
      }
    }

    console.log('\n✅ Verifying migration...');
    for (const table of tables) {
      const result = await neonClient.query(`SELECT COUNT(*) as count FROM "${table}"`);
      const count = result.rows[0].count;
      const expected = tableDataMap[table].length;
      const status = count === expected ? '✅' : '⚠️ ';
      console.log(`  ${status} ${table}: ${count} rows (expected ${expected})`);
    }

    await neonClient.end();
    console.log('\n🎉 Migration complete!');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
