const { getDb } = require('./lib/db');
const { getPhotosStore } = require('./lib/blobs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'DELETE') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const id = parseInt(event.path.split('/').pop());
    if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'Missing photo id' }) };

    const db = getDb();
    const store = getPhotosStore();

    const [photo] = await db.sql`SELECT blob_key FROM photos WHERE id = ${id}`;
    if (!photo) return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }) };

    await db.sql`DELETE FROM photos WHERE id = ${id}`;
    await store.delete(photo.blob_key).catch(() => {});

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error('api-delete-photo error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
