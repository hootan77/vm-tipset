import { TEAMS, GROUP_NAMES, GROUP_SCHEDULE, ROUND_OF_32_BRACKET } from './teams-data.js';
import { THIRD_PLACE_TABLE, THIRD_PLACE_WINNER_ORDER } from './third-place-table.js';
export { TEAMS, GROUP_NAMES, GROUP_SCHEDULE, ROUND_OF_32_BRACKET };

export function calculateStandings(teams, matches) {
  const table = {};
  for (const team of teams) {
    table[team] = { team, played: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 };
  }
  for (const match of matches) {
    const { home, away, homeGoals, awayGoals } = match;
    if (homeGoals == null || awayGoals == null) continue;
    const h = parseInt(homeGoals, 10);
    const a = parseInt(awayGoals, 10);
    if (isNaN(h) || isNaN(a)) continue;
    table[home].played++;
    table[away].played++;
    table[home].gf += h;
    table[home].ga += a;
    table[away].gf += a;
    table[away].ga += h;
    if (h > a) { table[home].wins++; table[home].points += 3; table[away].losses++; }
    else if (h < a) { table[away].wins++; table[away].points += 3; table[home].losses++; }
    else { table[home].draws++; table[away].draws++; table[home].points += 1; table[away].points += 1; }
  }
  for (const t of Object.values(table)) t.gd = t.gf - t.ga;
  return table;
}

// Group ranking: points first, then the head-to-head mini-league among teams
// level on points (head-to-head points -> GD -> goals), then overall GD -> goals,
// then drawing of lots (deterministic alphabetical fallback).
export function sortStandings(table, matches) {
  const rows = Object.values(table);
  const byPoints = [...rows].sort((a, b) => b.points - a.points);

  const result = [];
  let i = 0;
  while (i < byPoints.length) {
    let j = i + 1;
    while (j < byPoints.length && byPoints[j].points === byPoints[i].points) j++;
    const cluster = byPoints.slice(i, j);
    result.push(...(cluster.length === 1 ? cluster : resolveTie(cluster, matches)));
    i = j;
  }

  return result.map((row, idx) => ({ ...row, position: idx + 1 }));
}

// Mini-table (points/GD/goals) using only the matches between the given teams
function headToHeadTable(cluster, matches) {
  const set = new Set(cluster.map(r => r.team));
  const mini = {};
  for (const r of cluster) mini[r.team] = { points: 0, gf: 0, ga: 0 };
  for (const m of matches) {
    if (m.homeGoals == null || m.awayGoals == null) continue;
    const h = parseInt(m.homeGoals, 10);
    const a = parseInt(m.awayGoals, 10);
    if (isNaN(h) || isNaN(a)) continue;
    if (!set.has(m.home) || !set.has(m.away)) continue;
    mini[m.home].gf += h; mini[m.home].ga += a;
    mini[m.away].gf += a; mini[m.away].ga += h;
    if (h > a) mini[m.home].points += 3;
    else if (a > h) mini[m.away].points += 3;
    else { mini[m.home].points += 1; mini[m.away].points += 1; }
  }
  for (const t in mini) mini[t].gd = mini[t].gf - mini[t].ga;
  return mini;
}

// Resolve a set of teams level on overall points
function resolveTie(cluster, matches) {
  if (cluster.length === 1) return cluster;

  const mini = headToHeadTable(cluster, matches);
  const sorted = [...cluster].sort((a, b) =>
    mini[b.team].points - mini[a.team].points ||
    mini[b.team].gd - mini[a.team].gd ||
    mini[b.team].gf - mini[a.team].gf
  );

  const result = [];
  let i = 0;
  while (i < sorted.length) {
    let j = i + 1;
    while (j < sorted.length &&
      mini[sorted[j].team].points === mini[sorted[i].team].points &&
      mini[sorted[j].team].gd === mini[sorted[i].team].gd &&
      mini[sorted[j].team].gf === mini[sorted[i].team].gf) j++;
    const sub = sorted.slice(i, j);
    if (sub.length === 1) {
      result.push(sub[0]);
    } else if (sub.length === cluster.length) {
      // Head-to-head couldn't separate them: fall back to overall GD -> goals -> lots
      result.push(...[...sub].sort((a, b) =>
        b.gd - a.gd || b.gf - a.gf || a.team.localeCompare(b.team)));
    } else {
      // Re-apply head-to-head to the still-level smaller subset
      result.push(...resolveTie(sub, matches));
    }
    i = j;
  }
  return result;
}

export function getBestThirdPlaced(allGroupStandings) {
  const thirds = [];
  for (const [group, standings] of Object.entries(allGroupStandings)) {
    if (standings.length >= 3 && standings[2].played > 0) {
      thirds.push({ ...standings[2], group });
    }
  }
  thirds.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.team.localeCompare(b.team);
  });

  const qualified = thirds.slice(0, 8);

  return assignThirdsToSlots(qualified);
}

// best3 slot index (0..7, referenced by ROUND_OF_32_BRACKET) -> the first-place group it faces
const WINNER_BY_SLOT = ['E', 'I', 'A', 'L', 'D', 'G', 'B', 'K'];

