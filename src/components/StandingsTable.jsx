import { getFlag, getTeamName } from '../data/flags';
import { useLanguage } from '../context/LanguageContext';

export default function StandingsTable({ standings }) {
  const { t, lang } = useLanguage();
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-500 border-b">
            <th className="text-left py-1 px-1">#</th>
            <th className="text-left py-1 px-1">{t('st.team')}</th>
            <th className="py-1 px-1">{t('st.played')}</th>
            <th className="py-1 px-1">{t('st.wins')}</th>
            <th className="py-1 px-1">{t('st.draws')}</th>
            <th className="py-1 px-1">{t('st.losses')}</th>
            <th className="py-1 px-1">{t('st.gf')}</th>
            <th className="py-1 px-1">{t('st.ga')}</th>
            <th className="py-1 px-1">{t('st.gd')}</th>
            <th className="py-1 px-1 font-bold">{t('st.points')}</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row, i) => (
            <tr
              key={row.team}
              className={`border-b last:border-0 ${
                i < 2 ? 'bg-green-50' : i === 2 ? 'bg-yellow-50' : ''
              }`}
            >
              <td className="py-1.5 px-1 text-gray-500 font-medium">{row.position}</td>
              <td className="py-1.5 px-1 text-left font-medium text-gray-800 whitespace-nowrap">{getFlag(row.team)} {getTeamName(row.team, lang)}</td>
              <td className="py-1.5 px-1 text-center">{row.played}</td>
              <td className="py-1.5 px-1 text-center">{row.wins}</td>
              <td className="py-1.5 px-1 text-center">{row.draws}</td>
              <td className="py-1.5 px-1 text-center">{row.losses}</td>
              <td className="py-1.5 px-1 text-center">{row.gf}</td>
              <td className="py-1.5 px-1 text-center">{row.ga}</td>
              <td className="py-1.5 px-1 text-center">{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
              <td className="py-1.5 px-1 text-center font-bold">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
