import { TEAMS, GROUP_NAMES, GROUP_SCHEDULE, ROUND_OF_32_BRACKET } from './teams-data.js';
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

export function sortStandings(table, matches) {
  const rows = Object.values(table);
  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    const h2h = getHeadToHead(a.team, b.team, matches);
    if (h2h !== 0) return h2h;
    return a.team.localeCompare(b.team);
  });
  return rows.map((row, i) => ({ ...row, position: i + 1 }));
}

function getHeadToHead(teamA, teamB, matches) {
  for (const m of matches) {
    if (m.homeGoals == null || m.awayGoals == null) continue;
    const h = parseInt(m.homeGoals, 10);
    const a = parseInt(m.awayGoals, 10);
    if (isNaN(h) || isNaN(a)) continue;
    if (m.home === teamA && m.away === teamB) { if (h > a) return -1; if (h < a) return 1; }
    if (m.home === teamB && m.away === teamA) { if (h > a) return 1; if (h < a) return -1; }
  }
  return 0;
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
  return thirds.slice(0, 8);
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

function getMatchWinner(match) {
  if (match.homeGoals == null || match.awayGoals == null) return null;
  const h = parseInt(match.homeGoals, 10);
  const a = parseInt(match.awayGoals, 10);
  if (isNaN(h) || isNaN(a)) return null;
  if (h > a) return match.home;
  if (a > h) return match.away;
  if (h === a && match.penaltyWinner) return match.penaltyWinner;
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

export function buildFullBracket(r32Matches, knockoutPredictions) {
  const rounds = { r32: applyPredictions(r32Matches, knockoutPredictions) };
  const roundOrder = ['r16', 'qf', 'sf', 'final'];
  let prev = rounds.r32;
  for (const roundName of roundOrder) {
    const nextRound = buildNextRound(prev, roundName);
    rounds[roundName] = applyPredictions(nextRound, knockoutPredictions);
    prev = rounds[roundName];
  }
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
