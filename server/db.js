import Database from 'better-sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.RAILWAY_VOLUME_MOUNT_PATH || join(__dirname, '..');
const db = new Database(join(dataDir, 'vm-tipset.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_admin INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS group_predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    group_name TEXT NOT NULL,
    match_index INTEGER NOT NULL,
    home_goals INTEGER,
    away_goals INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, group_name, match_index)
  );

  CREATE TABLE IF NOT EXISTS knockout_predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    match_id TEXT NOT NULL,
    home_goals INTEGER,
    away_goals INTEGER,
    penalty_winner TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, match_id)
  );

  CREATE TABLE IF NOT EXISTS admin_group_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_name TEXT NOT NULL,
    match_index INTEGER NOT NULL,
    home_goals INTEGER,
    away_goals INTEGER,
    UNIQUE(group_name, match_index)
  );

  CREATE TABLE IF NOT EXISTS admin_knockout_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id TEXT NOT NULL UNIQUE,
    home_goals INTEGER,
    away_goals INTEGER,
    penalty_winner TEXT
  );

  CREATE TABLE IF NOT EXISTS top_scorer_predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    player_name TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS admin_top_scorer (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_name TEXT
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS bonus_predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    first_red_card_nation TEXT,
    golden_glove TEXT,
    tiebreaker INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS admin_bonus (
    id INTEGER PRIMARY KEY,
    first_red_card_nation TEXT,
    golden_glove TEXT,
    tiebreaker INTEGER
  );
`);

try { db.exec('ALTER TABLE knockout_predictions ADD COLUMN penalty_winner TEXT'); } catch(e) {}
try { db.exec('ALTER TABLE admin_knockout_results ADD COLUMN penalty_winner TEXT'); } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'Spelare'"); } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN display_name TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN username TEXT"); } catch(e) {}
try { db.exec("UPDATE users SET username = name WHERE username IS NULL"); } catch(e) {}
try { db.exec("UPDATE users SET display_name = name WHERE display_name IS NULL"); } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN org TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE bonus_predictions ADD COLUMN tiebreaker INTEGER"); } catch(e) {}
try { db.exec("ALTER TABLE admin_bonus ADD COLUMN tiebreaker INTEGER"); } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN deleted_at TEXT"); } catch(e) {}

db.exec(`
  CREATE TABLE IF NOT EXISTS bonus_overrides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    field TEXT NOT NULL,
    awarded INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, field)
  );
`);

import bcrypt from 'bcryptjs';
const adminExists = db.prepare('SELECT id FROM users WHERE is_admin = 1').get();
if (!adminExists) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare("INSERT INTO users (name, password_hash, is_admin, role) VALUES ('Admin', ?, 1, 'Ledare')").run(hash);
}

export default db;
