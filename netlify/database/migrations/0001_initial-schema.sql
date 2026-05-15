CREATE TABLE IF NOT EXISTS objects (
  id SERIAL PRIMARY KEY,
  messier_number INTEGER,
  ngc_number INTEGER,
  common_name TEXT,
  object_type TEXT,
  constellation TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  object_id INTEGER NOT NULL REFERENCES objects(id) ON DELETE CASCADE,
  date_taken TEXT,
  integration_minutes INTEGER DEFAULT 0,
  telescope TEXT,
  camera TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS photos (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  blob_key TEXT NOT NULL,
  original_name TEXT,
  is_primary INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
