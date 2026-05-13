from flask import Flask, render_template, request, jsonify, send_from_directory
import sqlite3
import os
import uuid

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads')
THUMB_DIR = os.path.join(BASE_DIR, 'thumbnails')
DB_PATH = os.path.join(BASE_DIR, 'astrovault.db')
THUMB_SIZE = (600, 600)
ALLOWED = {'jpg', 'jpeg', 'png', 'tif', 'tiff', 'webp', 'bmp'}

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(THUMB_DIR, exist_ok=True)

# (messier_num, ngc_num, common_name, object_type, constellation)
MESSIER_CATALOG = [
    (1,   1952,  "Crab Nebula",            "Supernova Remnant", "Taurus"),
    (2,   7089,  None,                     "Globular Cluster",  "Aquarius"),
    (3,   5272,  None,                     "Globular Cluster",  "Canes Venatici"),
    (4,   6121,  None,                     "Globular Cluster",  "Scorpius"),
    (5,   5904,  None,                     "Globular Cluster",  "Serpens"),
    (6,   6405,  "Butterfly Cluster",      "Open Cluster",      "Scorpius"),
    (7,   6475,  "Ptolemy Cluster",        "Open Cluster",      "Scorpius"),
    (8,   6523,  "Lagoon Nebula",          "Nebula",            "Sagittarius"),
    (9,   6333,  None,                     "Globular Cluster",  "Ophiuchus"),
    (10,  6254,  None,                     "Globular Cluster",  "Ophiuchus"),
    (11,  6705,  "Wild Duck Cluster",      "Open Cluster",      "Scutum"),
    (12,  6218,  None,                     "Globular Cluster",  "Ophiuchus"),
    (13,  6205,  "Hercules Cluster",       "Globular Cluster",  "Hercules"),
    (14,  6402,  None,                     "Globular Cluster",  "Ophiuchus"),
    (15,  7078,  None,                     "Globular Cluster",  "Pegasus"),
    (16,  6611,  "Eagle Nebula",           "Nebula",            "Serpens"),
    (17,  6618,  "Omega Nebula",           "Nebula",            "Sagittarius"),
    (18,  6613,  None,                     "Open Cluster",      "Sagittarius"),
    (19,  6273,  None,                     "Globular Cluster",  "Ophiuchus"),
    (20,  6514,  "Trifid Nebula",          "Nebula",            "Sagittarius"),
    (21,  6531,  None,                     "Open Cluster",      "Sagittarius"),
    (22,  6656,  "Sagittarius Cluster",    "Globular Cluster",  "Sagittarius"),
    (23,  6494,  None,                     "Open Cluster",      "Sagittarius"),
    (24,  None,  "Sagittarius Star Cloud", "Star Cloud",        "Sagittarius"),
    (25,  None,  None,                     "Open Cluster",      "Sagittarius"),
    (26,  6694,  None,                     "Open Cluster",      "Scutum"),
    (27,  6853,  "Dumbbell Nebula",        "Planetary Nebula",  "Vulpecula"),
    (28,  6626,  None,                     "Globular Cluster",  "Sagittarius"),
    (29,  6913,  None,                     "Open Cluster",      "Cygnus"),
    (30,  7099,  None,                     "Globular Cluster",  "Capricornus"),
    (31,  224,   "Andromeda Galaxy",       "Galaxy",            "Andromeda"),
    (32,  221,   None,                     "Galaxy",            "Andromeda"),
    (33,  598,   "Triangulum Galaxy",      "Galaxy",            "Triangulum"),
    (34,  1039,  None,                     "Open Cluster",      "Perseus"),
    (35,  2168,  None,                     "Open Cluster",      "Gemini"),
    (36,  1960,  None,                     "Open Cluster",      "Auriga"),
    (37,  2099,  None,                     "Open Cluster",      "Auriga"),
    (38,  1912,  None,                     "Open Cluster",      "Auriga"),
    (39,  7092,  None,                     "Open Cluster",      "Cygnus"),
    (40,  None,  "Winnecke 4",             "Double Star",       "Ursa Major"),
    (41,  2287,  None,                     "Open Cluster",      "Canis Major"),
    (42,  1976,  "Orion Nebula",           "Nebula",            "Orion"),
    (43,  1982,  "De Mairan's Nebula",     "Nebula",            "Orion"),
    (44,  2632,  "Beehive Cluster",        "Open Cluster",      "Cancer"),
    (45,  None,  "Pleiades",               "Open Cluster",      "Taurus"),
    (46,  2437,  None,                     "Open Cluster",      "Puppis"),
    (47,  2422,  None,                     "Open Cluster",      "Puppis"),
    (48,  2548,  None,                     "Open Cluster",      "Hydra"),
    (49,  4472,  None,                     "Galaxy",            "Virgo"),
    (50,  2323,  None,                     "Open Cluster",      "Monoceros"),
    (51,  5194,  "Whirlpool Galaxy",       "Galaxy",            "Canes Venatici"),
    (52,  7654,  None,                     "Open Cluster",      "Cassiopeia"),
    (53,  5024,  None,                     "Globular Cluster",  "Coma Berenices"),
    (54,  6715,  None,                     "Globular Cluster",  "Sagittarius"),
    (55,  6809,  None,                     "Globular Cluster",  "Sagittarius"),
    (56,  6779,  None,                     "Globular Cluster",  "Lyra"),
    (57,  6720,  "Ring Nebula",            "Planetary Nebula",  "Lyra"),
    (58,  4579,  None,                     "Galaxy",            "Virgo"),
    (59,  4621,  None,                     "Galaxy",            "Virgo"),
    (60,  4649,  None,                     "Galaxy",            "Virgo"),
    (61,  4303,  None,                     "Galaxy",            "Virgo"),
    (62,  6266,  None,                     "Globular Cluster",  "Ophiuchus"),
    (63,  5055,  "Sunflower Galaxy",       "Galaxy",            "Canes Venatici"),
    (64,  4826,  "Black Eye Galaxy",       "Galaxy",            "Coma Berenices"),
    (65,  3623,  None,                     "Galaxy",            "Leo"),
    (66,  3627,  None,                     "Galaxy",            "Leo"),
    (67,  2682,  None,                     "Open Cluster",      "Cancer"),
    (68,  4590,  None,                     "Globular Cluster",  "Hydra"),
    (69,  6637,  None,                     "Globular Cluster",  "Sagittarius"),
    (70,  6681,  None,                     "Globular Cluster",  "Sagittarius"),
    (71,  6838,  None,                     "Globular Cluster",  "Sagitta"),
    (72,  6981,  None,                     "Globular Cluster",  "Aquarius"),
    (73,  6994,  None,                     "Asterism",          "Aquarius"),
    (74,  628,   "Phantom Galaxy",         "Galaxy",            "Pisces"),
    (75,  6864,  None,                     "Globular Cluster",  "Sagittarius"),
    (76,  650,   "Little Dumbbell Nebula", "Planetary Nebula",  "Perseus"),
    (77,  1068,  "Cetus A",                "Galaxy",            "Cetus"),
    (78,  2068,  None,                     "Reflection Nebula", "Orion"),
    (79,  1904,  None,                     "Globular Cluster",  "Lepus"),
    (80,  6093,  None,                     "Globular Cluster",  "Scorpius"),
    (81,  3031,  "Bode's Galaxy",          "Galaxy",            "Ursa Major"),
    (82,  3034,  "Cigar Galaxy",           "Galaxy",            "Ursa Major"),
    (83,  5236,  "Southern Pinwheel",      "Galaxy",            "Hydra"),
    (84,  4374,  None,                     "Galaxy",            "Virgo"),
    (85,  4382,  None,                     "Galaxy",            "Coma Berenices"),
    (86,  4406,  None,                     "Galaxy",            "Virgo"),
    (87,  4486,  "Virgo A",                "Galaxy",            "Virgo"),
    (88,  4501,  None,                     "Galaxy",            "Coma Berenices"),
    (89,  4552,  None,                     "Galaxy",            "Virgo"),
    (90,  4569,  None,                     "Galaxy",            "Virgo"),
    (91,  4548,  None,                     "Galaxy",            "Coma Berenices"),
    (92,  6341,  None,                     "Globular Cluster",  "Hercules"),
    (93,  2447,  None,                     "Open Cluster",      "Puppis"),
    (94,  4736,  "Cat's Eye Galaxy",       "Galaxy",            "Canes Venatici"),
    (95,  3351,  None,                     "Galaxy",            "Leo"),
    (96,  3368,  None,                     "Galaxy",            "Leo"),
    (97,  3587,  "Owl Nebula",             "Planetary Nebula",  "Ursa Major"),
    (98,  4192,  None,                     "Galaxy",            "Coma Berenices"),
    (99,  4254,  "Coma Pinwheel",          "Galaxy",            "Coma Berenices"),
    (100, 4321,  None,                     "Galaxy",            "Coma Berenices"),
    (101, 5457,  "Pinwheel Galaxy",        "Galaxy",            "Ursa Major"),
    (102, 5866,  "Spindle Galaxy",         "Galaxy",            "Draco"),
    (103, 581,   None,                     "Open Cluster",      "Cassiopeia"),
    (104, 4594,  "Sombrero Galaxy",        "Galaxy",            "Virgo"),
    (105, 3379,  None,                     "Galaxy",            "Leo"),
    (106, 4258,  None,                     "Galaxy",            "Canes Venatici"),
    (107, 6171,  None,                     "Globular Cluster",  "Ophiuchus"),
    (108, 3556,  "Surfboard Galaxy",       "Galaxy",            "Ursa Major"),
    (109, 3992,  None,                     "Galaxy",            "Ursa Major"),
    (110, 205,   None,                     "Galaxy",            "Andromeda"),
]

