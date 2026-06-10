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
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;

    const headToHead = getHeadToHead(a.team, b.team, matches);
    if (headToHead !== 0) return headToHead;

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

    if (m.home === teamA && m.away === teamB) {
      if (h > a) return -1;
      if (h < a) return 1;
    }
    if (m.home === teamB && m.away === teamA) {
      if (h > a) return 1;
      if (h < a) return -1;
    }
  }
  return 0;
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

  // Each slot faces a specific group winner — a third from that group must not be placed there
  // Slot 0→E1, 1→I1, 2→A1, 3→L1, 4→D1, 5→G1, 6→B1, 7→K1
  const SLOT_BLOCKED_GROUP = ['E', 'I', 'A', 'L', 'D', 'G', 'B', 'K'];

  return assignThirdsToSlots(qualified, SLOT_BLOCKED_GROUP);
}

function assignThirdsToSlots(rankedThirds, slotBlockedGroup) {
  const n = slotBlockedGroup.length;
  const result = new Array(n).fill(null);

  function backtrack(slot, used) {
    if (slot === n) return true;
    const blocked = slotBlockedGroup[slot];
    for (let i = 0; i < rankedThirds.length; i++) {
      if (!used.has(i) && rankedThirds[i].group !== blocked) {
        result[slot] = rankedThirds[i];
        used.add(i);
        if (backtrack(slot + 1, used)) return true;
        used.delete(i);
      }
    }
    return false;
  }

  if (!backtrack(0, new Set())) {
    // Fallback if no valid assignment exists (shouldn't happen with 12 groups)
    return rankedThirds.slice(0, n);
  }

  return result;
}
