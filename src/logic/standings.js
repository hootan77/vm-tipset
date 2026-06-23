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

export function sortStandings(table, matches) {
  const rows = Object.values(table);

  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;

    // Head-to-head goal difference between the two teams takes priority over total GD
    const h2hGD = getHeadToHeadGD(a.team, b.team, matches);
    if (h2hGD !== 0) return -h2hGD; // higher head-to-head GD ranks first

    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;

    return a.team.localeCompare(b.team);
  });

  return rows.map((row, i) => ({ ...row, position: i + 1 }));
}

// Goal difference in matches between the two teams, from teamA's perspective
function getHeadToHeadGD(teamA, teamB, matches) {
  let gd = 0;
  for (const m of matches) {
    if (m.homeGoals == null || m.awayGoals == null) continue;
    const h = parseInt(m.homeGoals, 10);
    const a = parseInt(m.awayGoals, 10);
    if (isNaN(h) || isNaN(a)) continue;

    if (m.home === teamA && m.away === teamB) gd += (h - a);
    else if (m.home === teamB && m.away === teamA) gd += (a - h);
  }
  return gd;
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
