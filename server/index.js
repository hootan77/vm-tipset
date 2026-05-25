import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';
import { computeBracketFromData } from './bracket.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json());

// ── Auth ──

app.post('/api/register', (req, res) => {
  const { displayName, username, password } = req.body;
  if (!displayName || !username || !password) return res.status(400).json({ error: 'Alla fält krävs' });
  if (displayName.length < 2) return res.status(400).json({ error: 'Namn måste vara minst 2 tecken' });
  if (username.length < 2) return res.status(400).json({ error: 'Användarnamn måste vara minst 2 tecken' });
  if (password.length < 4) return res.status(400).json({ error: 'Lösenord måste vara minst 4 tecken' });

  const existing = db.prepare('SELECT id FROM users WHERE username = ? OR name = ?').get(username, username);
  if (existing) return res.status(409).json({ error: 'Användarnamnet är redan taget' });

  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO users (name, display_name, username, password_hash, role) VALUES (?, ?, ?, ?, ?)').run(displayName, displayName, username, hash, 'Spelare');
  res.json({ id: result.lastInsertRowid, name: displayName, isAdmin: false, role: 'Spelare' });
});

app.post('/api/login', (req, res) => {
  const { name, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ? OR name = ?').get(name, name);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Fel användarnamn eller lösenord' });
  }
  res.json({ id: user.id, name: user.display_name || user.name, isAdmin: !!user.is_admin, role: user.role || 'Spelare', org: user.org || null });
});

app.post('/api/users/:userId/role', (req, res) => {
  const { role } = req.body;
  const validRoles = ['Spelare', 'Ledare', 'Förälder', 'Syskon'];
  if (!validRoles.includes(role)) return res.status(400).json({ error: 'Ogiltig roll' });
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.userId);
  res.json({ ok: true });
});

app.post('/api/users/:userId/org', (req, res) => {
  const { org } = req.body;
  const validOrgs = ['Enskede', 'QBank', ''];
  if (!validOrgs.includes(org)) return res.status(400).json({ error: 'Ogiltig organisation' });
  db.prepare('UPDATE users SET org = ? WHERE id = ?').run(org || null, req.params.userId);
  res.json({ ok: true });
});

// ── Group predictions ──

app.get('/api/predictions/:userId/groups', (req, res) => {
  const rows = db.prepare('SELECT group_name, match_index, home_goals, away_goals FROM group_predictions WHERE user_id = ?')
    .all(req.params.userId);
  const result = {};
  for (const row of rows) {
    if (!result[row.group_name]) result[row.group_name] = {};
    result[row.group_name][row.match_index] = { homeGoals: row.home_goals, awayGoals: row.away_goals };
  }
  res.json(result);
});

app.post('/api/predictions/:userId/groups', (req, res) => {
  const { group, matchIndex, homeGoals, awayGoals } = req.body;
  const userId = parseInt(req.params.userId);
  const hg = homeGoals === null || homeGoals === '' ? null : parseInt(homeGoals);
  const ag = awayGoals === null || awayGoals === '' ? null : parseInt(awayGoals);

  db.prepare(`
    INSERT INTO group_predictions (user_id, group_name, match_index, home_goals, away_goals)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(user_id, group_name, match_index)
    DO UPDATE SET home_goals = excluded.home_goals, away_goals = excluded.away_goals
  `).run(userId, group, matchIndex, hg, ag);

  res.json({ ok: true });
});

// ── Knockout predictions ──

app.get('/api/predictions/:userId/knockout', (req, res) => {
  const rows = db.prepare('SELECT match_id, home_goals, away_goals, penalty_winner FROM knockout_predictions WHERE user_id = ?')
    .all(req.params.userId);
  const result = {};
  for (const row of rows) {
    result[row.match_id] = { homeGoals: row.home_goals, awayGoals: row.away_goals, penaltyWinner: row.penalty_winner };
  }
  res.json(result);
});

app.post('/api/predictions/:userId/knockout', (req, res) => {
  const { matchId, homeGoals, awayGoals, penaltyWinner } = req.body;
  const userId = parseInt(req.params.userId);
  const hg = homeGoals === null || homeGoals === '' ? null : parseInt(homeGoals);
  const ag = awayGoals === null || awayGoals === '' ? null : parseInt(awayGoals);

  db.prepare(`
    INSERT INTO knockout_predictions (user_id, match_id, home_goals, away_goals, penalty_winner)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(user_id, match_id)
    DO UPDATE SET home_goals = excluded.home_goals, away_goals = excluded.away_goals, penalty_winner = excluded.penalty_winner
  `).run(userId, matchId, hg, ag, penaltyWinner || null);

  res.json({ ok: true });
});

// ── Admin results ──

