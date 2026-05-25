import { useMemo } from 'react';
import { useTournament } from '../context/TournamentContext';
import { calculateTotalScore } from '../logic/scoring';
import { TEAMS, GROUP_NAMES, getGroupMatches } from '../data/teams';
import { calculateStandings, sortStandings, getBestThirdPlaced } from '../logic/standings';
import { buildRoundOf32, buildFullBracket } from '../logic/knockout';

export default function ScoreBoard() {
  const { state } = useTournament();

  const hasAdminData = useMemo(() => {
    return GROUP_NAMES.some(g =>
      state.adminGroupMatches[g].some(m => m.homeGoals != null && m.awayGoals != null)
    );
  }, [state.adminGroupMatches]);

  const score = useMemo(() => {
    if (!hasAdminData) return null;

    const adminStandings = {};
    const userStandings = {};
    for (const group of GROUP_NAMES) {
      const at = calculateStandings(TEAMS[group], state.adminGroupMatches[group]);
      adminStandings[group] = sortStandings(at, state.adminGroupMatches[group]);
      const ut = calculateStandings(TEAMS[group], state.groupMatches[group]);
      userStandings[group] = sortStandings(ut, state.groupMatches[group]);
    }

    const adminBestThirds = getBestThirdPlaced(adminStandings);
    const adminR32 = buildRoundOf32(adminStandings, adminBestThirds);
    const adminBracket = buildFullBracket(adminR32, state.adminKnockoutPredictions);

    const userBestThirds = getBestThirdPlaced(userStandings);
    const userR32 = buildRoundOf32(userStandings, userBestThirds);
    const userBracket = buildFullBracket(userR32, state.knockoutPredictions);

    const allGroupMatches = {};
    for (const group of GROUP_NAMES) {
      allGroupMatches[group] = getGroupMatches(TEAMS[group]);
    }

    return calculateTotalScore(
      state.groupMatches,
      state.adminGroupMatches,
      userBracket,
      adminBracket,
      { groupMatches: state.groupMatches, adminGroupMatches: state.adminGroupMatches }
    );
  }, [state, hasAdminData]);

  if (!hasAdminData) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Poängberäkning</h3>
        <p className="text-gray-500 text-sm">
          Poäng visas när admin har fyllt i verkliga resultat. Byt till adminläge för att börja.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
        <h3 className="text-white font-bold text-xl">Din poäng</h3>
      </div>
      <div className="p-6">
        <div className="text-center mb-6">
          <div className="text-5xl font-bold text-emerald-600">{score?.total ?? 0}</div>
          <div className="text-gray-500 text-sm mt-1">Totalt poäng</div>
        </div>
        {score?.breakdown && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <ScoreItem label="Gruppspel" value={score.breakdown.groups} />
            <ScoreItem label="32-del" value={score.breakdown.r32} />
            <ScoreItem label="Åttondel" value={score.breakdown.r16} />
            <ScoreItem label="Kvart" value={score.breakdown.qf} />
            <ScoreItem label="Semi" value={score.breakdown.sf} />
            <ScoreItem label="Final" value={score.breakdown.final} />
            <ScoreItem label="Vinnare" value={score.breakdown.winner} />
          </div>
        )}
      </div>
    </div>
  );
}

function ScoreItem({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="text-lg font-bold text-gray-800">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
