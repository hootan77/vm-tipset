import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';
import { computeBracketFromData, getMatchWinner, GROUP_SCHEDULE, GROUP_NAMES, TEAMS, calculateStandings, sortStandings, getBestThirdPlaced, buildRoundOf32 } from './bracket.js';
import { KNOCKOUT_SCHEDULE, ROUND_OF_32_BRACKET } from './teams-data.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json());

const LOCK_DATE = new Date('2026-07-10T19:00:00Z'); // 21:00 svensk tid (CEST, UTC+2)

function isTournamentLocked() {
  if (Date.now() >= LOCK_DATE.getTime()) return true;
  const row = db.prepare("SELECT value FROM settings WHERE key = 'locked'").get();
  return row?.value === '1';
}

function isAdminUser(id) {
  if (id == null) return false;
  const row = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(parseInt(id));
  return !!row?.is_admin;
}

// Map incoming field names to DB columns (whitelist — never interpolate raw user input)
const SCORE_COLUMNS = { homeGoals: 'home_goals', awayGoals: 'away_goals', penaltyWinner: 'penalty_winner' };

function coerceScore(field, value) {
  if (field === 'penaltyWinner') return value || null;
  return value === null || value === undefined || value === '' ? null : parseInt(value);
}

// Persist a score change while only touching the column(s) that actually changed.
// This avoids the previous full-row overwrite, which could clobber a freshly-saved
// goal when home/away were filled in quick succession (stale client state race).
function saveScoreRow({ table, keyCols, keyVals, body, hasPenalty }) {
  const placeholders = keyCols.map(() => '?').join(', ');
  const whereClause = keyCols.map(c => `${c} = ?`).join(' AND ');

  // Ensure the row exists (key columns only; score columns default to NULL)
  db.prepare(`INSERT OR IGNORE INTO ${table} (${keyCols.join(', ')}) VALUES (${placeholders})`).run(...keyVals);

  // Determine which fields to write: new style (single { field, value }) or legacy (explicit keys)
  const fields = [];
  if (body.field && SCORE_COLUMNS[body.field]) {
    fields.push([body.field, body.value]);
  } else {
    if ('homeGoals' in body) fields.push(['homeGoals', body.homeGoals]);
    if ('awayGoals' in body) fields.push(['awayGoals', body.awayGoals]);
    if (hasPenalty && 'penaltyWinner' in body) fields.push(['penaltyWinner', body.penaltyWinner]);
  }

  let goalChanged = false;
  for (const [field, value] of fields) {
    const col = SCORE_COLUMNS[field];
    db.prepare(`UPDATE ${table} SET ${col} = ? WHERE ${whereClause}`).run(coerceScore(field, value), ...keyVals);
    if (field === 'homeGoals' || field === 'awayGoals') goalChanged = true;
  }

  // Keep penalty winner consistent: a non-draw (or incomplete) result can't have one
  if (hasPenalty && goalChanged) {
    const row = db.prepare(`SELECT home_goals, away_goals FROM ${table} WHERE ${whereClause}`).get(...keyVals);
    if (!row || row.home_goals == null || row.away_goals == null || row.home_goals !== row.away_goals) {
      db.prepare(`UPDATE ${table} SET penalty_winner = NULL WHERE ${whereClause}`).run(...keyVals);
    }
  }
}

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
  if (!user || user.deleted_at || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Fel användarnamn eller lösenord' });
  }
  res.json({ id: user.id, name: user.display_name || user.name, isAdmin: !!user.is_admin, role: user.role || 'Spelare', org: user.org || null });
});

app.get('/api/me/:id', (req, res) => {
  const user = db.prepare('SELECT id, name, display_name, is_admin, role, org FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, name: user.display_name || user.name, isAdmin: !!user.is_admin, role: user.role || 'Spelare', org: user.org || null });
});

app.post('/api/users/:userId/role', (req, res) => {
  const { role } = req.body;
  const validRoles = ['Spelare', 'Ledare', 'Familj'];
  if (!validRoles.includes(role)) return res.status(400).json({ error: 'Ogiltig roll' });
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.userId);
  res.json({ ok: true });
});

