import { useTournament } from '../context/TournamentContext';
import { useLanguage } from '../context/LanguageContext';
import { getFlag, getTeamName } from '../data/flags';
import { scoreGroupMatch } from '../logic/scoring';

export default function MatchInput({ group, matchIndex, match, isAdmin }) {
  const { lang } = useLanguage();
  const { saveGroupScore, locked, state } = useTournament();

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(lang === 'sv' ? 'sv-SE' : 'en-US', { day: 'numeric', month: 'short' });
  };

  const readOnly = !isAdmin && locked;

  const handleChange = (field, value) => {
    if (readOnly) return;
    const parsed = value === '' ? null : value;
    saveGroupScore(group, matchIndex, field, parsed, isAdmin);
  };

  let points = null;
  if (!isAdmin) {
    const adminMatch = state.adminGroupMatches[group]?.[matchIndex];
    if (adminMatch?.homeGoals != null && adminMatch?.awayGoals != null &&
        match.homeGoals != null && match.awayGoals != null) {
      points = scoreGroupMatch(match, adminMatch);
    }
  }

  return (
    <div className="border border-gray-100 rounded-lg p-2 hover:bg-gray-50 transition-colors">
      {match.date && (
        <div className="flex items-center justify-between text-xs text-gray-400 mb-1 px-1">
          <span>{formatDate(match.date)} {match.time}</span>
          <div className="flex items-center gap-2">
            <span>{match.venue}</span>
            {points !== null && (
              <span className={`font-bold px-1.5 py-0.5 rounded text-xs ${
                points >= 5 ? 'bg-green-100 text-green-700' :
                points >= 2 ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-500'
              }`}>
                {points}p
              </span>
            )}
          </div>
        </div>
      )}
      <div className="flex items-center gap-2 text-sm">
        <span className="flex-1 text-right font-medium text-gray-700 truncate">
          {getFlag(match.home)} {getTeamName(match.home, lang)}
        </span>
        <input
          type="number"
          min="0"
          max="20"
          disabled={readOnly}
          className={`w-12 h-8 text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          value={match.homeGoals ?? ''}
          onChange={e => handleChange('homeGoals', e.target.value)}
        />
        <span className="text-gray-400 font-bold">–</span>
        <input
          type="number"
          min="0"
          max="20"
          disabled={readOnly}
          className={`w-12 h-8 text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          value={match.awayGoals ?? ''}
          onChange={e => handleChange('awayGoals', e.target.value)}
        />
        <span className="flex-1 text-left font-medium text-gray-700 truncate">
          {getFlag(match.away)} {getTeamName(match.away, lang)}
        </span>
      </div>
    </div>
  );
}
