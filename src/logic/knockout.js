import { ROUND_OF_32_BRACKET, KNOCKOUT_SCHEDULE } from '../data/teams';

export function buildRoundOf32(allGroupStandings, bestThirds) {
  return ROUND_OF_32_BRACKET.map((slot, index) => {
    const homeTeam = resolveSlot(slot.home, allGroupStandings, bestThirds);
    const awayTeam = resolveSlot(slot.away, allGroupStandings, bestThirds);
    return {
      id: `r32_${index}`,
      round: 'r32',
      home: homeTeam,
      away: awayTeam,
      homeGoals: null,
      awayGoals: null,
      penaltyWinner: null,
      matchNum: slot.matchNum,
      date: slot.date,
      venue: slot.venue,
    };
  });
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

export function getMatchWinner(match) {
  if (match.homeGoals == null || match.awayGoals == null) return null;
  const h = parseInt(match.homeGoals, 10);
  const a = parseInt(match.awayGoals, 10);
  if (isNaN(h) || isNaN(a)) return null;
  if (h > a) return match.home;
  if (a > h) return match.away;
  if (h === a && match.penaltyWinner) return match.penaltyWinner;
  return null;
}

export function getMatchLoser(match) {
  if (match.homeGoals == null || match.awayGoals == null) return null;
  const h = parseInt(match.homeGoals, 10);
  const a = parseInt(match.awayGoals, 10);
  if (isNaN(h) || isNaN(a)) return null;
  if (h > a) return match.away;
  if (a > h) return match.home;
  if (h === a && match.penaltyWinner) {
    return match.penaltyWinner === match.home ? match.away : match.home;
  }
  return null;
}

export function buildNextRound(currentRoundMatches, roundName) {
  const matches = [];
  for (let i = 0; i < currentRoundMatches.length; i += 2) {
    const winner1 = getMatchWinner(currentRoundMatches[i]);
    const winner2 = i + 1 < currentRoundMatches.length ? getMatchWinner(currentRoundMatches[i + 1]) : null;
    const id = `${roundName}_${i / 2}`;
    const schedule = KNOCKOUT_SCHEDULE[id] || {};
    matches.push({
      id,
      round: roundName,
      home: winner1,
      away: winner2,
      homeGoals: null,
      awayGoals: null,
      penaltyWinner: null,
      matchNum: schedule.matchNum,
      date: schedule.date,
      venue: schedule.venue,
    });
  }
  return matches;
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

  const sf = rounds.sf;
  const bronzeSchedule = KNOCKOUT_SCHEDULE['bronze_0'] || {};
  const bronzeMatch = {
    id: 'bronze_0',
    round: 'bronze',
    home: sf?.[0] ? getMatchLoser(sf[0]) : null,
    away: sf?.[1] ? getMatchLoser(sf[1]) : null,
    homeGoals: null,
    awayGoals: null,
    penaltyWinner: null,
    matchNum: bronzeSchedule.matchNum,
    date: bronzeSchedule.date,
    venue: bronzeSchedule.venue,
  };
  rounds.bronze = applyPredictions([bronzeMatch], knockoutPredictions);

  return rounds;
}

function applyPredictions(matches, predictions) {
  return matches.map(match => {
    const pred = predictions[match.id];
    if (pred) {
      return { ...match, homeGoals: pred.homeGoals, awayGoals: pred.awayGoals, penaltyWinner: pred.penaltyWinner || null };
    }
    return match;
  });
}

export const ROUND_LABELS = {
  r32: '16-delsfinal',
  r16: 'Åttondelsfinal',
  qf: 'Kvartsfinal',
  sf: 'Semifinal',
  bronze: 'Bronsmatch',
  final: 'Final',
};