app.post('/api/users/:userId/org', (req, res) => {
  const { orgs } = req.body;
  const validOrgs = ['Enskede', 'QBank', 'Friends', 'MNO'];
  if (!Array.isArray(orgs) || !orgs.every(o => validOrgs.includes(o))) {
    return res.status(400).json({ error: 'Ogiltig organisation' });
  }
  const value = orgs.length ? orgs.join(',') : null;
  db.prepare('UPDATE users SET org = ? WHERE id = ?').run(value, req.params.userId);
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
  if (isTournamentLocked()) return res.status(403).json({ error: 'Tippningen är låst' });
  const userId = parseInt(req.params.userId);
  const { group, matchIndex } = req.body;
  saveScoreRow({
    table: 'group_predictions',
    keyCols: ['user_id', 'group_name', 'match_index'],
    keyVals: [userId, group, matchIndex],
    body: req.body,
    hasPenalty: false,
  });
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
  if (isTournamentLocked()) return res.status(403).json({ error: 'Tippningen är låst' });
  const userId = parseInt(req.params.userId);
  const { matchId } = req.body;
  saveScoreRow({
    table: 'knockout_predictions',
    keyCols: ['user_id', 'match_id'],
    keyVals: [userId, matchId],
    body: req.body,
    hasPenalty: true,
  });
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
  const { group, matchIndex } = req.body;
  saveScoreRow({
    table: 'admin_group_results',
    keyCols: ['group_name', 'match_index'],
    keyVals: [group, matchIndex],
    body: req.body,
    hasPenalty: false,
  });
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
  const { matchId } = req.body;
  saveScoreRow({
    table: 'admin_knockout_results',
    keyCols: ['match_id'],
    keyVals: [matchId],
    body: req.body,
    hasPenalty: true,
  });
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

// Kickoff timestamp — schedule times are CEST (UTC+2)
function kickoffTime(date, time) {
  return new Date(`${date}T${time || '00:00'}:00+02:00`).getTime();
}

// Scheduled entry (date/time/venue) for a knockout match id
function knockoutSchedule(matchId) {
  if (matchId.startsWith('r32_')) return ROUND_OF_32_BRACKET[parseInt(matchId.split('_')[1])];
  return KNOCKOUT_SCHEDULE[matchId];
}
function knockoutDate(matchId) {
  return knockoutSchedule(matchId)?.date;
}
// Absolute kickoff (ms) for a knockout match, using its CEST date+time
function knockoutKickoff(matchId) {
  const s = knockoutSchedule(matchId);
  return s?.date ? kickoffTime(s.date, s.time) : null;
}

// Points for a single match: 5 exact, 2 correct outcome, 0 wrong, null if missing
function scorePair(pHome, pAway, aHome, aAway) {
  if (pHome == null || pAway == null || aHome == null || aAway == null) return null;
  if (pHome === aHome && pAway === aAway) return 5;
  if (Math.sign(pHome - pAway) === Math.sign(aHome - aAway)) return 2;
  return 0;
}

// FIFA-style chronological match numbers 1..72 for the group stage (computed once)
const GROUP_MATCH_NUMBER = (() => {
  const list = [];
  for (const group of GROUP_NAMES) {
    (GROUP_SCHEDULE[group] || []).forEach((m, index) => {
      list.push({ group, index, kickoff: kickoffTime(m.date, m.time) });
    });
  }
  list.sort((a, b) => a.kickoff - b.kickoff || a.group.localeCompare(b.group) || a.index - b.index);
  const map = {};
  list.forEach((e, i) => { map[`${e.group}:${e.index}`] = i + 1; });
  return map;
})();

function knockoutMatchNum(matchId) {
  if (matchId.startsWith('r32_')) return ROUND_OF_32_BRACKET[parseInt(matchId.split('_')[1])]?.matchNum;
  return KNOCKOUT_SCHEDULE[matchId]?.matchNum;
}

// The next match to be decided across group + knockout: the earliest by kickoff time
// that has no admin result yet (match number is a deterministic tiebreak for simultaneous matches).
function computeNextMatch(adminGroupMap, adminBracket, adminKnockoutById) {
  let best = null;
  const consider = (cand) => {
    if (cand.kickoff == null) return;
    if (best === null || cand.kickoff < best.kickoff ||
        (cand.kickoff === best.kickoff && (cand.matchNumber ?? Infinity) < (best.matchNumber ?? Infinity))) {
      best = cand;
    }
  };

  for (const group of GROUP_NAMES) {
    const matches = GROUP_SCHEDULE[group] || [];
    for (let i = 0; i < matches.length; i++) {
      const r = adminGroupMap[group]?.[i];
      if (r && r.homeGoals != null && r.awayGoals != null) continue;
      consider({
        matchNumber: GROUP_MATCH_NUMBER[`${group}:${i}`], type: 'group', round: 'group',
        group, matchIndex: i, home: matches[i].home, away: matches[i].away,
        date: matches[i].date, time: matches[i].time, venue: matches[i].venue,
        kickoff: kickoffTime(matches[i].date, matches[i].time),
      });
    }
  }
  for (const matches of Object.values(adminBracket)) {
    for (const m of matches) {
      const r = adminKnockoutById[m.id];
      if (r && r.home_goals != null && r.away_goals != null) continue;
      const s = knockoutSchedule(m.id);
      consider({
        matchNumber: knockoutMatchNum(m.id), type: 'knockout', round: m.round,
        matchId: m.id, home: m.home, away: m.away, date: s?.date, time: s?.time,
        kickoff: knockoutKickoff(m.id),
      });
    }
  }
  return best;
}

app.get('/api/leaderboard', (_req, res) => {
  const users = db.prepare("SELECT id, name, display_name, role, org FROM users WHERE is_admin = 0 AND deleted_at IS NULL").all();
  const adminGroupRows = db.prepare('SELECT group_name, match_index, home_goals, away_goals FROM admin_group_results').all();
  const adminKnockoutRows = db.prepare('SELECT match_id, home_goals, away_goals, penalty_winner FROM admin_knockout_results').all();

  const adminGroupMap = {};
  for (const r of adminGroupRows) {
    if (!adminGroupMap[r.group_name]) adminGroupMap[r.group_name] = {};
    adminGroupMap[r.group_name][r.match_index] = { homeGoals: r.home_goals, awayGoals: r.away_goals };
  }

  const adminBracket = computeBracketFromData(adminGroupRows, adminKnockoutRows);
  const adminTopScorer = db.prepare('SELECT player_name FROM admin_top_scorer WHERE id = 1').get();
  const adminBonus = db.prepare('SELECT first_red_card_nation, golden_glove, tiebreaker FROM admin_bonus WHERE id = 1').get();

  const adminKnockoutById = {};
  for (const r of adminKnockoutRows) adminKnockoutById[r.match_id] = r;

  const nextMatch = computeNextMatch(adminGroupMap, adminBracket, adminKnockoutById);

  // The last 3 played matches (group + knockout with admin results), chronological
  const playedMatches = [];
  for (const group of GROUP_NAMES) {
    const sched = GROUP_SCHEDULE[group] || [];
    for (let i = 0; i < sched.length; i++) {
      const r = adminGroupMap[group]?.[i];
      if (r && r.homeGoals != null && r.awayGoals != null) {
        playedMatches.push({ type: 'group', group, index: i, kickoff: kickoffTime(sched[i].date, sched[i].time), home: sched[i].home, away: sched[i].away, actual: r });
      }
    }
  }
  for (const matches of Object.values(adminBracket)) {
    for (const m of matches) {
      const r = adminKnockoutById[m.id];
      if (r && r.home_goals != null && r.away_goals != null) {
        playedMatches.push({ type: 'knockout', matchId: m.id, kickoff: knockoutKickoff(m.id) ?? 0, home: m.home, away: m.away, actual: { homeGoals: r.home_goals, awayGoals: r.away_goals } });
      }
    }
  }
  playedMatches.sort((a, b) => a.kickoff - b.kickoff);
  const lastThree = playedMatches.slice(-3);

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

    // Only award knockout team/bonus points if BOTH user has filled all 72 groups AND admin has group results
    const completedGroupPreds = userGroupRows.filter(p => p.home_goals != null && p.away_goals != null).length;
    const completedAdminGroups = adminGroupRows.filter(p => p.home_goals != null && p.away_goals != null).length;
    const allGroupsComplete = completedGroupPreds >= 72 && completedAdminGroups >= 72;

    if (allGroupsComplete) {
      const roundPointsMap = { r32: 5, r16: 5, qf: 10, sf: 15, final: 20 };
      for (const [round, pts] of Object.entries(roundPointsMap)) {
        const userTeams = getTeamsInRound(userBracket, round);
        const adminTeams = getTeamsInRound(adminBracket, round);
        if (adminTeams.size === 0) continue;
        for (const team of userTeams) {
          if (adminTeams.has(team)) knockoutPoints += pts;
        }
      }
    }

    let bonusPoints = 0;

    if (allGroupsComplete) {
      if (adminBracket.final?.[0]) {
        const adminWinner = getMatchWinner(adminBracket.final[0]);
        if (adminWinner && userBracket.final?.[0]) {
          const userWinner = getMatchWinner(userBracket.final[0]);
          if (userWinner === adminWinner) bonusPoints += 50;
        }
      }

      if (adminBracket.bronze?.[0]) {
        const adminBronzeWinner = getMatchWinner(adminBracket.bronze[0]);
        if (adminBronzeWinner && userBracket.bronze?.[0]) {
          const userBronzeWinner = getMatchWinner(userBracket.bronze[0]);
          if (userBronzeWinner === adminBronzeWinner) bonusPoints += 20;
        }
      }
    }

    // Load manual overrides for this user
    const overrideRows = db.prepare('SELECT field, awarded FROM bonus_overrides WHERE user_id = ?').all(user.id);
    const overrides = {};
    for (const r of overrideRows) overrides[r.field] = !!r.awarded;

    const userTopScorer = db.prepare('SELECT player_name FROM top_scorer_predictions WHERE user_id = ?').get(user.id);
    if (overrides.topScorer) {
      bonusPoints += 50;
    } else if (adminTopScorer && adminTopScorer.player_name && userTopScorer?.player_name) {
      if (userTopScorer.player_name.trim().toLowerCase() === adminTopScorer.player_name.trim().toLowerCase()) {
        bonusPoints += 50;
      }
    }

    const userBonus = db.prepare('SELECT first_red_card_nation, golden_glove, tiebreaker FROM bonus_predictions WHERE user_id = ?').get(user.id);
    if (adminBonus && userBonus) {
      if (overrides.firstRedCardNation) {
        bonusPoints += 20;
      } else if (adminBonus.first_red_card_nation && userBonus.first_red_card_nation &&
          userBonus.first_red_card_nation.trim().toLowerCase() === adminBonus.first_red_card_nation.trim().toLowerCase()) {
        bonusPoints += 20;
      }
      if (overrides.goldenGlove) {
        bonusPoints += 40;
      } else if (adminBonus.golden_glove && userBonus.golden_glove &&
          userBonus.golden_glove.trim().toLowerCase() === adminBonus.golden_glove.trim().toLowerCase()) {
        bonusPoints += 40;
      }
    }

    const tiebreakerDiff = (adminBonus?.tiebreaker != null && userBonus?.tiebreaker != null)
      ? Math.abs(userBonus.tiebreaker - adminBonus.tiebreaker)
      : null;

    const filledGroups = userGroupRows.filter(p => p.home_goals != null && p.away_goals != null).length;
    const filledKnockout = userKnockoutRows.filter(p => p.home_goals != null && p.away_goals != null).length;
    let filledBonus = 0;
    if (userTopScorer?.player_name) filledBonus++;
    if (userBonus?.first_red_card_nation) filledBonus++;
    if (userBonus?.golden_glove) filledBonus++;
    if (userBonus?.tiebreaker != null) filledBonus++;
    const totalPredictions = filledGroups + filledKnockout + filledBonus;

    let nextMatchPrediction = null;
    if (nextMatch) {
      const pred = nextMatch.type === 'group'
        ? userGroupRows.find(p => p.group_name === nextMatch.group && p.match_index === nextMatch.matchIndex)
        : userKnockoutRows.find(p => p.match_id === nextMatch.matchId);
      if (pred && pred.home_goals != null && pred.away_goals != null) {
        nextMatchPrediction = { homeGoals: pred.home_goals, awayGoals: pred.away_goals };
      }
    }

    const lastThreePoints = lastThree.map(pm => {
      let pred = null;
      if (pm.type === 'group') {
        pred = userGroupRows.find(p => p.group_name === pm.group && p.match_index === pm.index);
      } else {
        pred = userKnockoutRows.find(p => p.match_id === pm.matchId);
      }
      return scorePair(pred?.home_goals, pred?.away_goals, pm.actual.homeGoals, pm.actual.awayGoals);
    });

    leaderboard.push({
      id: user.id,
      name: user.display_name || user.name,
      role: user.role || 'Spelare',
      org: user.org || null,
      groupPoints,
      knockoutPoints,
      bonusPoints,
      total: groupPoints + knockoutPoints + bonusPoints,
      exactResults,
      correctOutcomes,
      totalPredictions,
      tiebreaker: userBonus?.tiebreaker ?? null,
      tiebreakerDiff,
      nextMatchPrediction,
      lastThreePoints,
    });
  }

  leaderboard.sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    if (b.exactResults !== a.exactResults) return b.exactResults - a.exactResults;
    // Tiebreaker: closest guess wins (lower diff = better)
    const aDiff = a.tiebreakerDiff ?? Infinity;
    const bDiff = b.tiebreakerDiff ?? Infinity;
    return aDiff - bDiff;
  });

  const nextMatchInfo = nextMatch
    ? {
        matchNumber: nextMatch.matchNumber, type: nextMatch.type, round: nextMatch.round,
        group: nextMatch.group ?? null, home: nextMatch.home, away: nextMatch.away,
        date: nextMatch.date, time: nextMatch.time ?? null, venue: nextMatch.venue ?? null,
      }
    : null;

  const lastThreeMatches = lastThree.map(pm => ({
    home: pm.home, away: pm.away,
    homeGoals: pm.actual.homeGoals, awayGoals: pm.actual.awayGoals,
  }));

  res.json({ players: leaderboard, nextMatch: nextMatchInfo, lastThreeMatches, adminTiebreaker: adminBonus?.tiebreaker ?? null });
});

