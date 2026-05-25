import { useState, useEffect } from 'react';
import { API } from '../context/AuthContext';
import { TEAMS, GROUP_NAMES, getGroupMatchesForGroup } from '../data/teams';
import { getFlag } from '../data/flags';
import { calculateStandings, sortStandings } from '../logic/standings';

export default function ViewUserPredictions({ viewUser, onBack }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${API}/users/${viewUser.id}/predictions`)
      .then(r => r.json())
      .then(setData);
  }, [viewUser.id]);

  if (!data) return <p className="text-gray-500 p-8">Laddar...</p>;

  const groupMatches = {};
  for (const group of GROUP_NAMES) {
    groupMatches[group] = getGroupMatchesForGroup(group).map((m, i) => {
      const pred = data.groups[group]?.[i];
      return { ...m, homeGoals: pred?.homeGoals ?? null, awayGoals: pred?.awayGoals ?? null };
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition-colors"
        >
          Tillbaka
        </button>
        <h2 className="text-2xl font-bold text-gray-800">
          Tips av {viewUser.name}
        </h2>
      </div>

      {data.topScorer && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <span className="text-sm font-semibold text-purple-700">Skyttekung: </span>
          <span className="text-purple-900">{data.topScorer}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {GROUP_NAMES.map(group => {
          const matches = groupMatches[group];
          const standings = sortStandings(
            calculateStandings(TEAMS[group], matches),
            matches
          );
          return (
            <ReadOnlyGroupCard key={group} group={group} matches={matches} standings={standings} />
          );
        })}
      </div>

      <KnockoutSummary knockoutData={data.knockout} />
    </div>
  );
}

function ReadOnlyGroupCard({ group, matches, standings }) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-700">
        <h3 className="text-white font-bold text-lg">Grupp {group}</h3>
      </div>
      <div className="p-4 space-y-3">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 border-b">
              <th className="text-left py-1 px-1">#</th>
              <th className="text-left py-1 px-1">Lag</th>
              <th className="py-1 px-1 font-bold">P</th>
              <th className="py-1 px-1">MS</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row, i) => (
              <tr key={row.team} className={`border-b last:border-0 ${i < 2 ? 'bg-green-50' : ''}`}>
                <td className="py-1 px-1 text-gray-500">{i + 1}</td>
                <td className="py-1 px-1 font-medium text-gray-800 whitespace-nowrap">{getFlag(row.team)} {row.team}</td>
                <td className="py-1 px-1 text-center font-bold">{row.points}</td>
                <td className="py-1 px-1 text-center">{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="space-y-1">
          {matches.map((m, i) => (
            <div key={i} className="flex items-center gap-2 text-xs py-1 px-2 bg-gray-50 rounded">
              <span className="flex-1 text-right truncate">{getFlag(m.home)} {m.home}</span>
              <span className={`font-bold px-1 min-w-[2rem] text-center ${m.homeGoals != null ? 'text-gray-800' : 'text-gray-300'}`}>
                {m.homeGoals ?? '-'} – {m.awayGoals ?? '-'}
              </span>
              <span className="flex-1 text-left truncate">{getFlag(m.away)} {m.away}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KnockoutSummary({ knockoutData }) {
  const entries = Object.entries(knockoutData || {});
  if (entries.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center text-gray-500 text-sm">
        Inga slutspelstips registrerade.
      </div>
    );
  }

  const rounds = { r32: [], r16: [], qf: [], sf: [], final: [], bronze: [] };
  for (const [matchId, pred] of entries) {
    const round = matchId.split('_')[0];
    if (rounds[round]) {
      rounds[round].push({ matchId, ...pred });
    }
  }

  const roundLabels = {
    r32: '32-delsfinal', r16: 'Åttondelsfinal', qf: 'Kvartsfinal',
    sf: 'Semifinal', bronze: 'Bronsmatch', final: 'Final',
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-700">
        <h3 className="text-white font-bold text-lg">Slutspelstips</h3>
      </div>
      <div className="p-4 space-y-3">
        {Object.entries(rounds).map(([round, matches]) => {
          if (matches.length === 0) return null;
          return (
            <div key={round}>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{roundLabels[round]}</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                {matches.map(m => (
                  <div key={m.matchId} className="text-xs bg-gray-50 rounded px-2 py-1 text-center">
                    {m.homeGoals ?? '-'} – {m.awayGoals ?? '-'}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
