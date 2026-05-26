import { useTournament } from '../context/TournamentContext';
import { useLanguage } from '../context/LanguageContext';
import { getFlag, getTeamName } from '../data/flags';

export default function BestThirds({ isAdmin }) {
  const { t, lang } = useLanguage();
  const { computed } = useTournament();
  const bestThirds = isAdmin ? computed.adminBestThirds : computed.userBestThirds;
  const allGroupsComplete = isAdmin ? computed.allAdminGroupsComplete : computed.allUserGroupsComplete;

  if (!allGroupsComplete || bestThirds.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-yellow-500 to-amber-500 px-4 py-3">
        <h3 className="text-white font-bold text-lg">{t('thirds.title')}</h3>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {bestThirds.map((row, i) => (
            <div
              key={row.team}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                i < 8 ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <span className="font-bold text-gray-500 text-xs">{i + 1}.</span>
              <span className="font-medium text-gray-800">{getFlag(row.team)} {getTeamName(row.team, lang)}</span>
              <span className="text-xs text-gray-500 ml-auto">({row.group}) {row.points}p</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