function assignThirdsToSlots(rankedThirds) {
  // Need exactly 8 qualifying thirds to use the official allocation table.
  if (rankedThirds.length < 8) return rankedThirds;

  const key = rankedThirds.map(t => t.group).sort().join('');
  const assignment = THIRD_PLACE_TABLE[key];
  if (!assignment) return rankedThirds;

  const winnerToGroup = {};
  THIRD_PLACE_WINNER_ORDER.forEach((w, i) => { winnerToGroup[w] = assignment[i]; });

  const byGroup = {};
  for (const t of rankedThirds) byGroup[t.group] = t;

  return WINNER_BY_SLOT.map(winner => byGroup[winnerToGroup[winner]] || null);
}

function resolveSlot(slot, allGroupStandings, bestThirds) {
  if (slot.type === 'best3') {
    const idx = slot.slot - 1;
    return bestThirds[idx]?.team || null;
  }
  const standings = allGroupStandings[slot.group];
  if (!standings || standings.length < slot.pos) return null;
  return standings[slot.pos - 1]?.team || null;
}

export function buildRoundOf32(allGroupStandings, bestThirds) {
  return ROUND_OF_32_BRACKET.map((slot, index) => ({
    id: `r32_${index}`,
    round: 'r32',
    home: resolveSlot(slot.home, allGroupStandings, bestThirds),
    away: resolveSlot(slot.away, allGroupStandings, bestThirds),
    homeGoals: null,
    awayGoals: null,
    penaltyWinner: null,
  }));
}

export function getMatchWinner(match) {
  if (match.homeGoals == null || match.awayGoals == null) return null;
  const h = parseInt(match.homeGoals, 10);
  const a = parseInt(match.awayGoals, 10);
  if (isNaN(h) || isNaN(a)) return null;
  if (h > a) return match.home;
  if (a > h) return match.away;
  // Only honour a penalty winner if it's actually one of the two current teams.
  // Upstream changes can leave a stale penaltyWinner (a now-eliminated team) in storage.
  if (h === a && (match.penaltyWinner === match.home || match.penaltyWinner === match.away)) {
    return match.penaltyWinner;
  }
  return null;
}

function buildNextRound(currentRoundMatches, roundName) {
  const matches = [];
  for (let i = 0; i < currentRoundMatches.length; i += 2) {
    const winner1 = getMatchWinner(currentRoundMatches[i]);
    const winner2 = i + 1 < currentRoundMatches.length ? getMatchWinner(currentRoundMatches[i + 1]) : null;
    matches.push({ id: `${roundName}_${i / 2}`, round: roundName, home: winner1, away: winner2, homeGoals: null, awayGoals: null });
  }
  return matches;
}

function applyPredictions(matches, predictions) {
  return matches.map(match => {
    const pred = predictions[match.id];
    if (pred) return { ...match, homeGoals: pred.homeGoals, awayGoals: pred.awayGoals, penaltyWinner: pred.penaltyWinner || null };
    return match;
  });
}

function getMatchLoser(match) {
  if (match.homeGoals == null || match.awayGoals == null) return null;
  const h = parseInt(match.homeGoals, 10);
  const a = parseInt(match.awayGoals, 10);
  if (isNaN(h) || isNaN(a)) return null;
  if (h > a) return match.away;
  if (a > h) return match.home;
  if (h === a && (match.penaltyWinner === match.home || match.penaltyWinner === match.away)) {
    return match.penaltyWinner === match.home ? match.away : match.home;
  }
  return null;
}

export function buildFullBracket(r32Matches, knockoutPredictions) {
  const rounds = { r32: applyPredictions(r32Matches, knockoutPredictions) };
  const roundOrder = ['r16', 'qf', 'sf', 'final'];
  let prev = rounds.r32;
  for (const roundName of roundOrder) {
    const nextRound = buildNextRound(prev, roundName);
    rounds[roundName] = applyPredictions(nextRound, knockoutPredictions);
    prev = rounds[roundName];
  }
  // Match for third place: losers of the two semi-finals
  const sf = rounds.sf;
  const bronze = {
    id: 'bronze_0', round: 'bronze',
    home: sf?.[0] ? getMatchLoser(sf[0]) : null,
    away: sf?.[1] ? getMatchLoser(sf[1]) : null,
    homeGoals: null, awayGoals: null,
  };
  rounds.bronze = applyPredictions([bronze], knockoutPredictions);
  return rounds;
}

export function computeBracketFromData(groupDbRows, knockoutDbRows) {
  const groupMatches = {};
  for (const group of GROUP_NAMES) {
    groupMatches[group] = GROUP_SCHEDULE[group].map(m => ({
      home: m.home, away: m.away, homeGoals: null, awayGoals: null,
    }));
  }
  for (const r of groupDbRows) {
    if (groupMatches[r.group_name]?.[r.match_index]) {
      groupMatches[r.group_name][r.match_index].homeGoals = r.home_goals;
      groupMatches[r.group_name][r.match_index].awayGoals = r.away_goals;
    }
  }
  const allStandings = {};
  for (const group of GROUP_NAMES) {
    const table = calculateStandings(TEAMS[group], groupMatches[group]);
    allStandings[group] = sortStandings(table, groupMatches[group]);
  }
  const bestThirds = getBestThirdPlaced(allStandings);
  const r32 = buildRoundOf32(allStandings, bestThirds);
  const knockoutMap = {};
  for (const r of knockoutDbRows) {
    knockoutMap[r.match_id] = { homeGoals: r.home_goals, awayGoals: r.away_goals, penaltyWinner: r.penalty_winner || null };
  }
  return buildFullBracket(r32, knockoutMap);
}
