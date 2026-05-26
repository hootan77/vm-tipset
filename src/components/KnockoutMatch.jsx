import { useTournament } from '../context/TournamentContext';
import { useLanguage } from '../context/LanguageContext';
import { getFlag, getTeamName } from '../data/flags';

export default function KnockoutMatch({ match, isAdmin, points }) {
  const { t, lang } = useLanguage();

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(lang === 'sv' ? 'sv-SE' : 'en-US', { day: 'numeric', month: 'short' });
  };
  const { saveKnockoutScore, locked } = useTournament();
  const readOnly = !isAdmin && locked;

  const handleChange = (field, value) => {
    if (readOnly) return;
    saveKnockoutScore(match.id, field, value === '' ? null : value, isAdmin);
  };

  const handlePenaltyWinner = (team) => {
    if (readOnly) return;
    saveKnockoutScore(match.id, 'penaltyWinner', team, isAdmin);
  };

  const hasTeams = match.home && match.away;
  const h = match.homeGoals != null ? parseInt(match.homeGoals) : null;
  const a = match.awayGoals != null ? parseInt(match.awayGoals) : null;
  const isDraw = h != null && a != null && h === a;
  const needsPenaltyWinner = isDraw && hasTeams;

  return (
    <div className={`rounded-lg border text-xs ${
      hasTeams ? 'border-gray-300 bg-white shadow-sm' : 'border-dashed border-gray-200 bg-gray-50'
    }`}>
      {(match.matchNum || match.date) && (
        <div className="flex items-center justify-between px-2 py-0.5 text-[10px] text-gray-400 border-b border-gray-100">
          <span>{match.matchNum ? `M${match.matchNum}` : ''} {match.date ? formatDate(match.date) : ''}</span>
          <div className="flex items-center gap-1">
            {match.venue && <span className="truncate max-w-[80px]">{match.venue}</span>}
            {points !== undefined && points !== null && (
              <span className={`font-bold px-1 py-0.5 rounded ${
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
      <TeamRow
        team={match.home}
        goals={match.homeGoals}
        isWinner={h != null && a != null && (h > a || (h === a && match.penaltyWinner === match.home))}
        onChange={v => handleChange('homeGoals', v)}
        enabled={hasTeams}
        readOnly={readOnly}
        lang={lang}
      />
      <div className="border-t border-gray-200" />
      <TeamRow
        team={match.away}
        goals={match.awayGoals}
        isWinner={h != null && a != null && (a > h || (h === a && match.penaltyWinner === match.away))}
        onChange={v => handleChange('awayGoals', v)}
        enabled={hasTeams}
        readOnly={readOnly}
        lang={lang}
      />
      {needsPenaltyWinner && (
        <div className="border-t border-gray-100 px-2 py-1.5 bg-amber-50">
          <div className="text-[10px] text-amber-700 font-medium mb-1">{t('ko.penaltyWinner')}</div>
          <div className="flex gap-1">
            <button
              disabled={readOnly}
              onClick={() => handlePenaltyWinner(match.home)}
              className={`flex-1 text-[10px] px-1.5 py-1 rounded border transition-colors ${
                match.penaltyWinner === match.home
                  ? 'bg-green-100 border-green-400 text-green-800 font-bold'
                  : 'border-gray-300 hover:bg-gray-100 text-gray-600'
              } ${readOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {getFlag(match.home)} {getTeamName(match.home, lang)}
            </button>
            <button
              disabled={readOnly}
              onClick={() => handlePenaltyWinner(match.away)}
              className={`flex-1 text-[10px] px-1.5 py-1 rounded border transition-colors ${
                match.penaltyWinner === match.away
                  ? 'bg-green-100 border-green-400 text-green-800 font-bold'
                  : 'border-gray-300 hover:bg-gray-100 text-gray-600'
              } ${readOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {getFlag(match.away)} {getTeamName(match.away, lang)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TeamRow({ team, goals, isWinner, onChange, enabled, readOnly, lang }) {
  return (
    <div className={`flex items-center gap-1 px-2 py-1.5 ${isWinner ? 'bg-green-50 font-semibold' : ''}`}>
      <span className={`flex-1 truncate ${team ? 'text-gray-800' : 'text-gray-400 italic'}`}>
        {team ? `${getFlag(team)} ${getTeamName(team, lang)}` : 'TBD'}
      </span>
      {enabled && (
        <input
          type="number"
          min="0"
          max="20"
          disabled={readOnly}
          className={`w-9 h-6 text-center border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          value={goals ?? ''}
          onChange={e => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
