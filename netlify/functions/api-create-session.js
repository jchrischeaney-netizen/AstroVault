const busboy = require('busboy');
const { randomUUID } = require('crypto');
const path = require('path');
const { getDb } = require('./lib/db');
const { getPhotosStore } = require('./lib/blobs');

function parseMultipart(event) {
  return new Promise((resolve, reject) => {
    const bb = busboy({ headers: { 'content-type': event.headers['content-type'] } });
    const fields = {};
    const files = [];

    bb.on('field', (name, val) => { fields[name] = val; });
    bb.on('file', (name, stream, info) => {
      const chunks = [];
      stream.on('data', c => chunks.push(c));
      stream.on('end', () => {
        files.push({
          fieldname: name,
          filename: info.filename,
          mimetype: info.mimeType,
          buffer: Buffer.concat(chunks),
        });
      });
    });
    bb.on('finish', () => resolve({ fields, files }));
    bb.on('error', reject);

    const body = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64')
      : Buffer.from(event.body || '');
    // bb.end(body) writes the buffer directly to busboy as a single chunk.
    // Readable.from(buffer) would iterate the buffer byte-by-byte in object
    // mode, which breaks busboy's multipart parser.
    bb.end(body);
  });
}

const ALLOWED_EXTS = new Set(['.jpg', '.jpeg', '.png', '.tif', '.tiff', '.webp', '.bmp']);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { fields, files } = await parseMultipart(event);
    const object_id = parseInt(fields.object_id);
    if (!object_id) return { statusCode: 400, body: JSON.stringify({ error: 'object_id required' }) };

    const sql = getDb();
    const store = getPhotosStore();

    // Insert session
    const [session] = await sql`
      INSERT INTO sessions (object_id, date_taken, integration_minutes, telescope, camera, notes)
      VALUES (
        ${object_id},
        ${fields.date_taken || null},
        ${parseInt(fields.integration_minutes) || 0},
        ${fields.telescope || null},
        ${fields.camera || null},
        ${fields.notes || null}
      )
      RETURNING id
    `;

    // Upload photos and insert records
    const photoFiles = files.filter(f => f.fieldname === 'photos');
    for (let i = 0; i < photoFiles.length; i++) {
      const f = photoFiles[i];
      const ext = path.extname(f.filename || '').toLowerCase();
      if (!ALLOWED_EXTS.has(ext)) continue;

      const blobKey = `photos/${randomUUID()}${ext}`;
      await store.set(blobKey, f.buffer, { metadata: { contentType: f.mimetype } });

      await sql`
        INSERT INTO photos (session_id, blob_key, original_name, is_primary)
        VALUES (${session.id}, ${blobKey}, ${f.filename}, ${i === 0 ? 1 : 0})
      `;
    }

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: session.id }),
    };
  } catch (err) {
    console.error('api-create-session error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