app.get('/api/admin/groups', (_req, res) => {
  const rows = db.prepare('SELECT group_name, match_index, home_goals, away_goals FROM admin_group_results').all();
  const result = {};
  for (const row of rows) {
    if (!result[row.group_name]) result[row.group_name] = {};
    result[row.group_name][row.match_index] = { homeGoals: row.home_goals, awayGoals: row.away_goals };
  }
  res.json(result);
});

app.post('/api/admin/groups', (req, res) => {
  const { group, matchIndex, homeGoals, awayGoals } = req.body;
  const hg = homeGoals === null || homeGoals === '' ? null : parseInt(homeGoals);
  const ag = awayGoals === null || awayGoals === '' ? null : parseInt(awayGoals);

  db.prepare(`
    INSERT INTO admin_group_results (group_name, match_index, home_goals, away_goals)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(group_name, match_index)
    DO UPDATE SET home_goals = excluded.home_goals, away_goals = excluded.away_goals
  `).run(group, matchIndex, hg, ag);

  res.json({ ok: true });
});

app.get('/api/admin/knockout', (_req, res) => {
  const rows = db.prepare('SELECT match_id, home_goals, away_goals, penalty_winner FROM admin_knockout_results').all();
  const result = {};
  for (const row of rows) {
    result[row.match_id] = { homeGoals: row.home_goals, awayGoals: row.away_goals, penaltyWinner: row.penalty_winner };
  }
  res.json(result);
});

app.post('/api/admin/knockout', (req, res) => {
  const { matchId, homeGoals, awayGoals, penaltyWinner } = req.body;
  const hg = homeGoals === null || homeGoals === '' ? null : parseInt(homeGoals);
  const ag = awayGoals === null || awayGoals === '' ? null : parseInt(awayGoals);

  db.prepare(`
    INSERT INTO admin_knockout_results (match_id, home_goals, away_goals, penalty_winner)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(match_id)
    DO UPDATE SET home_goals = excluded.home_goals, away_goals = excluded.away_goals, penalty_winner = excluded.penalty_winner
  `).run(matchId, hg, ag, penaltyWinner || null);

  res.json({ ok: true });
});

// ── Leaderboard ──

function getTeamsInRound(bracket, round) {
  const teams = new Set();
  if (!bracket?.[round]) return teams;
  for (const match of bracket[round]) {
    if (match.home) teams.add(match.home);
    if (match.away) teams.add(match.away);
  }
  return teams;
}

app.get('/api/leaderboard', (_req, res) => {
  const users = db.prepare("SELECT id, name, display_name, role, org FROM users WHERE is_admin = 0").all();
  const adminGroupRows = db.prepare('SELECT group_name, match_index, home_goals, away_goals FROM admin_group_results').all();
  const adminKnockoutRows = db.prepare('SELECT match_id, home_goals, away_goals, penalty_winner FROM admin_knockout_results').all();

  const adminGroupMap = {};
  for (const r of adminGroupRows) {
    if (!adminGroupMap[r.group_name]) adminGroupMap[r.group_name] = {};
    adminGroupMap[r.group_name][r.match_index] = { homeGoals: r.home_goals, awayGoals: r.away_goals };
  }

  const adminBracket = computeBracketFromData(adminGroupRows, adminKnockoutRows);

  const leaderboard = [];

  for (const user of users) {
    const userGroupRows = db.prepare('SELECT group_name, match_index, home_goals, away_goals FROM group_predictions WHERE user_id = ?').all(user.id);
    const userKnockoutRows = db.prepare('SELECT match_id, home_goals, away_goals, penalty_winner FROM knockout_predictions WHERE user_id = ?').all(user.id);

    let groupPoints = 0;
    let exactResults = 0;
    let correctOutcomes = 0;

    for (const pred of userGroupRows) {
      const actual = adminGroupMap[pred.group_name]?.[pred.match_index];
      if (!actual || actual.homeGoals == null || actual.awayGoals == null) continue;
      if (pred.home_goals == null || pred.away_goals == null) continue;

      if (pred.home_goals === actual.homeGoals && pred.away_goals === actual.awayGoals) {
        groupPoints += 5;
        exactResults++;
      } else {
        const predSign = Math.sign(pred.home_goals - pred.away_goals);
        const actSign = Math.sign(actual.homeGoals - actual.awayGoals);
        if (predSign === actSign) {
          groupPoints += 2;
          correctOutcomes++;
        }
      }
    }

    let knockoutPoints = 0;

    const adminKnockoutMap = {};
    for (const r of adminKnockoutRows) {
      adminKnockoutMap[r.match_id] = { homeGoals: r.home_goals, awayGoals: r.away_goals };
    }
    for (const pred of userKnockoutRows) {
      const actual = adminKnockoutMap[pred.match_id];
      if (!actual || actual.homeGoals == null || actual.awayGoals == null) continue;
      if (pred.home_goals == null || pred.away_goals == null) continue;
      if (pred.home_goals === actual.homeGoals && pred.away_goals === actual.awayGoals) {
        knockoutPoints += 5;
        exactResults++;
      } else {
        const predSign = Math.sign(pred.home_goals - pred.away_goals);
        const actSign = Math.sign(actual.homeGoals - actual.awayGoals);
        if (predSign === actSign) {
          knockoutPoints += 2;
          correctOutcomes++;
        }
      }
    }

    const userBracket = computeBracketFromData(userGroupRows, userKnockoutRows);
    const roundsToScore = ['r16', 'qf', 'sf', 'final'];
    for (const round of roundsToScore) {
      const userTeams = getTeamsInRound(userBracket, round);
      const adminTeams = getTeamsInRound(adminBracket, round);
      if (adminTeams.size === 0) continue;
      for (const team of userTeams) {
        if (adminTeams.has(team)) knockoutPoints += 5;
      }
    }

    const totalPredictions = userGroupRows.filter(p => p.home_goals != null && p.away_goals != null).length;

    leaderboard.push({
      id: user.id,
      name: user.display_name || user.name,
      role: user.role || 'Spelare',
      org: user.org || null,
      groupPoints,
      knockoutPoints,
      total: groupPoints + knockoutPoints,
      exactResults,
      correctOutcomes,
      totalPredictions,
    });
  }

  leaderboard.sort((a, b) => b.total - a.total || b.exactResults - a.exactResults);
  res.json(leaderboard);
});

