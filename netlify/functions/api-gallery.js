const { getDb } = require('./lib/db');
const { thumbUrl, imageUrl } = require('./lib/blobs');

exports.handler = async () => {
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT
        p.id, p.session_id, p.blob_key, p.original_name, p.is_primary,
        s.object_id, s.date_taken, s.integration_minutes, s.telescope, s.camera,
        o.messier_number, o.ngc_number, o.common_name, o.object_type, o.constellation
      FROM photos p
      JOIN sessions s ON s.id = p.session_id
      JOIN objects o ON o.id = s.object_id
      ORDER BY s.date_taken DESC NULLS LAST, p.id DESC
    `;

    const photos = rows.map(r => ({
      id: r.id,
      session_id: r.session_id,
      thumbnail_url: thumbUrl(r.blob_key),
      image_url: imageUrl(r.blob_key),
      original_name: r.original_name,
      is_primary: r.is_primary,
      object_id: r.object_id,
      messier_number: r.messier_number,
      ngc_number: r.ngc_number,
      common_name: r.common_name,
      object_type: r.object_type,
      constellation: r.constellation,
      date_taken: r.date_taken,
      integration_minutes: r.integration_minutes,
      telescope: r.telescope,
      camera: r.camera,
    }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photos }),
    };
  } catch (err) {
    console.error('api-gallery error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
