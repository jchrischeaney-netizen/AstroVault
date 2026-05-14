const { neon } = require('@netlify/neon');

let _sql;
function getDb() {
  if (!_sql) _sql = neon(process.env.DATABASE_URL);
  return _sql;
}

module.exports = { getDb };