// ── Top scorer ──

app.get('/api/predictions/:userId/top-scorer', (req, res) => {
  const row = db.prepare('SELECT player_name FROM top_scorer_predictions WHERE user_id = ?').get(req.params.userId);
  res.json({ playerName: row?.player_name || '' });
});

app.post('/api/predictions/:userId/top-scorer', (req, res) => {
  const { playerName } = req.body;
  db.prepare(`
    INSERT INTO top_scorer_predictions (user_id, player_name) VALUES (?, ?)
    ON CONFLICT(user_id) DO UPDATE SET player_name = excluded.player_name
  `).run(parseInt(req.params.userId), playerName || '');
  res.json({ ok: true });
});

app.get('/api/admin/top-scorer', (_req, res) => {
  const row = db.prepare('SELECT player_name FROM admin_top_scorer WHERE id = 1').get();
  res.json({ playerName: row?.player_name || '' });
});

app.post('/api/admin/top-scorer', (req, res) => {
  const { playerName } = req.body;
  db.prepare(`
    INSERT INTO admin_top_scorer (id, player_name) VALUES (1, ?)
    ON CONFLICT(id) DO UPDATE SET player_name = excluded.player_name
  `).run(playerName || '');
  res.json({ ok: true });
});

// ── Lock / Settings ──

app.get('/api/settings', (_req, res) => {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'locked'").get();
  res.json({ locked: row?.value === '1' });
});

app.post('/api/admin/lock', (req, res) => {
  const { locked } = req.body;
  db.prepare(`
    INSERT INTO settings (key, value) VALUES ('locked', ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(locked ? '1' : '0');
  res.json({ ok: true, locked: !!locked });
});

// ── Users list (for admin) ──

app.get('/api/users', (_req, res) => {
  const users = db.prepare('SELECT id, name, display_name, username, is_admin, role, org, created_at FROM users').all();
  res.json(users.map(u => ({ ...u, name: u.display_name || u.name, isAdmin: !!u.is_admin, role: u.role || 'Spelare', org: u.org || null })));
});

app.post('/api/users/:id/make-admin', (req, res) => {
  db.prepare('UPDATE users SET is_admin = 1 WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

app.post('/api/users/:id/password', (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 4) return res.status(400).json({ error: 'Lösenord måste vara minst 4 tecken' });
  const hash = bcrypt.hashSync(password, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, req.params.id);
  res.json({ ok: true });
});

app.get('/api/users/:id/predictions', (req, res) => {
  const userId = req.params.id;
  const groups = db.prepare('SELECT group_name, match_index, home_goals, away_goals FROM group_predictions WHERE user_id = ?').all(userId);
  const knockout = db.prepare('SELECT match_id, home_goals, away_goals FROM knockout_predictions WHERE user_id = ?').all(userId);
  const topScorer = db.prepare('SELECT player_name FROM top_scorer_predictions WHERE user_id = ?').get(userId);

  const groupMap = {};
  for (const r of groups) {
    if (!groupMap[r.group_name]) groupMap[r.group_name] = {};
    groupMap[r.group_name][r.match_index] = { homeGoals: r.home_goals, awayGoals: r.away_goals };
  }
  const knockoutMap = {};
  for (const r of knockout) {
    knockoutMap[r.match_id] = { homeGoals: r.home_goals, awayGoals: r.away_goals };
  }
  res.json({ groups: groupMap, knockout: knockoutMap, topScorer: topScorer?.player_name || '' });
});

const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3456;
app.listen(PORT, () => {
  console.log(`VM-tipset running on port ${PORT}`);
});
