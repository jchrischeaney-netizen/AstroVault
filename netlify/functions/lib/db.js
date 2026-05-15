const { neon } = require('@netlify/neon');

let _sql;
function getDb() {
  if (!_sql) _sql = neon();
  return _sql;
}

module.exports = { getDb };
