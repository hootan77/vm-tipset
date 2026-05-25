import { getMatchWinner } from './knockout';

const POINTS_EXACT = 5;
const POINTS_OUTCOME = 2;
const POINTS_KNOCKOUT_TEAM = 5;
const POINTS_KNOCKOUT_EXACT = 5;
const POINTS_KNOCKOUT_OUTCOME = 2;

export function scoreGroupMatch(prediction, actual) {
  if (!prediction || !actual) return 0;
  if (prediction.homeGoals == null || prediction.awayGoals == null) return 0;
  if (actual.homeGoals == null || actual.awayGoals == null) return 0;

  const ph = parseInt(prediction.homeGoals, 10);
  const pa = parseInt(prediction.awayGoals, 10);
  const ah = parseInt(actual.homeGoals, 10);
  const aa = parseInt(actual.awayGoals, 10);

  if (ph === ah && pa === aa) return POINTS_EXACT;

  const predOutcome = Math.sign(ph - pa);
  const actualOutcome = Math.sign(ah - aa);
  if (predOutcome === actualOutcome) return POINTS_OUTCOME;

  return 0;
}

export function scoreKnockoutMatch(prediction, actual) {
  if (!prediction || !actual) return null;
  if (prediction.homeGoals == null || prediction.awayGoals == null) return null;
  if (actual.homeGoals == null || actual.awayGoals == null) return null;

  const ph = parseInt(prediction.homeGoals, 10);
  const pa = parseInt(prediction.awayGoals, 10);
  const ah = parseInt(actual.homeGoals, 10);
  const aa = parseInt(actual.awayGoals, 10);

  if (ph === ah && pa === aa) return POINTS_KNOCKOUT_EXACT;

  const predOutcome = Math.sign(ph - pa);
  const actualOutcome = Math.sign(ah - aa);
  if (predOutcome === actualOutcome) return POINTS_KNOCKOUT_OUTCOME;

  return 0;
}

export function scoreKnockoutRound(predictedRounds, actualRounds, roundName) {
  if (!predictedRounds[roundName] || !actualRounds[roundName]) return 0;

  const predictedTeams = new Set();
  for (const match of predictedRounds[roundName]) {
    if (match.home) predictedTeams.add(match.home);
    if (match.away) predictedTeams.add(match.away);
  }

  const actualTeams = new Set();
  for (const match of actualRounds[roundName]) {
    if (match.home) actualTeams.add(match.home);
    if (match.away) actualTeams.add(match.away);
  }

  let points = 0;
  for (const team of predictedTeams) {
    if (actualTeams.has(team)) points += POINTS_KNOCKOUT_TEAM;
  }

  return points;
}

export function scoreWinner(predictedRounds, actualRounds) {
  if (!predictedRounds.final?.[0] || !actualRounds.final?.[0]) return 0;
  const predicted = getMatchWinner(predictedRounds.final[0]);
  const actual = getMatchWinner(actualRounds.final[0]);
  if (predicted && actual && predicted === actual) return POINTS_KNOCKOUT_TEAM;
  return 0;
}

export function calculateTotalScore(groupPredictions, groupActuals, predictedBracket, actualBracket, allGroupMatches) {
  let total = 0;
  let breakdown = { groups: 0, r32: 0, r16: 0, qf: 0, sf: 0, final: 0, winner: 0 };

  for (const group of Object.keys(allGroupMatches)) {
    for (const match of allGroupMatches[group]) {
      const matchKey = `${match.home}_${match.away}`;
      const pred = groupPredictions[group]?.find(m => `${m.home}_${m.away}` === matchKey);
      const act = groupActuals[group]?.find(m => `${m.home}_${m.away}` === matchKey);
      const pts = scoreGroupMatch(pred, act);
      breakdown.groups += pts;
      total += pts;
    }
  }

  if (predictedBracket && actualBracket) {
    for (const round of ['r32', 'r16', 'qf', 'sf', 'final']) {
      const pts = scoreKnockoutRound(predictedBracket, actualBracket, round);
      breakdown[round] = pts;
      total += pts;
    }
    const winnerPts = scoreWinner(predictedBracket, actualBracket);
    breakdown.winner = winnerPts;
    total += winnerPts;
  }

  return { total, breakdown };
}
