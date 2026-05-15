const { getDb } = require('./lib/db');
const { getPhotosStore } = require('./lib/blobs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'DELETE') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const id = parseInt(event.path.split('/').pop());
    if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'Missing session id' }) };

    const sql = getDb();
    const store = getPhotosStore();

    // Fetch blob keys before deleting DB records
    const photos = await sql`SELECT blob_key FROM photos WHERE session_id = ${id}`;

    // Delete DB records (photos cascade via FK)
    await sql`DELETE FROM sessions WHERE id = ${id}`;

    // Delete blobs (best-effort; don't fail the request if a blob is missing)
    await Promise.allSettled(photos.map(p => store.delete(p.blob_key)));

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error('api-delete-session error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
