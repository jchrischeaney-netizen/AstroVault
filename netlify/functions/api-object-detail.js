const { getDb } = require('./lib/db');
const { thumbUrl } = require('./lib/blobs');

exports.handler = async (event) => {
  try {
    const sql = getDb();
    // Extract id from path: /api/objects/42 → 42
    const id = parseInt(event.path.split('/').pop());
    if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'Missing id' }) };

    const [obj] = await sql`SELECT * FROM objects WHERE id = ${id}`;
    if (!obj) return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }) };

    const sessions_raw = await sql`
      SELECT * FROM sessions WHERE object_id = ${id} ORDER BY date_taken DESC NULLS LAST
    `;

    const sessions = await Promise.all(sessions_raw.map(async s => {
      const photos_raw = await sql`
        SELECT id, session_id, blob_key, original_name, is_primary
        FROM photos WHERE session_id = ${s.id} ORDER BY is_primary DESC
      `;
      const photos = photos_raw.map(p => ({
        id: p.id,
        session_id: p.session_id,
        original_name: p.original_name,
        is_primary: p.is_primary,
        thumbnail_url: thumbUrl(p.blob_key),
      }));
      return { ...s, photos };
    }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...obj, sessions }),
    };
  } catch (err) {
    console.error('api-object-detail error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
