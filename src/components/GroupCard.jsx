import { useTournament } from '../context/TournamentContext';
import { useAuth } from '../context/AuthContext';
import { getFlag } from '../data/flags';
import StandingsTable from './StandingsTable';
import MatchInput from './MatchInput';

export default function GroupCard({ group, isAdmin }) {
  const { state, computed } = useTournament();
  const source = isAdmin ? 'adminGroupMatches' : 'groupMatches';
  const matches = state[source][group];
  const standings = isAdmin ? computed.adminStandings[group] : computed.userStandings[group];

  const allComplete = matches.every(m => m.homeGoals != null && m.awayGoals != null);
  const first = standings[0]?.team;
  const second = standings[1]?.team;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className={`px-4 py-3 ${isAdmin ? 'bg-gradient-to-r from-amber-600 to-amber-800' : 'bg-gradient-to-r from-blue-600 to-blue-800'}`}>
        <h3 className="text-white font-bold text-lg">Grupp {group}</h3>
      </div>

      <div className="p-4 space-y-4">
        <StandingsTable standings={standings} />

        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Matcher</h4>
          {matches.map((match, i) => (
            <MatchInput key={i} group={group} matchIndex={i} match={match} isAdmin={isAdmin} />
          ))}
        </div>

        {allComplete && (
          <div className="border-t pt-3 mt-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Går vidare</p>
            <div className="flex gap-2">
              <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                1. {getFlag(first)} {first}
              </span>
              <span className="bg-green-50 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
                2. {getFlag(second)} {second}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