# Popular NGC objects without Messier numbers
# (ngc_num, common_name, object_type, constellation)
NGC_EXTRA_CATALOG = [
    (869,  "Double Cluster h Per",     "Open Cluster",      "Perseus"),
    (884,  "Double Cluster Chi Per",   "Open Cluster",      "Perseus"),
    (891,  None,                       "Galaxy",            "Andromeda"),
    (1499, "California Nebula",        "Emission Nebula",   "Perseus"),
    (1502, "Kemble's Cascade",         "Open Cluster",      "Camelopardalis"),
    (1977, "Running Man Nebula",       "Reflection Nebula", "Orion"),
    (2237, "Rosette Nebula",           "Emission Nebula",   "Monoceros"),
    (2244, "Rosette Cluster",          "Open Cluster",      "Monoceros"),
    (2264, "Cone Nebula",              "Emission Nebula",   "Monoceros"),
    (2359, "Thor's Helmet",            "Emission Nebula",   "Canis Major"),
    (2392, "Eskimo Nebula",            "Planetary Nebula",  "Gemini"),
    (3372, "Eta Carinae Nebula",       "Emission Nebula",   "Carina"),
    (3532, "Wishing Well Cluster",     "Open Cluster",      "Carina"),
    (3628, "Hamburger Galaxy",         "Galaxy",            "Leo"),
    (4038, "Antennae Galaxies",        "Galaxy",            "Corvus"),
    (4244, "Silver Needle Galaxy",     "Galaxy",            "Canes Venatici"),
    (4449, None,                       "Galaxy",            "Canes Venatici"),
    (4565, "Needle Galaxy",            "Galaxy",            "Coma Berenices"),
    (4631, "Whale Galaxy",             "Galaxy",            "Canes Venatici"),
    (5128, "Centaurus A",              "Galaxy",            "Centaurus"),
    (5139, "Omega Centauri",           "Globular Cluster",  "Centaurus"),
    (5907, "Splinter Galaxy",          "Galaxy",            "Draco"),
    (6188, "Fighting Dragons Nebula",  "Emission Nebula",   "Ara"),
    (6334, "Cat's Paw Nebula",         "Emission Nebula",   "Scorpius"),
    (6357, "Lobster Nebula",           "Emission Nebula",   "Scorpius"),
    (6822, "Barnard's Galaxy",         "Galaxy",            "Sagittarius"),
    (6888, "Crescent Nebula",          "Emission Nebula",   "Cygnus"),
    (6960, "Western Veil Nebula",      "Supernova Remnant", "Cygnus"),
    (6992, "Eastern Veil Nebula",      "Supernova Remnant", "Cygnus"),
    (6995, "Bat Nebula",               "Supernova Remnant", "Cygnus"),
    (7000, "North America Nebula",     "Emission Nebula",   "Cygnus"),
    (7023, "Iris Nebula",              "Reflection Nebula", "Cepheus"),
    (7293, "Helix Nebula",             "Planetary Nebula",  "Aquarius"),
    (7331, None,                       "Galaxy",            "Pegasus"),
    (7380, "Wizard Nebula",            "Emission Nebula",   "Cepheus"),
    (7479, None,                       "Galaxy",            "Pegasus"),
    (7635, "Bubble Nebula",            "Emission Nebula",   "Cassiopeia"),
    (7789, "Caroline's Rose",          "Open Cluster",      "Cassiopeia"),
]


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS objects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            messier_number INTEGER,
            ngc_number INTEGER,
            common_name TEXT,
            object_type TEXT,
            constellation TEXT,
            notes TEXT
        );
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            object_id INTEGER NOT NULL,
            date_taken TEXT,
            integration_minutes INTEGER DEFAULT 0,
            telescope TEXT,
            camera TEXT,
            notes TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (object_id) REFERENCES objects(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS photos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER NOT NULL,
            filename TEXT NOT NULL,
            thumbnail TEXT,
            original_name TEXT,
            is_primary INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
        );
    """)

    cur = conn.execute("SELECT COUNT(*) FROM objects WHERE messier_number IS NOT NULL")
    if cur.fetchone()[0] == 0:
        conn.executemany(
            "INSERT INTO objects (messier_number, ngc_number, common_name, object_type, constellation) VALUES (?,?,?,?,?)",
            MESSIER_CATALOG,
        )
    cur = conn.execute("SELECT COUNT(*) FROM objects WHERE ngc_number IS NOT NULL AND messier_number IS NULL")
    if cur.fetchone()[0] == 0:
        conn.executemany(
            "INSERT INTO objects (ngc_number, common_name, object_type, constellation) VALUES (?,?,?,?)",
            NGC_EXTRA_CATALOG,
        )
    conn.commit()
    conn.close()


def make_thumbnail(src, dest):
    try:
        from PIL import Image
        img = Image.open(src)
        img.thumbnail(THUMB_SIZE, Image.LANCZOS)
        if img.mode in ('RGBA', 'P', 'LA'):
            img = img.convert('RGB')
        img.save(dest, 'JPEG', quality=85)
    except Exception:
        import shutil
        shutil.copy2(src, dest)


def allowed(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED


# ── Routes ──────────────────────────────────────────────────────────────────

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/uploads/<path:filename>')
def serve_upload(filename):
    return send_from_directory(UPLOAD_DIR, filename)


@app.route('/thumbnails/<path:filename>')
def serve_thumb(filename):
    return send_from_directory(THUMB_DIR, filename)


@app.route('/api/gallery')
def api_gallery():
    conn = get_db()
    rows = conn.execute("""
        SELECT p.id, p.filename, p.thumbnail, p.original_name,
               s.id as session_id, s.date_taken, s.integration_minutes,
               s.telescope, s.camera, s.notes as session_notes,
               o.id as object_id, o.messier_number, o.ngc_number,
               o.common_name, o.object_type, o.constellation
        FROM photos p
        JOIN sessions s ON p.session_id = s.id
        JOIN objects  o ON s.object_id  = o.id
        ORDER BY s.date_taken DESC NULLS LAST, p.id DESC
    """).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.route('/api/objects')
def api_objects():
    conn = get_db()
    rows = conn.execute("""
        SELECT o.*,
               COUNT(DISTINCT s.id)  AS session_count,
               COUNT(p.id)           AS photo_count,
               MAX(s.date_taken)     AS last_imaged,
               COALESCE(SUM(s.integration_minutes), 0) AS total_minutes
        FROM objects o
        LEFT JOIN sessions s ON o.id = s.object_id
        LEFT JOIN photos   p ON s.id = p.session_id
        GROUP BY o.id
        ORDER BY o.messier_number ASC NULLS LAST, o.ngc_number ASC NULLS LAST
    """).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.route('/api/objects/<int:obj_id>')
def api_object_detail(obj_id):
    conn = get_db()
    obj = conn.execute("SELECT * FROM objects WHERE id=?", (obj_id,)).fetchone()
    if not obj:
        conn.close()
        return jsonify({'error': 'Not found'}), 404

    sessions = conn.execute("""
        SELECT s.* FROM sessions s WHERE s.object_id=? ORDER BY s.date_taken DESC NULLS LAST
    """, (obj_id,)).fetchall()

    sessions_out = []
    for s in sessions:
        photos = conn.execute(
            "SELECT * FROM photos WHERE session_id=? ORDER BY is_primary DESC, id ASC",
            (s['id'],)
        ).fetchall()
        sessions_out.append({**dict(s), 'photos': [dict(p) for p in photos]})

    conn.close()
    return jsonify({**dict(obj), 'sessions': sessions_out})


@app.route('/api/objects', methods=['POST'])
def api_create_object():
    d = request.json or {}
    conn = get_db()
    cur = conn.execute(
        "INSERT INTO objects (messier_number,ngc_number,common_name,object_type,constellation,notes) VALUES (?,?,?,?,?,?)",
        (d.get('messier_number'), d.get('ngc_number'), d.get('common_name'),
         d.get('object_type'), d.get('constellation'), d.get('notes')),
    )
    obj_id = cur.lastrowid
    conn.commit()
    conn.close()
    return jsonify({'id': obj_id}), 201


@app.route('/api/objects/<int:obj_id>', methods=['PUT'])
def api_update_object(obj_id):
    d = request.json or {}
    conn = get_db()
    conn.execute(
        "UPDATE objects SET notes=? WHERE id=?",
        (d.get('notes'), obj_id),
    )
    conn.commit()
    conn.close()
    return jsonify({'ok': True})


@app.route('/api/stats')
def api_stats():
    conn = get_db()
    m = conn.execute("""
        SELECT
            SUM(CASE WHEN o.messier_number IS NOT NULL THEN 1 ELSE 0 END) as total,
            SUM(CASE WHEN o.messier_number IS NOT NULL AND s.cnt > 0 THEN 1 ELSE 0 END) as done
        FROM objects o
        LEFT JOIN (SELECT object_id, COUNT(*) as cnt FROM sessions GROUP BY object_id) s
               ON o.id = s.object_id
    """).fetchone()
    t = conn.execute(
        "SELECT COALESCE(SUM(integration_minutes),0) as m, COUNT(*) as c FROM sessions"
    ).fetchone()
    p = conn.execute("SELECT COUNT(*) as c FROM photos").fetchone()
    by_type = conn.execute("""
        SELECT o.object_type, COUNT(DISTINCT o.id) as count
        FROM objects o JOIN sessions s ON o.id = s.object_id
        GROUP BY o.object_type ORDER BY count DESC
    """).fetchall()
    recent = conn.execute("""
        SELECT s.id, s.date_taken, s.integration_minutes,
               o.id as object_id, o.messier_number, o.ngc_number,
               o.common_name, o.object_type, o.constellation,
               (SELECT p2.thumbnail FROM photos p2
                WHERE p2.session_id = s.id ORDER BY p2.is_primary DESC LIMIT 1) as thumbnail
        FROM sessions s JOIN objects o ON s.object_id = o.id
        ORDER BY s.date_taken DESC NULLS LAST, s.created_at DESC LIMIT 6
    """).fetchall()
    conn.close()
    return jsonify({
        'messier_total': m['total'] or 110,
        'messier_done':  m['done']  or 0,
        'total_minutes': t['m'],
        'total_sessions': t['c'],
        'total_photos': p['c'],
        'by_type': [dict(r) for r in by_type],
        'recent_sessions': [dict(r) for r in recent],
    })


@app.route('/api/sessions', methods=['POST'])
def api_create_session():
    f = request.form
    object_id = f.get('object_id')
    if not object_id:
        return jsonify({'error': 'object_id required'}), 400

    try:
        hrs = float(f.get('integration_hours') or 0)
        mins = int(f.get('integration_minutes_part') or 0)
    except ValueError:
        hrs, mins = 0, 0
    total_minutes = int(hrs * 60) + mins

    conn = get_db()
    cur = conn.execute(
        "INSERT INTO sessions (object_id,date_taken,integration_minutes,telescope,camera,notes) VALUES (?,?,?,?,?,?)",
        (object_id, f.get('date_taken') or None, total_minutes,
         f.get('telescope', ''), f.get('camera', ''), f.get('notes', '')),
    )
    session_id = cur.lastrowid

    first = True
    for file in request.files.getlist('photos'):
        if not file or not file.filename or not allowed(file.filename):
            continue
        ext = file.filename.rsplit('.', 1)[1].lower()
        uid = uuid.uuid4().hex
        fname = f"{uid}.{ext}"
        tname = f"{uid}_thumb.jpg"
        src = os.path.join(UPLOAD_DIR, fname)
        file.save(src)
        make_thumbnail(src, os.path.join(THUMB_DIR, tname))
        conn.execute(
            "INSERT INTO photos (session_id,filename,thumbnail,original_name,is_primary) VALUES (?,?,?,?,?)",
            (session_id, fname, tname, file.filename, 1 if first else 0),
        )
        first = False

    conn.commit()
    conn.close()
    return jsonify({'session_id': session_id}), 201


@app.route('/api/sessions/<int:session_id>', methods=['PUT'])
def api_update_session(session_id):
    d = request.json or {}
    conn = get_db()
    conn.execute(
        "UPDATE sessions SET date_taken=?,integration_minutes=?,telescope=?,camera=?,notes=? WHERE id=?",
        (d.get('date_taken'), d.get('integration_minutes', 0),
         d.get('telescope', ''), d.get('camera', ''), d.get('notes', ''), session_id),
    )
    conn.commit()
    conn.close()
    return jsonify({'ok': True})


@app.route('/api/sessions/<int:session_id>', methods=['DELETE'])
def api_delete_session(session_id):
    conn = get_db()
    photos = conn.execute("SELECT filename,thumbnail FROM photos WHERE session_id=?", (session_id,)).fetchall()
    for p in photos:
        for path in [os.path.join(UPLOAD_DIR, p['filename']), os.path.join(THUMB_DIR, p['thumbnail'])]:
            try:
                os.remove(path)
            except OSError:
                pass
    conn.execute("DELETE FROM sessions WHERE id=?", (session_id,))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})


@app.route('/api/photos/<int:photo_id>', methods=['DELETE'])
def api_delete_photo(photo_id):
    conn = get_db()
    photo = conn.execute("SELECT * FROM photos WHERE id=?", (photo_id,)).fetchone()
    if photo:
        for path in [os.path.join(UPLOAD_DIR, photo['filename']), os.path.join(THUMB_DIR, photo['thumbnail'])]:
            try:
                os.remove(path)
            except OSError:
                pass
        conn.execute("DELETE FROM photos WHERE id=?", (photo_id,))
        conn.commit()
    conn.close()
    return jsonify({'ok': True})


if __name__ == '__main__':
    init_db()
    print("AstroVault running at http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
