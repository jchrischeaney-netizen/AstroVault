const { getDatabase } = require('@netlify/database');

let _db;
function getDb() {
  if (!_db) _db = getDatabase();
  return _db;
}

module.exports = { getDb };
