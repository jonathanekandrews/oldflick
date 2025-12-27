import pool from './connection.js';

/**
 * Schema Inspector - Dynamically detects Supabase schema and provides
 * field name mapping for backward compatibility and future schema changes
 */

let cachedSchema = null;
let schemaLastChecked = null;
const SCHEMA_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Force invalidate the schema cache
 */
export function invalidateSchemaCacheForce() {
  cachedSchema = null;
  schemaLastChecked = null;
  console.log('🔄 Schema cache forcefully invalidated');
}

/**
 * Get the actual column names from Supabase content table
 */
export async function getContentTableColumns() {
  // Return cached schema if still valid
  if (cachedSchema && schemaLastChecked && Date.now() - schemaLastChecked < SCHEMA_CACHE_TTL) {
    console.log('📦 Using cached schema');
    return cachedSchema;
  }

  if (cachedSchema && schemaLastChecked) {
    console.log('⏰ Schema cache expired, refreshing...');
  }

  try {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'content'
      ORDER BY ordinal_position
    `);

    cachedSchema = result.rows.reduce((acc, col) => {
      acc[col.column_name] = {
        type: col.data_type,
        nullable: col.is_nullable === 'YES'
      };
      return acc;
    }, {});

    schemaLastChecked = Date.now();

    console.log('✅ Schema introspection completed. Columns detected:');
    console.log('   ', Object.keys(cachedSchema).join(', '));

    return cachedSchema;
  } catch (error) {
    console.error('❌ Failed to introspect schema:', error.message);
    console.error('   Error code:', error.code);
    console.error('   Full error:', error);
    // Return empty schema to prevent crashes
    return {};
  }
}

/**
 * Create a field mapping based on actual columns present
 * Supports both old and new field naming conventions
 */
export function createFieldMapper(actualColumns) {
  // Define known field aliases (old name -> new name)
  const fieldAliases = {
    type: 'content_type',
    year: 'release_year',
    duration: 'runtime_minutes',
    thumbnail_url: 'poster_url',
    backdrop_url: 'poster_url',
    imdb_rating: 'rating',
    cast_members: 'actors'
  };

  return function mapRow(row) {
    if (!row) return row;

    const mapped = {
      id: row.id,
      title: row.title,
      description: row.description,
      genre: row.genre,
      director: row.director,
      video_url: row.video_url,
      trailer_url: row.trailer_url,
      is_featured: row.is_featured,
      is_masterpiece: row.is_masterpiece,
      is_cult: row.is_cult,
      created_date: row.created_date,
      updated_date: row.updated_date
    };

    // Map content type field
    if (actualColumns['content_type']) {
      mapped.content_type = row.content_type;
    } else if (actualColumns['type']) {
      mapped.content_type = row.type;
    }

    // Map release year field
    if (actualColumns['release_year']) {
      mapped.release_year = row.release_year;
    } else if (actualColumns['year']) {
      mapped.release_year = row.year;
    }

    // Map runtime field
    if (actualColumns['runtime_minutes']) {
      mapped.runtime_minutes = row.runtime_minutes;
    } else if (actualColumns['duration']) {
      mapped.runtime_minutes = row.duration;
    }

    // Map rating (prefer imdb_rating if available, fall back to rating)
    if (actualColumns['imdb_rating']) {
      mapped.rating = row.imdb_rating || row.rating;
    } else if (actualColumns['rating']) {
      mapped.rating = row.rating;
    }

    // Map poster URL (try multiple sources)
    if (actualColumns['poster_url']) {
      mapped.poster_url = row.poster_url;
    } else if (actualColumns['thumbnail_url']) {
      mapped.poster_url = row.thumbnail_url;
    } else if (actualColumns['backdrop_url']) {
      mapped.poster_url = row.backdrop_url;
    }

    // Map actors field
    if (actualColumns['actors']) {
      mapped.actors = row.actors;
    } else if (actualColumns['cast_members']) {
      mapped.actors = row.cast_members;
    }

    return mapped;
  };
}

/**
 * Get all required fields for the API to function
 */
export function getRequiredFields() {
  return [
    'id',
    'title',
    'description',
    'content_type', // or 'type'
    'genre',
    'release_year', // or 'year'
    'rating',
    'runtime_minutes', // or 'duration'
    'poster_url', // or 'thumbnail_url' or 'backdrop_url'
    'video_url',
    'director',
    'actors' // or 'cast_members'
  ];
}

/**
 * Validate that Supabase has required fields (or aliases)
 */
export function validateSchema(actualColumns) {
  const required = getRequiredFields();
  const aliases = {
    'content_type': ['content_type', 'type'],
    'release_year': ['release_year', 'year'],
    'runtime_minutes': ['runtime_minutes', 'duration'],
    'poster_url': ['poster_url', 'thumbnail_url', 'backdrop_url'],
    'rating': ['rating', 'imdb_rating'],
    'actors': ['actors', 'cast_members']
  };

  const missing = [];
  const found = [];

  Object.keys(aliases).forEach(fieldName => {
    const possibleNames = aliases[fieldName];
    const columnExists = possibleNames.some(name => actualColumns[name]);

    if (columnExists) {
      found.push(`✅ ${fieldName} (found as: ${possibleNames.find(n => actualColumns[n])})`);
    } else {
      missing.push(`❌ ${fieldName} (expected one of: ${possibleNames.join(', ')})`);
    }
  });

  // Always present fields
  ['id', 'title', 'description', 'genre', 'video_url', 'director'].forEach(field => {
    if (actualColumns[field]) {
      found.push(`✅ ${field}`);
    } else {
      missing.push(`❌ ${field}`);
    }
  });

  return {
    valid: missing.length === 0,
    found,
    missing,
    message: missing.length === 0
      ? '✅ Schema is compatible with API requirements'
      : `❌ Schema has ${missing.length} missing fields`
  };
}

/**
 * Clear schema cache (useful after schema changes)
 */
export function invalidateSchemaCache() {
  cachedSchema = null;
  schemaLastChecked = null;
}