// ── Top scorer ──

app.get('/api/predictions/:userId/top-scorer', (req, res) => {
  const row = db.prepare('SELECT player_name FROM top_scorer_predictions WHERE user_id = ?').get(req.params.userId);
  res.json({ playerName: row?.player_name || '' });
});

app.post('/api/predictions/:userId/top-scorer', (req, res) => {
  if (isTournamentLocked()) return res.status(403).json({ error: 'Tippningen är låst' });
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

// ── Bonus predictions (red card nation, golden glove) ──

app.get('/api/predictions/:userId/bonus', (req, res) => {
  const row = db.prepare('SELECT first_red_card_nation, golden_glove, tiebreaker FROM bonus_predictions WHERE user_id = ?').get(req.params.userId);
  res.json({ firstRedCardNation: row?.first_red_card_nation || '', goldenGlove: row?.golden_glove || '', tiebreaker: row?.tiebreaker ?? null });
});

app.post('/api/predictions/:userId/bonus', (req, res) => {
  if (isTournamentLocked()) return res.status(403).json({ error: 'Tippningen är låst' });
  const { firstRedCardNation, goldenGlove, tiebreaker } = req.body;
  db.prepare(`
    INSERT INTO bonus_predictions (user_id, first_red_card_nation, golden_glove, tiebreaker) VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET first_red_card_nation = excluded.first_red_card_nation, golden_glove = excluded.golden_glove, tiebreaker = excluded.tiebreaker
  `).run(parseInt(req.params.userId), firstRedCardNation || '', goldenGlove || '', tiebreaker != null ? parseInt(tiebreaker) : null);
  res.json({ ok: true });
});

app.get('/api/admin/bonus', (_req, res) => {
  const row = db.prepare('SELECT first_red_card_nation, golden_glove, tiebreaker FROM admin_bonus WHERE id = 1').get();
  res.json({ firstRedCardNation: row?.first_red_card_nation || '', goldenGlove: row?.golden_glove || '', tiebreaker: row?.tiebreaker ?? null });
});

app.post('/api/admin/bonus', (req, res) => {
  const { firstRedCardNation, goldenGlove, tiebreaker } = req.body;
  db.prepare(`
    INSERT INTO admin_bonus (id, first_red_card_nation, golden_glove, tiebreaker) VALUES (1, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET first_red_card_nation = excluded.first_red_card_nation, golden_glove = excluded.golden_glove, tiebreaker = excluded.tiebreaker
  `).run(firstRedCardNation || '', goldenGlove || '', tiebreaker != null ? parseInt(tiebreaker) : null);
  res.json({ ok: true });
});

// ── Admin: find & fix stale knockout penalty winners ──

// A stale penalty winner = a drawn knockout match whose stored penalty_winner
// is no longer one of the two teams currently in that slot (e.g. the player
// changed an earlier result so a different team advanced).
app.get('/api/admin/stale-penalties', (_req, res) => {
  const users = db.prepare("SELECT id, name, display_name FROM users WHERE is_admin = 0 AND deleted_at IS NULL").all();
  const roundLabels = { r32: '16-delsfinal', r16: 'Åttondelsfinal', qf: 'Kvartsfinal', sf: 'Semifinal', final: 'Final', bronze: 'Bronsmatch' };

  const result = [];
  for (const user of users) {
    const groupRows = db.prepare('SELECT group_name, match_index, home_goals, away_goals FROM group_predictions WHERE user_id = ?').all(user.id);
    const knockoutRows = db.prepare('SELECT match_id, home_goals, away_goals, penalty_winner FROM knockout_predictions WHERE user_id = ?').all(user.id);
    const bracket = computeBracketFromData(groupRows, knockoutRows);

    const stale = [];
    for (const [round, matches] of Object.entries(bracket)) {
      for (const m of matches) {
        if (m.home && m.away &&
            m.homeGoals != null && m.awayGoals != null && m.homeGoals === m.awayGoals &&
            m.penaltyWinner && m.penaltyWinner !== m.home && m.penaltyWinner !== m.away) {
          stale.push({
            matchId: m.id, round, roundLabel: roundLabels[round] || round,
            home: m.home, away: m.away, homeGoals: m.homeGoals, awayGoals: m.awayGoals,
            stalePenaltyWinner: m.penaltyWinner,
          });
        }
      }
    }
    if (stale.length) result.push({ userId: user.id, name: user.display_name || user.name, matches: stale });
  }
  res.json({ users: result });
});

// Admin edits a specific player's knockout match (bypasses the lock)
app.post('/api/admin/users/:userId/knockout', (req, res) => {
  const { adminId, matchId } = req.body;
  if (!isAdminUser(adminId)) return res.status(403).json({ error: 'Endast admin' });
  if (!matchId) return res.status(400).json({ error: 'matchId krävs' });
  saveScoreRow({
    table: 'knockout_predictions',
    keyCols: ['user_id', 'match_id'],
    keyVals: [parseInt(req.params.userId), matchId],
    body: req.body,
    hasPenalty: true,
  });
  res.json({ ok: true });
});

// ── Admin: win-probability simulation (Monte Carlo) ──

const KNOCKOUT_ROUND_POINTS = { r32: 5, r16: 5, qf: 10, sf: 15, final: 20 };
const ORG_LIST = ['Alla', 'Enskede', 'QBank', 'Friends', 'MNO'];
const eqi = (a, b) => !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();
const randGoals = () => Math.floor(Math.random() * 4); // 0-3

function teamsInRoundSet(bracket, round) {
  const s = new Set();
  for (const m of bracket[round] || []) { if (m.home) s.add(m.home); if (m.away) s.add(m.away); }
  return s;
}

// Complete the admin facit: known results are fixed, undecided matches get random scorelines.
// `strength` (team -> implied win prob) weights knockout winners when both teams are listed.
function simulateScenario(adminGroupMap, adminKnockoutMap, strength) {
  const groupResults = {};
  for (const group of GROUP_NAMES) {
    groupResults[group] = {};
    const matches = GROUP_SCHEDULE[group].map((m, i) => {
      const known = adminGroupMap[group]?.[i];
      let h, a;
      if (known && known.homeGoals != null && known.awayGoals != null) { h = known.homeGoals; a = known.awayGoals; }
      else { h = randGoals(); a = randGoals(); }
      groupResults[group][i] = { homeGoals: h, awayGoals: a };
      return { home: m.home, away: m.away, homeGoals: h, awayGoals: a };
    });
    groupResults[group]._matches = matches;
  }
  const standings = {};
  for (const group of GROUP_NAMES) {
    standings[group] = sortStandings(calculateStandings(TEAMS[group], groupResults[group]._matches), groupResults[group]._matches);
  }
  const bestThirds = getBestThirdPlaced(standings);
  const r32 = buildRoundOf32(standings, bestThirds);

  const knockoutResults = {};
  const playMatch = (m) => {
    const known = adminKnockoutMap[m.id];
    let h, a, pw = null;
    if (known && known.homeGoals != null && known.awayGoals != null) {
      h = known.homeGoals; a = known.awayGoals; pw = known.penaltyWinner || null;
      if (h === a && pw !== m.home && pw !== m.away) pw = (Math.random() < 0.5 ? m.home : m.away);
    } else {
      const sH = strength?.[m.home], sA = strength?.[m.away];
      if (sH != null && sA != null && sH + sA > 0) {
        // Odds-weighted: choose the winner by relative strength, then a plausible scoreline
        const winner = Math.random() < sH / (sH + sA) ? m.home : m.away;
        if (Math.random() < 0.25) { // decided on penalties
          const g = 1 + Math.floor(Math.random() * 2);
          h = g; a = g; pw = winner;
        } else {
          const wg = 1 + Math.floor(Math.random() * 3);
          const lg = Math.floor(Math.random() * wg);
          if (winner === m.home) { h = wg; a = lg; } else { h = lg; a = wg; }
        }
      } else {
        h = randGoals(); a = randGoals();
      }
    }
    if (h === a && !pw) pw = (Math.random() < 0.5 ? m.home : m.away);
    m.homeGoals = h; m.awayGoals = a; m.penaltyWinner = pw;
    knockoutResults[m.id] = { homeGoals: h, awayGoals: a, penaltyWinner: pw };
  };

  const bracket = { r32 };
  for (const m of r32) playMatch(m);
  let prev = r32;
  for (const rn of ['r16', 'qf', 'sf', 'final']) {
    const next = [];
    for (let i = 0; i < prev.length; i += 2) {
      const home = getMatchWinner(prev[i]);
      const away = i + 1 < prev.length ? getMatchWinner(prev[i + 1]) : null;
      const m = { id: `${rn}_${i / 2}`, round: rn, home, away, homeGoals: null, awayGoals: null, penaltyWinner: null };
      if (home && away) playMatch(m);
      next.push(m);
    }
    bracket[rn] = next;
    prev = next;
  }
  const loser = (mm) => { const w = getMatchWinner(mm); return !w ? null : (w === mm.home ? mm.away : mm.home); };
  const sf = bracket.sf;
  const bm = { id: 'bronze_0', round: 'bronze', home: sf[0] ? loser(sf[0]) : null, away: sf[1] ? loser(sf[1]) : null, homeGoals: null, awayGoals: null, penaltyWinner: null };
  if (bm.home && bm.away) playMatch(bm);
  bracket.bronze = [bm];

  return {
    groupResults, knockoutResults, bracket,
    champion: bracket.final[0] ? getMatchWinner(bracket.final[0]) : null,
    bronzeWinner: (bm.home && bm.away) ? getMatchWinner(bm) : null,
  };
}

app.post('/api/admin/win-probabilities', (req, res) => {
  if (!isAdminUser(req.body.adminId)) return res.status(403).json({ error: 'Endast admin' });
  const sims = Math.min(Math.max(parseInt(req.body.sims) || 2000, 100), 5000);
  // Optional odds-based strengths: { swedishTeamName: impliedProbability }
  const strength = (req.body.odds && typeof req.body.odds === 'object') ? req.body.odds : null;

  const users = db.prepare("SELECT id, name, display_name, org FROM users WHERE is_admin = 0 AND deleted_at IS NULL").all();

  // Known admin facit
  const adminGroupMap = {};
  for (const r of db.prepare('SELECT group_name, match_index, home_goals, away_goals FROM admin_group_results').all()) {
    if (!adminGroupMap[r.group_name]) adminGroupMap[r.group_name] = {};
    adminGroupMap[r.group_name][r.match_index] = { homeGoals: r.home_goals, awayGoals: r.away_goals };
  }
  const adminKnockoutMap = {};
  for (const r of db.prepare('SELECT match_id, home_goals, away_goals, penalty_winner FROM admin_knockout_results').all()) {
    adminKnockoutMap[r.match_id] = { homeGoals: r.home_goals, awayGoals: r.away_goals, penaltyWinner: r.penalty_winner || null };
  }
  const adminTopScorer = db.prepare('SELECT player_name FROM admin_top_scorer WHERE id = 1').get()?.player_name || '';
  const adminBonus = db.prepare('SELECT first_red_card_nation, golden_glove, tiebreaker FROM admin_bonus WHERE id = 1').get() || {};

  // Precompute each player's fixed data (their predictions never change across sims)
  const players = users.map(u => {
    const groupRows = db.prepare('SELECT group_name, match_index, home_goals, away_goals FROM group_predictions WHERE user_id = ?').all(u.id);
    const knockoutRows = db.prepare('SELECT match_id, home_goals, away_goals, penalty_winner FROM knockout_predictions WHERE user_id = ?').all(u.id);
    const ts = db.prepare('SELECT player_name FROM top_scorer_predictions WHERE user_id = ?').get(u.id);
    const bonus = db.prepare('SELECT first_red_card_nation, golden_glove, tiebreaker FROM bonus_predictions WHERE user_id = ?').get(u.id) || {};
    const overrideRows = db.prepare('SELECT field, awarded FROM bonus_overrides WHERE user_id = ?').all(u.id);
    const overrides = {}; for (const r of overrideRows) overrides[r.field] = !!r.awarded;

    const groupPreds = [];
    for (const r of groupRows) if (r.home_goals != null && r.away_goals != null) groupPreds.push({ g: r.group_name, i: r.match_index, h: r.home_goals, a: r.away_goals });
    const knockoutPreds = [];
    for (const r of knockoutRows) if (r.home_goals != null && r.away_goals != null) knockoutPreds.push({ id: r.match_id, h: r.home_goals, a: r.away_goals });

    const bracket = computeBracketFromData(groupRows, knockoutRows);
    const teamsByRound = {};
    for (const round of Object.keys(KNOCKOUT_ROUND_POINTS)) teamsByRound[round] = teamsInRoundSet(bracket, round);

    return {
      id: u.id, name: u.display_name || u.name, org: u.org || null,
      groupPreds, knockoutPreds, teamsByRound,
      groupComplete: groupPreds.length >= 72,
      champion: bracket.final?.[0] ? getMatchWinner(bracket.final[0]) : null,
      bronzeWinner: bracket.bronze?.[0] ? getMatchWinner(bracket.bronze[0]) : null,
      topScorer: ts?.player_name || '', redCard: bonus.first_red_card_nation || '',
      goldenGlove: bonus.golden_glove || '', tiebreaker: bonus.tiebreaker ?? null,
      overrides,
      wins: {}, // per-org fractional wins
      totals: [], // final score in each simulation
    };
  });

  // Distinct player answers to sample an undecided bonus "truth" from
  const distinct = (vals) => [...new Set(vals.filter(Boolean))];
  const tsPool = distinct(players.map(p => p.topScorer));
  const rcPool = distinct(players.map(p => p.redCard));
  const ggPool = distinct(players.map(p => p.goldenGlove));
  const tbPool = players.map(p => p.tiebreaker).filter(v => v != null);
  const pick = (arr) => arr.length ? arr[Math.floor(Math.random() * arr.length)] : null;

  for (const org of ORG_LIST) {
    for (const p of players) p.wins[org] = 0;
  }
  const orgMembers = {};
  for (const org of ORG_LIST) {
    orgMembers[org] = org === 'Alla' ? players : players.filter(p => p.org && p.org.split(',').includes(org));
  }

  const KO_ROUNDS = ['r32', 'r16', 'qf', 'sf', 'final'];
  const roundWins = {}; for (const rn of KO_ROUNDS) roundWins[rn] = {}; // round -> team -> sims won

  for (let s = 0; s < sims; s++) {
    const sc = simulateScenario(adminGroupMap, adminKnockoutMap, strength);
    const adminTeams = {};
    for (const round of Object.keys(KNOCKOUT_ROUND_POINTS)) adminTeams[round] = teamsInRoundSet(sc.bracket, round);

    // Track winners in every knockout round (final winner = world champion)
    for (const rn of KO_ROUNDS) {
      for (const m of sc.bracket[rn] || []) {
        const w = getMatchWinner(m);
        if (w) roundWins[rn][w] = (roundWins[rn][w] || 0) + 1;
      }
    }
    const truth = {
      topScorer: adminTopScorer || pick(tsPool),
      redCard: adminBonus.first_red_card_nation || pick(rcPool),
      goldenGlove: adminBonus.golden_glove || pick(ggPool),
      tiebreaker: adminBonus.tiebreaker ?? pick(tbPool),
    };

    // Score every player for this scenario
    for (const p of players) {
      let total = 0, exact = 0;
      for (const gp of p.groupPreds) {
        const act = sc.groupResults[gp.g][gp.i];
        if (gp.h === act.homeGoals && gp.a === act.awayGoals) { total += 5; exact++; }
        else if (Math.sign(gp.h - gp.a) === Math.sign(act.homeGoals - act.awayGoals)) total += 2;
      }
      for (const kp of p.knockoutPreds) {
        const act = sc.knockoutResults[kp.id];
        if (!act) continue;
        if (kp.h === act.homeGoals && kp.a === act.awayGoals) { total += 5; exact++; }
        else if (Math.sign(kp.h - kp.a) === Math.sign(act.homeGoals - act.awayGoals)) total += 2;
      }
      if (p.groupComplete) {
        for (const round of Object.keys(KNOCKOUT_ROUND_POINTS)) {
          const at = adminTeams[round];
          for (const team of p.teamsByRound[round]) if (at.has(team)) total += KNOCKOUT_ROUND_POINTS[round];
        }
        if (p.champion && p.champion === sc.champion) total += 50;
        if (p.bronzeWinner && p.bronzeWinner === sc.bronzeWinner) total += 20;
      }
      if (p.overrides.topScorer || eqi(p.topScorer, truth.topScorer)) total += 50;
      if (p.overrides.firstRedCardNation || eqi(p.redCard, truth.redCard)) total += 20;
      if (p.overrides.goldenGlove || eqi(p.goldenGlove, truth.goldenGlove)) total += 40;
      const tdiff = (p.tiebreaker != null && truth.tiebreaker != null) ? Math.abs(p.tiebreaker - truth.tiebreaker) : Infinity;
      p._total = total; p._exact = exact; p._tdiff = tdiff;
      p.totals.push(total);
    }

    // Winner per org (total desc, exact desc, tiebreakerDiff asc); split ties fractionally
    for (const org of ORG_LIST) {
      const members = orgMembers[org];
      if (!members.length) continue;
      let best = null, winners = [];
      for (const p of members) {
        const key = [p._total, p._exact, -p._tdiff];
        if (!best || key[0] > best[0] || (key[0] === best[0] && (key[1] > best[1] || (key[1] === best[1] && key[2] > best[2])))) {
          best = key; winners = [p];
        } else if (key[0] === best[0] && key[1] === best[1] && key[2] === best[2]) {
          winners.push(p);
        }
      }
      const share = 1 / winners.length;
      for (const w of winners) w.wins[org] += share;
    }
  }

  // Expected final points per player (mean + 10th/90th percentile range)
  const stats = {};
  for (const p of players) {
    const arr = p.totals;
    const mean = arr.reduce((n, v) => n + v, 0) / (arr.length || 1);
    const sorted = [...arr].sort((a, b) => a - b);
    const at = (q) => sorted[Math.min(sorted.length - 1, Math.max(0, Math.floor(q * sorted.length)))] ?? 0;
    stats[p.id] = { avgPoints: Math.round(mean), lowPoints: at(0.10), highPoints: at(0.90) };
  }

  const result = {};
  for (const org of ORG_LIST) {
    const members = orgMembers[org];
    if (!members.length) continue;
    result[org] = members
      .map(p => ({ id: p.id, name: p.name, winPct: (p.wins[org] / sims) * 100, ...stats[p.id] }))
      .sort((a, b) => b.winPct - a.winPct || b.avgPoints - a.avgPoints);
  }

  const roundWinners = {};
  for (const rn of KO_ROUNDS) {
    roundWinners[rn] = Object.entries(roundWins[rn])
      .map(([team, wins]) => ({ team, wins, pct: (wins / sims) * 100 }))
      .sort((a, b) => b.wins - a.wins);
  }

  res.json({ sims, orgs: result, roundWinners });
});

// ── Admin data management ──

app.get('/api/admin/knockout-results', (_req, res) => {
  const rows = db.prepare('SELECT id, match_id, home_goals, away_goals, penalty_winner FROM admin_knockout_results ORDER BY match_id').all();
  res.json(rows);
});

app.delete('/api/admin/knockout-results', (_req, res) => {
  db.prepare('DELETE FROM admin_knockout_results').run();
  res.json({ ok: true });
});

app.delete('/api/admin/knockout-results/:matchId', (req, res) => {
  db.prepare('DELETE FROM admin_knockout_results WHERE match_id = ?').run(req.params.matchId);
  res.json({ ok: true });
});

app.get('/api/admin/group-results', (_req, res) => {
  const rows = db.prepare('SELECT id, group_name, match_index, home_goals, away_goals FROM admin_group_results ORDER BY group_name, match_index').all();
  res.json(rows);
});

app.delete('/api/admin/group-results', (_req, res) => {
  db.prepare('DELETE FROM admin_group_results').run();
  res.json({ ok: true });
});

// ── Bonus overrides (admin manually awards points) ──

app.get('/api/admin/bonus-overrides/:userId', (req, res) => {
  const rows = db.prepare('SELECT field, awarded FROM bonus_overrides WHERE user_id = ?').all(req.params.userId);
  const result = {};
  for (const r of rows) result[r.field] = !!r.awarded;
  res.json(result);
});

app.post('/api/admin/bonus-overrides/:userId', (req, res) => {
  const { field, awarded, adminId } = req.body;
  if (!isAdminUser(adminId)) return res.status(403).json({ error: 'Endast admin' });
  const validFields = ['topScorer', 'firstRedCardNation', 'goldenGlove'];
  if (!validFields.includes(field)) return res.status(400).json({ error: 'Invalid field' });
  db.prepare(`
    INSERT INTO bonus_overrides (user_id, field, awarded) VALUES (?, ?, ?)
    ON CONFLICT(user_id, field) DO UPDATE SET awarded = excluded.awarded
  `).run(parseInt(req.params.userId), field, awarded ? 1 : 0);
  res.json({ ok: true });
});

// ── Admin: all bonus answers overview ──

app.get('/api/admin/all-bonus', (_req, res) => {
  const users = db.prepare("SELECT id, name, display_name FROM users WHERE is_admin = 0 AND deleted_at IS NULL").all();
  const adminTopScorer = db.prepare('SELECT player_name FROM admin_top_scorer WHERE id = 1').get();
  const adminBonus = db.prepare('SELECT first_red_card_nation, golden_glove, tiebreaker FROM admin_bonus WHERE id = 1').get();

  const result = [];
  for (const user of users) {
    const ts = db.prepare('SELECT player_name FROM top_scorer_predictions WHERE user_id = ?').get(user.id);
    const bonus = db.prepare('SELECT first_red_card_nation, golden_glove, tiebreaker FROM bonus_predictions WHERE user_id = ?').get(user.id);
    const overrideRows = db.prepare('SELECT field, awarded FROM bonus_overrides WHERE user_id = ?').all(user.id);
    const overrides = {};
    for (const r of overrideRows) overrides[r.field] = !!r.awarded;

    result.push({
      id: user.id,
      name: user.display_name || user.name,
      topScorer: ts?.player_name || '',
      firstRedCardNation: bonus?.first_red_card_nation || '',
      goldenGlove: bonus?.golden_glove || '',
      tiebreaker: bonus?.tiebreaker ?? null,
      overrides,
    });
  }

  res.json({
    users: result,
    admin: {
      topScorer: adminTopScorer?.player_name || '',
      firstRedCardNation: adminBonus?.first_red_card_nation || '',
      goldenGlove: adminBonus?.golden_glove || '',
      tiebreaker: adminBonus?.tiebreaker ?? null,
    },
  });
});

// ── Admin: prediction statistics (champion / finalists / bonus per org) ──

app.get('/api/admin/prediction-stats', (_req, res) => {
  const users = db.prepare("SELECT id, name, display_name, org FROM users WHERE is_admin = 0 AND deleted_at IS NULL").all();

  const records = [];
  for (const user of users) {
    const groupRows = db.prepare('SELECT group_name, match_index, home_goals, away_goals FROM group_predictions WHERE user_id = ?').all(user.id);
    const knockoutRows = db.prepare('SELECT match_id, home_goals, away_goals, penalty_winner FROM knockout_predictions WHERE user_id = ?').all(user.id);
    const ts = db.prepare('SELECT player_name FROM top_scorer_predictions WHERE user_id = ?').get(user.id);
    const bonus = db.prepare('SELECT first_red_card_nation, golden_glove FROM bonus_predictions WHERE user_id = ?').get(user.id);

    // Compute the bracket from whatever the player entered and read off the final/bronze.
    // We don't gate on "all 72 groups filled": for statistics we want to count whatever a
    // player actually predicted. A champion is counted only if their final resolves to a
    // winner (both teams known + a decisive result / penalty winner), so idle/empty players
    // produce no champion and aren't counted.
    const completedGroups = groupRows.filter(p => p.home_goals != null && p.away_goals != null).length;
    let champion = null;
    let finalists = [];
    let bronzeWinner = null;
    const bracket = computeBracketFromData(groupRows, knockoutRows);
    const finalMatch = bracket.final?.[0];
    if (finalMatch) {
      if (finalMatch.home) finalists.push(finalMatch.home);
      if (finalMatch.away) finalists.push(finalMatch.away);
      champion = getMatchWinner(finalMatch) || null;
    }
    const bronzeMatch = bracket.bronze?.[0];
    if (bronzeMatch) bronzeWinner = getMatchWinner(bronzeMatch) || null;

    records.push({
      id: user.id,
      name: user.display_name || user.name,
      org: user.org || null,
      groupsComplete: completedGroups >= 72,
      champion,
      finalists,
      bronzeWinner,
      topScorer: ts?.player_name || '',
      firstRedCardNation: bonus?.first_red_card_nation || '',
      goldenGlove: bonus?.golden_glove || '',
    });
  }

  res.json({ records });
});

// ── Lock / Settings ──

app.get('/api/settings', (_req, res) => {
  res.json({ locked: isTournamentLocked() });
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
  const users = db.prepare('SELECT id, name, display_name, username, is_admin, role, org, created_at, deleted_at FROM users').all();
  res.json(users.map(u => ({ ...u, name: u.display_name || u.name, isAdmin: !!u.is_admin, role: u.role || 'Spelare', org: u.org || null, deleted: !!u.deleted_at, deletedAt: u.deleted_at || null })));
});

app.post('/api/users/:id/delete', (req, res) => {
  const user = db.prepare('SELECT id, is_admin FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'Användaren hittades inte' });
  if (user.is_admin) return res.status(403).json({ error: 'Kan inte ta bort en admin' });
  db.prepare("UPDATE users SET deleted_at = datetime('now') WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

app.post('/api/users/:id/restore', (req, res) => {
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'Användaren hittades inte' });
  db.prepare('UPDATE users SET deleted_at = NULL WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
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
  const knockout = db.prepare('SELECT match_id, home_goals, away_goals, penalty_winner FROM knockout_predictions WHERE user_id = ?').all(userId);
  const topScorer = db.prepare('SELECT player_name FROM top_scorer_predictions WHERE user_id = ?').get(userId);
  const bonus = db.prepare('SELECT first_red_card_nation, golden_glove, tiebreaker FROM bonus_predictions WHERE user_id = ?').get(userId);

  // Include admin answers and overrides for admin view
  const adminTopScorer = db.prepare('SELECT player_name FROM admin_top_scorer WHERE id = 1').get();
  const adminBonus = db.prepare('SELECT first_red_card_nation, golden_glove, tiebreaker FROM admin_bonus WHERE id = 1').get();
  const overrideRows = db.prepare('SELECT field, awarded FROM bonus_overrides WHERE user_id = ?').all(userId);
  const overrides = {};
  for (const r of overrideRows) overrides[r.field] = !!r.awarded;

  const groupMap = {};
  for (const r of groups) {
    if (!groupMap[r.group_name]) groupMap[r.group_name] = {};
    groupMap[r.group_name][r.match_index] = { homeGoals: r.home_goals, awayGoals: r.away_goals };
  }
  const knockoutMap = {};
  for (const r of knockout) {
    knockoutMap[r.match_id] = { homeGoals: r.home_goals, awayGoals: r.away_goals, penaltyWinner: r.penalty_winner || null };
  }

  // Admin results (facit) so the viewer can see points earned per match
  const adminGroupRows = db.prepare('SELECT group_name, match_index, home_goals, away_goals FROM admin_group_results').all();
  const adminGroups = {};
  for (const r of adminGroupRows) {
    if (!adminGroups[r.group_name]) adminGroups[r.group_name] = {};
    adminGroups[r.group_name][r.match_index] = { homeGoals: r.home_goals, awayGoals: r.away_goals };
  }
  const adminKnockoutRows = db.prepare('SELECT match_id, home_goals, away_goals, penalty_winner FROM admin_knockout_results').all();
  const adminKnockout = {};
  for (const r of adminKnockoutRows) {
    adminKnockout[r.match_id] = { homeGoals: r.home_goals, awayGoals: r.away_goals, penaltyWinner: r.penalty_winner || null };
  }

  res.json({
    groups: groupMap,
    knockout: knockoutMap,
    adminGroups,
    adminKnockout,
    topScorer: topScorer?.player_name || '',
    firstRedCardNation: bonus?.first_red_card_nation || '',
    goldenGlove: bonus?.golden_glove || '',
    tiebreaker: bonus?.tiebreaker ?? null,
    adminAnswers: {
      topScorer: adminTopScorer?.player_name || '',
      firstRedCardNation: adminBonus?.first_red_card_nation || '',
      goldenGlove: adminBonus?.golden_glove || '',
      tiebreaker: adminBonus?.tiebreaker ?? null,
    },
    overrides,
  });
});

// Debug: raw user list (remove after debugging)
app.get('/api/debug/users', (_req, res) => {
  const users = db.prepare('SELECT * FROM users').all();
  res.json(users.map(({ password_hash, ...rest }) => rest));
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
