const { getDb } = require('./lib/db');

exports.handler = async (event) => {
  const sql = getDb();

  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      const { messier_number, ngc_number, common_name, object_type, constellation } = body;
      if (!messier_number && !ngc_number && !common_name) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Provide at least one identifier.' }) };
      }
      const [obj] = await sql`
        INSERT INTO objects (messier_number, ngc_number, common_name, object_type, constellation, notes)
        VALUES (${messier_number || null}, ${ngc_number || null}, ${common_name || null},
                ${object_type || null}, ${constellation || null}, NULL)
        RETURNING id
      `;
      return {
        statusCode: 201,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: obj.id }),
      };
    } catch (err) {
      console.error('api-objects POST error:', err);
      return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
  }

  // GET — return all objects with aggregated stats
  try {
    const objects = await sql`
      SELECT
        o.id, o.messier_number, o.ngc_number, o.common_name, o.object_type, o.constellation, o.notes,
        COUNT(DISTINCT s.id)::int       AS session_count,
        COUNT(DISTINCT p.id)::int       AS photo_count,
        COALESCE(SUM(s.integration_minutes), 0)::int AS total_minutes,
        MAX(s.date_taken)               AS last_imaged
      FROM objects o
      LEFT JOIN sessions s ON s.object_id = o.id
      LEFT JOIN photos p ON p.session_id = s.id
      GROUP BY o.id
      ORDER BY
        o.messier_number ASC NULLS LAST,
        o.ngc_number ASC NULLS LAST
    `;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ objects }),
    };
  } catch (err) {
    console.error('api-objects GET error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
