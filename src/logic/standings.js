import { THIRD_PLACE_TABLE, THIRD_PLACE_WINNER_ORDER } from '../data/thirdPlaceTable.js';

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

    if (h > a) {
      table[home].wins++;
      table[home].points += 3;
      table[away].losses++;
    } else if (h < a) {
      table[away].wins++;
      table[away].points += 3;
      table[home].losses++;
    } else {
      table[home].draws++;
      table[away].draws++;
      table[home].points += 1;
      table[away].points += 1;
    }
  }

  for (const t of Object.values(table)) {
    t.gd = t.gf - t.ga;
  }

  return table;
}

// Group ranking: points first, then the head-to-head mini-league among teams
// level on points (head-to-head points -> GD -> goals), then overall GD -> goals,
// then drawing of lots (deterministic alphabetical fallback, as we track no fair-play points).
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

export function getGroupAdvancers(sortedStandings) {
  if (sortedStandings.length < 2) return { first: null, second: null, third: null };
  return {
    first: sortedStandings[0]?.team || null,
    second: sortedStandings[1]?.team || null,
    third: sortedStandings[2] || null,
  };
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
  // (Incomplete predictions -> fall back to ranked order so a partial bracket still renders.)
  if (rankedThirds.length < 8) return rankedThirds;

  const key = rankedThirds.map(t => t.group).sort().join('');
  const assignment = THIRD_PLACE_TABLE[key];
  if (!assignment) return rankedThirds;

  // assignment[i] = third-place group that plays winner THIRD_PLACE_WINNER_ORDER[i]
  const winnerToGroup = {};
  THIRD_PLACE_WINNER_ORDER.forEach((w, i) => { winnerToGroup[w] = assignment[i]; });

  const byGroup = {};
  for (const t of rankedThirds) byGroup[t.group] = t;

  return WINNER_BY_SLOT.map(winner => byGroup[winnerToGroup[winner]] || null);
}
