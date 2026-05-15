const { getDb } = require('./lib/db');
const { thumbUrl } = require('./lib/blobs');

exports.handler = async () => {
  try {
    const sql = getDb();

    // Messier progress
    const [{ messier_total, messier_done }] = await sql`
      SELECT
        COUNT(*)::int FILTER (WHERE messier_number IS NOT NULL)                    AS messier_total,
        COUNT(DISTINCT s.object_id)::int FILTER (WHERE o.messier_number IS NOT NULL) AS messier_done
      FROM objects o
      LEFT JOIN sessions s ON s.object_id = o.id
    `;

    // Totals
    const [{ total_sessions, total_minutes, total_photos }] = await sql`
      SELECT
        COUNT(DISTINCT s.id)::int   AS total_sessions,
        COALESCE(SUM(s.integration_minutes), 0)::int AS total_minutes,
        COUNT(DISTINCT p.id)::int   AS total_photos
      FROM sessions s
      LEFT JOIN photos p ON p.session_id = s.id
    `;

    // Object-type breakdown (only objects with sessions)
    const by_type = await sql`
      SELECT o.object_type AS type, COUNT(DISTINCT o.id)::int AS count
      FROM objects o
      JOIN sessions s ON s.object_id = o.id
      WHERE o.object_type IS NOT NULL
      GROUP BY o.object_type
      ORDER BY count DESC
    `;

    // Recent 6 sessions
    const recent_raw = await sql`
      SELECT
        s.id, s.object_id, s.date_taken, s.integration_minutes,
        o.messier_number, o.ngc_number, o.common_name, o.object_type, o.constellation
      FROM sessions s
      JOIN objects o ON o.id = s.object_id
      ORDER BY s.date_taken DESC NULLS LAST, s.id DESC
      LIMIT 6
    `;

    const recent_sessions = await Promise.all(recent_raw.map(async s => {
      const [primary] = await sql`
        SELECT blob_key FROM photos
        WHERE session_id = ${s.id} AND is_primary = 1
        LIMIT 1
      `;
      return {
        ...s,
        thumbnail: primary ? thumbUrl(primary.blob_key) : null,
      };
    }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messier_total,
        messier_done,
        total_sessions,
        total_minutes,
        total_photos,
        by_type,
        recent_sessions,
      }),
    };
  } catch (err) {
    console.error('api-stats error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
